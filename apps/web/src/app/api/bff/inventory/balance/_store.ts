import type { InventoryBalanceListItem } from '@/lib/mocks/erp-list-fixtures';

export interface InventoryBalanceDraft {
  readonly id: string;
  readonly name?: string;
  readonly quantity: number;
  readonly skuId: string;
  readonly threshold: number;
  readonly warehouseId: string;
}

type InventoryBalanceStoreState = {
  deleted: Set<string>;
  upserts: Map<string, InventoryBalanceDraft>;
};

const STORE_KEY = '__MINIERP_INVENTORY_BALANCE_STORE__';

function getStore(): InventoryBalanceStoreState {
  const globalStore = globalThis as typeof globalThis & {
    [STORE_KEY]?: InventoryBalanceStoreState;
  };

  if (!globalStore[STORE_KEY]) {
    globalStore[STORE_KEY] = {
      deleted: new Set<string>(),
      upserts: new Map<string, InventoryBalanceDraft>(),
    };
  }

  return globalStore[STORE_KEY]!;
}

export function createInventoryBalanceId(skuId: string, warehouseId: string) {
  return `${skuId}::${warehouseId}`;
}

export function upsertInventoryBalanceDraft(
  draft: Omit<InventoryBalanceDraft, 'id'> & { id?: string },
) {
  const store = getStore();
  const id = draft.id ?? createInventoryBalanceId(draft.skuId, draft.warehouseId);

  store.deleted.delete(id);
  store.upserts.set(id, {
    ...draft,
    id,
  });

  return id;
}

export function removeInventoryBalanceDraft(id: string) {
  const store = getStore();
  store.upserts.delete(id);
  store.deleted.add(id);
}

function toListItem(draft: InventoryBalanceDraft): InventoryBalanceListItem {
  return {
    available: draft.quantity,
    balance: draft.quantity,
    name: draft.name?.trim() || draft.skuId,
    reserved: 0,
    safe: draft.threshold,
    sku: draft.skuId,
    warehouse: draft.warehouseId,
  };
}

export function mergeInventoryBalanceItems(
  source: readonly InventoryBalanceListItem[],
): InventoryBalanceListItem[] {
  const store = getStore();
  const merged = new Map<string, InventoryBalanceListItem>();

  for (const item of source) {
    const id = createInventoryBalanceId(item.sku, item.warehouse);
    if (store.deleted.has(id)) {
      continue;
    }

    merged.set(id, item);
  }

  for (const draft of store.upserts.values()) {
    merged.set(draft.id, toListItem(draft));
  }

  return [...merged.values()];
}
