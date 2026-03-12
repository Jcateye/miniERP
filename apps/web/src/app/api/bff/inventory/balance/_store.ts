import {
  inventoryBalanceListFixtures,
  type InventoryBalanceListItem,
} from '@/lib/mocks/erp-list-fixtures';

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
    const normalizedWarehouseId = normalizeWarehouseForBalance(item.warehouse);
    const id = createInventoryBalanceId(item.sku, normalizedWarehouseId);
    if (store.deleted.has(id)) {
      continue;
    }

    merged.set(id, {
      ...item,
      warehouse: normalizedWarehouseId,
    });
  }

  for (const draft of store.upserts.values()) {
    merged.set(draft.id, toListItem(draft));
  }

  return [...merged.values()];
}

export function applyInventoryBalanceDelta(input: {
  quantityDelta: number;
  skuId: string;
  warehouseId: string;
}) {
  const normalizedWarehouseId = normalizeWarehouseForBalance(input.warehouseId);
  const store = getStore();
  const existingId = createInventoryBalanceId(input.skuId, normalizedWarehouseId);
  const existingDraft = store.upserts.get(existingId);
  const fixture = inventoryBalanceListFixtures.find(
    (candidate) => candidate.sku === input.skuId && candidate.warehouse === normalizedWarehouseId,
  );

  const baselineQuantity = existingDraft?.quantity ?? fixture?.balance ?? 0;
  const baselineThreshold = existingDraft?.threshold ?? fixture?.safe ?? 0;
  const baselineName = existingDraft?.name ?? fixture?.name;

  const nextQuantity = Math.max(0, baselineQuantity + input.quantityDelta);

  return upsertInventoryBalanceDraft({
    name: baselineName,
    quantity: nextQuantity,
    skuId: input.skuId,
    threshold: baselineThreshold,
    warehouseId: normalizedWarehouseId,
  });
}

function normalizeWarehouseForBalance(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  const normalized = trimmed.replaceAll(' ', '');
  if (normalized === 'WH-001' || normalized === '深圳总仓' || normalized === '深圳A仓') {
    return '深圳 A 仓';
  }

  if (normalized === 'WH-002' || normalized === '青岛B仓') {
    return '青岛 B 仓';
  }

  if (normalized === 'WH-003' || normalized === '苏州周转仓') {
    return '苏州 周转仓';
  }

  return trimmed;
}
