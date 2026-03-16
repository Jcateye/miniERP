import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { rethrowPrismaWriteConflictAsHttpException } from '../../../common/filters/prisma-write-conflict';
import Decimal from 'decimal.js';
import {
  type CoreDocumentStatus,
  type CoreDocumentType,
  getAllowedNextStatuses,
  type StatusTransitionAttempt,
  InvalidStatusTransitionError,
} from '../../core-document/domain/status-transition';
import { AuditService } from '../../../audit/application/audit.service';
import { PlatformDbService } from '../../../database/platform-db.service';
import { InventoryPostingService } from '../../inventory/application/inventory-posting.service';
import { resolveTenantDbId } from '../../masterdata/infrastructure/prisma-tenant-id.resolver';
import { PrismaInventoryTenantTransaction } from '../../inventory/infrastructure/prisma-inventory-consistency.store';
import type {
  DocumentActionResult,
  DocumentCreateInput,
  DocumentCreateResult,
} from '../../documents/services/documents.service';
import {
  DocumentNotFoundError,
  UnknownDocumentActionError,
} from '../../documents/services/documents.service';

const ACTION_TO_STATUS: Record<string, CoreDocumentStatus> = {
  cancel: 'cancelled',
  close: 'closed',
  confirm: 'confirmed',
  pick: 'picking',
  post: 'posted',
};

function parseDocumentId(rawId: string): bigint {
  try {
    return BigInt(rawId);
  } catch {
    throw new Error(`invalid document id: ${rawId}`);
  }
}

@Injectable()
export class SalesShipmentWriteService {
  private readonly docNoCounter = new Map<string, number>();

  constructor(
    private readonly platformDb: PlatformDbService,
    private readonly auditService: AuditService,
    private readonly inventoryPostingService: InventoryPostingService,
  ) {}

