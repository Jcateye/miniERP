import type { TemplateFamily, TemplateFamilyVariant } from '@/contracts/template-contracts';

export type InventoryBalanceFilter = 'all' | 'low-stock' | 'zero-stock';

export type InventoryBalanceListItem = {
  readonly id: string;
  readonly itemCode: string;
  readonly itemName: string | null;
  readonly warehouseName: string | null;
  readonly onHandLabel: string | null;
  readonly availableLabel: string | null;
  readonly reservedLabel: string | null;
  readonly safetyStockLabel: string | null;
  readonly statusLabel: string | null;
  readonly filter: InventoryBalanceFilter;
};

export type InventoryBalanceListColumnKey =
  | 'itemCode'
  | 'itemName'
  | 'warehouseName'
  | 'onHand'
  | 'available'
  | 'reserved'
  | 'safetyStock'
  | 'status';

export type InventoryBalanceListColumn = {
  readonly key: InventoryBalanceListColumnKey;
  readonly label: string;
};

export type InventoryBalanceListRow = {
  readonly id: string;
  readonly itemCode: string;
  readonly itemName: string;
  readonly warehouseName: string;
  readonly onHand: string;
  readonly available: string;
  readonly reserved: string;
  readonly safetyStock: string;
  readonly status: string;
  readonly detailHref?: string;
};

export type InventoryBalanceSearchFilters = {
  readonly keyword: string;
  readonly filter: InventoryBalanceFilter;
};

export type InventoryBalancePagePresentation = {
  readonly family: TemplateFamily;
  readonly variant: TemplateFamilyVariant;
  readonly title: string;
  readonly summary: string;
  readonly primaryActionLabel: string;
  readonly searchPlaceholder: string;
  readonly apiBasePath: string;
};

export const INVENTORY_BALANCE_PAGE_PRESENTATION: InventoryBalancePagePresentation = {
  family: 'T2',
  variant: 'search-list',
  title: '库存余额',
  summary: '实时库存余额查询 · 多维度筛选',
  primaryActionLabel: '导出',
  searchPlaceholder: '搜索物料编号, 名称, 仓库...',
  apiBasePath: '/api/bff/inventory/balances',
};

export const INVENTORY_BALANCE_FILTER_OPTIONS: ReadonlyArray<{ value: InventoryBalanceFilter; label: string }> = [
  { value: 'all', label: '全部仓库' },
  { value: 'low-stock', label: '低于安全库存' },
  { value: 'zero-stock', label: '零库存' },
];

export const INVENTORY_BALANCE_LIST_COLUMNS: readonly InventoryBalanceListColumn[] = [
  { key: 'itemCode', label: '物料编号' },
  { key: 'itemName', label: '物料名称' },
  { key: 'warehouseName', label: '仓库' },
  { key: 'onHand', label: '在库数量' },
  { key: 'available', label: '可用数量' },
  { key: 'reserved', label: '预留数量' },
  { key: 'safetyStock', label: '安全库存' },
  { key: 'status', label: '状态' },
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

export function parseInventoryBalanceSearchParams(searchParams: URLSearchParams): InventoryBalanceSearchFilters {
  const filter = searchParams.get('filter');

  return {
    keyword: searchParams.get('keyword')?.trim() ?? '',
    filter: filter === 'low-stock' || filter === 'zero-stock' ? filter : 'all',
  };
}

export function buildInventoryBalanceSearchQuery(filters: InventoryBalanceSearchFilters): string {
  const params = new URLSearchParams();

  if (filters.keyword.trim()) {
    params.set('keyword', filters.keyword.trim());
  }

  if (filters.filter !== 'all') {
    params.set('filter', filters.filter);
  }

  return params.toString();
}

export function getNextInventoryBalanceFilter(
  nextFilter: InventoryBalanceFilter,
  activeFilter: InventoryBalanceFilter,
): InventoryBalanceFilter {
  return nextFilter === activeFilter ? 'all' : nextFilter;
}

export function filterInventoryBalanceListItems(
  items: readonly InventoryBalanceListItem[],
  filters: InventoryBalanceSearchFilters,
): InventoryBalanceListItem[] {
  const keyword = filters.keyword.trim().toLowerCase();

  return items.filter((item) => {
    const matchesKeyword =
      !keyword ||
      includesKeyword(item.itemCode, keyword) ||
      includesKeyword(item.itemName, keyword) ||
      includesKeyword(item.warehouseName, keyword);
    const matchesFilter = filters.filter === 'all' ? true : item.filter === filters.filter;

    return matchesKeyword && matchesFilter;
  });
}

export function buildInventoryBalanceListRows(
  items: readonly InventoryBalanceListItem[],
): InventoryBalanceListRow[] {
  return items.map((item) => ({
    id: item.id,
    itemCode: item.itemCode,
    itemName: getDisplayValue(item.itemName),
    warehouseName: getDisplayValue(item.warehouseName),
    onHand: getDisplayValue(item.onHandLabel),
    available: getDisplayValue(item.availableLabel),
    reserved: getDisplayValue(item.reservedLabel),
    safetyStock: getDisplayValue(item.safetyStockLabel),
    status: getDisplayValue(item.statusLabel),
  }));
}

export function getSeedInventoryBalanceListItems(): InventoryBalanceListItem[] {
  return [
    {
      id: 'bal_001',
      itemCode: 'ADP-USB-C-HUB',
      itemName: 'USB-C扩展坞',
      warehouseName: '深圳总仓',
      onHandLabel: '112',
      availableLabel: '106',
      reservedLabel: '6',
      safetyStockLabel: '50',
      statusLabel: '正常',
      filter: 'all',
    } satisfies InventoryBalanceListItem,
    {
      id: 'bal_002',
      itemCode: 'CAB-HDMI-2M',
      itemName: 'HDMI线材',
      warehouseName: '深圳总仓',
      onHandLabel: '2',
      availableLabel: '2',
      reservedLabel: '0',
      safetyStockLabel: '10',
      statusLabel: '低库存',
      filter: 'low-stock',
    } satisfies InventoryBalanceListItem,
  ].map((item) => ({ ...item }));
}
