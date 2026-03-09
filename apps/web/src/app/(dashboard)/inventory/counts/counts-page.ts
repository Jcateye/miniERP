import type { TemplateFamily, TemplateFamilyVariant } from '@/contracts/template-contracts';

export type InventoryCountFilter = 'all' | 'in-progress' | 'posted';

export type InventoryCountListItem = {
  readonly id: string;
  readonly countNumber: string;
  readonly warehouseName: string | null;
  readonly dateLabel: string | null;
  readonly lineCountLabel: string | null;
  readonly differenceCountLabel: string | null;
  readonly ownerName: string | null;
  readonly statusLabel: string | null;
  readonly filter: InventoryCountFilter;
};

export type InventoryCountListColumnKey =
  | 'countNumber'
  | 'warehouseName'
  | 'date'
  | 'lineCount'
  | 'differenceCount'
  | 'ownerName'
  | 'status';

export type InventoryCountListColumn = {
  readonly key: InventoryCountListColumnKey;
  readonly label: string;
};

export type InventoryCountListRow = {
  readonly id: string;
  readonly countNumber: string;
  readonly warehouseName: string;
  readonly date: string;
  readonly lineCount: string;
  readonly differenceCount: string;
  readonly ownerName: string;
  readonly status: string;
  readonly detailHref?: string;
};

export type InventoryCountSearchFilters = {
  readonly keyword: string;
  readonly filter: InventoryCountFilter;
};

export type InventoryCountPagePresentation = {
  readonly family: TemplateFamily;
  readonly variant: TemplateFamilyVariant;
  readonly title: string;
  readonly summary: string;
  readonly primaryActionLabel: string;
  readonly searchPlaceholder: string;
  readonly apiBasePath: string;
};

export const INVENTORY_COUNT_PAGE_PRESENTATION: InventoryCountPagePresentation = {
  family: 'T2',
  variant: 'search-list',
  title: '盘点管理',
  summary: '盘点单 · 管理工作台',
  primaryActionLabel: '新建盘点',
  searchPlaceholder: '搜索盘点编号, 仓库...',
  apiBasePath: '/api/bff/inventory/counts',
};

export const INVENTORY_COUNT_FILTER_OPTIONS: ReadonlyArray<{
  value: InventoryCountFilter;
  label: string;
}> = [
  { value: 'all', label: '全部' },
  { value: 'in-progress', label: '进行中' },
  { value: 'posted', label: '已过账' },
];

export const INVENTORY_COUNT_LIST_COLUMNS: readonly InventoryCountListColumn[] = [
  { key: 'countNumber', label: '盘点编号' },
  { key: 'warehouseName', label: '仓库' },
  { key: 'date', label: '日期' },
  { key: 'lineCount', label: '盘点行' },
  { key: 'differenceCount', label: '差异数' },
  { key: 'ownerName', label: '负责人' },
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

export function parseInventoryCountSearchParams(
  searchParams: URLSearchParams,
): InventoryCountSearchFilters {
  const filter = searchParams.get('filter');

  return {
    keyword: searchParams.get('keyword')?.trim() ?? '',
    filter: filter === 'in-progress' || filter === 'posted' ? filter : 'all',
  };
}

export function buildInventoryCountSearchQuery(
  filters: InventoryCountSearchFilters,
): string {
  const params = new URLSearchParams();

  if (filters.keyword.trim()) {
    params.set('keyword', filters.keyword.trim());
  }

  if (filters.filter !== 'all') {
    params.set('filter', filters.filter);
  }

  return params.toString();
}

export function getNextInventoryCountFilter(
  nextFilter: InventoryCountFilter,
  activeFilter: InventoryCountFilter,
): InventoryCountFilter {
  return nextFilter === activeFilter ? 'all' : nextFilter;
}

export function filterInventoryCountListItems(
  items: readonly InventoryCountListItem[],
  filters: InventoryCountSearchFilters,
): InventoryCountListItem[] {
  const keyword = filters.keyword.trim().toLowerCase();

  return items.filter((item) => {
    const matchesKeyword =
      !keyword ||
      includesKeyword(item.countNumber, keyword) ||
      includesKeyword(item.warehouseName, keyword) ||
      includesKeyword(item.ownerName, keyword);
    const matchesFilter =
      filters.filter === 'all' ? true : item.filter === filters.filter;

    return matchesKeyword && matchesFilter;
  });
}

export function buildInventoryCountListRows(
  items: readonly InventoryCountListItem[],
): InventoryCountListRow[] {
  return items.map((item) => ({
    id: item.id,
    countNumber: item.countNumber,
    warehouseName: getDisplayValue(item.warehouseName),
    date: getDisplayValue(item.dateLabel),
    lineCount: getDisplayValue(item.lineCountLabel),
    differenceCount: getDisplayValue(item.differenceCountLabel),
    ownerName: getDisplayValue(item.ownerName),
    status: getDisplayValue(item.statusLabel),
  }));
}

export function getSeedInventoryCountListItems(): InventoryCountListItem[] {
  return [
    {
      id: 'count_001',
      countNumber: 'ST-20260308-001',
      warehouseName: '深圳总仓',
      dateLabel: '2026-03-08',
      lineCountLabel: '28',
      differenceCountLabel: '3',
      ownerName: '王五',
      statusLabel: '进行中',
      filter: 'in-progress',
    } satisfies InventoryCountListItem,
    {
      id: 'count_002',
      countNumber: 'ST-20260305-003',
      warehouseName: '上海分仓',
      dateLabel: '2026-03-05',
      lineCountLabel: '12',
      differenceCountLabel: '0',
      ownerName: '李四',
      statusLabel: '已过账',
      filter: 'posted',
    } satisfies InventoryCountListItem,
  ].map((item) => ({ ...item }));
}
