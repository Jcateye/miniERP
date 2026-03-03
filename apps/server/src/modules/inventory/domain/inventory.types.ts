export type InventoryReferenceType = 'GRN' | 'OUT' | 'STOCKTAKE' | 'ADJUSTMENT' | 'REVERSAL';

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

export interface InventoryKey {
  readonly skuId: string;
  readonly warehouseId: string;
}

export interface IdempotencyRecord {
  readonly tenantId: string;
  readonly idempotencyKey: string;
  readonly payloadHash: string;
  readonly result: InventoryPostingResult;
  readonly requestId: string;
}

export interface InventoryConsistencyStore {
  withTenantTransaction<T>(tenantId: string, work: (tx: InventoryTenantTransaction) => T | Promise<T>): Promise<T>;
}

export interface InventoryTenantTransaction {
  findIdempotencyRecord(idempotencyKey: string): IdempotencyRecord | undefined;
  saveIdempotencyRecord(record: IdempotencyRecord): void;

  createLedgerEntry(entry: Omit<InventoryLedgerEntry, 'id' | 'postedAt'>): InventoryLedgerEntry;
  findLedgerEntriesByIds(ledgerIds: readonly string[]): InventoryLedgerEntry[];
  findBalance(key: InventoryKey): number;
  saveBalance(key: InventoryKey, onHand: number): void;
  isLedgerReversed(ledgerId: string): boolean;
  markLedgerReversed(ledgerId: string): void;
}
