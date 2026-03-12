import type {
  IdempotencyRecord,
  InventoryBalanceSnapshot,
  InventoryConsistencyStore,
  InventoryIdempotencyAction,
  InventoryKey,
  InventoryLedgerEntry,
  InventoryTenantTransaction,
} from '../domain/inventory.types';

interface TenantState {
  readonly idempotencyRecords: Map<string, IdempotencyRecord>;
  readonly ledgerEntries: Map<string, InventoryLedgerEntry>;
  readonly balanceByKey: Map<string, number>;
  readonly reversedLedgerIds: Set<string>;
  sequence: number;
}

function createTenantState(): TenantState {
  return {
    idempotencyRecords: new Map<string, IdempotencyRecord>(),
    ledgerEntries: new Map<string, InventoryLedgerEntry>(),
    balanceByKey: new Map<string, number>(),
    reversedLedgerIds: new Set<string>(),
    sequence: 0,
  };
}

function keyToString(key: InventoryKey): string {
  return `${key.skuId}::${key.warehouseId}`;
}

function idempotencyMapKey(
  actionType: InventoryIdempotencyAction,
  idempotencyKey: string,
): string {
  return `${actionType}::${idempotencyKey}`;
}

function deepCloneTenantState(state: TenantState): TenantState {
  return {
    idempotencyRecords: new Map<string, IdempotencyRecord>(
      state.idempotencyRecords,
    ),
    ledgerEntries: new Map<string, InventoryLedgerEntry>(state.ledgerEntries),
    balanceByKey: new Map<string, number>(state.balanceByKey),
    reversedLedgerIds: new Set<string>(state.reversedLedgerIds),
    sequence: state.sequence,
  };
}

export class InMemoryInventoryConsistencyStore implements InventoryConsistencyStore {
  private readonly stateByTenant = new Map<string, TenantState>();
  private readonly transactionQueueByTenant = new Map<string, Promise<void>>();

  async withTenantTransaction<T>(
    tenantId: string,
    work: (tx: InventoryTenantTransaction) => T | Promise<T>,
  ): Promise<T> {
    const previous =
      this.transactionQueueByTenant.get(tenantId) ?? Promise.resolve();
    let release!: () => void;
    const current = new Promise<void>((resolve) => {
      release = resolve;
    });
    const queued = previous.then(() => current);

    this.transactionQueueByTenant.set(tenantId, queued);

    await previous;

    try {
      const currentState =
        this.stateByTenant.get(tenantId) ?? createTenantState();
      const workingState = deepCloneTenantState(currentState);
      const tx = new InMemoryInventoryTenantTransaction(workingState);

      const result = await work(tx);

      this.stateByTenant.set(tenantId, tx.commit());

      return result;
    } finally {
      release();

      if (this.transactionQueueByTenant.get(tenantId) === queued) {
        this.transactionQueueByTenant.delete(tenantId);
      }
    }
  }

  getAllBalanceSnapshots(
    tenantId: string,
  ): Promise<InventoryBalanceSnapshot[]> {
    const state = this.stateByTenant.get(tenantId) ?? createTenantState();

    return Promise.resolve(
      [...state.balanceByKey.entries()].map(([rawKey, onHand]) => {
        const [skuId, warehouseId] = rawKey.split('::');
        return {
          skuId,
          warehouseId,
          onHand,
        };
      }),
    );
  }

  getAllLedgerEntries(tenantId: string): Promise<InventoryLedgerEntry[]> {
    const state = this.stateByTenant.get(tenantId) ?? createTenantState();
    return Promise.resolve(
      [...state.ledgerEntries.values()].map((entry) => ({ ...entry })),
    );
  }
}

class InMemoryInventoryTenantTransaction implements InventoryTenantTransaction {
  constructor(private readonly workingState: TenantState) {}

  findIdempotencyRecord(
    actionType: InventoryIdempotencyAction,
    idempotencyKey: string,
  ): Promise<IdempotencyRecord | undefined> {
    return Promise.resolve(
      this.workingState.idempotencyRecords.get(
        idempotencyMapKey(actionType, idempotencyKey),
      ),
    );
  }

  saveIdempotencyRecord(record: IdempotencyRecord): Promise<void> {
    this.workingState.idempotencyRecords.set(
      idempotencyMapKey(record.actionType, record.idempotencyKey),
      record,
    );
    return Promise.resolve();
  }

  createLedgerEntry(
    entry: Omit<InventoryLedgerEntry, 'id' | 'postedAt'>,
  ): Promise<InventoryLedgerEntry> {
    const sequence = this.workingState.sequence + 1;
    const created: InventoryLedgerEntry = {
      ...entry,
      id: sequence.toString(),
      postedAt: new Date().toISOString(),
    };

    this.workingState.ledgerEntries.set(created.id, created);
    this.workingState.sequence = sequence;

    return Promise.resolve(created);
  }

  findLedgerEntriesByIds(
    ledgerIds: readonly string[],
  ): Promise<InventoryLedgerEntry[]> {
    return Promise.resolve(
      ledgerIds
        .map((id) => this.workingState.ledgerEntries.get(id))
        .filter(
          (entry): entry is InventoryLedgerEntry =>
            typeof entry !== 'undefined',
        )
        .map((entry) => ({ ...entry })),
    );
  }

  findBalance(key: InventoryKey): Promise<number> {
    return Promise.resolve(
      this.workingState.balanceByKey.get(keyToString(key)) ?? 0,
    );
  }

  saveBalance(key: InventoryKey, onHand: number): Promise<void> {
    this.workingState.balanceByKey.set(keyToString(key), onHand);
    return Promise.resolve();
  }

  isLedgerReversed(ledgerId: string): Promise<boolean> {
    return Promise.resolve(this.workingState.reversedLedgerIds.has(ledgerId));
  }

  markLedgerReversed(ledgerId: string): Promise<void> {
    this.workingState.reversedLedgerIds.add(ledgerId);
    return Promise.resolve();
  }

  commit(): TenantState {
    return deepCloneTenantState(this.workingState);
  }
}
