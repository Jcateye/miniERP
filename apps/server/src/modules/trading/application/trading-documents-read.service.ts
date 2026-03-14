import { Injectable, Optional } from '@nestjs/common';
import {
  type CoreDocumentStatus,
  type CoreDocumentType,
} from '../../core-document/domain/status-transition';
import { PrismaService } from '../../../database/prisma.service';
import type {
  DocumentDetail,
  DocumentLine,
  DocumentListItem,
  ListDocumentsQuery,
  PaginationEnvelope,
} from '../../documents/services/documents.service';

function parseDocumentId(rawId: string): bigint {
  try {
    return BigInt(rawId);
  } catch {
    throw new Error(`Document not found: invalid id ${rawId}`);
  }
}

function tenantCodeCandidates(tenantId: string): string[] {
  const normalized = tenantId.trim();
  const candidates = new Set<string>([normalized]);
  if (!normalized.toUpperCase().startsWith('TENANT-')) {
    candidates.add(`TENANT-${normalized}`);
  }
  return [...candidates];
}

const PERSISTED_TRADING_DOC_TYPES = ['PO', 'GRN', 'SO', 'OUT'] as const;

@Injectable()
export class TradingDocumentsReadService {
  constructor(@Optional() private readonly prisma?: PrismaService) {}

  canHandle(docType: CoreDocumentType): boolean {
    return (
      Boolean(this.prisma) &&
      (PERSISTED_TRADING_DOC_TYPES as readonly string[]).includes(docType)
    );
  }

  async list(
    query: ListDocumentsQuery,
    tenantId: string,
  ): Promise<PaginationEnvelope<DocumentListItem>> {
    if (!this.prisma) {
      throw new Error('Prisma service is unavailable');
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const tenantDbId = await this.resolveTenantDbId(tenantId);
    const skip = (page - 1) * pageSize;

    if (query.docType === 'PO') {
      const [total, rows] = await Promise.all([
        this.prisma.purchaseOrder.count({
          where: { tenantId: tenantDbId, deletedAt: null },
        }),
        this.prisma.purchaseOrder.findMany({
          where: { tenantId: tenantDbId, deletedAt: null },
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          skip,
          take: pageSize,
        }),
      ]);

      const ids = rows.map((row) => row.id);
      const counts =
        ids.length === 0
          ? []
          : await this.prisma.purchaseOrderLine.groupBy({
              by: ['poId'],
              where: { tenantId: tenantDbId, poId: { in: ids } },
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
        this.prisma.grn.count({
          where: { tenantId: tenantDbId, deletedAt: null },
        }),
        this.prisma.grn.findMany({
          where: { tenantId: tenantDbId, deletedAt: null },
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          skip,
          take: pageSize,
        }),
      ]);

      const ids = rows.map((row) => row.id);
      const counts =
        ids.length === 0
          ? []
          : await this.prisma.grnLine.groupBy({
              by: ['grnId'],
              where: { tenantId: tenantDbId, grnId: { in: ids } },
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
        this.prisma.salesOrder.findMany({
          where: { tenantId: tenantDbId, deletedAt: null },
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          skip,
          take: pageSize,
        }),
        this.prisma.salesOrder.count({
          where: { tenantId: tenantDbId, deletedAt: null },
        }),
      ]);

      const soIds = rows.map((row) => row.id);
      const lineCounts =
        soIds.length === 0
          ? []
          : await this.prisma.salesOrderLine.groupBy({
              by: ['soId'],
              where: { tenantId: tenantDbId, soId: { in: soIds } },
              _count: { _all: true },
            });
      const lineCountById = new Map(
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
      this.prisma.outbound.findMany({
        where: { tenantId: tenantDbId, deletedAt: null },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip,
        take: pageSize,
      }),
      this.prisma.outbound.count({
        where: { tenantId: tenantDbId, deletedAt: null },
      }),
    ]);

    const outboundIds = rows.map((row) => row.id);
    const lineCounts =
      outboundIds.length === 0
        ? []
        : await this.prisma.outboundLine.groupBy({
            by: ['outboundId'],
            where: { tenantId: tenantDbId, outboundId: { in: outboundIds } },
            _count: { _all: true },
          });
    const lineCountById = new Map(
      lineCounts.map((item) => [item.outboundId.toString(), item._count._all]),
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
  }

  async getDetail(
    docType: Extract<CoreDocumentType, 'PO' | 'GRN' | 'SO' | 'OUT'>,
    id: string,
    tenantId: string,
  ): Promise<DocumentDetail | null> {
    if (!this.prisma) {
      throw new Error('Prisma service is unavailable');
    }

    const tenantDbId = await this.resolveTenantDbId(tenantId);
    const documentId = parseDocumentId(id);

    if (docType === 'PO') {
      const header = await this.prisma.purchaseOrder.findFirst({
        where: { tenantId: tenantDbId, id: documentId, deletedAt: null },
      });

      if (!header) {
        return null;
      }

      const lines = await this.prisma.purchaseOrderLine.findMany({
        where: { tenantId: tenantDbId, poId: header.id },
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
      const header = await this.prisma.grn.findFirst({
        where: { tenantId: tenantDbId, id: documentId, deletedAt: null },
      });

      if (!header) {
        return null;
      }

      const lines = await this.prisma.grnLine.findMany({
        where: { tenantId: tenantDbId, grnId: header.id },
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
      const row = await this.prisma.salesOrder.findFirst({
        where: { id: documentId, tenantId: tenantDbId, deletedAt: null },
      });

      if (!row) {
        return null;
      }

      const lines = await this.prisma.salesOrderLine.findMany({
        where: { tenantId: tenantDbId, soId: row.id },
        orderBy: { lineNo: 'asc' },
      });

      return {
        ...this.mapPersistedHeaderToListItem(row, 'SO', tenantId, lines.length),
        lines: lines.map((line) => this.toDocumentLine(row.id, line)),
      };
    }

    const row = await this.prisma.outbound.findFirst({
      where: { id: documentId, tenantId: tenantDbId, deletedAt: null },
    });

    if (!row) {
      return null;
    }

    const lines = await this.prisma.outboundLine.findMany({
      where: { tenantId: tenantDbId, outboundId: row.id },
      orderBy: { lineNo: 'asc' },
    });

    return {
      ...this.mapPersistedHeaderToListItem(row, 'OUT', tenantId, lines.length),
      lines: lines.map((line) => this.toDocumentLine(row.id, line)),
    };
  }

  private async resolveTenantDbId(tenantId: string): Promise<bigint> {
    if (!this.prisma) {
      throw new Error('Prisma service is unavailable');
    }

    const normalized = tenantId.trim();
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        code: {
          in: tenantCodeCandidates(normalized),
        },
      },
      select: { id: true },
    });

    if (tenant) {
      return tenant.id;
    }

    try {
      return BigInt(normalized);
    } catch {
      throw new Error(`tenantId is not bigint-compatible: ${tenantId}`);
    }
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
