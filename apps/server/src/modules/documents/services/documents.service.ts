import { Injectable, Optional } from '@nestjs/common';
import {
  type CoreDocumentStatus,
  type CoreDocumentType,
  getAllowedNextStatuses,
  type StatusTransitionAttempt,
  InvalidStatusTransitionError,
} from '../../core-document/domain/status-transition';
import { AuditService } from '../../../audit/application/audit.service';
import { InventoryPostingService } from '../../inventory/application/inventory-posting.service';
import { PrismaService } from '../../../database/prisma.service';
import { InventoryInsufficientStockError } from '../../inventory/domain/inventory.errors';

export interface DocumentListItem {
  id: string;
  tenantId: string;
  docNo: string;
  docType: CoreDocumentType;
  docDate: string;
  status: CoreDocumentStatus;
  remarks: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  deletedAt: string | null;
  deletedBy: string | null;
  lineCount: number;
  totalQty: string;
  totalAmount: string;
}

export interface DocumentLine {
  id: string;
  docId: string;
  lineNo: number;
  skuId: string;
  qty: string;
  unitPrice: string;
  amount: string;
  taxAmount: string;
}

export interface DocumentDetail extends DocumentListItem {
  lines: DocumentLine[];
}

export interface PaginationEnvelope<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ListDocumentsQuery {
  docType: CoreDocumentType;
  page?: number;
  pageSize?: number;
}

export interface DocumentActionResult {
  success: true;
  documentId: string;
  docType: CoreDocumentType;
  previousStatus: CoreDocumentStatus;
  newStatus: CoreDocumentStatus;
  action: string;
  inventoryPosted?: boolean;
  ledgerEntryIds?: string[];
}

export class DocumentNotFoundError extends Error {
  constructor(docType: CoreDocumentType, id: string) {
    super(`Document not found: ${docType}/${id}`);
    this.name = 'DocumentNotFoundError';
  }
}

export class UnknownDocumentActionError extends Error {
  constructor(action: string) {
    super(`Unknown action: ${action}`);
    this.name = 'UnknownDocumentActionError';
  }
}

export class OutboundStockInsufficientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OutboundStockInsufficientError';
  }
}

const ACTION_TO_STATUS: Record<string, CoreDocumentStatus> = {
  confirm: 'confirmed',
  validate: 'validating',
  post: 'posted',
  pick: 'picking',
  close: 'closed',
  cancel: 'cancelled',
};

@Injectable()
export class DocumentsService {
  private readonly documents = new Map<string, DocumentDetail>();
  private readonly docNoCounter = new Map<string, number>();
  private readonly idempotencyCache = new Map<string, DocumentActionResult>();

  constructor(
    private readonly auditService: AuditService,
    private readonly inventoryPostingService: InventoryPostingService,
    @Optional() private readonly prisma?: PrismaService,
  ) {
    this.seedDemoData();
  }

