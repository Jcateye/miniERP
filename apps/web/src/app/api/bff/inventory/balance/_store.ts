import {
  inventoryBalanceListFixtures,
  type InventoryBalanceListItem,
  warehouseBinLabelById,
  warehouseLabelById,
} from '@/lib/mocks/erp-list-fixtures';

export interface InventoryBalanceDraft {
  readonly binId?: string | null;
  readonly binLabel?: string | null;
  readonly id: string;
  readonly name?: string;
  readonly reserved?: number;
  readonly quantity: number;
  readonly skuId: string;
  readonly threshold: number;
  readonly warehouseId: string;
  readonly warehouseLabel?: string;
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

export function createInventoryBalanceId(
  skuId: string,
  warehouseId: string,
  binId?: string | null,
) {
  return `${skuId}::${warehouseId}::${binId ?? ''}`;
}

export function upsertInventoryBalanceDraft(
  draft: Omit<InventoryBalanceDraft, 'id'> & { id?: string },
) {
  const store = getStore();
  const id = draft.id ?? createInventoryBalanceId(draft.skuId, draft.warehouseId, draft.binId);

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
  const reserved = draft.reserved ?? 0;

  return {
    available: Math.max(draft.quantity - reserved, 0),
    balance: draft.quantity,
    bin: draft.binLabel ?? (draft.binId ? warehouseBinLabelById[draft.binId] ?? draft.binId : null),
    binId: draft.binId ?? null,
    name: draft.name?.trim() || draft.skuId,
    reserved,
    safe: draft.threshold,
    sku: draft.skuId,
    warehouse: draft.warehouseLabel ?? warehouseLabelById[draft.warehouseId] ?? draft.warehouseId,
    warehouseId: draft.warehouseId,
  };
}

export function mergeInventoryBalanceItems(
  source: readonly InventoryBalanceListItem[],
): InventoryBalanceListItem[] {
  const store = getStore();
  const merged = new Map<string, InventoryBalanceListItem>();

  for (const item of source) {
    const normalizedWarehouseId = normalizeWarehouseForBalance(item.warehouseId ?? item.warehouse);
    const normalizedBinId = normalizeBinForBalance(item.binId);
    const id = createInventoryBalanceId(item.sku, normalizedWarehouseId, normalizedBinId);
    if (store.deleted.has(id)) {
      continue;
    }

    merged.set(id, {
      ...item,
      bin: normalizedBinId ? warehouseBinLabelById[normalizedBinId] ?? item.bin ?? normalizedBinId : null,
      binId: normalizedBinId ?? null,
      warehouse: warehouseLabelById[normalizedWarehouseId] ?? item.warehouse,
      warehouseId: normalizedWarehouseId,
    });
  }

  for (const draft of store.upserts.values()) {
    merged.set(draft.id, toListItem(draft));
  }

  return [...merged.values()];
}

export function applyInventoryBalanceDelta(input: {
  binId?: string | null;
  quantityDelta: number;
  skuId: string;
  warehouseId: string;
}) {
  const normalizedWarehouseId = normalizeWarehouseForBalance(input.warehouseId);
  const normalizedBinId = normalizeBinForBalance(input.binId);
  const store = getStore();
  const existingId = createInventoryBalanceId(input.skuId, normalizedWarehouseId, normalizedBinId);
  const existingDraft = store.upserts.get(existingId);
  const fixture = inventoryBalanceListFixtures.find(
    (candidate) =>
      candidate.sku === input.skuId &&
      candidate.warehouseId === normalizedWarehouseId &&
      (candidate.binId ?? null) === (normalizedBinId ?? null),
  );

  const baselineQuantity = existingDraft?.quantity ?? fixture?.balance ?? 0;
  const baselineThreshold = existingDraft?.threshold ?? fixture?.safe ?? 0;
  const baselineName = existingDraft?.name ?? fixture?.name;
  const baselineReserved = existingDraft?.reserved ?? fixture?.reserved ?? 0;

  const nextQuantity = Math.max(0, baselineQuantity + input.quantityDelta);

  return upsertInventoryBalanceDraft({
    name: baselineName,
    binId: normalizedBinId,
    binLabel: normalizedBinId ? warehouseBinLabelById[normalizedBinId] ?? normalizedBinId : null,
    reserved: baselineReserved,
    quantity: nextQuantity,
    skuId: input.skuId,
    threshold: baselineThreshold,
    warehouseId: normalizedWarehouseId,
    warehouseLabel: warehouseLabelById[normalizedWarehouseId] ?? normalizedWarehouseId,
  });
}

export function resetInventoryBalanceStore() {
  const store = getStore();
  store.deleted.clear();
  store.upserts.clear();
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

function normalizeBinForBalance(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed || null;
}
