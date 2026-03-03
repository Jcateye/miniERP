import { describe, expect, it } from '@jest/globals';
import {
  InventoryAlreadyReversedError,
  InventoryIdempotencyConflictError,
  InventoryInsufficientStockError,
  InventoryLedgerNotFoundError,
  InventoryValidationError,
} from '../domain/inventory.errors';
import { InMemoryInventoryConsistencyStore } from '../infrastructure/in-memory-inventory-consistency.store';
import { InventoryPostingService } from './inventory-posting.service';

describe('InventoryPostingService', () => {
  const tenantId = 't-1';

  function createService() {
    const store = new InMemoryInventoryConsistencyStore();
    const service = new InventoryPostingService(store);

    return {
      store,
      service,
    };
  }

  it('posts ledger atomically and updates balance', async () => {
    const { service } = createService();

    const result = await service.post(
      tenantId,
      {
        idempotencyKey: 'idem-grn-1',
        referenceType: 'GRN',
        referenceId: 'GRN-1',
        lines: [{ skuId: 'SKU-1', warehouseId: 'WH-1', quantityDelta: 10 }],
      },
      'request-1',
    );

    expect(result.ledgerEntries).toHaveLength(1);
    expect(result.ledgerEntries[0]?.quantityDelta).toBe(10);
    expect(result.balanceSnapshots).toEqual([{ skuId: 'SKU-1', warehouseId: 'WH-1', onHand: 10 }]);
  });

  it('returns first result for same key and same payload', async () => {
    const { service } = createService();

    const command = {
      idempotencyKey: 'idem-grn-2',
      referenceType: 'GRN' as const,
      referenceId: 'GRN-2',
      lines: [{ skuId: 'SKU-1', warehouseId: 'WH-1', quantityDelta: 5 }],
    };

    const first = await service.post(tenantId, command, 'request-2');
    const second = await service.post(tenantId, command, 'request-3');

    expect(second).toEqual(first);
  });

  it('rejects same key with different payload', async () => {
    const { service } = createService();

    await service.post(
      tenantId,
      {
        idempotencyKey: 'idem-grn-3',
        referenceType: 'GRN',
        referenceId: 'GRN-3',
        lines: [{ skuId: 'SKU-1', warehouseId: 'WH-1', quantityDelta: 3 }],
      },
      'request-4',
    );

    await expect(
      service.post(
        tenantId,
        {
          idempotencyKey: 'idem-grn-3',
          referenceType: 'GRN',
          referenceId: 'GRN-3',
          lines: [{ skuId: 'SKU-1', warehouseId: 'WH-1', quantityDelta: 4 }],
        },
        'request-5',
      ),
    ).rejects.toBeInstanceOf(InventoryIdempotencyConflictError);
  });

  it('prevents negative stock and keeps posting atomic', async () => {
    const { service } = createService();

    await service.post(
      tenantId,
      {
        idempotencyKey: 'idem-seed-1',
        referenceType: 'GRN',
        referenceId: 'GRN-SEED-1',
        lines: [{ skuId: 'SKU-1', warehouseId: 'WH-1', quantityDelta: 10 }],
      },
      'request-6',
    );

    await expect(
      service.post(
        tenantId,
        {
          idempotencyKey: 'idem-out-1',
          referenceType: 'OUT',
          referenceId: 'OUT-1',
          lines: [
            { skuId: 'SKU-1', warehouseId: 'WH-1', quantityDelta: -2 },
            { skuId: 'SKU-2', warehouseId: 'WH-1', quantityDelta: -1 },
          ],
        },
        'request-7',
      ),
    ).rejects.toBeInstanceOf(InventoryInsufficientStockError);

    const snapshot = await service.getBalanceSnapshot(tenantId, [
      { skuId: 'SKU-1', warehouseId: 'WH-1' },
      { skuId: 'SKU-2', warehouseId: 'WH-1' },
    ]);

    expect(snapshot).toEqual([
      { skuId: 'SKU-1', warehouseId: 'WH-1', onHand: 10 },
      { skuId: 'SKU-2', warehouseId: 'WH-1', onHand: 0 },
    ]);
  });

  it('blocks reverse command with duplicate ledger ids', async () => {
    const { service } = createService();

    const postResult = await service.post(
      tenantId,
      {
        idempotencyKey: 'idem-grn-dup-ledger',
        referenceType: 'GRN',
        referenceId: 'GRN-DUP-LEDGER',
        lines: [{ skuId: 'SKU-1', warehouseId: 'WH-1', quantityDelta: 2 }],
      },
      'request-8',
    );

    const ledgerId = postResult.ledgerEntries[0]?.id;

    await expect(
      service.reverse(
        tenantId,
        {
          idempotencyKey: 'idem-reverse-dup-ledger',
          referenceId: 'REV-DUP-LEDGER',
          ledgerIds: [ledgerId as string, ledgerId as string],
        },
        'request-9',
      ),
    ).rejects.toBeInstanceOf(InventoryValidationError);
  });

  it('throws when reverse target ledger does not exist', async () => {
    const { service } = createService();

    await expect(
      service.reverse(
        tenantId,
        {
          idempotencyKey: 'idem-reverse-not-found',
          referenceId: 'REV-NOT-FOUND',
          ledgerIds: ['999999'],
        },
        'request-10',
      ),
    ).rejects.toBeInstanceOf(InventoryLedgerNotFoundError);
  });

  it('reverses posted ledger and blocks duplicate reversal', async () => {
    const { service } = createService();

    const postResult = await service.post(
      tenantId,
      {
        idempotencyKey: 'idem-grn-4',
        referenceType: 'GRN',
        referenceId: 'GRN-4',
        lines: [{ skuId: 'SKU-1', warehouseId: 'WH-1', quantityDelta: 8 }],
      },
      'request-11',
    );

    const ledgerId = postResult.ledgerEntries[0]?.id;
    expect(ledgerId).toBeDefined();

    const reversal = await service.reverse(
      tenantId,
      {
        idempotencyKey: 'idem-reverse-1',
        referenceId: 'REV-1',
        ledgerIds: [ledgerId as string],
      },
      'request-12',
    );

    expect(reversal.ledgerEntries[0]?.reversalOfLedgerId).toBe(ledgerId);
    expect(reversal.balanceSnapshots).toEqual([{ skuId: 'SKU-1', warehouseId: 'WH-1', onHand: 0 }]);

    await expect(
      service.reverse(
        tenantId,
        {
          idempotencyKey: 'idem-reverse-2',
          referenceId: 'REV-2',
          ledgerIds: [ledgerId as string],
        },
        'request-13',
      ),
    ).rejects.toBeInstanceOf(InventoryAlreadyReversedError);
  });

  it('serializes concurrent tenant postings to avoid lost updates', async () => {
    const { service } = createService();

    await Promise.all([
      service.post(
        tenantId,
        {
          idempotencyKey: 'idem-concurrent-1',
          referenceType: 'GRN',
          referenceId: 'GRN-CONCURRENT-1',
          lines: [{ skuId: 'SKU-1', warehouseId: 'WH-1', quantityDelta: 10 }],
        },
        'request-14',
      ),
      service.post(
        tenantId,
        {
          idempotencyKey: 'idem-concurrent-2',
          referenceType: 'GRN',
          referenceId: 'GRN-CONCURRENT-2',
          lines: [{ skuId: 'SKU-1', warehouseId: 'WH-1', quantityDelta: 10 }],
        },
        'request-15',
      ),
    ]);

    const snapshot = await service.getBalanceSnapshot(tenantId, [{ skuId: 'SKU-1', warehouseId: 'WH-1' }]);

    expect(snapshot).toEqual([{ skuId: 'SKU-1', warehouseId: 'WH-1', onHand: 20 }]);
  });
});
