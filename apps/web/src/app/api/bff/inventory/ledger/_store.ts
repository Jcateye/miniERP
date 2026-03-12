import type { InventoryLedgerListItem } from '@/lib/mocks/erp-list-fixtures';

export interface InventoryLedgerDraft {
  readonly date: string;
  readonly id: string;
  readonly quantity: number;
  readonly reason?: string;
  readonly skuId: string;
  readonly type: InventoryLedgerListItem['type'];
  readonly warehouseId: string;
}

type InventoryLedgerStoreState = {
  deleted: Set<string>;
  upserts: Map<string, InventoryLedgerDraft>;
};

const STORE_KEY = '__MINIERP_INVENTORY_LEDGER_STORE__';

function getStore(): InventoryLedgerStoreState {
  const globalStore = globalThis as typeof globalThis & {
    [STORE_KEY]?: InventoryLedgerStoreState;
  };

  if (!globalStore[STORE_KEY]) {
    globalStore[STORE_KEY] = {
      deleted: new Set<string>(),
      upserts: new Map<string, InventoryLedgerDraft>(),
    };
  }

  return globalStore[STORE_KEY]!;
}

export function createInventoryLedgerId(input: {
  date: string;
  skuId: string;
  source: string;
  warehouse: string;
}) {
  return `${input.date}::${input.skuId}::${input.warehouse}::${input.source}`;
}

export function upsertInventoryLedgerDraft(
  draft: Omit<InventoryLedgerDraft, 'date' | 'id' | 'type'> & {
    date?: string;
    id?: string;
    type: '入库' | '出库' | '调整';
  },
) {
  const store = getStore();
  const normalizedType = draft.type === '调整' ? '调拨' : draft.type;
  const date = draft.date ?? formatDateTime(new Date().toISOString());
  const source = draft.reason?.trim() || `MANUAL-${normalizedType}`;
  const id =
    draft.id ??
    createInventoryLedgerId({
      date,
      skuId: draft.skuId,
      source,
      warehouse: draft.warehouseId,
    });

  store.deleted.delete(id);
  store.upserts.set(id, {
    ...draft,
    date,
    id,
    type: normalizedType,
  });

  return id;
}

export function removeInventoryLedgerDraft(id: string) {
  const store = getStore();
  store.upserts.delete(id);
  store.deleted.add(id);
}

function toListItem(draft: InventoryLedgerDraft): InventoryLedgerListItem {
  return {
    balance: draft.quantity,
    date: draft.date,
    direction: `${draft.quantity >= 0 ? '+' : ''}${draft.quantity}`,
    operator: '系统',
    skuId: draft.skuId,
    source: draft.reason?.trim() || `MANUAL-${draft.type}`,
    type: draft.type,
    warehouse: draft.warehouseId,
  };
}

export function mergeInventoryLedgerItems(
  source: readonly InventoryLedgerListItem[],
): InventoryLedgerListItem[] {
  const store = getStore();
  const merged = new Map<string, InventoryLedgerListItem>();

  for (const item of source) {
    const id = createInventoryLedgerId({
      date: item.date,
      skuId: item.skuId,
      source: item.source,
      warehouse: item.warehouse,
    });

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

export function resetInventoryLedgerStore() {
  const store = getStore();
  store.deleted.clear();
  store.upserts.clear();
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}
