import {
  Injectable,
  HttpException,
  HttpStatus,
  Inject,
  Optional,
} from '@nestjs/common';
import Decimal from 'decimal.js';
import {
  type CoreDocumentStatus,
  type CoreDocumentType,
  getAllowedNextStatuses,
  type StatusTransitionAttempt,
  InvalidStatusTransitionError,
} from '../../core-document/domain/status-transition';
import { AuditService } from '../../../audit/application/audit.service';
import { InventoryPostingService } from '../../inventory/application/inventory-posting.service';
import { PRISMA_SERVICE_TOKEN } from '../../../database/database.constants';
import { InventoryInsufficientStockError } from '../../inventory/domain/inventory.errors';
import {
  PurchaseInboundWriteService,
  SalesShipmentWriteService,
  TradingDocumentsReadService,
} from '../../trading';

export interface DocumentListItem {
  id: string;
  tenantId: string;
  docNo: string;
  docType: CoreDocumentType;
  docDate: string;
  status: CoreDocumentStatus;
  counterpartyId?: string | null;
  supplierId?: string | null;
  customerId?: string | null;
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
  binId?: string | null;
  itemNameSnapshot?: string | null;
  specModelSnapshot?: string | null;
  uom?: string | null;
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
  binId?: string;
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
    private readonly purchaseInboundWriteService: PurchaseInboundWriteService,
    private readonly salesShipmentWriteService: SalesShipmentWriteService,
    private readonly tradingDocumentsReadService: TradingDocumentsReadService,
    @Optional()
    @Inject(PRISMA_SERVICE_TOKEN)
    private readonly prisma?: unknown,
  ) {
    const nodeEnv = process.env.NODE_ENV ?? 'development';

    // Fail-closed in production: persisted store is required.
    // 避免因为 DI 绑定缺失而静默降级到 demo/in-memory 行为。
    if (nodeEnv === 'production' && !this.prisma) {
      throw new Error(
        'DocumentsService requires persisted store in production',
      );
    }

    if (nodeEnv !== 'production') {
      this.seedDemoData();
    }
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
        counterpartyId:
          demo.docType === 'PO'
            ? 'sup_001'
            : demo.docType === 'SO'
              ? 'cust_001'
              : null,
        supplierId: demo.docType === 'PO' ? 'sup_001' : null,
        customerId: demo.docType === 'SO' ? 'cust_001' : null,
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
            binId:
              demo.docType === 'GRN' || demo.docType === 'OUT'
                ? 'BIN-A-01-01'
                : null,
            itemNameSnapshot: 'HDMI 高清视频线 2米',
            specModelSnapshot: 'HDMI 2.0 / 编织外被 / 镀金',
            uom: 'PCS',
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
            binId: demo.docType === 'GRN' ? 'BIN-A-01-02' : null,
            itemNameSnapshot: 'USB-C 转 VGA 转换器',
            specModelSnapshot: '1080P / 铝合金 / 15cm',
            uom: 'PCS',
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
    if (
      this.prisma &&
      this.tradingDocumentsReadService.canHandle(query.docType)
    ) {
      try {
        return await this.tradingDocumentsReadService.list(query, tenantId);
      } catch (error) {
        if (this.shouldFallbackToInMemory(error)) {
          return this.listFromMemory(query, tenantId);
        }
        throw error;
      }
    }

    return this.listFromMemory(query, tenantId);
  }

  private listFromMemory(
    query: ListDocumentsQuery,
    tenantId: string,
  ): PaginationEnvelope<DocumentListItem> {
    const allDocs = Array.from(this.documents.values())
      .filter(
        (doc) => doc.tenantId === tenantId && doc.docType === query.docType,
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const total = allDocs.length;
    const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
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

  private shouldFallbackToInMemory(error: unknown): boolean {
    if ((process.env.NODE_ENV ?? 'development') === 'production') {
      return false;
    }

    if (!(error instanceof Error)) {
      return false;
    }

    return error.message.includes('permission denied for table tenants');
  }

  async getDetail(
    docType: CoreDocumentType,
    id: string,
    tenantId: string,
  ): Promise<DocumentDetail | null> {
    if (this.prisma && this.tradingDocumentsReadService.canHandle(docType)) {
      try {
        return await this.tradingDocumentsReadService.getDetail(
          docType as Extract<CoreDocumentType, 'PO' | 'GRN' | 'SO' | 'OUT'>,
          id,
          tenantId,
        );
      } catch (error) {
        if (this.shouldFallbackToInMemory(error)) {
          return this.documents.get(`${tenantId}:${docType}:${id}`) ?? null;
        }
        throw error;
      }
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

    this.validateCreateInput(docType, input);
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
      return this.executeActionWithInFlightDedup(cacheKey, async () => {
        try {
          return await this.salesShipmentWriteService.executeAction(
            docType,
            id,
            action,
            idempotencyKey,
            tenantId,
            actorId,
            requestId,
          );
        } catch (error) {
          if (error instanceof InventoryInsufficientStockError) {
            throw new OutboundStockInsufficientError(error.message);
          }
          throw error;
        }
      });
    }

    if (this.usePersistentStore(docType)) {
      return this.executeActionWithInFlightDedup(cacheKey, () =>
        this.purchaseInboundWriteService.executeAction(
          docType as Extract<CoreDocumentType, 'PO' | 'GRN'>,
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
              binId:
                'binId' in line &&
                typeof line.binId === 'string' &&
                line.binId.trim().length > 0
                  ? line.binId.trim()
                  : null,
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

  private validateCreateInput(
    docType: CoreDocumentType,
    input: DocumentCreateInput,
  ): void {
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

    if (
      (docType === 'GRN' || docType === 'OUT') &&
      (!input.warehouseId || input.warehouseId.trim().length === 0)
    ) {
      throw new HttpException(
        {
          code: 'VALIDATION_DOCUMENT_WAREHOUSE_REQUIRED',
          category: 'validation',
          message: `warehouseId is required for ${docType} documents`,
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

      if (
        line.binId !== undefined &&
        line.binId !== null &&
        line.binId.trim().length === 0
      ) {
        throw new HttpException(
          {
            code: 'VALIDATION_DOCUMENT_LINE_BIN_INVALID',
            category: 'validation',
            message: `line[${index}].binId must be a non-empty string when provided`,
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

  private async createByStore(
    docType: CoreDocumentType,
    input: DocumentCreateInput,
    tenantId: string,
    actorId: string,
    requestId: string,
  ): Promise<DocumentCreateResult> {
    if (this.usePersistentStore(docType)) {
      return this.purchaseInboundWriteService.create(
        docType as Extract<CoreDocumentType, 'PO' | 'GRN'>,
        input,
        tenantId,
        actorId,
        requestId,
      );
    }

    if (this.prisma && (docType === 'SO' || docType === 'OUT')) {
      return this.salesShipmentWriteService.create(
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

  private createInMemoryDocument(
    docType: CoreDocumentType,
    input: DocumentCreateInput,
    tenantId: string,
    actorId: string,
    requestId: string,
  ): Promise<DocumentCreateResult> {
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
        binId:
          typeof line.binId === 'string' && line.binId.trim().length > 0
            ? line.binId.trim()
            : null,
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
}
