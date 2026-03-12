import {
  Injectable,
  Optional,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
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
import { InventoryInsufficientStockError } from '../../inventory/domain/inventory.errors';
import { PrismaInventoryTenantTransaction } from '../../inventory/infrastructure/prisma-inventory-consistency.store';

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

export interface DocumentCreateLineInput {
  skuId: string;
  qty: string;
  unitPrice?: string;
}

export interface DocumentCreateInput {
  docDate?: string;
  remarks?: string | null;
  supplierId?: string;
  customerId?: string;
  warehouseId?: string;
  sourceDocId?: string;
  lines: DocumentCreateLineInput[];
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

export interface DocumentCreateResult {
  id: string;
  docNo: string;
  docType: CoreDocumentType;
  status: CoreDocumentStatus;
  docDate: string;
  lineCount: number;
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
  private readonly createIdempotencyCache = new Map<
    string,
    DocumentCreateResult
  >();
  private readonly inflightActionRequests = new Map<
    string,
    Promise<DocumentActionResult>
  >();

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

    if (this.prisma && (query.docType === 'SO' || query.docType === 'OUT')) {
      return this.listSalesOutboundFromDb(query, tenantId);
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

    if (this.prisma && (docType === 'SO' || docType === 'OUT')) {
      return this.getSalesOutboundDetailFromDb(docType, id, tenantId);
    }

    return this.documents.get(`${tenantId}:${docType}:${id}`) ?? null;
  }

  async create(
    docType: CoreDocumentType,
    input: DocumentCreateInput,
    tenantId: string,
    actorId: string,
    requestId: string,
    idempotencyKey: string,
  ): Promise<DocumentCreateResult> {
    this.ensureRequiredIdempotencyKey(idempotencyKey);

    const cacheKey = `${tenantId}:${docType}:${idempotencyKey}`;
    const cached = this.createIdempotencyCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    this.validateCreateInput(input);
    const created = await this.createByStore(
      docType,
      input,
      tenantId,
      actorId,
      requestId,
    );

    this.createIdempotencyCache.set(cacheKey, created);
    return created;
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
    this.ensureRequiredIdempotencyKey(idempotencyKey);
    const cacheKey = `${tenantId}:${docType}:${id}:${action}:${idempotencyKey}`;

    if (this.prisma && (docType === 'SO' || docType === 'OUT')) {
      return this.executeActionWithInFlightDedup(cacheKey, () =>
        this.executeSalesOutboundActionInDb(
          docType,
          id,
          action,
          idempotencyKey,
          tenantId,
          actorId,
          requestId,
        ),
      );
    }

    return this.executeActionWithInFlightDedup(cacheKey, () =>
      this.executeActionInMemory(
        docType,
        id,
        action,
        idempotencyKey,
        tenantId,
        actorId,
        requestId,
      ),
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
        }),
        this.prisma!.salesOrder.count({ where: { tenantId: tenantBigInt } }),
      ]);

      const soIds = rows.map((row) => row.id);
      const lineCounts =
        soIds.length === 0
          ? []
          : await this.prisma!.salesOrderLine.groupBy({
              by: ['soId'],
              where: { tenantId: tenantBigInt, soId: { in: soIds } },
              _count: { _all: true },
            });
      const lineCountById = new Map(
        lineCounts.map((item) => [item.soId.toString(), item._count._all]),
      );

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
        lineCount: lineCountById.get(row.id.toString()) ?? 0,
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
      }),
      this.prisma!.outbound.count({ where: { tenantId: tenantBigInt } }),
    ]);

    const outboundIds = rows.map((row) => row.id);
    const lineCounts =
      outboundIds.length === 0
        ? []
        : await this.prisma!.outboundLine.groupBy({
            by: ['outboundId'],
            where: { tenantId: tenantBigInt, outboundId: { in: outboundIds } },
            _count: { _all: true },
          });
    const lineCountById = new Map(
      lineCounts.map((item) => [item.outboundId.toString(), item._count._all]),
    );

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
      lineCount: lineCountById.get(row.id.toString()) ?? 0,
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
      });

      if (!row) {
        return null;
      }

      const lines = await this.prisma!.salesOrderLine.findMany({
        where: { tenantId: tenantBigInt, soId: row.id },
        orderBy: { lineNo: 'asc' },
      });

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
        lineCount: lines.length,
        totalQty: row.totalQty.toString(),
        totalAmount: row.totalAmount.toString(),
        lines: lines.map((line) => ({
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
    });

    if (!row) {
      return null;
    }

    const lines = await this.prisma!.outboundLine.findMany({
      where: { tenantId: tenantBigInt, outboundId: row.id },
      orderBy: { lineNo: 'asc' },
    });

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
      lineCount: lines.length,
      totalQty: row.totalQty.toString(),
      totalAmount: '0',
      lines: lines.map((line) => ({
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
    const targetStatus = ACTION_TO_STATUS[action];
    if (!targetStatus) {
      throw new UnknownDocumentActionError(action);
    }

    const detail = await this.getSalesOutboundDetailFromDb(
      docType,
      id,
      tenantId,
    );
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
        metadata: {
          docType,
          fromStatus: detail.status,
          toStatus: targetStatus,
        },
      });
      throw error;
    }

    const previousStatus = detail.status;
    let inventoryPosted = false;
    let ledgerEntryIds: string[] = [];

    if (docType === 'OUT' && action === 'post') {
      try {
        const tenantDbId = await this.resolveTenantDbId(tenantId);
        const documentId = parseDocumentId(id);
        const result = await this.prisma!.$transaction(
          async (tx) => {
            const outbound = await tx.outbound.findFirst({
              where: {
                tenantId: tenantDbId,
                id: documentId,
                deletedAt: null,
              },
            });

            if (!outbound) {
              throw new DocumentNotFoundError(docType, id);
            }

            const inventoryResult =
              await this.inventoryPostingService.postInTransaction(
                tenantId,
                {
                  idempotencyKey,
                  referenceType: 'OUT',
                  referenceId: id,
                  lines: detail.lines.map((line) => ({
                    skuId: line.skuId,
                    warehouseId: outbound.warehouseId?.toString() ?? 'WH-001',
                    quantityDelta: -Math.abs(Math.trunc(Number(line.qty) || 0)),
                  })),
                },
                requestId,
                new PrismaInventoryTenantTransaction(tx, tenantId, tenantDbId),
              );

            const updateResult = await tx.outbound.updateMany({
              where: {
                tenantId: tenantDbId,
                id: documentId,
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

            await tx.stateTransitionLog.create({
              data: {
                tenantId: tenantDbId,
                entityType: docType,
                entityId: id,
                fromStatus: previousStatus,
                toStatus: targetStatus,
                actorId,
                requestId,
              },
            });

            await this.createDocumentPostedOutboxEvent(
              tx,
              tenantDbId,
              docType,
              id,
              previousStatus,
              targetStatus,
              actorId,
              requestId,
              idempotencyKey,
              inventoryResult.ledgerEntries.map((entry) => entry.id),
            );

            return inventoryResult;
          },
          { isolationLevel: 'Serializable' },
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
    } else if (action !== 'post') {
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

    if (
      (docType === 'GRN' || docType === 'OUT' || docType === 'ADJ') &&
      action === 'post'
    ) {
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
        if (
          docType === 'OUT' &&
          error instanceof InventoryInsufficientStockError
        ) {
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

  private validateCreateInput(input: DocumentCreateInput): void {
    if (!Array.isArray(input.lines) || input.lines.length === 0) {
      throw new HttpException(
        {
          code: 'VALIDATION_DOCUMENT_LINES_REQUIRED',
          category: 'validation',
          message: 'lines must not be empty',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    input.lines.forEach((line, index) => {
      if (!line || typeof line !== 'object') {
        throw new HttpException(
          {
            code: 'VALIDATION_DOCUMENT_LINE_INVALID',
            category: 'validation',
            message: `line[${index}] must be an object`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!line.skuId || line.skuId.trim().length === 0) {
        throw new HttpException(
          {
            code: 'VALIDATION_DOCUMENT_LINE_SKU_REQUIRED',
            category: 'validation',
            message: `line[${index}].skuId is required`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      let qty: Decimal;
      try {
        qty = new Decimal(line.qty);
      } catch {
        throw new HttpException(
          {
            code: 'VALIDATION_DOCUMENT_LINE_QTY_INVALID',
            category: 'validation',
            message: `line[${index}].qty must be numeric`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!qty.isFinite() || qty.eq(0)) {
        throw new HttpException(
          {
            code: 'VALIDATION_DOCUMENT_LINE_QTY_INVALID',
            category: 'validation',
            message: `line[${index}].qty must be non-zero`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    });
  }

  private normalizeDocDate(value?: string): Date {
    if (!value || value.trim().length === 0) {
      return new Date();
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return new Date();
    }
    return parsed;
  }

  private formatDateYmd(value: Date): string {
    return value.toISOString().slice(0, 10).replace(/-/g, '');
  }

  private nextInMemoryDocNo(docType: CoreDocumentType, docDate: Date): string {
    const key = `${docType}:${this.formatDateYmd(docDate)}`;
    const seq = (this.docNoCounter.get(key) ?? 0) + 1;
    this.docNoCounter.set(key, seq);
    return `DOC-${docType}-${this.formatDateYmd(docDate)}-${seq.toString().padStart(3, '0')}`;
  }

  private parseSeqFromDocNo(docNo: string): number {
    const matched = docNo.match(/-(\d+)$/);
    if (!matched) {
      return 0;
    }
    return Number(matched[1] ?? 0);
  }

  private async nextPersistedDocNo(
    docType: Extract<CoreDocumentType, 'PO' | 'GRN' | 'SO' | 'OUT'>,
    tenantDbId: bigint,
    docDate: Date,
  ): Promise<string> {
    const ymd = this.formatDateYmd(docDate);
    const prefix = `DOC-${docType}-${ymd}-`;
    const cacheKey = `${docType}:${ymd}`;

    let maxSeq = this.docNoCounter.get(cacheKey) ?? 0;

    if (!this.prisma) {
      const seq = maxSeq + 1;
      this.docNoCounter.set(cacheKey, seq);
      return `${prefix}${seq.toString().padStart(3, '0')}`;
    }

    if (docType === 'PO') {
      const latest = await this.prisma.purchaseOrder.findFirst({
        where: { tenantId: tenantDbId, docNo: { startsWith: prefix } },
        orderBy: { docNo: 'desc' },
        select: { docNo: true },
      });
      maxSeq = Math.max(
        maxSeq,
        latest ? this.parseSeqFromDocNo(latest.docNo) : 0,
      );
    } else if (docType === 'GRN') {
      const latest = await this.prisma.grn.findFirst({
        where: { tenantId: tenantDbId, docNo: { startsWith: prefix } },
        orderBy: { docNo: 'desc' },
        select: { docNo: true },
      });
      maxSeq = Math.max(
        maxSeq,
        latest ? this.parseSeqFromDocNo(latest.docNo) : 0,
      );
    } else if (docType === 'SO') {
      const latest = await this.prisma.salesOrder.findFirst({
        where: { tenantId: tenantDbId, docNo: { startsWith: prefix } },
        orderBy: { docNo: 'desc' },
        select: { docNo: true },
      });
      maxSeq = Math.max(
        maxSeq,
        latest ? this.parseSeqFromDocNo(latest.docNo) : 0,
      );
    } else {
      const latest = await this.prisma.outbound.findFirst({
        where: { tenantId: tenantDbId, docNo: { startsWith: prefix } },
        orderBy: { docNo: 'desc' },
        select: { docNo: true },
      });
      maxSeq = Math.max(
        maxSeq,
        latest ? this.parseSeqFromDocNo(latest.docNo) : 0,
      );
    }

    const next = maxSeq + 1;
    this.docNoCounter.set(cacheKey, next);
    return `${prefix}${next.toString().padStart(3, '0')}`;
  }

  private async resolveWarehouseId(
    tenantDbId: bigint,
    raw?: string,
  ): Promise<bigint | null> {
    if (!this.prisma || !raw || raw.trim().length === 0) {
      return null;
    }

    const value = raw.trim();
    const parsed = this.toBigintOrNull(value);
    if (parsed !== null) {
      return parsed;
    }

    const row = await this.prisma.warehouse.findFirst({
      where: { tenantId: tenantDbId, code: value, deletedAt: null },
      select: { id: true },
    });
    return row?.id ?? null;
  }

  private async resolveSupplierId(
    tenantDbId: bigint,
    raw?: string,
  ): Promise<bigint | null> {
    if (!this.prisma || !raw || raw.trim().length === 0) {
      return null;
    }

    const value = raw.trim();
    const parsed = this.toBigintOrNull(value);
    if (parsed !== null) {
      return parsed;
    }

    const row = await this.prisma.supplier.findFirst({
      where: { tenantId: tenantDbId, code: value, deletedAt: null },
      select: { id: true },
    });
    return row?.id ?? null;
  }

  private async resolveCustomerId(
    tenantDbId: bigint,
    raw?: string,
  ): Promise<bigint | null> {
    if (!this.prisma || !raw || raw.trim().length === 0) {
      return null;
    }

    const value = raw.trim();
    const parsed = this.toBigintOrNull(value);
    if (parsed !== null) {
      return parsed;
    }

    const row = await this.prisma.customer.findFirst({
      where: { tenantId: tenantDbId, code: value, deletedAt: null },
      select: { id: true },
    });
    return row?.id ?? null;
  }

  private async resolvePurchaseOrderId(
    tenantDbId: bigint,
    raw?: string,
  ): Promise<bigint | null> {
    if (!this.prisma || !raw || raw.trim().length === 0) {
      return null;
    }

    const value = raw.trim();
    const parsed = this.toBigintOrNull(value);
    if (parsed !== null) {
      return parsed;
    }

    const row = await this.prisma.purchaseOrder.findFirst({
      where: { tenantId: tenantDbId, docNo: value, deletedAt: null },
      select: { id: true },
    });
    return row?.id ?? null;
  }

  private async resolveSalesOrderId(
    tenantDbId: bigint,
    raw?: string,
  ): Promise<bigint | null> {
    if (!this.prisma || !raw || raw.trim().length === 0) {
      return null;
    }

    const value = raw.trim();
    const parsed = this.toBigintOrNull(value);
    if (parsed !== null) {
      return parsed;
    }

    const row = await this.prisma.salesOrder.findFirst({
      where: { tenantId: tenantDbId, docNo: value, deletedAt: null },
      select: { id: true },
    });
    return row?.id ?? null;
  }

  private async resolveSkuId(tenantDbId: bigint, raw: string): Promise<bigint> {
    if (!this.prisma) {
      throw new HttpException(
        {
          code: 'VALIDATION_SKU_NOT_FOUND',
          category: 'validation',
          message: `SKU not found: ${raw}`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const value = raw.trim();
    const parsed = this.toBigintOrNull(value);
    if (parsed !== null) {
      return parsed;
    }

    const row = await this.prisma.sku.findFirst({
      where: { tenantId: tenantDbId, skuCode: value, deletedAt: null },
      select: { id: true },
    });

    if (!row) {
      throw new HttpException(
        {
          code: 'VALIDATION_SKU_NOT_FOUND',
          category: 'validation',
          message: `SKU not found: ${raw}`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return row.id;
  }

  private toBigintOrNull(raw: string): bigint | null {
    try {
      return BigInt(raw);
    } catch {
      return null;
    }
  }

  private async createByStore(
    docType: CoreDocumentType,
    input: DocumentCreateInput,
    tenantId: string,
    actorId: string,
    requestId: string,
  ): Promise<DocumentCreateResult> {
    if (this.usePersistentStore(docType)) {
      return this.createPersistentDocument(
        docType as Extract<CoreDocumentType, 'PO' | 'GRN'>,
        input,
        tenantId,
        actorId,
        requestId,
      );
    }

    if (this.prisma && (docType === 'SO' || docType === 'OUT')) {
      return this.createSalesOutboundDocument(
        docType,
        input,
        tenantId,
        actorId,
        requestId,
      );
    }

    return this.createInMemoryDocument(
      docType,
      input,
      tenantId,
      actorId,
      requestId,
    );
  }

  private async createPersistentDocument(
    docType: Extract<CoreDocumentType, 'PO' | 'GRN'>,
    input: DocumentCreateInput,
    tenantId: string,
    actorId: string,
    requestId: string,
  ): Promise<DocumentCreateResult> {
    if (!this.prisma) {
      throw new Error('Prisma service is unavailable');
    }

    const tenantDbId = await this.resolveTenantDbId(tenantId);
    const docDate = this.normalizeDocDate(input.docDate);
    const docNo = await this.nextPersistedDocNo(docType, tenantDbId, docDate);
    const remarks = input.remarks ?? null;

    const lines = await Promise.all(
      input.lines.map(async (line, index) => {
        const qty = new Decimal(line.qty);
        const unitPrice = new Decimal(line.unitPrice ?? '0');
        return {
          lineNo: index + 1,
          skuId: await this.resolveSkuId(tenantDbId, line.skuId),
          qty,
          unitPrice,
          amount: qty.mul(unitPrice),
        };
      }),
    );

    const totalQty = lines.reduce(
      (sum, line) => sum.add(line.qty),
      new Decimal(0),
    );
    const totalAmount = lines.reduce(
      (sum, line) => sum.add(line.amount),
      new Decimal(0),
    );

    if (docType === 'PO') {
      const supplierId = await this.resolveSupplierId(
        tenantDbId,
        input.supplierId,
      );
      const warehouseId = await this.resolveWarehouseId(
        tenantDbId,
        input.warehouseId,
      );

      const header = await this.prisma.purchaseOrder.create({
        data: {
          tenantId: tenantDbId,
          docNo,
          docDate,
          status: 'draft',
          supplierId,
          warehouseId,
          remarks,
          totalQty: totalQty.toString(),
          totalAmount: totalAmount.toString(),
          createdBy: actorId,
          updatedBy: actorId,
        },
      });

      await this.prisma.purchaseOrderLine.createMany({
        data: lines.map((line) => ({
          tenantId: tenantDbId,
          poId: header.id,
          lineNo: line.lineNo,
          skuId: line.skuId,
          qty: line.qty.toString(),
          unitPrice: line.unitPrice.toString(),
          amount: line.amount.toString(),
        })),
      });

      this.auditService.recordAuthorization({
        requestId,
        tenantId,
        actorId,
        action: 'document.create',
        entityType: 'document',
        entityId: header.id.toString(),
        result: 'success',
        metadata: { docType, docNo, lineCount: lines.length },
      });

      return {
        id: header.id.toString(),
        docNo,
        docType,
        status: 'draft',
        docDate: header.docDate.toISOString().slice(0, 10),
        lineCount: lines.length,
      };
    }

    const poId = await this.resolvePurchaseOrderId(
      tenantDbId,
      input.sourceDocId,
    );
    const warehouseId = await this.resolveWarehouseId(
      tenantDbId,
      input.warehouseId,
    );

    const header = await this.prisma.grn.create({
      data: {
        tenantId: tenantDbId,
        docNo,
        docDate,
        status: 'draft',
        poId,
        warehouseId,
        remarks,
        totalQty: totalQty.toString(),
        totalAmount: totalAmount.toString(),
        createdBy: actorId,
        updatedBy: actorId,
      },
    });

    await this.prisma.grnLine.createMany({
      data: lines.map((line) => ({
        tenantId: tenantDbId,
        grnId: header.id,
        lineNo: line.lineNo,
        skuId: line.skuId,
        qty: line.qty.toString(),
        unitPrice: line.unitPrice.toString(),
        amount: line.amount.toString(),
      })),
    });

    this.auditService.recordAuthorization({
      requestId,
      tenantId,
      actorId,
      action: 'document.create',
      entityType: 'document',
      entityId: header.id.toString(),
      result: 'success',
      metadata: { docType, docNo, lineCount: lines.length },
    });

    return {
      id: header.id.toString(),
      docNo,
      docType,
      status: 'draft',
      docDate: header.docDate.toISOString().slice(0, 10),
      lineCount: lines.length,
    };
  }

  private async createSalesOutboundDocument(
    docType: Extract<CoreDocumentType, 'SO' | 'OUT'>,
    input: DocumentCreateInput,
    tenantId: string,
    actorId: string,
    requestId: string,
  ): Promise<DocumentCreateResult> {
    if (!this.prisma) {
      throw new Error('Prisma service is unavailable');
    }

    const tenantDbId = await this.resolveTenantDbId(tenantId);
    const docDate = this.normalizeDocDate(input.docDate);
    const docNo = await this.nextPersistedDocNo(docType, tenantDbId, docDate);
    const remarks = input.remarks ?? null;

    const lines = await Promise.all(
      input.lines.map(async (line, index) => {
        const qty = new Decimal(line.qty);
        const unitPrice = new Decimal(line.unitPrice ?? '0');
        return {
          lineNo: index + 1,
          skuId: await this.resolveSkuId(tenantDbId, line.skuId),
          qty,
          unitPrice,
          amount: qty.mul(unitPrice),
        };
      }),
    );

    const totalQty = lines.reduce(
      (sum, line) => sum.add(line.qty),
      new Decimal(0),
    );
    const totalAmount = lines.reduce(
      (sum, line) => sum.add(line.amount),
      new Decimal(0),
    );

    if (docType === 'SO') {
      const customerId = await this.resolveCustomerId(
        tenantDbId,
        input.customerId,
      );
      const warehouseId = await this.resolveWarehouseId(
        tenantDbId,
        input.warehouseId,
      );

      const header = await this.prisma.salesOrder.create({
        data: {
          tenantId: tenantDbId,
          docNo,
          docDate,
          status: 'draft',
          customerId,
          warehouseId,
          remarks,
          totalQty: totalQty.toString(),
          totalAmount: totalAmount.toString(),
          createdBy: actorId,
          updatedBy: actorId,
        },
      });

      await this.prisma.salesOrderLine.createMany({
        data: lines.map((line) => ({
          tenantId: tenantDbId,
          soId: header.id,
          lineNo: line.lineNo,
          skuId: line.skuId,
          qty: line.qty.toString(),
          unitPrice: line.unitPrice.toString(),
          amount: line.amount.toString(),
        })),
      });

      this.auditService.recordAuthorization({
        requestId,
        tenantId,
        actorId,
        action: 'document.create',
        entityType: 'document',
        entityId: header.id.toString(),
        result: 'success',
        metadata: { docType, docNo, lineCount: lines.length },
      });

      return {
        id: header.id.toString(),
        docNo,
        docType,
        status: 'draft',
        docDate: header.docDate.toISOString().slice(0, 10),
        lineCount: lines.length,
      };
    }

    const soId = await this.resolveSalesOrderId(tenantDbId, input.sourceDocId);
    const warehouseId = await this.resolveWarehouseId(
      tenantDbId,
      input.warehouseId,
    );

    const header = await this.prisma.outbound.create({
      data: {
        tenantId: tenantDbId,
        docNo,
        docDate,
        status: 'draft',
        soId,
        warehouseId,
        remarks,
        totalQty: totalQty.toString(),
        createdBy: actorId,
        updatedBy: actorId,
      },
    });

    await this.prisma.outboundLine.createMany({
      data: lines.map((line) => ({
        tenantId: tenantDbId,
        outboundId: header.id,
        lineNo: line.lineNo,
        skuId: line.skuId,
        qty: line.qty.toString(),
      })),
    });

    this.auditService.recordAuthorization({
      requestId,
      tenantId,
      actorId,
      action: 'document.create',
      entityType: 'document',
      entityId: header.id.toString(),
      result: 'success',
      metadata: { docType, docNo, lineCount: lines.length },
    });

    return {
      id: header.id.toString(),
      docNo,
      docType,
      status: 'draft',
      docDate: header.docDate.toISOString().slice(0, 10),
      lineCount: lines.length,
    };
  }

  private createInMemoryDocument(
    docType: CoreDocumentType,
    input: DocumentCreateInput,
    tenantId: string,
    actorId: string,
    requestId: string,
  ): DocumentCreateResult {
    const docDate = this.normalizeDocDate(input.docDate);
    const docNo = this.nextInMemoryDocNo(docType, docDate);
    const now = new Date().toISOString();
    const id = `${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const lines = input.lines.map((line, index) => {
      const qty = new Decimal(line.qty);
      const unitPrice = new Decimal(line.unitPrice ?? '0');
      return {
        id: `${id}-L${index + 1}`,
        docId: id,
        lineNo: index + 1,
        skuId: line.skuId.trim(),
        qty: qty.toString(),
        unitPrice: unitPrice.toString(),
        amount: qty.mul(unitPrice).toString(),
        taxAmount: '0',
      };
    });

    const totalQty = lines.reduce(
      (sum, line) => sum.add(new Decimal(line.qty)),
      new Decimal(0),
    );
    const totalAmount = lines.reduce(
      (sum, line) => sum.add(new Decimal(line.amount)),
      new Decimal(0),
    );

    const detail: DocumentDetail = {
      id,
      tenantId,
      docNo,
      docType,
      docDate: docDate.toISOString().slice(0, 10),
      status: 'draft',
      remarks: input.remarks ?? null,
      createdAt: now,
      createdBy: actorId,
      updatedAt: now,
      updatedBy: actorId,
      deletedAt: null,
      deletedBy: null,
      lineCount: lines.length,
      totalQty: totalQty.toString(),
      totalAmount: totalAmount.toString(),
      lines,
    };

    this.documents.set(`${tenantId}:${docType}:${id}`, detail);
    this.auditService.recordAuthorization({
      requestId,
      tenantId,
      actorId,
      action: 'document.create',
      entityType: 'document',
      entityId: id,
      result: 'success',
      metadata: { docType, docNo, lineCount: lines.length },
    });

    return Promise.resolve({
      id,
      docNo,
      docType,
      status: 'draft',
      docDate: detail.docDate,
      lineCount: lines.length,
    });
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
      const inventoryResult = await this.prisma.$transaction(
        async (tx) => {
          const transactionalDoc = await tx.grn.findFirst({
            where: {
              tenantId: tenantDbId,
              id: doc.id,
              deletedAt: null,
            },
          });

          if (!transactionalDoc) {
            throw new Error(`Document not found: ${docType}/${id}`);
          }

          const lines = await tx.grnLine.findMany({
            where: { tenantId: tenantDbId, grnId: doc.id },
            orderBy: { lineNo: 'asc' },
          });

          await this.validateGrnPrePost(
            tx,
            tenantDbId,
            transactionalDoc,
            lines,
          );

          const result = await this.inventoryPostingService.postInTransaction(
            tenantId,
            {
              idempotencyKey,
              referenceType: 'GRN',
              referenceId: id,
              lines: lines.map((line) => {
                const qty = new Decimal(line.qty.toString());
                return {
                  skuId: line.skuId.toString(),
                  warehouseId: transactionalDoc.warehouseId!.toString(),
                  quantityDelta: qty.toNumber(),
                };
              }),
            },
            requestId,
            new PrismaInventoryTenantTransaction(tx, tenantId, tenantDbId),
          );

          const updateResult = await tx.grn.updateMany({
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

          await tx.stateTransitionLog.create({
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

          await this.createDocumentPostedOutboxEvent(
            tx,
            tenantDbId,
            docType,
            id,
            previousStatus,
            targetStatus,
            actorId,
            requestId,
            idempotencyKey,
            result.ledgerEntries.map((entry) => entry.id),
          );

          return result;
        },
        { isolationLevel: 'Serializable' },
      );

      inventoryPosted = true;
      ledgerEntryIds = inventoryResult.ledgerEntries.map((entry) => entry.id);
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

    if (action !== 'post') {
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
    client: Pick<
      Prisma.TransactionClient,
      'purchaseOrder' | 'purchaseOrderLine'
    >,
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

    const po = await client.purchaseOrder.findFirst({
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

    const poLines = await client.purchaseOrderLine.findMany({
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

  private ensureRequiredIdempotencyKey(idempotencyKey: string): void {
    if (
      typeof idempotencyKey !== 'string' ||
      idempotencyKey.trim().length === 0
    ) {
      throw new Error('Idempotency-Key is required');
    }
  }

  private async executeActionWithInFlightDedup(
    cacheKey: string,
    work: () => Promise<DocumentActionResult>,
  ): Promise<DocumentActionResult> {
    const cachedResult = this.idempotencyCache.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const inflight = this.inflightActionRequests.get(cacheKey);
    if (inflight) {
      return inflight;
    }

    const task = work()
      .then((result) => {
        this.idempotencyCache.set(cacheKey, result);
        return result;
      })
      .finally(() => {
        this.inflightActionRequests.delete(cacheKey);
      });

    this.inflightActionRequests.set(cacheKey, task);
    return task;
  }

  private async createDocumentPostedOutboxEvent(
    tx: Prisma.TransactionClient,
    tenantId: bigint,
    docType: CoreDocumentType,
    documentId: string,
    previousStatus: CoreDocumentStatus,
    newStatus: CoreDocumentStatus,
    actorId: string,
    requestId: string,
    idempotencyKey: string,
    ledgerEntryIds: readonly string[],
  ): Promise<void> {
    await tx.outboxEvent.create({
      data: {
        tenantId,
        aggregateType: 'document',
        aggregateId: documentId,
        eventType: `document.${docType.toLowerCase()}.posted`,
        payload: {
          docType,
          documentId,
          previousStatus,
          newStatus,
          actorId,
          requestId,
          idempotencyKey,
          ledgerEntryIds,
        } as Prisma.InputJsonValue,
      },
    });
  }
}
