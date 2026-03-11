import { Controller, Get, Inject, Query } from '@nestjs/common';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';
import { InventoryPostingService } from '../application/inventory-posting.service';
import type {
  InventoryBalanceSnapshot,
  InventoryConsistencyStore,
  InventoryLedgerEntry,
} from '../domain/inventory.types';
import { InventoryValidationError } from '../domain/inventory.errors';

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
    throw new InventoryValidationError(`${field} must be a positive integer`);
  }

  return Number(value);
}

@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly inventoryPostingService: InventoryPostingService,
    private readonly tenantContextService: TenantContextService,
    @Inject('InventoryConsistencyStore')
    private readonly inventoryStore: InventoryConsistencyStore,
  ) {}

  @Get('balances')
  async getBalances(
    @Query('skuId') skuId?: string,
    @Query('warehouseId') warehouseId?: string,
  ): Promise<InventoryBalanceResponse> {
    const ctx = this.tenantContextService.getRequiredContext();

    if (skuId && !warehouseId) {
      throw new InventoryValidationError(
        'warehouseId is required when skuId is provided',
      );
    }

    if (!skuId && warehouseId) {
      throw new InventoryValidationError(
        'skuId is required when warehouseId is provided',
      );
    }

    if (skuId && warehouseId) {
      const snapshots = await this.inventoryPostingService.getBalanceSnapshot(
        ctx.tenantId,
        [{ skuId, warehouseId }],
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
    @Query('docType') docType?: string,
    @Query('page') pageRaw?: string,
    @Query('pageSize') pageSizeRaw?: string,
  ): Promise<InventoryLedgerResponse> {
    const ctx = this.tenantContextService.getRequiredContext();
    const page = parsePositiveInt(pageRaw, 'page', 1);
    const pageSize = parsePositiveInt(pageSizeRaw, 'pageSize', 20);

    if (pageSize > 200) {
      throw new InventoryValidationError('pageSize must be <= 200');
    }

    const source = await this.inventoryStore.getAllLedgerEntries(ctx.tenantId);
    const filtered = source.filter((entry) => {
      if (skuId && entry.skuId !== skuId) {
        return false;
      }
      if (warehouseId && entry.warehouseId !== warehouseId) {
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
}
