export class InventoryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InventoryValidationError';
  }
}

export class InventoryIdempotencyConflictError extends Error {
  constructor() {
    super('Idempotency key already exists with different payload');
    this.name = 'InventoryIdempotencyConflictError';
  }
}

export class InventoryInsufficientStockError extends Error {
  constructor(skuId: string, warehouseId: string, available: number, required: number) {
    super(
      `Insufficient stock for sku=${skuId}, warehouse=${warehouseId}, available=${available}, required=${required}`,
    );
    this.name = 'InventoryInsufficientStockError';
  }
}

export class InventoryLedgerNotFoundError extends Error {
  constructor(ledgerId: string) {
    super(`Ledger entry not found: ${ledgerId}`);
    this.name = 'InventoryLedgerNotFoundError';
  }
}

export class InventoryAlreadyReversedError extends Error {
  constructor(ledgerId: string) {
    super(`Ledger entry already reversed: ${ledgerId}`);
    this.name = 'InventoryAlreadyReversedError';
  }
}
