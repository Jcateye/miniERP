import type { TemplateFamily, TemplateFamilyVariant } from '@/contracts/template-contracts';

export type SalesShipmentFilter = 'all' | 'picking' | 'picked' | 'dispatched';

export type SalesShipmentListItem = {
  readonly id: string;
  readonly shipmentNumber: string;
  readonly customerName: string | null;
  readonly relatedSalesOrderNumber: string | null;
  readonly quantityLabel: string | null;
  readonly trackingNumber: string | null;
  readonly statusLabel: string | null;
  readonly filter: SalesShipmentFilter;
};

export type SalesShipmentListColumnKey =
  | 'shipmentNumber'
  | 'customerName'
  | 'relatedSalesOrderNumber'
  | 'quantity'
  | 'trackingNumber'
  | 'status'
  | 'actions';

export type SalesShipmentListColumn = {
  readonly key: SalesShipmentListColumnKey;
  readonly label: string;
};

export type SalesShipmentListRow = {
  readonly id: string;
  readonly shipmentNumber: string;
  readonly customerName: string;
  readonly relatedSalesOrderNumber: string;
  readonly quantity: string;
  readonly trackingNumber: string;
  readonly status: string;
  readonly actions: 'view';
  readonly detailHref?: string;
};

export type SalesShipmentSearchFilters = {
  readonly keyword: string;
  readonly filter: SalesShipmentFilter;
};

export type SalesShipmentPagePresentation = {
  readonly family: TemplateFamily;
  readonly variant: TemplateFamilyVariant;
  readonly title: string;
  readonly summary: string;
  readonly primaryActionLabel: string;
  readonly searchPlaceholder: string;
  readonly apiBasePath: string;
};

export const SALES_SHIPMENT_PAGE_PRESENTATION: SalesShipmentPagePresentation = {
  family: 'T2',
  variant: 'search-list',
  title: '发运管理',
  summary: '发运单 · 管理工作台',
  primaryActionLabel: '新建发运',
  searchPlaceholder: '搜索发运编号, 客户, 物流单号...',
  apiBasePath: '/api/bff/sales/shipments',
};

export const SALES_SHIPMENT_FILTER_OPTIONS: ReadonlyArray<{ value: SalesShipmentFilter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'picking', label: '待拣货' },
  { value: 'picked', label: '已拣货' },
  { value: 'dispatched', label: '已发出' },
];

export const SALES_SHIPMENT_LIST_COLUMNS: readonly SalesShipmentListColumn[] = [
  { key: 'shipmentNumber', label: '发运编号' },
  { key: 'customerName', label: '客户' },
  { key: 'relatedSalesOrderNumber', label: '关联SO' },
  { key: 'quantity', label: '数量' },
  { key: 'trackingNumber', label: '物流单号' },
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

export function parseSalesShipmentSearchParams(searchParams: URLSearchParams): SalesShipmentSearchFilters {
  const filter = searchParams.get('filter');

  return {
    keyword: searchParams.get('keyword')?.trim() ?? '',
    filter: filter === 'picking' || filter === 'picked' || filter === 'dispatched' ? filter : 'all',
  };
}

export function buildSalesShipmentSearchQuery(filters: SalesShipmentSearchFilters): string {
  const params = new URLSearchParams();

  if (filters.keyword.trim()) {
    params.set('keyword', filters.keyword.trim());
  }

  if (filters.filter !== 'all') {
    params.set('filter', filters.filter);
  }

  return params.toString();
}

export function getNextSalesShipmentFilter(nextFilter: SalesShipmentFilter, activeFilter: SalesShipmentFilter): SalesShipmentFilter {
  return nextFilter === activeFilter ? 'all' : nextFilter;
}

export function filterSalesShipmentListItems(
  items: readonly SalesShipmentListItem[],
  filters: SalesShipmentSearchFilters,
): SalesShipmentListItem[] {
  const keyword = filters.keyword.trim().toLowerCase();

  return items.filter((item) => {
    const matchesKeyword =
      !keyword ||
      includesKeyword(item.shipmentNumber, keyword) ||
      includesKeyword(item.customerName, keyword) ||
      includesKeyword(item.trackingNumber, keyword) ||
      includesKeyword(item.relatedSalesOrderNumber, keyword);
    const matchesFilter = filters.filter === 'all' ? true : item.filter === filters.filter;

    return matchesKeyword && matchesFilter;
  });
}

export function buildSalesShipmentListRows(items: readonly SalesShipmentListItem[]): SalesShipmentListRow[] {
  return items.map((item) => ({
    id: item.id,
    shipmentNumber: item.shipmentNumber,
    customerName: getDisplayValue(item.customerName),
    relatedSalesOrderNumber: getDisplayValue(item.relatedSalesOrderNumber),
    quantity: getDisplayValue(item.quantityLabel),
    trackingNumber: getDisplayValue(item.trackingNumber),
    status: getDisplayValue(item.statusLabel),
    actions: 'view',
  }));
}

export function getSeedSalesShipmentListItems(): SalesShipmentListItem[] {
  return [
    {
      id: 'ship_001',
      shipmentNumber: 'OUT-20260308-001',
      customerName: '京东企业购',
      relatedSalesOrderNumber: 'SO-20260306-001',
      quantityLabel: '12',
      trackingNumber: 'SF12345678',
      statusLabel: '待拣货',
      filter: 'picking',
    } satisfies SalesShipmentListItem,
    {
      id: 'ship_002',
      shipmentNumber: 'OUT-20260305-003',
      customerName: '企业微信采购',
      relatedSalesOrderNumber: 'SO-20260305-007',
      quantityLabel: '24',
      trackingNumber: 'JD998877',
      statusLabel: '已发出',
      filter: 'dispatched',
    } satisfies SalesShipmentListItem,
  ].map((item) => ({ ...item }));
}
