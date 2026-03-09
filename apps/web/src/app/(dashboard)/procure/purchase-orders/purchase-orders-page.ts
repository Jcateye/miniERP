export type PurchaseOrderFilter = 'all' | 'draft' | 'pending-approval' | 'approved' | 'completed';

export type PurchaseOrderListItem = {
  id: string;
  orderNumber: string;
  supplierName: string;
  createdAtLabel: string;
  amountLabel: string;
  lineCountLabel: string;
  statusLabel: string;
  filter: PurchaseOrderFilter;
};

export type PurchaseOrderListRow = {
  id: string;
  orderNumber: string;
  supplierName: string;
  orderedAt: string;
  amount: string;
  lineCount: string;
  status: string;
  actions: 'view';
  detailHref?: string;
};

export type PurchaseOrderColumn = {
  key: keyof PurchaseOrderListRow;
  label: string;
};

export const PURCHASE_ORDER_PAGE_PRESENTATION = {
  family: 'T2',
  variant: 'search-list',
  title: '采购单管理',
  summary: '采购单 · 管理工作台',
  primaryActionLabel: '新建采购单',
  searchPlaceholder: '搜索 PO编号, 供应商, 物料...',
  apiBasePath: '/api/bff/procure/purchase-orders',
} as const;

export const PURCHASE_ORDER_FILTER_OPTIONS: ReadonlyArray<{ value: PurchaseOrderFilter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'draft', label: '草稿' },
  { value: 'pending-approval', label: '待审批' },
  { value: 'approved', label: '已批准' },
  { value: 'completed', label: '已完成' },
];

export const PURCHASE_ORDER_LIST_COLUMNS: readonly PurchaseOrderColumn[] = [
  { key: 'orderNumber', label: 'PO 编号' },
  { key: 'supplierName', label: '供应商' },
  { key: 'orderedAt', label: '下单日期' },
  { key: 'amount', label: '金额' },
  { key: 'lineCount', label: '行数' },
  { key: 'status', label: '状态' },
  { key: 'actions', label: '操作' },
];

export function getSeedPurchaseOrderListItems(): PurchaseOrderListItem[] {
  return [
    {
      id: 'po_001',
      orderNumber: 'PO-20260308-001',
      supplierName: '华为技术有限公司',
      createdAtLabel: '2026-03-08',
      amountLabel: '¥128,000',
      lineCountLabel: '12',
      statusLabel: '待审批',
      filter: 'pending-approval',
    } satisfies PurchaseOrderListItem,
    {
      id: 'po_002',
      orderNumber: 'PO-20260305-003',
      supplierName: '比亚迪供应链有限公司',
      createdAtLabel: '2026-03-05',
      amountLabel: '¥86,000',
      lineCountLabel: '8',
      statusLabel: '已批准',
      filter: 'approved',
    } satisfies PurchaseOrderListItem,
  ].map((item) => ({ ...item }));
}

function includesKeyword(value: string | null | undefined, keyword: string): boolean {
  return (value ?? '').toLowerCase().includes(keyword.toLowerCase());
}

export function buildPurchaseOrderListRows(items: readonly PurchaseOrderListItem[]): PurchaseOrderListRow[] {
  return items.map((item) => ({
    id: item.id,
    orderNumber: item.orderNumber,
    supplierName: item.supplierName,
    orderedAt: item.createdAtLabel,
    amount: item.amountLabel,
    lineCount: item.lineCountLabel,
    status: item.statusLabel,
    actions: 'view',
    detailHref: undefined,
  }));
}

export function parsePurchaseOrderSearchParams(searchParams: URLSearchParams): {
  keyword: string;
  filter: PurchaseOrderFilter;
} {
  const keyword = searchParams.get('keyword')?.trim() ?? '';
  const filterParam = searchParams.get('filter');
  const filter = PURCHASE_ORDER_FILTER_OPTIONS.some((option) => option.value === filterParam)
    ? (filterParam as PurchaseOrderFilter)
    : 'all';

  return { keyword, filter };
}

export function buildPurchaseOrderSearchQuery(filters: {
  keyword: string;
  filter: PurchaseOrderFilter;
}): string {
  const params = new URLSearchParams();

  if (filters.keyword.trim()) {
    params.set('keyword', filters.keyword.trim());
  }

  if (filters.filter !== 'all') {
    params.set('filter', filters.filter);
  }

  return params.toString();
}

export function filterPurchaseOrderListItems(
  items: readonly PurchaseOrderListItem[],
  filters: { keyword: string; filter: PurchaseOrderFilter },
): PurchaseOrderListItem[] {
  const keyword = filters.keyword.trim();

  return items.filter((item) => {
    const matchesKeyword =
      !keyword || includesKeyword(item.orderNumber, keyword) || includesKeyword(item.supplierName, keyword);
    const matchesFilter = filters.filter === 'all' || item.filter === filters.filter;

    return matchesKeyword && matchesFilter;
  });
}

export function getNextPurchaseOrderFilter(
  nextFilter: PurchaseOrderFilter,
  activeFilter: PurchaseOrderFilter,
): PurchaseOrderFilter {
  return nextFilter === activeFilter ? 'all' : nextFilter;
}
