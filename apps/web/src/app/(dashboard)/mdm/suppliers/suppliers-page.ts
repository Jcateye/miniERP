import type { TemplateFamily, TemplateFamilyVariant } from '@/contracts/template-contracts';

export type SupplierListItem = {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly contactPerson: string | null;
  readonly qualificationExpiryLabel: string | null;
  readonly cooperativeOrdersLabel: string | null;
  readonly statusLabel: string | null;
};

export type SupplierListColumnKey =
  | 'code'
  | 'name'
  | 'contactPerson'
  | 'qualificationExpiry'
  | 'cooperativeOrders'
  | 'status';

export type SupplierListColumn = {
  readonly key: SupplierListColumnKey;
  readonly label: string;
};

export type SupplierListRow = {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly contactPerson: string;
  readonly qualificationExpiry: string;
  readonly cooperativeOrders: string;
  readonly status: string;
  readonly detailHref: string;
};

export type SupplierSearchFilters = {
  readonly keyword: string;
};

export type SupplierPagePresentation = {
  readonly family: TemplateFamily;
  readonly variant: TemplateFamilyVariant;
  readonly title: string;
  readonly summary: string;
  readonly primaryActionLabel: string;
  readonly searchPlaceholder: string;
  readonly detailHrefBase: string;
  readonly apiBasePath: string;
};

export const SUPPLIER_PAGE_PRESENTATION: SupplierPagePresentation = {
  family: 'T2',
  variant: 'search-list',
  title: '供应商管理',
  summary: '供应商 · 主数据管理',
  primaryActionLabel: '新建供应商',
  searchPlaceholder: '搜索供应商名称, 联系人...',
  detailHrefBase: '/mdm/suppliers',
  apiBasePath: '/api/bff/suppliers',
};

export const SUPPLIER_LIST_COLUMNS: readonly SupplierListColumn[] = [
  { key: 'code', label: '编号' },
  { key: 'name', label: '供应商名称' },
  { key: 'contactPerson', label: '联系人' },
  { key: 'qualificationExpiry', label: '资质到期' },
  { key: 'cooperativeOrders', label: '合作订单' },
  { key: 'status', label: '状态' },
];

function getDisplayValue(value: string | null | undefined): string {
  return value && value.trim() ? value : '—';
}

function includesKeyword(value: string | null | undefined, keyword: string): boolean {
  if (!keyword) {
    return true;
  }

  return value?.toLowerCase().includes(keyword.toLowerCase()) ?? false;
}

export function parseSupplierSearchParams(searchParams: URLSearchParams): SupplierSearchFilters {
  return {
    keyword: searchParams.get('keyword')?.trim() ?? '',
  };
}

export function buildSupplierSearchQuery(filters: SupplierSearchFilters): string {
  const params = new URLSearchParams();

  if (filters.keyword.trim()) {
    params.set('keyword', filters.keyword.trim());
  }

  return params.toString();
}

export function filterSupplierListItems(
  items: readonly SupplierListItem[],
  filters: SupplierSearchFilters,
): SupplierListItem[] {
  const keyword = filters.keyword.trim().toLowerCase();

  return items.filter((item) => {
    return (
      !keyword ||
      includesKeyword(item.code, keyword) ||
      includesKeyword(item.name, keyword) ||
      includesKeyword(item.contactPerson, keyword)
    );
  });
}

export function buildSupplierListRows(items: readonly SupplierListItem[]): SupplierListRow[] {
  return items.map((item) => ({
    id: item.id,
    code: item.code,
    name: item.name,
    contactPerson: getDisplayValue(item.contactPerson),
    qualificationExpiry: getDisplayValue(item.qualificationExpiryLabel),
    cooperativeOrders: getDisplayValue(item.cooperativeOrdersLabel),
    status: getDisplayValue(item.statusLabel),
    detailHref: `${SUPPLIER_PAGE_PRESENTATION.detailHrefBase}/${encodeURIComponent(item.id)}`,
  }));
}
