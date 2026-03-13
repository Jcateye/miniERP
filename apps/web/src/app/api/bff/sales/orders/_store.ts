import type { SalesOrderListItem } from '@/lib/mocks/erp-list-fixtures';

export interface SalesOrderDraft {
  readonly amount: number;
  readonly customerId: string;
  readonly customerLabel?: string;
  readonly id: string;
  readonly lines: readonly SalesOrderDraftLine[];
  readonly orderDate: string;
  readonly orderNo: string;
  readonly status: SalesOrderListItem['status'];
}

export interface SalesOrderDraftLine {
  readonly itemId: string;
  readonly itemLabel?: string;
  readonly qty: string;
  readonly unitPrice: string;
}

type SalesOrderStoreState = {
  deleted: Set<string>;
  upserts: Map<string, SalesOrderDraft>;
};

const STORE_KEY = '__MINIERP_SALES_ORDER_STORE__';

function getStore(): SalesOrderStoreState {
  const globalStore = globalThis as typeof globalThis & {
    [STORE_KEY]?: SalesOrderStoreState;
  };

  if (!globalStore[STORE_KEY]) {
    globalStore[STORE_KEY] = {
      deleted: new Set<string>(),
      upserts: new Map<string, SalesOrderDraft>(),
    };
  }

  return globalStore[STORE_KEY]!;
}

export function upsertSalesOrderDraft(draft: Omit<SalesOrderDraft, 'id'> & { id?: string }) {
  const store = getStore();
  const id = draft.id ?? draft.orderNo;

  store.deleted.delete(id);
  store.upserts.set(id, {
    ...draft,
    id,
  });

  return id;
}

export function removeSalesOrderDraft(id: string) {
  const store = getStore();
  store.upserts.delete(id);
  store.deleted.add(id);
}

export function getSalesOrderDraft(id: string): SalesOrderDraft | null {
  const store = getStore();
  return store.upserts.get(id) ?? null;
}

function toListItem(draft: SalesOrderDraft): SalesOrderListItem {
  return {
    amount: draft.amount,
    customer: draft.customerLabel || draft.customerId,
    date: draft.orderDate,
    id: draft.id,
    skuCount: draft.lines.length,
    so: draft.orderNo,
    status: draft.status,
  };
}

export function mergeSalesOrderItems(source: readonly SalesOrderListItem[]) {
  const store = getStore();
  const merged = new Map<string, SalesOrderListItem>();

  for (const item of source) {
    if (store.deleted.has(item.id)) {
      continue;
    }

    merged.set(item.id, item);
  }

  for (const draft of store.upserts.values()) {
    merged.set(draft.id, toListItem(draft));
  }

  return [...merged.values()];
}
