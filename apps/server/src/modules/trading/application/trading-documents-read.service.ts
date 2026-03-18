import { Injectable } from '@nestjs/common';
import {
  type CoreDocumentStatus,
  type CoreDocumentType,
} from '../../core-document/domain/status-transition';
import { PlatformDbService } from '../../../database/platform-db.service';
import type {
  DocumentDetail,
  DocumentLine,
  DocumentListItem,
  ListDocumentsQuery,
  PaginationEnvelope,
} from '../../documents/services/documents.service';

function parseDocumentId(rawId: string): bigint | null {
  try {
    return BigInt(rawId);
  } catch {
    return null;
  }
}

const PERSISTED_TRADING_DOC_TYPES = ['PO', 'GRN', 'SO', 'OUT'] as const;

@Injectable()
export class TradingDocumentsReadService {
  constructor(private readonly platformDb: PlatformDbService) {}

  canHandle(docType: CoreDocumentType): boolean {
    return (PERSISTED_TRADING_DOC_TYPES as readonly string[]).includes(docType);
  }

  async list(
    query: ListDocumentsQuery,
    tenantId: string,
  ): Promise<PaginationEnvelope<DocumentListItem>> {
    return this.platformDb.withTenantTx(async (tx) => {
      const page = query.page ?? 1;
      const pageSize = query.pageSize ?? 20;
      const skip = (page - 1) * pageSize;

      if (query.docType === 'PO') {
        const [total, rows] = await Promise.all([
          tx.purchaseOrder.count({
            where: { deletedAt: null },
          }),
          tx.purchaseOrder.findMany({
            where: { deletedAt: null },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            skip,
            take: pageSize,
          }),
        ]);

        const ids = rows.map((row) => row.id);
        const counts =
          ids.length === 0
            ? []
            : await tx.purchaseOrderLine.groupBy({
                by: ['poId'],
                where: { poId: { in: ids } },
                _count: { _all: true },
              });

        const lineCountById = new Map<string, number>(
          counts.map((item) => [item.poId.toString(), item._count._all]),
        );

        return {
          data: rows.map((row) =>
            this.mapPersistedHeaderToListItem(
              row,
              'PO',
              tenantId,
              lineCountById.get(row.id.toString()) ?? 0,
            ),
          ),
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        };
      }

      if (query.docType === 'GRN') {
        const [total, rows] = await Promise.all([
          tx.grn.count({
            where: { deletedAt: null },
          }),
          tx.grn.findMany({
            where: { deletedAt: null },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            skip,
            take: pageSize,
          }),
        ]);

        const ids = rows.map((row) => row.id);
        const counts =
          ids.length === 0
            ? []
            : await tx.grnLine.groupBy({
                by: ['grnId'],
                where: { grnId: { in: ids } },
                _count: { _all: true },
              });

        const lineCountById = new Map<string, number>(
          counts.map((item) => [item.grnId.toString(), item._count._all]),
        );

        return {
          data: rows.map((row) =>
            this.mapPersistedHeaderToListItem(
              row,
              'GRN',
              tenantId,
              lineCountById.get(row.id.toString()) ?? 0,
            ),
          ),
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        };
      }

      if (query.docType === 'SO') {
        const [rows, total] = await Promise.all([
          tx.salesOrder.findMany({
            where: { deletedAt: null },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            skip,
            take: pageSize,
          }),
          tx.salesOrder.count({
            where: { deletedAt: null },
          }),
        ]);

        const soIds = rows.map((row) => row.id);
        const lineCounts =
          soIds.length === 0
            ? []
            : await tx.salesOrderLine.groupBy({
                by: ['soId'],
                where: { soId: { in: soIds } },
                _count: { _all: true },
              });
        const lineCountById = new Map<string, number>(
          lineCounts.map((item) => [item.soId.toString(), item._count._all]),
        );

        return {
          data: rows.map((row) =>
            this.mapPersistedHeaderToListItem(
              row,
              'SO',
              tenantId,
              lineCountById.get(row.id.toString()) ?? 0,
            ),
          ),
          total,
          page,
          pageSize,
          totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
        };
      }

      const [rows, total] = await Promise.all([
        tx.outbound.findMany({
          where: { deletedAt: null },
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          skip,
          take: pageSize,
        }),
        tx.outbound.count({
          where: { deletedAt: null },
        }),
      ]);

      const outboundIds = rows.map((row) => row.id);
      const lineCounts =
        outboundIds.length === 0
          ? []
          : await tx.outboundLine.groupBy({
              by: ['outboundId'],
              where: { outboundId: { in: outboundIds } },
              _count: { _all: true },
            });
      const lineCountById = new Map<string, number>(
        lineCounts.map((item) => [
          item.outboundId.toString(),
          item._count._all,
        ]),
      );

      return {
        data: rows.map((row) =>
          this.mapPersistedHeaderToListItem(
            row,
            'OUT',
            tenantId,
            lineCountById.get(row.id.toString()) ?? 0,
          ),
        ),
        total,
        page,
        pageSize,
        totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
      };
    });
  }

