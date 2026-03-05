import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import {
  InventoryAlreadyReversedError,
  InventoryIdempotencyConflictError,
  InventoryInsufficientStockError,
  InventoryLedgerNotFoundError,
  InventoryValidationError,
} from '../domain/inventory.errors';
import type { InventoryReferenceType } from '../domain/inventory.types';
import type {
  IdempotencyRecord,
  InventoryBalanceSnapshot,
  InventoryConsistencyStore,
  InventoryKey,
  InventoryPostingCommand,
  InventoryPostingLine,
  InventoryPostingResult,
  InventoryReversalCommand,
  InventoryTenantTransaction,
} from '../domain/inventory.types';

function normalizeLines(
  lines: readonly InventoryPostingLine[],
): InventoryPostingLine[] {
  return [...lines].sort((left, right) => {
    const keyCompare = `${left.skuId}:${left.warehouseId}`.localeCompare(
      `${right.skuId}:${right.warehouseId}`,
    );
    if (keyCompare !== 0) {
      return keyCompare;
    }

    return left.quantityDelta - right.quantityDelta;
  });
}

function hashPayload(payload: unknown): string {
  const json = JSON.stringify(payload);
  return createHash('sha256').update(json).digest('hex');
}

function aggregateLines(
  lines: readonly InventoryPostingLine[],
): Map<string, { key: InventoryKey; quantityDelta: number }> {
  return lines.reduce((acc, line) => {
    const mapKey = `${line.skuId}::${line.warehouseId}`;
    const existing = acc.get(mapKey);

    if (existing) {
      acc.set(mapKey, {
        key: existing.key,
        quantityDelta: existing.quantityDelta + line.quantityDelta,
      });
      return acc;
    }

    acc.set(mapKey, {
      key: { skuId: line.skuId, warehouseId: line.warehouseId },
      quantityDelta: line.quantityDelta,
    });
    return acc;
  }, new Map<string, { key: InventoryKey; quantityDelta: number }>());
}

const ALLOWED_REFERENCE_TYPES: ReadonlySet<InventoryReferenceType> =
  new Set<InventoryReferenceType>([
    'GRN',
    'OUT',
    'STOCKTAKE',
    'ADJUSTMENT',
    'REVERSAL',
  ]);

@Injectable()
export class InventoryPostingService {
  constructor(
    @Inject('InventoryConsistencyStore')
    private readonly store: InventoryConsistencyStore,
  ) {}

  async post(
    tenantId: string,
    command: InventoryPostingCommand,
    requestId: string,
  ): Promise<InventoryPostingResult> {
    this.validatePostCommand(command);

    const payloadHash = hashPayload({
      referenceType: command.referenceType,
      referenceId: command.referenceId,
      lines: normalizeLines(command.lines),
    });

    return this.store.withTenantTransaction(tenantId, (tx) => {
      const existing = tx.findIdempotencyRecord(command.idempotencyKey);

      if (existing) {
        if (existing.payloadHash !== payloadHash) {
          throw new InventoryIdempotencyConflictError();
        }

        return existing.result;
      }

      const aggregatedLines = aggregateLines(command.lines);

      for (const item of aggregatedLines.values()) {
        const current = tx.findBalance(item.key);
        const next = current + item.quantityDelta;

        if (next < 0) {
          throw new InventoryInsufficientStockError(
            item.key.skuId,
            item.key.warehouseId,
            current,
            Math.abs(item.quantityDelta),
          );
        }
      }

      const ledgerEntries = command.lines.map((line) =>
        tx.createLedgerEntry({
          tenantId,
          skuId: line.skuId,
          warehouseId: line.warehouseId,
          quantityDelta: line.quantityDelta,
          referenceType: command.referenceType,
          referenceId: command.referenceId,
          reversalOfLedgerId: null,
        }),
      );

      for (const item of aggregatedLines.values()) {
        const current = tx.findBalance(item.key);
        tx.saveBalance(item.key, current + item.quantityDelta);
      }

      const balanceSnapshots = this.toBalanceSnapshots(
        tx,
        [...aggregatedLines.values()].map((item) => item.key),
      );
      const result: InventoryPostingResult = {
        ledgerEntries,
        balanceSnapshots,
      };

      const idempotencyRecord: IdempotencyRecord = {
        tenantId,
        idempotencyKey: command.idempotencyKey,
        payloadHash,
        result,
        requestId,
      };

      tx.saveIdempotencyRecord(idempotencyRecord);

      return result;
    });
  }

