import {
  Injectable,
  Optional,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import Decimal from 'decimal.js';
import {
  type CoreDocumentStatus,
  type CoreDocumentType,
  CORE_DOCUMENT_STATUSES,
  getAllowedNextStatuses,
  type StatusTransitionAttempt,
  InvalidStatusTransitionError,
} from '../../core-document/domain/status-transition';
import { AuditService } from '../../../audit/application/audit.service';
import { InventoryPostingService } from '../../inventory/application/inventory-posting.service';
import { PrismaService } from '../../../database/prisma.service';

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

const ACTION_TO_STATUS: Record<string, CoreDocumentStatus> = {
  confirm: 'confirmed',
  validate: 'validating',
  post: 'posted',
  pick: 'picking',
  close: 'closed',
  cancel: 'cancelled',
};

function isCoreDocumentStatus(value: string): value is CoreDocumentStatus {
  return (CORE_DOCUMENT_STATUSES as readonly string[]).includes(value);
}

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
      {
        id: '2001',
        docType: 'PO',
        status: 'draft',
        totalQty: '280',
        totalAmount: '128800',
      },
      {
        id: '2002',
        docType: 'PO',
        status: 'confirmed',
        totalQty: '96',
        totalAmount: '41200',
      },
      {
        id: '3001',
        docType: 'GRN',
        status: 'draft',
        totalQty: '278',
        totalAmount: '127960',
      },
      {
        id: '3002',
        docType: 'GRN',
        status: 'posted',
        totalQty: '96',
        totalAmount: '41200',
      },
      {
        id: '4001',
        docType: 'SO',
        status: 'draft',
        totalQty: '160',
        totalAmount: '152400',
      },
      {
        id: '4002',
        docType: 'SO',
        status: 'confirmed',
        totalQty: '54',
        totalAmount: '68900',
      },
      {
        id: '5001',
        docType: 'OUT',
        status: 'draft',
        totalQty: '160',
        totalAmount: '152400',
      },
      {
        id: '5002',
        docType: 'OUT',
        status: 'posted',
        totalQty: '54',
        totalAmount: '68900',
      },
      {
        id: '6001',
        docType: 'ADJ',
        status: 'draft',
        totalQty: '-4',
        totalAmount: '0',
      },
      {
        id: '6002',
        docType: 'ADJ',
        status: 'posted',
        totalQty: '2',
        totalAmount: '0',
      },
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
    if (this.usePersistentStore(query.docType)) {
      return this.listPersisted(query, tenantId);
    }

    const allDocs = Array.from(this.documents.values())
      .filter(
        (doc) => doc.tenantId === tenantId && doc.docType === query.docType,
      )
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
    if (this.usePersistentStore(docType)) {
      return this.getPersistedDetail(docType, id, tenantId);
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
    const cacheKey = `${tenantId}:${docType}:${id}:${action}:${idempotencyKey}`;
    const cachedResult = this.idempotencyCache.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    if (this.usePersistentStore(docType)) {
      const persistentResult = await this.executePersistentAction(
        docType,
        id,
        action,
        idempotencyKey,
        tenantId,
        actorId,
        requestId,
      );
      this.idempotencyCache.set(cacheKey, persistentResult);
      return persistentResult;
    }

    const key = `${tenantId}:${docType}:${id}`;
    const doc = this.documents.get(key);

    if (!doc) {
      throw new Error(`Document not found: ${docType}/${id}`);
    }

    const targetStatus = ACTION_TO_STATUS[action];
    if (!targetStatus) {
      throw new Error(`Unknown action: ${action}`);
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

    if (
      (docType === 'GRN' || docType === 'OUT' || docType === 'ADJ') &&
      action === 'post'
    ) {
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
      ledgerEntryIds = result.ledgerEntries.map((entry) => entry.id);
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

  private usePersistentStore(docType: CoreDocumentType): boolean {
    return Boolean(this.prisma) && (docType === 'PO' || docType === 'GRN');
  }

  private async resolveTenantDbId(tenantId: string): Promise<bigint> {
    const normalized = tenantId.trim();
    if (normalized.length === 0) {
      throw new Error('tenantId is required');
    }

    if (!this.prisma) {
      throw new Error('Prisma service is unavailable');
    }

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
    if (!isCoreDocumentStatus(status)) {
      throw new Error(`Invalid persisted status for ${docType}: ${status}`);
    }

    return status;
  }

  private toDocumentLine(
    docId: bigint,
    line: {
      id: bigint;
      lineNo: number;
      skuId: bigint;
      qty: { toString(): string };
      unitPrice: { toString(): string };
      amount: { toString(): string };
    },
  ): DocumentLine {
    return {
      id: line.id.toString(),
      docId: docId.toString(),
      lineNo: line.lineNo,
      skuId: line.skuId.toString(),
      qty: line.qty.toString(),
      unitPrice: line.unitPrice.toString(),
      amount: line.amount.toString(),
      taxAmount: '0',
    };
  }

  private mapPersistedHeaderToListItem(
    header: {
      id: bigint;
      docNo: string;
      docDate: Date;
      status: string;
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

  private async listPersisted(
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

      const data = rows.map((row) =>
        this.mapPersistedHeaderToListItem(
          row,
          'PO',
          tenantId,
          lineCountById.get(row.id.toString()) ?? 0,
        ),
      );

      return {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }

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

    const data = rows.map((row) =>
      this.mapPersistedHeaderToListItem(
        row,
        'GRN',
        tenantId,
        lineCountById.get(row.id.toString()) ?? 0,
      ),
    );

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  private async getPersistedDetail(
    docType: CoreDocumentType,
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

  private async executePersistentAction(
    docType: CoreDocumentType,
    id: string,
    action: string,
    idempotencyKey: string,
    tenantId: string,
    actorId: string,
    requestId: string,
  ): Promise<DocumentActionResult> {
    if (!this.prisma) {
      throw new Error('Prisma service is unavailable');
    }

    const targetStatus = ACTION_TO_STATUS[action];
    if (!targetStatus) {
      throw new Error(`Unknown action: ${action}`);
    }

    const tenantDbId = await this.resolveTenantDbId(tenantId);
    const documentId = parseDocumentId(id);

    if (docType === 'PO') {
      const doc = await this.prisma.purchaseOrder.findFirst({
        where: { tenantId: tenantDbId, id: documentId, deletedAt: null },
      });

      if (!doc) {
        throw new Error(`Document not found: ${docType}/${id}`);
      }

      const previousStatus = this.toCoreStatus(doc.status, docType);
      const attempt: StatusTransitionAttempt = {
        entityType: docType,
        entityId: id,
        fromStatus: previousStatus,
        toStatus: targetStatus,
      };

      try {
        const allowed = getAllowedNextStatuses(docType, previousStatus);
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
          metadata: {
            docType,
            fromStatus: previousStatus,
            toStatus: targetStatus,
          },
        });
        throw error;
      }

      const updateResult = await this.prisma.purchaseOrder.updateMany({
        where: {
          tenantId: tenantDbId,
          id: doc.id,
          status: previousStatus,
          deletedAt: null,
        },
        data: {
          status: targetStatus,
          updatedBy: actorId,
        },
      });

      if (updateResult.count === 0) {
        throw new InvalidStatusTransitionError(
          attempt,
          getAllowedNextStatuses(docType, previousStatus),
        );
      }

      await this.prisma.stateTransitionLog.create({
        data: {
          tenantId: tenantDbId,
          entityType: 'PO',
          entityId: id,
          fromStatus: previousStatus,
          toStatus: targetStatus,
          actorId,
          requestId,
        },
      });

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
          inventoryPosted: false,
          ledgerEntryIds: [],
        },
      });

      return {
        success: true,
        documentId: id,
        docType,
        previousStatus,
        newStatus: targetStatus,
        action,
        inventoryPosted: false,
        ledgerEntryIds: [],
      };
    }

    const doc = await this.prisma.grn.findFirst({
      where: { tenantId: tenantDbId, id: documentId, deletedAt: null },
    });

    if (!doc) {
      throw new Error(`Document not found: ${docType}/${id}`);
    }

    const previousStatus = this.toCoreStatus(doc.status, docType);
    const attempt: StatusTransitionAttempt = {
      entityType: docType,
      entityId: id,
      fromStatus: previousStatus,
      toStatus: targetStatus,
    };

    try {
      const allowed = getAllowedNextStatuses(docType, previousStatus);
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
        metadata: {
          docType,
          fromStatus: previousStatus,
          toStatus: targetStatus,
        },
      });
      throw error;
    }

    let inventoryPosted = false;
    let ledgerEntryIds: string[] = [];

    if (action === 'post') {
      const lines = await this.prisma.grnLine.findMany({
        where: { tenantId: tenantDbId, grnId: doc.id },
        orderBy: { lineNo: 'asc' },
      });

      await this.validateGrnPrePost(tenantDbId, doc, lines);

      const prePostUpdateResult = await this.prisma.grn.updateMany({
        where: {
          tenantId: tenantDbId,
          id: doc.id,
          status: previousStatus,
          deletedAt: null,
        },
        data: {
          status: targetStatus,
          updatedBy: actorId,
        },
      });

      if (prePostUpdateResult.count === 0) {
        throw new InvalidStatusTransitionError(
          attempt,
          getAllowedNextStatuses(docType, previousStatus),
        );
      }

      try {
        const inventoryResult = await this.inventoryPostingService.post(
          tenantId,
          {
            idempotencyKey,
            referenceType: 'GRN',
            referenceId: id,
            lines: lines.map((line) => {
              const qty = new Decimal(line.qty.toString());
              return {
                skuId: line.skuId.toString(),
                warehouseId: doc.warehouseId!.toString(),
                quantityDelta: qty.toNumber(),
              };
            }),
          },
          requestId,
        );

        inventoryPosted = true;
        ledgerEntryIds = inventoryResult.ledgerEntries.map((entry) => entry.id);
      } catch (error) {
        await this.prisma.grn.updateMany({
          where: {
            tenantId: tenantDbId,
            id: doc.id,
            status: targetStatus,
            deletedAt: null,
          },
          data: {
            status: previousStatus,
            updatedBy: actorId,
          },
        });
        throw error;
      }
    } else {
      const updateResult = await this.prisma.grn.updateMany({
        where: {
          tenantId: tenantDbId,
          id: doc.id,
          status: previousStatus,
          deletedAt: null,
        },
        data: {
          status: targetStatus,
          updatedBy: actorId,
        },
      });

      if (updateResult.count === 0) {
        throw new InvalidStatusTransitionError(
          attempt,
          getAllowedNextStatuses(docType, previousStatus),
        );
      }
    }

    await this.prisma.stateTransitionLog.create({
      data: {
        tenantId: tenantDbId,
        entityType: 'GRN',
        entityId: id,
        fromStatus: previousStatus,
        toStatus: targetStatus,
        actorId,
        requestId,
      },
    });

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

    return {
      success: true,
      documentId: id,
      docType,
      previousStatus,
      newStatus: targetStatus,
      action,
      inventoryPosted,
      ledgerEntryIds,
    };
  }

  private async validateGrnPrePost(
    tenantDbId: bigint,
    grn: {
      id: bigint;
      poId: bigint | null;
      warehouseId: bigint | null;
      docNo: string;
    },
    lines: Array<{
      lineNo: number;
      skuId: bigint;
      qty: { toString(): string };
    }>,
  ): Promise<void> {
    if (!this.prisma) {
      throw new Error('Prisma service is unavailable');
    }

    if (grn.warehouseId === null) {
      throw new HttpException(
        {
          code: 'VALIDATION_GRN_WAREHOUSE_REQUIRED',
          category: 'validation',
          message: `GRN ${grn.docNo} is missing warehouse before post`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (lines.length === 0) {
      throw new HttpException(
        {
          code: 'VALIDATION_GRN_LINES_REQUIRED',
          category: 'validation',
          message: `GRN ${grn.docNo} has no lines to post`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    for (const line of lines) {
      const qty = new Decimal(line.qty.toString());
      if (!qty.isFinite() || qty.lte(0)) {
        throw new HttpException(
          {
            code: 'VALIDATION_GRN_LINE_QTY_INVALID',
            category: 'validation',
            message: `GRN line ${line.lineNo} has invalid quantity`,
            details: {
              grnId: grn.id.toString(),
              lineNo: line.lineNo,
              qty: line.qty.toString(),
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!qty.isInteger()) {
        throw new HttpException(
          {
            code: 'VALIDATION_GRN_LINE_QTY_NON_INTEGER',
            category: 'validation',
            message: `GRN line ${line.lineNo} quantity must be an integer for inventory posting`,
            details: {
              grnId: grn.id.toString(),
              lineNo: line.lineNo,
              qty: line.qty.toString(),
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (grn.poId === null) {
      return;
    }

    const po = await this.prisma.purchaseOrder.findFirst({
      where: { tenantId: tenantDbId, id: grn.poId, deletedAt: null },
      select: { id: true, docNo: true, status: true },
    });

    if (!po) {
      throw new HttpException(
        {
          code: 'VALIDATION_GRN_PO_NOT_FOUND',
          category: 'validation',
          message: `GRN ${grn.docNo} references a missing PO`,
          details: {
            grnId: grn.id.toString(),
            poId: grn.poId.toString(),
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (po.status !== 'confirmed' && po.status !== 'closed') {
      throw new HttpException(
        {
          code: 'VALIDATION_GRN_PO_STATUS_INVALID',
          category: 'validation',
          message: `PO ${po.docNo} status ${po.status} is not allowed for GRN posting`,
          details: {
            poId: po.id.toString(),
            poStatus: po.status,
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const poLines = await this.prisma.purchaseOrderLine.findMany({
      where: { tenantId: tenantDbId, poId: po.id },
      select: { skuId: true, qty: true },
    });

    const poQtyBySku = new Map<string, Decimal>();
    for (const line of poLines) {
      const key = line.skuId.toString();
      const current = poQtyBySku.get(key) ?? new Decimal(0);
      poQtyBySku.set(key, current.add(line.qty.toString()));
    }

    const grnQtyBySku = new Map<string, Decimal>();
    for (const line of lines) {
      const key = line.skuId.toString();
      const current = grnQtyBySku.get(key) ?? new Decimal(0);
      grnQtyBySku.set(key, current.add(line.qty.toString()));
    }

    for (const [skuId, grnQty] of grnQtyBySku.entries()) {
      const poQty = poQtyBySku.get(skuId);
      if (!poQty) {
        throw new HttpException(
          {
            code: 'VALIDATION_GRN_SKU_NOT_IN_PO',
            category: 'validation',
            message: `GRN contains SKU not present in PO`,
            details: {
              poId: po.id.toString(),
              grnId: grn.id.toString(),
              skuId,
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (grnQty.gt(poQty)) {
        throw new HttpException(
          {
            code: 'VALIDATION_GRN_QTY_EXCEEDS_PO',
            category: 'validation',
            message: `GRN quantity exceeds PO quantity for SKU ${skuId}`,
            details: {
              poId: po.id.toString(),
              grnId: grn.id.toString(),
              skuId,
              poQty: poQty.toString(),
              grnQty: grnQty.toString(),
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }
}