  async getDetail(
    docType: Extract<CoreDocumentType, 'PO' | 'GRN' | 'SO' | 'OUT'>,
    id: string,
    tenantId: string,
  ): Promise<DocumentDetail | null> {
    return this.platformDb.withTenantTx(async (tx) => {
      const documentId = parseDocumentId(id);
      if (documentId === null) {
        return null;
      }

      if (docType === 'PO') {
        const header = await tx.purchaseOrder.findFirst({
          where: { id: documentId, deletedAt: null },
        });

        if (!header) {
          return null;
        }

        const lines = await tx.purchaseOrderLine.findMany({
          where: { poId: header.id },
          orderBy: { lineNo: 'asc' },
        });

        return {
          ...this.mapPersistedHeaderToListItem(
            header,
            'PO',
            tenantId,
            lines.length,
          ),
          lines: lines.map((line) => this.toDocumentLine(header.id, line)),
        };
      }

      if (docType === 'GRN') {
        const header = await tx.grn.findFirst({
          where: { id: documentId, deletedAt: null },
        });

        if (!header) {
          return null;
        }

        const lines = await tx.grnLine.findMany({
          where: { grnId: header.id },
          orderBy: { lineNo: 'asc' },
        });

        return {
          ...this.mapPersistedHeaderToListItem(
            header,
            'GRN',
            tenantId,
            lines.length,
          ),
          lines: lines.map((line) => this.toDocumentLine(header.id, line)),
        };
      }

      if (docType === 'SO') {
        const header = await tx.salesOrder.findFirst({
          where: { id: documentId, deletedAt: null },
        });

        if (!header) {
          return null;
        }

        const lines = await tx.salesOrderLine.findMany({
          where: { soId: header.id },
          orderBy: { lineNo: 'asc' },
        });

        return {
          ...this.mapPersistedHeaderToListItem(
            header,
            'SO',
            tenantId,
            lines.length,
          ),
          lines: lines.map((line) => this.toDocumentLine(header.id, line)),
        };
      }

      const header = await tx.outbound.findFirst({
        where: { id: documentId, deletedAt: null },
      });

      if (!header) {
        return null;
      }

      const lines = await tx.outboundLine.findMany({
        where: { outboundId: header.id },
        orderBy: { lineNo: 'asc' },
      });

      return {
        ...this.mapPersistedHeaderToListItem(
          header,
          'OUT',
          tenantId,
          lines.length,
        ),
        lines: lines.map((line) => this.toDocumentLine(header.id, line)),
      };
    });
  }

  private toCoreStatus(
    status: string,
    docType: CoreDocumentType,
  ): CoreDocumentStatus {
    const valid = [
      'draft',
      'confirmed',
      'closed',
      'cancelled',
      'validating',
      'posted',
      'picking',
    ] as const;

    if (!(valid as readonly string[]).includes(status)) {
      throw new Error(`Invalid persisted status for ${docType}: ${status}`);
    }

    return status as CoreDocumentStatus;
  }

  private toDocumentLine(
    docId: bigint,
    line: {
      id: bigint;
      lineNo: number;
      skuId: bigint;
      binId?: bigint | null;
      itemNameSnapshot?: string | null;
      specModelSnapshot?: string | null;
      uom?: string | null;
      qty: { toString(): string };
      unitPrice: { toString(): string } | null;
      amount: { toString(): string } | null;
      taxAmount?: { toString(): string } | null;
    },
  ): DocumentLine {
    return {
      id: line.id.toString(),
      docId: docId.toString(),
      lineNo: line.lineNo,
      skuId: line.skuId.toString(),
      binId: line.binId?.toString() ?? null,
      itemNameSnapshot: line.itemNameSnapshot ?? null,
      specModelSnapshot: line.specModelSnapshot ?? null,
      uom: line.uom ?? null,
      qty: line.qty.toString(),
      unitPrice: line.unitPrice?.toString() ?? '0',
      amount: line.amount?.toString() ?? '0',
      taxAmount: line.taxAmount?.toString() ?? '0',
    };
  }

  private mapPersistedHeaderToListItem(
    header: {
      id: bigint;
      docNo: string;
      docDate: Date;
      status: string;
      counterpartyId?: string | null;
      supplierId?: bigint | null;
      customerId?: bigint | null;
      remarks: string | null;
      createdAt: Date;
      createdBy: string;
      updatedAt: Date;
      updatedBy: string;
      deletedAt: Date | null;
      deletedBy: string | null;
      totalQty: { toString(): string };
      totalAmount: { toString(): string };
    },
    docType: CoreDocumentType,
    tenantId: string,
    lineCount: number,
  ): DocumentListItem {
    return {
      id: header.id.toString(),
      tenantId,
      docNo: header.docNo,
      docType,
      docDate: header.docDate.toISOString().slice(0, 10),
      status: this.toCoreStatus(header.status, docType),
      counterpartyId:
        header.counterpartyId ??
        header.supplierId?.toString() ??
        header.customerId?.toString() ??
        null,
      supplierId: header.supplierId?.toString() ?? null,
      customerId: header.customerId?.toString() ?? null,
      remarks: header.remarks,
      createdAt: header.createdAt.toISOString(),
      createdBy: header.createdBy,
      updatedAt: header.updatedAt.toISOString(),
      updatedBy: header.updatedBy,
      deletedAt: header.deletedAt?.toISOString() ?? null,
      deletedBy: header.deletedBy,
      lineCount,
      totalQty: header.totalQty.toString(),
      totalAmount: header.totalAmount.toString(),
    };
  }
}
