import type { WarehouseEntity } from '@minierp/shared';

export type WarehouseListItem = WarehouseEntity & {
  readonly warehouseTypeLabel?: string | null;
  readonly locationManagedLabel?: string | null;
};

export type WarehousePagePresentation = {
  readonly family: 'T2';
  readonly variant: 'search-list';
  readonly title: string;
  readonly summary: string;
  readonly primaryActionLabel: string;
  readonly searchPlaceholder: string;
  readonly apiBasePath: string;
};

export type WarehouseListColumn = {
  readonly key: string;
  readonly label: string;
};

export type WarehouseListRow = {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly warehouseType: string;
  readonly address: string;
  readonly contactPerson: string;
  readonly locationManaged: string;
  readonly status: string;
};

export type WarehouseSearchFilters = {
  readonly keyword: string;
};

export const WAREHOUSE_PAGE_PRESENTATION: WarehousePagePresentation = {
  family: 'T2',
  variant: 'search-list',
  title: '仓库管理',
  summary: '仓库 · 主数据管理',
  primaryActionLabel: '新建仓库',
  searchPlaceholder: '搜索仓库编号, 名称...',
  apiBasePath: '/api/bff/warehouses',
};

export const WAREHOUSE_LIST_COLUMNS: readonly WarehouseListColumn[] = [
  { key: 'code', label: '仓库编号' },
  { key: 'name', label: '仓库名称' },
  { key: 'warehouseType', label: '类型' },
  { key: 'address', label: '地址' },
  { key: 'contactPerson', label: '联系人' },
  { key: 'locationManaged', label: '库位管理' },
  { key: 'status', label: '状态' },
];

function getDisplayValue(value: string | null | undefined): string {
  const normalizedValue = value?.trim();
  return normalizedValue && normalizedValue.length > 0 ? normalizedValue : '—';
}

function getWarehouseStatusLabel(isActive: boolean): string {
  return isActive ? '启用' : '停用';
}

function normalizeKeywordValue(value: string | null): string {
  return value?.trim() ?? '';
}

function includesKeyword(source: string | null | undefined, keyword: string): boolean {
  if (!keyword) {
    return true;
  }

  return source?.toLowerCase().includes(keyword.toLowerCase()) ?? false;
}

export function parseWarehouseSearchParams(searchParams: URLSearchParams): WarehouseSearchFilters {
  return {
    keyword: normalizeKeywordValue(searchParams.get('keyword')),
  };
}

export function buildWarehouseSearchQuery(filters: WarehouseSearchFilters): string {
  const params = new URLSearchParams();

  if (filters.keyword.trim()) {
    params.set('keyword', filters.keyword.trim());
  }

  return params.toString();
}

export function filterWarehouseListItems(
  items: readonly WarehouseListItem[],
  filters: WarehouseSearchFilters,
): WarehouseListItem[] {
  const keyword = filters.keyword.trim().toLowerCase();

  return items.filter((item) => {
    const matchesKeyword =
      !keyword ||
      includesKeyword(item.code, keyword) ||
      includesKeyword(item.name, keyword) ||
      includesKeyword(item.address, keyword) ||
      includesKeyword(item.contactPerson, keyword);

    return matchesKeyword;
  });
}

export function parseWarehouseListPayload(payload: unknown): WarehouseListItem[] {
  if (typeof payload !== 'object' || payload === null || !('data' in payload) || !Array.isArray(payload.data)) {
    throw new Error('仓库列表响应格式无效');
  }

  return payload.data as WarehouseListItem[];
}

export function buildWarehouseListRows(items: readonly WarehouseListItem[]): WarehouseListRow[] {
  return items.map((item) => ({
    id: item.id,
    code: item.code,
    name: item.name,
    warehouseType: getDisplayValue(item.warehouseTypeLabel),
    address: getDisplayValue(item.address),
    contactPerson: getDisplayValue(item.contactPerson),
    locationManaged: getDisplayValue(item.locationManagedLabel),
    status: getWarehouseStatusLabel(item.isActive),
  }));
}
