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

  async getAllBalanceSnapshots(
    tenantId: string,
  ): Promise<InventoryBalanceSnapshot[]> {
    const state = this.stateByTenant.get(tenantId) ?? createTenantState();

    return [...state.balanceByKey.entries()].map(([rawKey, onHand]) => {
      const [skuId, warehouseId] = rawKey.split('::');
      return {
        skuId,
        warehouseId,
        onHand,
      };
    });
  }

  async getAllLedgerEntries(tenantId: string): Promise<InventoryLedgerEntry[]> {
    const state = this.stateByTenant.get(tenantId) ?? createTenantState();
    return [...state.ledgerEntries.values()].map((entry) => ({ ...entry }));
  }
}

class InMemoryInventoryTenantTransaction implements InventoryTenantTransaction {
  constructor(private readonly workingState: TenantState) {}

  async findIdempotencyRecord(
    actionType: InventoryIdempotencyAction,
    idempotencyKey: string,
  ): Promise<IdempotencyRecord | undefined> {
    return this.workingState.idempotencyRecords.get(
      idempotencyMapKey(actionType, idempotencyKey),
    );
  }

  async saveIdempotencyRecord(record: IdempotencyRecord): Promise<void> {
    this.workingState.idempotencyRecords.set(
      idempotencyMapKey(record.actionType, record.idempotencyKey),
      record,
    );
  }

  async createLedgerEntry(
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

    return created;
  }

  async findLedgerEntriesByIds(
    ledgerIds: readonly string[],
  ): Promise<InventoryLedgerEntry[]> {
    return ledgerIds
      .map((id) => this.workingState.ledgerEntries.get(id))
      .filter(
        (entry): entry is InventoryLedgerEntry => typeof entry !== 'undefined',
      )
      .map((entry) => ({ ...entry }));
  }

  async findBalance(key: InventoryKey): Promise<number> {
    return this.workingState.balanceByKey.get(keyToString(key)) ?? 0;
  }

  async saveBalance(key: InventoryKey, onHand: number): Promise<void> {
    this.workingState.balanceByKey.set(keyToString(key), onHand);
  }

  async isLedgerReversed(ledgerId: string): Promise<boolean> {
    return this.workingState.reversedLedgerIds.has(ledgerId);
  }

  async markLedgerReversed(ledgerId: string): Promise<void> {
    this.workingState.reversedLedgerIds.add(ledgerId);
  }

  commit(): TenantState {
    return deepCloneTenantState(this.workingState);
  }
}
