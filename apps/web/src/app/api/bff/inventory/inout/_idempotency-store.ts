type SuccessPayload = {
  data: {
    balanceAfter: number;
    balanceBefore: number;
    balanceId: string;
    ledgerId: string;
    operation: 'INBOUND' | 'OUTBOUND';
    quantity: number;
    skuId: string;
    warehouseId: string;
  };
  message: string;
};

const IDEMPOTENCY_STORE_KEY = '__MINIERP_INOUT_IDEMPOTENCY__';

export function getInventoryInoutIdempotencyStore() {
  const globalStore = globalThis as typeof globalThis & {
    [IDEMPOTENCY_STORE_KEY]?: Map<
      string,
      {
        body: SuccessPayload;
        status: number;
      }
    >;
  };

  if (!globalStore[IDEMPOTENCY_STORE_KEY]) {
    globalStore[IDEMPOTENCY_STORE_KEY] = new Map();
  }

  return globalStore[IDEMPOTENCY_STORE_KEY]!;
}

export function resetInventoryInoutIdempotencyStore() {
  getInventoryInoutIdempotencyStore().clear();
}

export type { SuccessPayload };
