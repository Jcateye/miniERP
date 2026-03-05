import { Injectable } from '@nestjs/common';
import {
  type CoreDocumentStatus,
  type CoreDocumentType,
  getAllowedNextStatuses,
  type StatusTransitionAttempt,
  InvalidStatusTransitionError,
} from '../../core-document/domain/status-transition';
import { AuditService } from '../../../audit/application/audit.service';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';
import { InventoryPostingService } from '../../inventory/application/inventory-posting.service';

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

@Injectable()
export class DocumentsService {
  private readonly documents = new Map<string, DocumentDetail>();
  private readonly docNoCounter = new Map<string, number>();
  // HIGH-1 Fix: 内存幂等性缓存（P0 阶段限制：重启后丢失）
  // P1/P2 阶段需要替换为持久化存储
  private readonly idempotencyCache = new Map<string, DocumentActionResult>();

  constructor(
    private readonly auditService: AuditService,
    private readonly tenantContextService: TenantContextService,
    private readonly inventoryPostingService: InventoryPostingService,
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
            qty: '120',
            unitPrice: '320',
            amount: '38400',
            taxAmount: '0',
          },
          {
            id: `${demo.id}-L2`,
            docId: demo.id,
            lineNo: 2,
            skuId: 'ADP-USB-C-DP',
            qty: '80',
            unitPrice: '420',
            amount: '33600',
            taxAmount: '0',
          },
        ],
      };

      this.documents.set(`${tenantId}:${demo.docType}:${demo.id}`, doc);
    }
  }

  list(
    query: ListDocumentsQuery,
    tenantId: string,
  ): PaginationEnvelope<DocumentListItem> {
    const allDocs = Array.from(this.documents.values())
      .filter(
        (doc) =>
          doc.tenantId === tenantId && doc.docType === query.docType,
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

  getDetail(
    docType: CoreDocumentType,
    id: string,
    tenantId: string,
  ): DocumentDetail | null {
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
    // HIGH-1 Fix: 幂等性检查 - 相同 key 返回缓存结果
    const cacheKey = `${tenantId}:${idempotencyKey}`;
    const cachedResult = this.idempotencyCache.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
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

    // Update status
    const updatedDoc: DocumentDetail = {
      ...doc,
      status: targetStatus,
      updatedAt: new Date().toISOString(),
      updatedBy: actorId,
    };
    this.documents.set(key, updatedDoc);

    let inventoryPosted = false;
    let ledgerEntryIds: string[] = [];

    // Post to inventory for GRN/OUT
    if ((docType === 'GRN' || docType === 'OUT') && action === 'post') {
      const quantityDelta = docType === 'GRN' ? 1 : -1;
      const result = await this.inventoryPostingService.post(tenantId, {
        idempotencyKey,
        referenceType: docType,
        referenceId: id,
        lines: doc.lines.map((line) => ({
          skuId: line.skuId,
          warehouseId: 'WH-001',
          quantityDelta: parseInt(line.qty, 10) * quantityDelta,
        })),
      }, requestId);

      inventoryPosted = true;
      ledgerEntryIds = result.ledgerEntries.map((e) => e.id);
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

    // HIGH-1 Fix: 缓存结果以实现幂等性
    this.idempotencyCache.set(cacheKey, result);

    return result;
  }
}