  private seedDemoData(): void {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const tenantId = '1001';

    const demoDocs: Array<{
      id: string;
      docType: CoreDocumentType;
      status: CoreDocumentStatus;
      totalQty: string;
      totalAmount: string;
    }> = [
      { id: '2001', docType: 'PO', status: 'draft', totalQty: '280', totalAmount: '128800' },
      { id: '2002', docType: 'PO', status: 'confirmed', totalQty: '96', totalAmount: '41200' },
      { id: '3001', docType: 'GRN', status: 'draft', totalQty: '278', totalAmount: '127960' },
      { id: '3002', docType: 'GRN', status: 'posted', totalQty: '96', totalAmount: '41200' },
      { id: '4001', docType: 'SO', status: 'draft', totalQty: '160', totalAmount: '152400' },
      { id: '4002', docType: 'SO', status: 'confirmed', totalQty: '54', totalAmount: '68900' },
      { id: '5001', docType: 'OUT', status: 'draft', totalQty: '160', totalAmount: '152400' },
      { id: '5002', docType: 'OUT', status: 'posted', totalQty: '54', totalAmount: '68900' },
      { id: '6001', docType: 'ADJ', status: 'draft', totalQty: '-4', totalAmount: '0' },
      { id: '6002', docType: 'ADJ', status: 'posted', totalQty: '2', totalAmount: '0' },
    ];

    for (const demo of demoDocs) {
      const seq = (this.docNoCounter.get(demo.docType) ?? 0) + 1;
      this.docNoCounter.set(demo.docType, seq);

      const docNo = `DOC-${demo.docType}-${today}-${seq.toString().padStart(3, '0')}`;
      const doc: DocumentDetail = {
        id: demo.id,
        tenantId,
        docNo,
        docType: demo.docType,
        docDate: new Date().toISOString().slice(0, 10),
        status: demo.status,
        remarks: 'demo data',
        createdAt: new Date().toISOString(),
        createdBy: '9001',
        updatedAt: new Date().toISOString(),
        updatedBy: '9001',
        deletedAt: null,
        deletedBy: null,
        lineCount: 2,
        totalQty: demo.totalQty,
        totalAmount: demo.totalAmount,
        lines: [
          {
            id: `${demo.id}-L1`,
            docId: demo.id,
            lineNo: 1,
            skuId: 'CAB-HDMI-2M',
            qty: demo.docType === 'ADJ' ? '-4' : '120',
            unitPrice: demo.docType === 'ADJ' ? '0' : '320',
            amount: demo.docType === 'ADJ' ? '0' : '38400',
            taxAmount: '0',
          },
          {
            id: `${demo.id}-L2`,
            docId: demo.id,
            lineNo: 2,
            skuId: 'ADP-USB-C-DP',
            qty: demo.docType === 'ADJ' ? '2' : '80',
            unitPrice: demo.docType === 'ADJ' ? '0' : '420',
            amount: demo.docType === 'ADJ' ? '0' : '33600',
            taxAmount: '0',
          },
        ],
      };

      this.documents.set(`${tenantId}:${demo.docType}:${demo.id}`, doc);
    }
  }

  async list(
    query: ListDocumentsQuery,
    tenantId: string,
  ): Promise<PaginationEnvelope<DocumentListItem>> {
    if (this.prisma && (query.docType === 'SO' || query.docType === 'OUT')) {
      return this.listSalesOutboundFromDb(query, tenantId);
    }

    const allDocs = Array.from(this.documents.values())
      .filter((doc) => doc.tenantId === tenantId && doc.docType === query.docType)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const total = allDocs.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const data = allDocs.slice(start, start + pageSize);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async getDetail(
    docType: CoreDocumentType,
    id: string,
    tenantId: string,
  ): Promise<DocumentDetail | null> {
    if (this.prisma && (docType === 'SO' || docType === 'OUT')) {
      return this.getSalesOutboundDetailFromDb(docType, id, tenantId);
    }

    return this.documents.get(`${tenantId}:${docType}:${id}`) ?? null;
  }

  async executeAction(
    docType: CoreDocumentType,
    id: string,
    action: string,
    idempotencyKey: string,
    tenantId: string,
    actorId: string,
    requestId: string,
  ): Promise<DocumentActionResult> {
    if (this.prisma && (docType === 'SO' || docType === 'OUT')) {
      return this.executeSalesOutboundActionInDb(
        docType,
        id,
        action,
        idempotencyKey,
        tenantId,
        actorId,
        requestId,
      );
    }

    return this.executeActionInMemory(
      docType,
      id,
      action,
      idempotencyKey,
      tenantId,
      actorId,
      requestId,
    );
  }

  private async listSalesOutboundFromDb(
    query: ListDocumentsQuery,
    tenantId: string,
  ): Promise<PaginationEnvelope<DocumentListItem>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;
    const tenantBigInt = BigInt(tenantId);

    if (query.docType === 'SO') {
      const [rows, total] = await Promise.all([
        this.prisma!.salesOrder.findMany({
          where: { tenantId: tenantBigInt },
          orderBy: { createdAt: 'desc' },
          skip,
          take: pageSize,
          include: {
            _count: { select: { SalesOrderLine: true } },
          },
        }),
        this.prisma!.salesOrder.count({ where: { tenantId: tenantBigInt } }),
      ]);

      const data: DocumentListItem[] = rows.map((row) => ({
        id: row.id.toString(),
        tenantId,
        docNo: row.docNo,
        docType: 'SO',
        docDate: row.docDate.toISOString().slice(0, 10),
        status: row.status as CoreDocumentStatus,
        remarks: row.remarks,
        createdAt: row.createdAt.toISOString(),
        createdBy: row.createdBy,
        updatedAt: row.updatedAt.toISOString(),
        updatedBy: row.updatedBy,
        deletedAt: row.deletedAt?.toISOString() ?? null,
        deletedBy: row.deletedBy,
        lineCount: row._count.SalesOrderLine,
        totalQty: row.totalQty.toString(),
        totalAmount: row.totalAmount.toString(),
      }));

      return {
        data,
        total,
        page,
        pageSize,
        totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
      };
    }

    const [rows, total] = await Promise.all([
      this.prisma!.outbound.findMany({
        where: { tenantId: tenantBigInt },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          _count: { select: { OutboundLine: true } },
        },
      }),
      this.prisma!.outbound.count({ where: { tenantId: tenantBigInt } }),
    ]);

