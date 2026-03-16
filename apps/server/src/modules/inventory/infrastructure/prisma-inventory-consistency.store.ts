import { Injectable } from '@nestjs/common';
import {
  Prisma,
  type InventoryLedger as PrismaInventoryLedger,
} from '@prisma/client';
import { PlatformDbService } from '../../../database/platform-db.service';
import { resolveTenantDbId } from '../../masterdata/infrastructure/prisma-tenant-id.resolver';
import {
  InventoryIdempotencyConflictError,
  InventoryValidationError,
} from '../domain/inventory.errors';
import type {
  IdempotencyRecord,
  InventoryBalanceSnapshot,
  InventoryConsistencyStore,
  InventoryIdempotencyAction,
  InventoryKey,
  InventoryLedgerEntry,
  InventoryPostingResult,
  InventoryTenantTransaction,
} from '../domain/inventory.types';

function idempotencyStorageKey(
  actionType: InventoryIdempotencyAction,
  idempotencyKey: string,
): string {
  return `${actionType}::${idempotencyKey}`;
}

function parseLedgerId(rawId: string): bigint {
  try {
    return BigInt(rawId);
  } catch {
    throw new InventoryValidationError(`Invalid ledger id: ${rawId}`);
  }
}

function mapLedgerEntry(entry: PrismaInventoryLedger): InventoryLedgerEntry {
  return {
    id: entry.id.toString(),
    tenantId: entry.tenantId.toString(),
    skuId: entry.skuId,
    warehouseId: entry.warehouseId,
    binId: entry.binId,
    quantityDelta: entry.quantityDelta,
    referenceType: entry.referenceType as InventoryLedgerEntry['referenceType'],
    referenceId: entry.referenceId,
    reversalOfLedgerId: entry.reversalOfLedgerId?.toString() ?? null,
    postedAt: entry.postedAt.toISOString(),
  };
}

function normalizeBalanceBinId(binId: string | null): string {
  return binId ?? '';
}

function decodePostingResult(payload: unknown): InventoryPostingResult {
  if (typeof payload !== 'object' || payload === null) {
    throw new InventoryValidationError(
      'Invalid inventory idempotency response payload',
    );
  }

  const candidate = payload as Partial<InventoryPostingResult>;

  if (
    !Array.isArray(candidate.ledgerEntries) ||
    !Array.isArray(candidate.balanceSnapshots)
  ) {
    throw new InventoryValidationError(
      'Invalid inventory idempotency response payload',
    );
  }

  return {
    ledgerEntries: candidate.ledgerEntries as InventoryLedgerEntry[],
    balanceSnapshots: candidate.balanceSnapshots as InventoryBalanceSnapshot[],
  };
}

@Injectable()
export class PrismaInventoryConsistencyStore implements InventoryConsistencyStore {
  constructor(private readonly platformDb: PlatformDbService) {}

  async withTenantTransaction<T>(
    tenantId: string,
    work: (tx: InventoryTenantTransaction) => T | Promise<T>,
  ): Promise<T> {
    return this.platformDb.withTenantTx(
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      async (tx) => {
        const tenantDbId = await resolveTenantDbId(tx, tenantId);
        const tenantTx = new PrismaInventoryTenantTransaction(
          tx,
          tenantId,
          tenantDbId,
        );
        return work(tenantTx);
      },
    );
  }

  async getAllBalanceSnapshots(
    tenantId: string,
    options?: {
      readonly where?: Readonly<Record<string, unknown>>;
    },
  ): Promise<InventoryBalanceSnapshot[]> {
    return this.platformDb.withTenantTx(async (tx) => {
      const tenantDbId = await resolveTenantDbId(tx, tenantId);
      const rows = await tx.inventoryBalance.findMany({
        where: {
          ...(options?.where
            ? { AND: [options.where, { tenantId: tenantDbId }] }
            : { tenantId: tenantDbId }),
        },
        orderBy: [{ warehouseId: 'asc' }, { binId: 'asc' }, { skuId: 'asc' }],
      });

      return rows.map((row) => ({
        skuId: row.skuId,
        warehouseId: row.warehouseId,
        binId: row.binId || null,
        onHand: row.onHand,
      }));
    });
  }

