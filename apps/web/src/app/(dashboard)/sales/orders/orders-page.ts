import type { TemplateFamily, TemplateFamilyVariant } from '@/contracts/template-contracts';

export type SalesOrderFilter = 'all' | 'pending' | 'confirmed' | 'shipped';

export type SalesOrderListItem = {
  readonly id: string;
  readonly orderNumber: string;
  readonly customerName: string | null;
  readonly orderDateLabel: string | null;
  readonly amountLabel: string | null;
  readonly deliveryDateLabel: string | null;
  readonly statusLabel: string | null;
  readonly filter: SalesOrderFilter;
};

export type SalesOrderListColumnKey =
  | 'orderNumber'
  | 'customerName'
  | 'orderDate'
  | 'amount'
  | 'deliveryDate'
  | 'status'
  | 'actions';

export type SalesOrderListColumn = {
  readonly key: SalesOrderListColumnKey;
  readonly label: string;
};

export type SalesOrderListRow = {
  readonly id: string;
  readonly orderNumber: string;
  readonly customerName: string;
  readonly orderDate: string;
  readonly amount: string;
  readonly deliveryDate: string;
  readonly status: string;
  readonly actions: 'view';
  readonly detailHref?: string;
};

export type SalesOrderSearchFilters = {
  readonly keyword: string;
  readonly filter: SalesOrderFilter;
};

export type SalesOrderPagePresentation = {
  readonly family: TemplateFamily;
  readonly variant: TemplateFamilyVariant;
  readonly title: string;
  readonly summary: string;
  readonly primaryActionLabel: string;
  readonly searchPlaceholder: string;
  readonly apiBasePath: string;
};

export const SALES_ORDER_PAGE_PRESENTATION: SalesOrderPagePresentation = {
  family: 'T2',
  variant: 'search-list',
  title: '销售订单管理',
  summary: '销售订单 · 管理工作台',
  primaryActionLabel: '新建销售订单',
  searchPlaceholder: '搜索 SO编号, 客户, 物料...',
  apiBasePath: '/api/bff/sales/orders',
};

export const SALES_ORDER_FILTER_OPTIONS: ReadonlyArray<{ value: SalesOrderFilter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待确认' },
  { value: 'confirmed', label: '已确认' },
  { value: 'shipped', label: '已发运' },
];

export const SALES_ORDER_LIST_COLUMNS: readonly SalesOrderListColumn[] = [
  { key: 'orderNumber', label: 'SO 编号' },
  { key: 'customerName', label: '客户' },
  { key: 'orderDate', label: '下单日期' },
  { key: 'amount', label: '金额' },
  { key: 'deliveryDate', label: '交期' },
  { key: 'status', label: '状态' },
  { key: 'actions', label: '操作' },
];

function getDisplayValue(value: string | null | undefined): string {
  return value && value.trim() ? value : '—';
}

function includesKeyword(source: string | null | undefined, keyword: string): boolean {
  if (!keyword) {
    return true;
  }

  return source?.toLowerCase().includes(keyword.toLowerCase()) ?? false;
}

export function parseSalesOrderSearchParams(searchParams: URLSearchParams): SalesOrderSearchFilters {
  const filter = searchParams.get('filter');

  return {
    keyword: searchParams.get('keyword')?.trim() ?? '',
    filter: filter === 'pending' || filter === 'confirmed' || filter === 'shipped' ? filter : 'all',
  };
}

export function buildSalesOrderSearchQuery(filters: SalesOrderSearchFilters): string {
  const params = new URLSearchParams();

  if (filters.keyword.trim()) {
    params.set('keyword', filters.keyword.trim());
  }

  if (filters.filter !== 'all') {
    params.set('filter', filters.filter);
  }

  return params.toString();
}

export function getNextSalesOrderFilter(nextFilter: SalesOrderFilter, activeFilter: SalesOrderFilter): SalesOrderFilter {
  return nextFilter === activeFilter ? 'all' : nextFilter;
}

export function filterSalesOrderListItems(
  items: readonly SalesOrderListItem[],
  filters: SalesOrderSearchFilters,
): SalesOrderListItem[] {
  const keyword = filters.keyword.trim().toLowerCase();

  return items.filter((item) => {
    const matchesKeyword =
      !keyword ||
      includesKeyword(item.orderNumber, keyword) ||
      includesKeyword(item.customerName, keyword);
    const matchesFilter = filters.filter === 'all' ? true : item.filter === filters.filter;

    return matchesKeyword && matchesFilter;
  });
}

export function buildSalesOrderListRows(items: readonly SalesOrderListItem[]): SalesOrderListRow[] {
  return items.map((item) => ({
    id: item.id,
    orderNumber: item.orderNumber,
    customerName: getDisplayValue(item.customerName),
    orderDate: getDisplayValue(item.orderDateLabel),
    amount: getDisplayValue(item.amountLabel),
    deliveryDate: getDisplayValue(item.deliveryDateLabel),
    status: getDisplayValue(item.statusLabel),
    actions: 'view',
  }));
}

export function getSeedSalesOrderListItems(): SalesOrderListItem[] {
  return [
    {
      id: 'so_001',
      orderNumber: 'SO-20260306-001',
      customerName: '京东企业购',
      orderDateLabel: '2026-03-06',
      amountLabel: '¥16,800',
      deliveryDateLabel: '03-12',
      statusLabel: '待确认',
      filter: 'pending',
    } satisfies SalesOrderListItem,
    {
      id: 'so_002',
      orderNumber: 'SO-20260305-007',
      customerName: '企业微信采购',
      orderDateLabel: '2026-03-05',
      amountLabel: '¥32,000',
      deliveryDateLabel: '03-09',
      statusLabel: '已确认',
      filter: 'confirmed',
    } satisfies SalesOrderListItem,
  ].map((item) => ({ ...item }));
}
