import type { PurchaseOrderListItem } from '@/lib/mocks/erp-list-fixtures';

export interface PurchaseOrderDraft {
  readonly amount: number;
  readonly id: string;
  readonly orderDate: string;
  readonly orderNo: string;
  readonly status: PurchaseOrderListItem['status'];
  readonly supplierId: string;
}

type PurchaseOrderStoreState = {
  deleted: Set<string>;
  upserts: Map<string, PurchaseOrderDraft>;
};

const STORE_KEY = '__MINIERP_PURCHASE_ORDER_STORE__';

function getStore(): PurchaseOrderStoreState {
  const globalStore = globalThis as typeof globalThis & {
    [STORE_KEY]?: PurchaseOrderStoreState;
  };

  if (!globalStore[STORE_KEY]) {
    globalStore[STORE_KEY] = {
      deleted: new Set<string>(),
      upserts: new Map<string, PurchaseOrderDraft>(),
    };
  }

  return globalStore[STORE_KEY]!;
}

export function upsertPurchaseOrderDraft(
  draft: Omit<PurchaseOrderDraft, 'id'> & { id?: string },
) {
  const store = getStore();
  const id = draft.id ?? draft.orderNo;

  store.deleted.delete(id);
  store.upserts.set(id, {
    ...draft,
    id,
  });

  return id;
}

export function removePurchaseOrderDraft(id: string) {
  const store = getStore();
  store.upserts.delete(id);
  store.deleted.add(id);
}

function toListItem(draft: PurchaseOrderDraft): PurchaseOrderListItem {
  return {
    amount: draft.amount,
    date: draft.orderDate,
    po: draft.orderNo,
    skuCount: 1,
    status: draft.status,
    supplier: draft.supplierId,
  };
}

export function mergePurchaseOrderItems(source: readonly PurchaseOrderListItem[]) {
  const store = getStore();
  const merged = new Map<string, PurchaseOrderListItem>();

  for (const item of source) {
    if (store.deleted.has(item.po)) {
      continue;
    }

    merged.set(item.po, item);
  }

  for (const draft of store.upserts.values()) {
    merged.set(draft.id, toListItem(draft));
  }

  return [...merged.values()];
}