  async create(
    docType: Extract<CoreDocumentType, 'SO' | 'OUT'>,
    input: DocumentCreateInput,
    tenantId: string,
    actorId: string,
    requestId: string,
  ): Promise<DocumentCreateResult> {
    try {
      const created = await this.platformDb.withTenantTx(
        { isolationLevel: 'Serializable' },
        async (tx) => {
          const tenantDbId = await resolveTenantDbId(tx, tenantId);
          const docDate = this.normalizeDocDate(input.docDate);
          const docNo = await this.nextPersistedDocNo(
            tx,
            docType,
            tenantDbId,
            docDate,
          );
          const remarks = input.remarks ?? null;

          const lines = await Promise.all(
            input.lines.map(async (line, index) => {
              const qty = new Decimal(line.qty);
              const unitPrice = new Decimal(line.unitPrice ?? '0');
              return {
                inputBinId:
                  typeof line.binId === 'string' ? line.binId.trim() : '',
                lineNo: index + 1,
                skuId: await this.resolveSkuId(tx, tenantDbId, line.skuId),
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
              tx,
              tenantDbId,
              input.customerId,
            );
            const warehouseId = await this.resolveWarehouseId(
              tx,
              tenantDbId,
              input.warehouseId,
            );

            const header = await tx.salesOrder.create({
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

            await tx.salesOrderLine.createMany({
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

            return {
              id: header.id.toString(),
              docNo,
              docType,
              status: 'draft' as const,
              docDate: header.docDate.toISOString().slice(0, 10),
              lineCount: lines.length,
            };
          }

          const soId = await this.resolveSalesOrderId(
            tx,
            tenantDbId,
            input.sourceDocId,
          );
          const warehouseId = await this.resolveWarehouseId(
            tx,
            tenantDbId,
            input.warehouseId,
          );

          const persistedLines = await Promise.all(
            lines.map(async (line) => ({
              ...line,
              binId: await this.resolveWarehouseBinId(
                tx,
                tenantDbId,
                warehouseId,
                line.inputBinId,
              ),
            })),
          );

          const header = await tx.outbound.create({
            data: {
              tenantId: tenantDbId,
              docNo,
              docDate,
              status: 'draft',
              soId,
              warehouseId,
              remarks,
              totalQty: totalQty.toString(),
              totalAmount: '0',
              createdBy: actorId,
              updatedBy: actorId,
            },
          });

          await tx.outboundLine.createMany({
            data: persistedLines.map((line) => ({
              tenantId: tenantDbId,
              outboundId: header.id,
              lineNo: line.lineNo,
              skuId: line.skuId,
              binId: line.binId,
              qty: line.qty.toString(),
            })),
          });

          return {
            id: header.id.toString(),
            docNo,
            docType,
            status: 'draft' as const,
            docDate: header.docDate.toISOString().slice(0, 10),
            lineCount: persistedLines.length,
          };
        },
      );

      try {
        this.auditService.recordAuthorization({
          requestId,
          tenantId,
          actorId,
          action: 'document.create',
          entityType: 'document',
          entityId: created.id,
          result: 'success',
          metadata: {
            docType,
            docNo: created.docNo,
            lineCount: created.lineCount,
          },
        });
      } catch {
        // best-effort: audit 失败不应影响业务返回
      }

      return created;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        rethrowPrismaWriteConflictAsHttpException(error);
      }

      throw error;
    }
  }

  async executeAction(
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

    if (
      action === 'post' &&
      (typeof idempotencyKey !== 'string' || idempotencyKey.trim().length === 0)
    ) {
      throw new HttpException(
        {
          code: 'VALIDATION_IDEMPOTENCY_KEY_REQUIRED',
          category: 'validation',
          message: 'Idempotency-Key is required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const tenantTxOptions: Prisma.TransactionIsolationLevel | undefined =
      action === 'post' ? 'Serializable' : undefined;

    const run = tenantTxOptions
      ? <T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) =>
          this.platformDb.withTenantTx({ isolationLevel: tenantTxOptions }, fn)
      : <T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) =>
          this.platformDb.withTenantTx(fn);

    try {
      const { result, auditMetadata } = await run(async (tx) => {
        const tenantDbId = await resolveTenantDbId(tx, tenantId);

        let documentId: bigint;
        try {
          documentId = parseDocumentId(id.trim());
        } catch {
          throw new DocumentNotFoundError(docType, id);
        }

        const normalizedDocumentId = documentId.toString();

        if (docType === 'SO') {
          const doc = await tx.salesOrder.findFirst({
            where: { tenantId: tenantDbId, id: documentId, deletedAt: null },
          });

          if (!doc) {
            throw new DocumentNotFoundError(docType, id);
          }

          const previousStatus = this.toCoreStatus(doc.status, docType);
          const attempt: StatusTransitionAttempt = {
            entityType: docType,
            entityId: normalizedDocumentId,
            fromStatus: previousStatus,
            toStatus: targetStatus,
          };

          const allowed = getAllowedNextStatuses(docType, previousStatus);
          if (!allowed.includes(targetStatus)) {
            throw new InvalidStatusTransitionError(attempt, allowed);
          }

          const updateResult = await tx.salesOrder.updateMany({
            where: {
              tenantId: tenantDbId,
              id: doc.id,
              status: previousStatus,
              deletedAt: null,
            },
            data: {
              status: targetStatus,
              updatedBy: actorId,
              updatedAt: new Date(),
            },
          });

          if (updateResult.count === 0) {
            throw new InvalidStatusTransitionError(
              attempt,
              getAllowedNextStatuses(docType, previousStatus),
            );
          }

          const result: DocumentActionResult = {
            success: true,
            documentId: normalizedDocumentId,
            docType,
            previousStatus,
            newStatus: targetStatus,
            action,
            inventoryPosted: false,
            ledgerEntryIds: [],
          };

          return {
            result,
            auditMetadata: {
              docType,
              previousStatus,
              newStatus: targetStatus,
              inventoryPosted: false,
              ledgerEntryIds: [] as string[],
            },
          };
        }

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

        const previousStatus = this.toCoreStatus(outbound.status, docType);
        const attempt: StatusTransitionAttempt = {
          entityType: docType,
          entityId: normalizedDocumentId,
          fromStatus: previousStatus,
          toStatus: targetStatus,
        };

        if (previousStatus === targetStatus) {
          if (action === 'post') {
            const existingLedgerEntries = await tx.inventoryLedger.findMany({
              where: {
                tenantId: tenantDbId,
                referenceType: 'OUT',
                referenceId: normalizedDocumentId,
              },
              select: { id: true },
              orderBy: { id: 'asc' },
            });

            if (existingLedgerEntries.length === 0) {
              throw new HttpException(
                {
                  code: 'CONSISTENCY_INVENTORY_LEDGER_MISSING',
                  category: 'consistency',
                  message: `Outbound ${normalizedDocumentId} is posted but inventory ledger is missing`,
                },
                HttpStatus.CONFLICT,
              );
            }

            const ledgerEntryIds = existingLedgerEntries.map((entry) =>
              entry.id.toString(),
            );

            const result: DocumentActionResult = {
              success: true,
              documentId: normalizedDocumentId,
              docType,
              previousStatus,
              newStatus: targetStatus,
              action,
              inventoryPosted: true,
              ledgerEntryIds,
            };

            return {
              result,
              auditMetadata: {
                docType,
                previousStatus,
                newStatus: targetStatus,
                inventoryPosted: true,
                ledgerEntryIds,
              },
            };
          }

          const result: DocumentActionResult = {
            success: true,
            documentId: normalizedDocumentId,
            docType,
            previousStatus,
            newStatus: targetStatus,
            action,
            inventoryPosted: false,
            ledgerEntryIds: [],
          };

          return {
            result,
            auditMetadata: {
              docType,
              previousStatus,
              newStatus: targetStatus,
              inventoryPosted: false,
              ledgerEntryIds: [] as string[],
            },
          };
        }

        const allowed = getAllowedNextStatuses(docType, previousStatus);
        if (!allowed.includes(targetStatus)) {
          throw new InvalidStatusTransitionError(attempt, allowed);
        }

        let inventoryPosted = false;
        let ledgerEntryIds: string[] = [];

        if (action === 'post') {
          const transactionalLines = await tx.outboundLine.findMany({
            where: { tenantId: tenantDbId, outboundId: documentId },
            orderBy: { lineNo: 'asc' },
          });

          const inventoryResult =
            await this.inventoryPostingService.postInTransaction(
              tenantId,
              {
                idempotencyKey,
                referenceType: 'OUT',
                referenceId: normalizedDocumentId,
                lines: transactionalLines.map((line) => ({
                  binId: line.binId?.toString() ?? null,
                  skuId: line.skuId.toString(),
                  warehouseId: (() => {
                    const warehouseId = outbound.warehouseId?.toString();
                    if (!warehouseId) {
                      throw new HttpException(
                        {
                          code: 'VALIDATION_WAREHOUSE_ID_REQUIRED',
                          category: 'validation',
                          message: `Warehouse is required for posting outbound ${normalizedDocumentId}`,
                        },
                        HttpStatus.BAD_REQUEST,
                      );
                    }
                    return warehouseId;
                  })(),
                  quantityDelta: (() => {
                    const rawQty = line.qty?.toString?.() ?? '';
                    if (!/^-?\d+$/.test(rawQty)) {
                      throw new HttpException(
                        {
                          code: 'VALIDATION_OUTBOUND_LINE_QTY_INVALID',
                          category: 'validation',
                          message: `Outbound line qty must be an integer: ${rawQty}`,
                        },
                        HttpStatus.BAD_REQUEST,
                      );
                    }
                    const parsedQty = Number.parseInt(rawQty, 10);
                    if (!Number.isSafeInteger(parsedQty) || parsedQty === 0) {
                      throw new HttpException(
                        {
                          code: 'VALIDATION_OUTBOUND_LINE_QTY_INVALID',
                          category: 'validation',
                          message: `Outbound line qty must be a non-zero safe integer: ${rawQty}`,
                        },
                        HttpStatus.BAD_REQUEST,
                      );
                    }
                    return -Math.abs(parsedQty);
                  })(),
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
              updatedAt: new Date(),
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
              entityId: normalizedDocumentId,
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
            normalizedDocumentId,
            previousStatus,
            targetStatus,
            actorId,
            requestId,
            idempotencyKey,
            inventoryResult.ledgerEntries.map((entry) => entry.id),
          );

          inventoryPosted = true;
          ledgerEntryIds = inventoryResult.ledgerEntries.map(
            (entry) => entry.id,
          );
        } else {
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
              updatedAt: new Date(),
            },
          });

          if (updateResult.count === 0) {
            throw new InvalidStatusTransitionError(
              attempt,
              getAllowedNextStatuses(docType, previousStatus),
            );
          }
        }

        const result: DocumentActionResult = {
          success: true,
          documentId: normalizedDocumentId,
          docType,
          previousStatus,
          newStatus: targetStatus,
          action,
          inventoryPosted,
          ledgerEntryIds,
        };

        return {
          result,
          auditMetadata: {
            docType,
            previousStatus,
            newStatus: targetStatus,
            inventoryPosted,
            ledgerEntryIds,
          },
        };
      });

      try {
        this.auditService.recordAuthorization({
          requestId,
          tenantId,
          actorId,
          action: `document.${action}`,
          entityType: 'document',
          entityId: result.documentId,
          result: 'success',
          metadata: auditMetadata,
        });
      } catch {
        // best-effort: audit 失败不应影响业务返回
      }

      return result;
    } catch (error) {
      if (error instanceof InvalidStatusTransitionError) {
        try {
          this.auditService.recordAuthorization({
            requestId,
            tenantId,
            actorId,
            action: `document.${action}`,
            entityType: 'document',
            entityId: error.details.entity_id,
            result: 'deny',
            reason: 'INVALID_STATUS_TRANSITION',
            metadata: {
              docType: error.details.entity_type,
              fromStatus: error.details.from_status,
              toStatus: error.details.to_status,
            },
          });
        } catch {
          // best-effort: audit 失败不应覆盖业务异常
        }
      }

      throw error;
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
    tx: Prisma.TransactionClient,
    docType: Extract<CoreDocumentType, 'SO' | 'OUT'>,
    tenantDbId: bigint,
    docDate: Date,
  ): Promise<string> {
    const ymd = this.formatDateYmd(docDate);
    const prefix = `DOC-${docType}-${ymd}-`;
    const cacheKey = `${tenantDbId.toString()}:${docType}:${ymd}`;
    let maxSeq = this.docNoCounter.get(cacheKey) ?? 0;

    const latest =
      docType === 'SO'
        ? await tx.salesOrder.findFirst({
            where: { tenantId: tenantDbId, docNo: { startsWith: prefix } },
            orderBy: { docNo: 'desc' },
            select: { docNo: true },
          })
        : await tx.outbound.findFirst({
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
    tx: Prisma.TransactionClient,
    tenantDbId: bigint,
    raw?: string,
  ): Promise<bigint | null> {
    if (!raw || raw.trim().length === 0) {
      return null;
    }

    const value = raw.trim();
    const parsed = this.toBigintOrNull(value);
    const row = await tx.warehouse.findFirst({
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
    tx: Prisma.TransactionClient,
    tenantDbId: bigint,
    warehouseId: bigint | null,
    raw?: string,
  ): Promise<bigint | null> {
    if (!warehouseId || !raw || raw.trim().length === 0) {
      return null;
    }

    const value = raw.trim();
    const parsed = this.toBigintOrNull(value);
    const row = await tx.warehouseBin.findFirst({
      where:
        parsed !== null
          ? { tenantId: tenantDbId, warehouseId, id: parsed, deletedAt: null }
          : {
              tenantId: tenantDbId,
              warehouseId,
              binCode: value,
              deletedAt: null,
            },
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

  private async resolveCustomerId(
    tx: Prisma.TransactionClient,
    tenantDbId: bigint,
    raw?: string,
  ): Promise<bigint | null> {
    if (!raw || raw.trim().length === 0) {
      return null;
    }

    const value = raw.trim();
    const parsed = this.toBigintOrNull(value);
    if (parsed !== null) {
      return parsed;
    }

    const row = await tx.customer.findFirst({
      where: { tenantId: tenantDbId, code: value, deletedAt: null },
      select: { id: true },
    });
    return row?.id ?? null;
  }

  private async resolveSalesOrderId(
    tx: Prisma.TransactionClient,
    tenantDbId: bigint,
    raw?: string,
  ): Promise<bigint | null> {
    if (!raw || raw.trim().length === 0) {
      return null;
    }

    const value = raw.trim();
    const parsed = this.toBigintOrNull(value);
    if (parsed !== null) {
      return parsed;
    }

    const row = await tx.salesOrder.findFirst({
      where: { tenantId: tenantDbId, docNo: value, deletedAt: null },
      select: { id: true },
    });
    return row?.id ?? null;
  }

  private async resolveSkuId(
    tx: Prisma.TransactionClient,
    tenantDbId: bigint,
    raw: string,
  ): Promise<bigint> {
    const value = raw.trim();
    const parsed = this.toBigintOrNull(value);
    const row = await tx.sku.findFirst({
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
    docType: Extract<CoreDocumentType, 'SO' | 'OUT'>,
  ): CoreDocumentStatus {
    if (status === 'draft' || status === 'cancelled') {
      return status;
    }
    if (docType === 'SO' && (status === 'confirmed' || status === 'closed')) {
      return status;
    }
    if (docType === 'OUT' && (status === 'picking' || status === 'posted')) {
      return status;
    }
    return 'draft';
  }

  private async createDocumentPostedOutboxEvent(
    tx: Prisma.TransactionClient,
    tenantId: bigint,
    docType: Extract<CoreDocumentType, 'SO' | 'OUT'>,
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
