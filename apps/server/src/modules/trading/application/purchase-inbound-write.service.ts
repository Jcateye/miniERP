import {
  HttpException,
  HttpStatus,
  Injectable,
  Optional,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
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
import { PrismaService } from '../../../database/prisma.service';
import { PrismaInventoryTenantTransaction } from '../../inventory/infrastructure/prisma-inventory-consistency.store';
import type {
  DocumentActionResult,
  DocumentCreateInput,
  DocumentCreateResult,
} from '../../documents/services/documents.service';

const ACTION_TO_STATUS: Record<string, CoreDocumentStatus> = {
  cancel: 'cancelled',
  close: 'closed',
  confirm: 'confirmed',
  post: 'posted',
  validate: 'validating',
};

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
export class PurchaseInboundWriteService {
  private readonly docNoCounter = new Map<string, number>();

  constructor(
    private readonly auditService: AuditService,
    private readonly inventoryPostingService: InventoryPostingService,
    @Optional() private readonly prisma?: PrismaService,
  ) {}

  async create(
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
          inputBinId: typeof line.binId === 'string' ? line.binId.trim() : '',
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

    const poId = await this.resolvePurchaseOrderId(tenantDbId, input.sourceDocId);
    const warehouseId = await this.resolveWarehouseId(
      tenantDbId,
      input.warehouseId,
    );
    const persistedLines = await Promise.all(
      lines.map(async (line) => ({
        ...line,
        binId: await this.resolveWarehouseBinId(
          tenantDbId,
          warehouseId,
          line.inputBinId,
        ),
      })),
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
      data: persistedLines.map((line) => ({
        tenantId: tenantDbId,
        grnId: header.id,
        lineNo: line.lineNo,
        skuId: line.skuId,
        binId: line.binId,
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
        lineCount: persistedLines.length,
      };
  }

  async executeAction(
    docType: Extract<CoreDocumentType, 'PO' | 'GRN'>,
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
                  binId: line.binId?.toString() ?? null,
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
      throw new Error(
        `tenantId is not bigint-compatible and no tenant code matched: ${tenantId}`,
      );
    }
  }

  private normalizeDocDate(value?: string): Date {
    if (!value || value.trim().length === 0) {
      return new Date();
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  private formatDateYmd(value: Date): string {
    return value.toISOString().slice(0, 10).replace(/-/g, '');
  }

  private parseSeqFromDocNo(docNo: string): number {
    const matched = docNo.match(/-(\d+)$/);
    if (!matched) {
      return 0;
    }
    return Number(matched[1] ?? 0);
  }

  private async nextPersistedDocNo(
    docType: Extract<CoreDocumentType, 'PO' | 'GRN'>,
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

    const latest =
      docType === 'PO'
        ? await this.prisma.purchaseOrder.findFirst({
            where: { tenantId: tenantDbId, docNo: { startsWith: prefix } },
            orderBy: { docNo: 'desc' },
            select: { docNo: true },
          })
        : await this.prisma.grn.findFirst({
            where: { tenantId: tenantDbId, docNo: { startsWith: prefix } },
            orderBy: { docNo: 'desc' },
            select: { docNo: true },
          });

    maxSeq = Math.max(
      maxSeq,
      latest ? this.parseSeqFromDocNo(latest.docNo) : 0,
    );

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
    const row = await this.prisma.warehouse.findFirst({
      where:
        parsed !== null
          ? { tenantId: tenantDbId, id: parsed, deletedAt: null }
          : { tenantId: tenantDbId, code: value, deletedAt: null },
      select: { id: true },
    });

    if (!row) {
      throw new HttpException(
        {
          code: 'VALIDATION_WAREHOUSE_NOT_FOUND',
          category: 'validation',
          message: `Warehouse not found: ${raw}`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return row.id;
  }

  private async resolveWarehouseBinId(
    tenantDbId: bigint,
    warehouseId: bigint | null,
    raw?: string,
  ): Promise<bigint | null> {
    if (!this.prisma || !warehouseId || !raw || raw.trim().length === 0) {
      return null;
    }

    const value = raw.trim();
    const parsed = this.toBigintOrNull(value);
    const row = await this.prisma.warehouseBin.findFirst({
      where:
        parsed !== null
          ? { tenantId: tenantDbId, warehouseId, id: parsed, deletedAt: null }
          : { tenantId: tenantDbId, warehouseId, binCode: value, deletedAt: null },
      select: { id: true },
    });

    if (!row) {
      throw new HttpException(
        {
          code: 'VALIDATION_WAREHOUSE_BIN_NOT_FOUND',
          category: 'validation',
          message: `Warehouse bin not found: ${raw}`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return row.id;
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
    const row = await this.prisma.sku.findFirst({
      where:
        parsed !== null
          ? { tenantId: tenantDbId, id: parsed, deletedAt: null }
          : { tenantId: tenantDbId, skuCode: value, deletedAt: null },
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

  private toCoreStatus(
    status: string,
    docType: Extract<CoreDocumentType, 'PO' | 'GRN'>,
  ): CoreDocumentStatus {
    if (status === 'draft' || status === 'cancelled') {
      return status;
    }
    if (docType === 'PO' && (status === 'confirmed' || status === 'closed')) {
      return status;
    }
    if (docType === 'GRN' && (status === 'validating' || status === 'posted')) {
      return status;
    }
    return 'draft';
  }

  private async createDocumentPostedOutboxEvent(
    tx: Prisma.TransactionClient,
    tenantId: bigint,
    docType: Extract<CoreDocumentType, 'PO' | 'GRN'>,
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
