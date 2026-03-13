import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Post,
  Query,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import type {
  InventoryMovementCommand,
  InventoryMovementResponse,
} from '@minierp/shared';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';
import { InventoryPostingService } from '../application/inventory-posting.service';
import type {
  InventoryBalanceSnapshot,
  InventoryConsistencyStore,
  InventoryLedgerEntry,
} from '../domain/inventory.types';
import {
  InventoryAlreadyReversedError,
  InventoryIdempotencyConflictError,
  InventoryInsufficientStockError,
  InventoryLedgerNotFoundError,
} from '../domain/inventory.errors';

export interface InventoryBalanceResponse {
  readonly data: readonly InventoryBalanceSnapshot[];
  readonly total: number;
}

export interface InventoryLedgerResponse {
  readonly data: readonly InventoryLedgerEntry[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
}

function parsePositiveInt(
  value: string | undefined,
  field: string,
  fallback: number,
): number {
  if (value === undefined) {
    return fallback;
  }

  if (!/^[1-9]\d*$/.test(value)) {
    throw new BadRequestException({
      category: 'validation',
      code: 'VALIDATION_INVALID_QUERY',
      message: `${field} must be a positive integer`,
    });
  }

  return Number(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function validationError(message: string): BadRequestException {
  return new BadRequestException({
    category: 'validation',
    code: 'VALIDATION_INVALID_PAYLOAD',
    message,
  });
}

function conflictError(
  code: string,
  message: string,
  details?: Record<string, unknown>,
): ConflictException {
  return new ConflictException({
    category: 'conflict',
    code,
    message,
    details,
  });
}

function notFoundError(message: string): NotFoundException {
  return new NotFoundException({
    category: 'not_found',
    code: 'NOT_FOUND_LEDGER',
    message,
  });
}

function parseMovementPayload(payload: unknown): InventoryMovementCommand {
  if (typeof payload !== 'object' || payload === null) {
    throw validationError('Request body must be an object');
  }

  const candidate = payload as Record<string, unknown>;
  const skuId = candidate.skuId;
  const warehouseId = candidate.warehouseId;
  const binId = candidate.binId;
  const referenceId = candidate.referenceId;

  if (!isNonEmptyString(skuId)) {
    throw validationError('skuId is required');
  }

  if (!isNonEmptyString(warehouseId)) {
    throw validationError('warehouseId is required');
  }

  if (binId !== undefined && binId !== null && !isNonEmptyString(binId)) {
    throw validationError('binId must be a non-empty string');
  }

  let quantity: number;
  if (typeof candidate.quantity === 'number') {
    quantity = candidate.quantity;
  } else if (isNonEmptyString(candidate.quantity)) {
    quantity = Number(candidate.quantity.trim());
  } else {
    throw validationError('quantity is required');
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw validationError('quantity must be a positive integer');
  }

  if (referenceId !== undefined && !isNonEmptyString(referenceId)) {
    throw validationError('referenceId must be a non-empty string');
  }

  return {
    binId: isNonEmptyString(binId) ? binId.trim() : undefined,
    skuId: skuId.trim(),
    warehouseId: warehouseId.trim(),
    quantity,
    referenceId: isNonEmptyString(referenceId) ? referenceId.trim() : undefined,
  };
}

function formatDocDate(now: Date): string {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function buildReferenceId(
  referenceType: 'GRN' | 'OUT',
  idempotencyKey: string,
  explicitReferenceId?: string,
): string {
  if (explicitReferenceId) {
    return explicitReferenceId;
  }

  const digest = createHash('sha256')
    .update(`${referenceType}:${idempotencyKey}`)
    .digest('hex');
  const sequence = String(
    Number(BigInt(`0x${digest.slice(0, 12)}`) % 1_000_000n),
  ).padStart(6, '0');

  return `DOC-${referenceType}-${formatDocDate(new Date())}-${sequence}`;
}

@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly inventoryPostingService: InventoryPostingService,
    private readonly tenantContextService: TenantContextService,
    @Inject('InventoryConsistencyStore')
    private readonly inventoryStore: InventoryConsistencyStore,
  ) {}

  @Post('inbound')
  @HttpCode(HttpStatus.CREATED)
  async createInbound(
    @Headers('idempotency-key') idempotencyKey?: string,
    @Body() body?: unknown,
  ): Promise<InventoryMovementResponse> {
    return this.postMovement('GRN', idempotencyKey, body);
  }

  @Post('outbound')
  @HttpCode(HttpStatus.CREATED)
  async createOutbound(
    @Headers('idempotency-key') idempotencyKey?: string,
    @Body() body?: unknown,
  ): Promise<InventoryMovementResponse> {
    return this.postMovement('OUT', idempotencyKey, body);
  }

  @Get('balances')
  async getBalances(
    @Query('skuId') skuId?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('binId') binId?: string,
  ): Promise<InventoryBalanceResponse> {
    const ctx = this.tenantContextService.getRequiredContext();

    if (skuId && !warehouseId) {
      throw new BadRequestException({
        category: 'validation',
        code: 'VALIDATION_INVALID_QUERY',
        message: 'warehouseId is required when skuId is provided',
      });
    }

    if (!skuId && warehouseId) {
      throw new BadRequestException({
        category: 'validation',
        code: 'VALIDATION_INVALID_QUERY',
        message: 'skuId is required when warehouseId is provided',
      });
    }

    if (binId && (!skuId || !warehouseId)) {
      throw new BadRequestException({
        category: 'validation',
        code: 'VALIDATION_INVALID_QUERY',
        message: 'skuId and warehouseId are required when binId is provided',
      });
    }

    if (skuId && warehouseId) {
      const snapshots = await this.inventoryPostingService.getBalanceSnapshot(
        ctx.tenantId,
        [{ skuId, warehouseId, binId: binId?.trim() || null }],
      );

      return {
        data: snapshots,
        total: snapshots.length,
      };
    }

    const snapshots = await this.inventoryStore.getAllBalanceSnapshots(
      ctx.tenantId,
    );
    return {
      data: snapshots,
      total: snapshots.length,
    };
  }

  @Get('ledger')
  async getLedger(
    @Query('skuId') skuId?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('binId') binId?: string,
    @Query('docType') docType?: string,
    @Query('page') pageRaw?: string,
    @Query('pageSize') pageSizeRaw?: string,
  ): Promise<InventoryLedgerResponse> {
    const ctx = this.tenantContextService.getRequiredContext();
    const page = parsePositiveInt(pageRaw, 'page', 1);
    const pageSize = parsePositiveInt(pageSizeRaw, 'pageSize', 20);

    if (pageSize > 200) {
      throw new BadRequestException({
        category: 'validation',
        code: 'VALIDATION_INVALID_QUERY',
        message: 'pageSize must be <= 200',
      });
    }

    const source = await this.inventoryStore.getAllLedgerEntries(ctx.tenantId);
    const filtered = source.filter((entry) => {
      if (skuId && entry.skuId !== skuId) {
        return false;
      }
      if (warehouseId && entry.warehouseId !== warehouseId) {
        return false;
      }
      if (binId && entry.binId !== binId) {
        return false;
      }
      if (docType && entry.referenceType !== docType) {
        return false;
      }
      return true;
    });

    const sorted = [...filtered].sort((left, right) =>
      right.postedAt.localeCompare(left.postedAt),
    );

    const total = sorted.length;
    const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;
    const data = sorted.slice(offset, offset + pageSize);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  private async postMovement(
    referenceType: 'GRN' | 'OUT',
    idempotencyKey: string | undefined,
    body: unknown,
  ): Promise<InventoryMovementResponse> {
    if (!isNonEmptyString(idempotencyKey)) {
      throw new BadRequestException({
        category: 'validation',
        code: 'VALIDATION_IDEMPOTENCY_KEY_REQUIRED',
        message: 'Idempotency-Key header is required',
      });
    }

    const input = parseMovementPayload(body);
    const ctx = this.tenantContextService.getRequiredContext();
    const referenceId = buildReferenceId(
      referenceType,
      idempotencyKey.trim(),
      input.referenceId,
    );

    try {
      const result = await this.inventoryPostingService.post(
        ctx.tenantId,
        {
          idempotencyKey: idempotencyKey.trim(),
          referenceType,
          referenceId,
          lines: [
            {
              skuId: input.skuId,
              warehouseId: input.warehouseId,
              binId: input.binId?.trim() || null,
              quantityDelta:
                referenceType === 'GRN' ? input.quantity : -input.quantity,
            },
          ],
        },
        ctx.requestId,
      );

      const balance =
        result.balanceSnapshots[0] ??
        ({
          skuId: input.skuId,
          warehouseId: input.warehouseId,
          binId: input.binId?.trim() || null,
          onHand: 0,
        } satisfies InventoryBalanceSnapshot);

      return {
        movementType: referenceType === 'GRN' ? 'INBOUND' : 'OUTBOUND',
        referenceType,
        referenceId,
        quantity: input.quantity,
        ledgerEntries: result.ledgerEntries,
        balance,
      };
    } catch (error) {
      this.rethrowInventoryError(error);
    }
  }

  private rethrowInventoryError(error: unknown): never {
    if (error instanceof InventoryIdempotencyConflictError) {
      throw conflictError(
        'CONFLICT_IDEMPOTENCY_KEY_REUSED',
        'Idempotency key already exists with different payload',
      );
    }

    if (error instanceof InventoryInsufficientStockError) {
      throw conflictError('CONFLICT_INSUFFICIENT_STOCK', '库存不足', {
        skuId: error.skuId,
        warehouseId: error.warehouseId,
        binId: error.binId,
        available: error.available,
        required: error.required,
      });
    }

    if (error instanceof InventoryLedgerNotFoundError) {
      throw notFoundError(error.message);
    }

    if (error instanceof InventoryAlreadyReversedError) {
      throw conflictError('CONFLICT_LEDGER_ALREADY_REVERSED', error.message);
    }

    throw error;
  }
}
