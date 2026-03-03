import type {
  IdempotencyRecord,
  InventoryBalanceSnapshot,
  InventoryConsistencyStore,
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

function deepCloneTenantState(state: TenantState): TenantState {
  return {
    idempotencyRecords: new Map<string, IdempotencyRecord>(state.idempotencyRecords),
    ledgerEntries: new Map<string, InventoryLedgerEntry>(state.ledgerEntries),
    balanceByKey: new Map<string, number>(state.balanceByKey),
    reversedLedgerIds: new Set<string>(state.reversedLedgerIds),
    sequence: state.sequence,
  };
}

export class InMemoryInventoryConsistencyStore implements InventoryConsistencyStore {
  private readonly stateByTenant = new Map<string, TenantState>();

  async withTenantTransaction<T>(tenantId: string, work: (tx: InventoryTenantTransaction) => T | Promise<T>): Promise<T> {
    const currentState = this.stateByTenant.get(tenantId) ?? createTenantState();
    const workingState = deepCloneTenantState(currentState);
    const tx = new InMemoryInventoryTenantTransaction(tenantId, workingState);

    const result = await work(tx);

    this.stateByTenant.set(tenantId, tx.commit());

    return result;
  }

  getBalanceSnapshots(tenantId: string, keys: readonly InventoryKey[]): InventoryBalanceSnapshot[] {
    const state = this.stateByTenant.get(tenantId) ?? createTenantState();

    return keys.map((key) => ({
      skuId: key.skuId,
      warehouseId: key.warehouseId,
      onHand: state.balanceByKey.get(keyToString(key)) ?? 0,
    }));
  }
}

class InMemoryInventoryTenantTransaction implements InventoryTenantTransaction {
  constructor(
    private readonly tenantId: string,
    private readonly workingState: TenantState,
  ) {}

  findIdempotencyRecord(idempotencyKey: string): IdempotencyRecord | undefined {
    return this.workingState.idempotencyRecords.get(idempotencyKey);
  }

  saveIdempotencyRecord(record: IdempotencyRecord): void {
    this.workingState.idempotencyRecords.set(record.idempotencyKey, record);
  }

  createLedgerEntry(entry: Omit<InventoryLedgerEntry, 'id' | 'postedAt'>): InventoryLedgerEntry {
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

  findLedgerEntriesByIds(ledgerIds: readonly string[]): InventoryLedgerEntry[] {
    return ledgerIds
      .map((id) => this.workingState.ledgerEntries.get(id))
      .filter((entry): entry is InventoryLedgerEntry => typeof entry !== 'undefined');
  }

  findBalance(key: InventoryKey): number {
    return this.workingState.balanceByKey.get(keyToString(key)) ?? 0;
  }

  saveBalance(key: InventoryKey, onHand: number): void {
    this.workingState.balanceByKey.set(keyToString(key), onHand);
  }

  isLedgerReversed(ledgerId: string): boolean {
    return this.workingState.reversedLedgerIds.has(ledgerId);
  }

  markLedgerReversed(ledgerId: string): void {
    this.workingState.reversedLedgerIds.add(ledgerId);
  }

  commit(): TenantState {
    return deepCloneTenantState(this.workingState);
  }
}