  async getAllLedgerEntries(
    tenantId: string,
    options?: {
      readonly where?: Readonly<Record<string, unknown>>;
    },
  ): Promise<InventoryLedgerEntry[]> {
    return this.platformDb.withTenantTx(async (tx) => {
      const tenantDbId = await resolveTenantDbId(tx, tenantId);
      const rows = await tx.inventoryLedger.findMany({
        where: {
          ...(options?.where
            ? { AND: [options.where, { tenantId: tenantDbId }] }
            : { tenantId: tenantDbId }),
        },
        orderBy: [{ postedAt: 'desc' }, { id: 'desc' }],
      });

      return rows.map((row) => mapLedgerEntry(row));
    });
  }
}

export class PrismaInventoryTenantTransaction implements InventoryTenantTransaction {
  private readonly idempotencyCache = new Map<string, IdempotencyRecord>();
  private readonly balanceCache = new Map<
    string,
    { id: bigint; onHand: number }
  >();

  constructor(
    private readonly tx: Prisma.TransactionClient,
    private readonly tenantContextId: string,
    private readonly tenantDbId: bigint,
  ) {}

  async findIdempotencyRecord(
    actionType: InventoryIdempotencyAction,
    idempotencyKey: string,
  ): Promise<IdempotencyRecord | undefined> {
    const cacheKey = idempotencyStorageKey(actionType, idempotencyKey);
    const cached = this.idempotencyCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const persisted = await this.tx.idempotencyRecord.findUnique({
      where: {
        tenantId_idempotencyKey_actionType: {
          tenantId: this.tenantDbId,
          idempotencyKey,
          actionType,
        },
      },
    });

    if (!persisted) {
      return undefined;
    }

    const result = decodePostingResult(persisted.responseBody);
    const record: IdempotencyRecord = {
      tenantId: this.tenantContextId,
      actionType: actionType,
      idempotencyKey,
      payloadHash: persisted.payloadHash,
      requestId: persisted.requestId,
      result,
    };

    this.idempotencyCache.set(cacheKey, record);
    return record;
  }

