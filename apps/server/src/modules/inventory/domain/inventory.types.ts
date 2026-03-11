export type InventoryReferenceType =
  | 'GRN'
  | 'OUT'
  | 'STOCKTAKE'
  | 'ADJUSTMENT'
  | 'REVERSAL';

export interface InventoryPostingLine {
  readonly skuId: string;
  readonly warehouseId: string;
  readonly quantityDelta: number;
}

export interface InventoryPostingCommand {
  readonly idempotencyKey: string;
  readonly referenceType: InventoryReferenceType;
  readonly referenceId: string;
  readonly lines: readonly InventoryPostingLine[];
}

export interface InventoryReversalCommand {
  readonly idempotencyKey: string;
  readonly referenceId: string;
  readonly ledgerIds: readonly string[];
}

export interface InventoryLedgerEntry {
  readonly id: string;
  readonly tenantId: string;
  readonly skuId: string;
  readonly warehouseId: string;
  readonly quantityDelta: number;
  readonly referenceType: InventoryReferenceType;
  readonly referenceId: string;
  readonly postedAt: string;
  readonly reversalOfLedgerId: string | null;
}

export interface InventoryBalanceSnapshot {
  readonly skuId: string;
  readonly warehouseId: string;
  readonly onHand: number;
}

export interface InventoryPostingResult {
  readonly ledgerEntries: readonly InventoryLedgerEntry[];
  readonly balanceSnapshots: readonly InventoryBalanceSnapshot[];
}

export type InventoryIdempotencyAction = 'inventory.post' | 'inventory.reverse';

export interface InventoryKey {
  readonly skuId: string;
  readonly warehouseId: string;
}

export interface IdempotencyRecord {
  readonly tenantId: string;
  readonly actionType: InventoryIdempotencyAction;
  readonly idempotencyKey: string;
  readonly payloadHash: string;
  readonly result: InventoryPostingResult;
  readonly requestId: string;
}

export interface InventoryConsistencyStore {
  withTenantTransaction<T>(
    tenantId: string,
    work: (tx: InventoryTenantTransaction) => T | Promise<T>,
  ): Promise<T>;

  getAllBalanceSnapshots(tenantId: string): Promise<InventoryBalanceSnapshot[]>;
  getAllLedgerEntries(tenantId: string): Promise<InventoryLedgerEntry[]>;
}

export interface InventoryTenantTransaction {
  findIdempotencyRecord(
    actionType: InventoryIdempotencyAction,
    idempotencyKey: string,
  ): Promise<IdempotencyRecord | undefined>;
  saveIdempotencyRecord(record: IdempotencyRecord): Promise<void>;

  createLedgerEntry(
    entry: Omit<InventoryLedgerEntry, 'id' | 'postedAt'>,
  ): Promise<InventoryLedgerEntry>;
  findLedgerEntriesByIds(
    ledgerIds: readonly string[],
  ): Promise<InventoryLedgerEntry[]>;
  findBalance(key: InventoryKey): Promise<number>;
  saveBalance(key: InventoryKey, onHand: number): Promise<void>;
  isLedgerReversed(ledgerId: string): Promise<boolean>;
  markLedgerReversed(ledgerId: string): Promise<void>;
}