    const data: DocumentListItem[] = rows.map((row) => ({
      id: row.id.toString(),
      tenantId,
      docNo: row.docNo,
      docType: 'OUT',
      docDate: row.docDate.toISOString().slice(0, 10),
      status: row.status as CoreDocumentStatus,
      remarks: row.remarks,
      createdAt: row.createdAt.toISOString(),
      createdBy: row.createdBy,
      updatedAt: row.updatedAt.toISOString(),
      updatedBy: row.updatedBy,
      deletedAt: row.deletedAt?.toISOString() ?? null,
      deletedBy: row.deletedBy,
      lineCount: row._count.OutboundLine,
      totalQty: row.totalQty.toString(),
      totalAmount: '0',
    }));

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
    };
  }

  private async getSalesOutboundDetailFromDb(
    docType: Extract<CoreDocumentType, 'SO' | 'OUT'>,
    id: string,
    tenantId: string,
  ): Promise<DocumentDetail | null> {
    const tenantBigInt = BigInt(tenantId);
    const docBigInt = BigInt(id);

    if (docType === 'SO') {
      const row = await this.prisma!.salesOrder.findFirst({
        where: { id: docBigInt, tenantId: tenantBigInt },
        include: { SalesOrderLine: { orderBy: { lineNo: 'asc' } } },
      });

      if (!row) {
        return null;
      }

      return {
        id: row.id.toString(),
        tenantId,
        docNo: row.docNo,
        docType,
        docDate: row.docDate.toISOString().slice(0, 10),
        status: row.status as CoreDocumentStatus,
        remarks: row.remarks,
        createdAt: row.createdAt.toISOString(),
        createdBy: row.createdBy,
        updatedAt: row.updatedAt.toISOString(),
        updatedBy: row.updatedBy,
        deletedAt: row.deletedAt?.toISOString() ?? null,
        deletedBy: row.deletedBy,
        lineCount: row.SalesOrderLine.length,
        totalQty: row.totalQty.toString(),
        totalAmount: row.totalAmount.toString(),
        lines: row.SalesOrderLine.map((line) => ({
          id: line.id.toString(),
          docId: row.id.toString(),
          lineNo: line.lineNo,
          skuId: line.skuId.toString(),
          qty: line.qty.toString(),
          unitPrice: line.unitPrice.toString(),
          amount: line.amount.toString(),
          taxAmount: '0',
        })),
      };
    }

    const row = await this.prisma!.outbound.findFirst({
      where: { id: docBigInt, tenantId: tenantBigInt },
      include: { OutboundLine: { orderBy: { lineNo: 'asc' } } },
    });

    if (!row) {
      return null;
    }

    return {
      id: row.id.toString(),
      tenantId,
      docNo: row.docNo,
      docType,
      docDate: row.docDate.toISOString().slice(0, 10),
      status: row.status as CoreDocumentStatus,
      remarks: row.remarks,
      createdAt: row.createdAt.toISOString(),
      createdBy: row.createdBy,
      updatedAt: row.updatedAt.toISOString(),
      updatedBy: row.updatedBy,
      deletedAt: row.deletedAt?.toISOString() ?? null,
      deletedBy: row.deletedBy,
      lineCount: row.OutboundLine.length,
      totalQty: row.totalQty.toString(),
      totalAmount: '0',
      lines: row.OutboundLine.map((line) => ({
        id: line.id.toString(),
        docId: row.id.toString(),
        lineNo: line.lineNo,
        skuId: line.skuId.toString(),
        qty: line.qty.toString(),
        unitPrice: '0',
        amount: '0',
        taxAmount: '0',
      })),
    };
  }

  private async executeSalesOutboundActionInDb(
    docType: Extract<CoreDocumentType, 'SO' | 'OUT'>,
    id: string,
    action: string,
    idempotencyKey: string,
    tenantId: string,
    actorId: string,
    requestId: string,
  ): Promise<DocumentActionResult> {
    const cacheKey = `${tenantId}:${docType}:${id}:${action}:${idempotencyKey}`;
    const cachedResult = this.idempotencyCache.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const targetStatus = ACTION_TO_STATUS[action];
    if (!targetStatus) {
      throw new UnknownDocumentActionError(action);
    }

    const detail = await this.getSalesOutboundDetailFromDb(docType, id, tenantId);
    if (!detail) {
      throw new DocumentNotFoundError(docType, id);
    }

    const attempt: StatusTransitionAttempt = {
      entityType: docType,
      entityId: id,
      fromStatus: detail.status,
      toStatus: targetStatus,
    };

    try {
      const allowed = getAllowedNextStatuses(docType, detail.status);
      if (!allowed.includes(targetStatus)) {
        throw new InvalidStatusTransitionError(attempt, allowed);
      }
    } catch (error) {
      this.auditService.recordAuthorization({
        requestId,
        tenantId,
        actorId,
        action: `document.${action}`,
        entityType: 'document',
        entityId: id,
        result: 'deny',
        reason: 'INVALID_STATUS_TRANSITION',
        metadata: { docType, fromStatus: detail.status, toStatus: targetStatus },
      });
      throw error;
    }

    const previousStatus = detail.status;
    let inventoryPosted = false;
    let ledgerEntryIds: string[] = [];

    if (docType === 'OUT' && action === 'post') {
      try {
        const result = await this.inventoryPostingService.post(
          tenantId,
          {
            idempotencyKey,
            referenceType: 'OUT',
            referenceId: id,
            lines: detail.lines.map((line) => ({
              skuId: line.skuId,
              warehouseId: 'WH-001',
              quantityDelta: -Math.abs(Math.trunc(Number(line.qty) || 0)),
            })),
          },
          requestId,
        );

        inventoryPosted = true;
        ledgerEntryIds = result.ledgerEntries.map((entry) => entry.id);
      } catch (error) {
        if (error instanceof InventoryInsufficientStockError) {
          throw new OutboundStockInsufficientError(error.message);
        }
        throw error;
      }
    }

    if (docType === 'SO') {
      await this.prisma!.salesOrder.update({
        where: { id: BigInt(id) },
        data: {
          status: targetStatus,
          updatedBy: actorId,
          updatedAt: new Date(),
        },
      });
    } else {
      await this.prisma!.outbound.update({
        where: { id: BigInt(id) },
        data: {
          status: targetStatus,
          updatedBy: actorId,
          updatedAt: new Date(),
        },
      });
    }

    this.auditService.recordAuthorization({
      requestId,
      tenantId,
      actorId,
      action: `document.${action}`,
      entityType: 'document',
      entityId: id,
      result: 'success',
      metadata: {
        docType,
        previousStatus,
        newStatus: targetStatus,
        inventoryPosted,
        ledgerEntryIds,
      },
    });

    const result: DocumentActionResult = {
      success: true,
      documentId: id,
      docType,
      previousStatus,
      newStatus: targetStatus,
      action,
      inventoryPosted,
      ledgerEntryIds,
    };

    this.idempotencyCache.set(cacheKey, result);
    return result;
  }

  private async executeActionInMemory(
    docType: CoreDocumentType,
    id: string,
    action: string,
    idempotencyKey: string,
    tenantId: string,
    actorId: string,
    requestId: string,
  ): Promise<DocumentActionResult> {
    const cacheKey = `${tenantId}:${docType}:${id}:${action}:${idempotencyKey}`;
    const cachedResult = this.idempotencyCache.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const key = `${tenantId}:${docType}:${id}`;
    const doc = this.documents.get(key);

    if (!doc) {
      throw new DocumentNotFoundError(docType, id);
    }

    const targetStatus = ACTION_TO_STATUS[action];
    if (!targetStatus) {
      throw new UnknownDocumentActionError(action);
    }

    const attempt: StatusTransitionAttempt = {
      entityType: docType,
      entityId: id,
      fromStatus: doc.status,
      toStatus: targetStatus,
    };

    try {
      const allowed = getAllowedNextStatuses(docType, doc.status);
      if (!allowed.includes(targetStatus)) {
        throw new InvalidStatusTransitionError(attempt, allowed);
      }
    } catch (error) {
      this.auditService.recordAuthorization({
        requestId,
        tenantId,
        actorId,
        action: `document.${action}`,
        entityType: 'document',
        entityId: id,
        result: 'deny',
        reason: 'INVALID_STATUS_TRANSITION',
        metadata: { docType, fromStatus: doc.status, toStatus: targetStatus },
      });
      throw error;
    }

    const previousStatus = doc.status;
    let inventoryPosted = false;
    let ledgerEntryIds: string[] = [];

    if ((docType === 'GRN' || docType === 'OUT' || docType === 'ADJ') && action === 'post') {
      try {
        const referenceType = docType === 'ADJ' ? 'ADJUSTMENT' : docType;
        const result = await this.inventoryPostingService.post(
          tenantId,
          {
            idempotencyKey,
            referenceType,
            referenceId: id,
            lines: doc.lines.map((line) => ({
              skuId: line.skuId,
              warehouseId: 'WH-001',
              quantityDelta:
                docType === 'GRN'
                  ? parseInt(line.qty, 10)
                  : docType === 'OUT'
                    ? -parseInt(line.qty, 10)
                    : parseInt(line.qty, 10),
            })),
          },
          requestId,
        );

        inventoryPosted = true;
        ledgerEntryIds = result.ledgerEntries.map((e) => e.id);
      } catch (error) {
        if (docType === 'OUT' && error instanceof InventoryInsufficientStockError) {
          throw new OutboundStockInsufficientError(error.message);
        }
        throw error;
      }
    }

    const updatedDoc: DocumentDetail = {
      ...doc,
      status: targetStatus,
      updatedAt: new Date().toISOString(),
      updatedBy: actorId,
    };
    this.documents.set(key, updatedDoc);

    this.auditService.recordAuthorization({
      requestId,
      tenantId,
      actorId,
      action: `document.${action}`,
      entityType: 'document',
      entityId: id,
      result: 'success',
      metadata: {
        docType,
        previousStatus,
        newStatus: targetStatus,
        inventoryPosted,
        ledgerEntryIds,
      },
    });

    const result: DocumentActionResult = {
      success: true,
      documentId: id,
      docType,
      previousStatus,
      newStatus: targetStatus,
      action,
      inventoryPosted,
      ledgerEntryIds,
    };

    this.idempotencyCache.set(cacheKey, result);

    return result;
  }
}