  async saveIdempotencyRecord(record: IdempotencyRecord): Promise<void> {
    try {
      await this.tx.idempotencyRecord.create({
        data: {
          tenantId: this.tenantDbId,
          actionType: record.actionType,
          idempotencyKey: record.idempotencyKey,
          payloadHash: record.payloadHash,
          requestId: record.requestId,
          responseBody: record.result as unknown as Prisma.InputJsonValue,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const existing = await this.findIdempotencyRecord(
          record.actionType,
          record.idempotencyKey,
        );
        if (existing && existing.payloadHash === record.payloadHash) {
          return;
        }

        throw new InventoryIdempotencyConflictError();
      }

      throw error;
    }

    this.idempotencyCache.set(
      idempotencyStorageKey(record.actionType, record.idempotencyKey),
      record,
    );
  }

  async createLedgerEntry(
    entry: Omit<InventoryLedgerEntry, 'id' | 'postedAt'>,
  ): Promise<InventoryLedgerEntry> {
    const created = await this.tx.inventoryLedger.create({
      data: {
        tenantId: this.tenantDbId,
        skuId: entry.skuId,
        warehouseId: entry.warehouseId,
        binId: entry.binId,
        quantityDelta: entry.quantityDelta,
        referenceType: entry.referenceType,
        referenceId: entry.referenceId,
        reversalOfLedgerId:
          entry.reversalOfLedgerId === null
            ? null
            : parseLedgerId(entry.reversalOfLedgerId),
      },
    });

    return mapLedgerEntry(created);
  }

  async findLedgerEntriesByIds(
    ledgerIds: readonly string[],
  ): Promise<InventoryLedgerEntry[]> {
    const parsedIds = ledgerIds.map((id) => parseLedgerId(id));

    const entries = await this.tx.inventoryLedger.findMany({
      where: {
        tenantId: this.tenantDbId,
        id: {
          in: parsedIds,
        },
      },
      orderBy: {
        postedAt: 'asc',
      },
    });

    const byId = new Map<string, InventoryLedgerEntry>(
      entries.map((entry) => {
        const mapped = mapLedgerEntry(entry);
        return [mapped.id, mapped] as const;
      }),
    );

    return ledgerIds
      .map((ledgerId) => byId.get(ledgerId))
      .filter(
        (entry): entry is InventoryLedgerEntry => typeof entry !== 'undefined',
      );
  }

  async findBalance(key: InventoryKey): Promise<number> {
    const row = await this.ensureBalanceRowLocked(key);
    return row.onHand;
  }

  async saveBalance(key: InventoryKey, onHand: number): Promise<void> {
    const cached = await this.ensureBalanceRowLocked(key);

    await this.tx.inventoryBalance.update({
      where: {
        id: cached.id,
      },
      data: {
        onHand,
      },
    });

    this.balanceCache.set(
      `${key.skuId}::${key.warehouseId}::${key.binId ?? ''}`,
      {
        id: cached.id,
        onHand,
      },
    );
  }

  async isLedgerReversed(ledgerId: string): Promise<boolean> {
    const parsedLedgerId = parseLedgerId(ledgerId);

    const count = await this.tx.inventoryLedger.count({
      where: {
        tenantId: this.tenantDbId,
        reversalOfLedgerId: parsedLedgerId,
      },
    });

    return count > 0;
  }

  markLedgerReversed(ledgerId: string): Promise<void> {
    void ledgerId;
    return Promise.resolve();
  }

  private async ensureBalanceRowLocked(
    key: InventoryKey,
  ): Promise<{ id: bigint; onHand: number }> {
    const mapKey = `${key.skuId}::${key.warehouseId}::${key.binId ?? ''}`;
    const cached = this.balanceCache.get(mapKey);
    if (cached) {
      return cached;
    }

    const existing = await this.selectBalanceRowForUpdate(key);
    if (existing) {
      this.balanceCache.set(mapKey, existing);
      return existing;
    }

    await this.tx.$executeRaw`
      INSERT INTO "inventory_balance" ("tenant_id", "sku_id", "warehouse_id", "bin_id", "on_hand", "updated_at")
      VALUES (${this.tenantDbId}, ${key.skuId}, ${key.warehouseId}, ${normalizeBalanceBinId(key.binId)}, 0, NOW())
      ON CONFLICT ("tenant_id", "sku_id", "warehouse_id", "bin_id") DO NOTHING
    `;

    const ensured = await this.selectBalanceRowForUpdate(key);
    if (!ensured) {
      throw new InventoryValidationError(
        `Unable to initialize inventory balance for ${key.skuId}/${key.warehouseId}/${key.binId ?? 'null'}`,
      );
    }

    this.balanceCache.set(mapKey, ensured);
    return ensured;
  }

  private async selectBalanceRowForUpdate(
    key: InventoryKey,
  ): Promise<{ id: bigint; onHand: number } | undefined> {
    const rows = await this.tx.$queryRaw<
      Array<{ id: bigint; on_hand: number }>
    >`
      SELECT "id", "on_hand"
      FROM "inventory_balance"
      WHERE "tenant_id" = ${this.tenantDbId}
        AND "sku_id" = ${key.skuId}
        AND "warehouse_id" = ${key.warehouseId}
        AND "bin_id" = ${normalizeBalanceBinId(key.binId)}
      FOR UPDATE
    `;

    const first = rows[0];
    if (!first) {
      return undefined;
    }

    return {
      id: first.id,
      onHand: first.on_hand,
    };
  }
}