  async reverse(
    tenantId: string,
    command: InventoryReversalCommand,
    requestId: string,
  ): Promise<InventoryPostingResult> {
    this.validateReverseCommand(command);

    const payloadHash = hashPayload({
      referenceId: command.referenceId,
      ledgerIds: [...command.ledgerIds].sort((left, right) =>
        left.localeCompare(right),
      ),
    });

    return this.store.withTenantTransaction(tenantId, (tx) => {
      const existing = tx.findIdempotencyRecord(command.idempotencyKey);

      if (existing) {
        if (existing.payloadHash !== payloadHash) {
          throw new InventoryIdempotencyConflictError();
        }

        return existing.result;
      }

      const sourceEntries = tx.findLedgerEntriesByIds(command.ledgerIds);

      if (sourceEntries.length !== command.ledgerIds.length) {
        const existingIds = new Set<string>(
          sourceEntries.map((entry) => entry.id),
        );
        const missing = command.ledgerIds.find(
          (ledgerId) => !existingIds.has(ledgerId),
        );
        throw new InventoryLedgerNotFoundError(missing ?? 'unknown');
      }

      for (const sourceEntry of sourceEntries) {
        if (tx.isLedgerReversed(sourceEntry.id)) {
          throw new InventoryAlreadyReversedError(sourceEntry.id);
        }
      }

      const aggregatedLines = aggregateLines(
        sourceEntries.map((entry) => ({
          skuId: entry.skuId,
          warehouseId: entry.warehouseId,
          quantityDelta: -entry.quantityDelta,
        })),
      );

      for (const item of aggregatedLines.values()) {
        const current = tx.findBalance(item.key);
        const next = current + item.quantityDelta;

        if (next < 0) {
          throw new InventoryInsufficientStockError(
            item.key.skuId,
            item.key.warehouseId,
            current,
            Math.abs(item.quantityDelta),
          );
        }
      }

      const reversalEntries = sourceEntries.map((sourceEntry) =>
        tx.createLedgerEntry({
          tenantId,
          skuId: sourceEntry.skuId,
          warehouseId: sourceEntry.warehouseId,
          quantityDelta: -sourceEntry.quantityDelta,
          referenceType: 'REVERSAL',
          referenceId: command.referenceId,
          reversalOfLedgerId: sourceEntry.id,
        }),
      );

      for (const sourceEntry of sourceEntries) {
        tx.markLedgerReversed(sourceEntry.id);
      }

      for (const item of aggregatedLines.values()) {
        const current = tx.findBalance(item.key);
        tx.saveBalance(item.key, current + item.quantityDelta);
      }

      const balanceSnapshots = this.toBalanceSnapshots(
        tx,
        [...aggregatedLines.values()].map((item) => item.key),
      );
      const result: InventoryPostingResult = {
        ledgerEntries: reversalEntries,
        balanceSnapshots,
      };

      const idempotencyRecord: IdempotencyRecord = {
        tenantId,
        idempotencyKey: command.idempotencyKey,
        payloadHash,
        result,
        requestId,
      };

      tx.saveIdempotencyRecord(idempotencyRecord);

      return result;
    });
  }

  async getBalanceSnapshot(
    tenantId: string,
    keys: readonly InventoryKey[],
  ): Promise<readonly InventoryBalanceSnapshot[]> {
    return this.store.withTenantTransaction(tenantId, (tx) =>
      this.toBalanceSnapshots(tx, keys),
    );
  }

  private toBalanceSnapshots(
    tx: InventoryTenantTransaction,
    keys: readonly InventoryKey[],
  ): readonly InventoryBalanceSnapshot[] {
    const unique = new Map<string, InventoryKey>();

    for (const key of keys) {
      unique.set(`${key.skuId}::${key.warehouseId}`, key);
    }

    return [...unique.values()].map((key) => ({
      skuId: key.skuId,
      warehouseId: key.warehouseId,
      onHand: tx.findBalance(key),
    }));
  }

  private validatePostCommand(command: InventoryPostingCommand): void {
    if (command.idempotencyKey.trim().length === 0) {
      throw new InventoryValidationError('idempotencyKey is required');
    }

    if (!ALLOWED_REFERENCE_TYPES.has(command.referenceType)) {
      throw new InventoryValidationError('referenceType is invalid');
    }

    if (command.referenceId.trim().length === 0) {
      throw new InventoryValidationError('referenceId is required');
    }

    if (command.lines.length === 0) {
      throw new InventoryValidationError('lines must not be empty');
    }

    for (const line of command.lines) {
      if (line.skuId.trim().length === 0) {
        throw new InventoryValidationError('line.skuId is required');
      }

      if (line.warehouseId.trim().length === 0) {
        throw new InventoryValidationError('line.warehouseId is required');
      }

      if (!Number.isFinite(line.quantityDelta) || line.quantityDelta === 0) {
        throw new InventoryValidationError(
          'line.quantityDelta must be a non-zero finite number',
        );
      }
    }
  }

  private validateReverseCommand(command: InventoryReversalCommand): void {
    if (command.idempotencyKey.trim().length === 0) {
      throw new InventoryValidationError('idempotencyKey is required');
    }

    if (command.referenceId.trim().length === 0) {
      throw new InventoryValidationError('referenceId is required');
    }

    if (command.ledgerIds.length === 0) {
      throw new InventoryValidationError('ledgerIds must not be empty');
    }

    const unique = new Set<string>();

    for (const ledgerId of command.ledgerIds) {
      if (ledgerId.trim().length === 0) {
        throw new InventoryValidationError(
          'ledgerIds must not contain empty value',
        );
      }

      if (unique.has(ledgerId)) {
        throw new InventoryValidationError(
          'ledgerIds must not contain duplicate values',
        );
      }

      unique.add(ledgerId);
    }
  }
}
