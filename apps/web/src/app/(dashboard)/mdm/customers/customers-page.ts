import type { CustomerEntity } from '@minierp/shared';

export type CustomerListItem = CustomerEntity & {
  readonly creditLimitLabel?: string;
};

export type CustomerPagePresentation = {
  readonly family: 'T2';
  readonly variant: 'search-list';
  readonly title: string;
  readonly summary: string;
  readonly primaryActionLabel: string;
  readonly createHref: string;
  readonly searchPlaceholder: string;
  readonly detailHrefBase: string;
  readonly apiBasePath: string;
};

export type CustomerListColumn = {
  readonly key: string;
  readonly label: string;
};

export type CustomerListRow = {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly contactPerson: string;
  readonly contactPhone: string;
  readonly creditLimit: string;
  readonly status: string;
  readonly detailHref: string;
};

export type CustomerSearchFilters = {
  readonly keyword: string;
  readonly status: '' | 'active' | 'inactive';
};

export const CUSTOMER_PAGE_PRESENTATION: CustomerPagePresentation = {
  family: 'T2',
  variant: 'search-list',
  title: '客户管理',
  summary: '客户 · 主数据管理',
  primaryActionLabel: '新建客户',
  createHref: '/mdm/customers/new',
  searchPlaceholder: '搜索客户名称, 联系人, 编号...',
  detailHrefBase: '/mdm/customers',
  apiBasePath: '/api/bff/customers',
};

export const CUSTOMER_LIST_COLUMNS: readonly CustomerListColumn[] = [
  { key: 'code', label: '编号' },
  { key: 'name', label: '客户名称' },
  { key: 'contactPerson', label: '联系人' },
  { key: 'contactPhone', label: '电话' },
  { key: 'creditLimit', label: '信用额度' },
  { key: 'status', label: '状态' },
];

function getDisplayValue(value: string | null | undefined): string {
  const normalizedValue = value?.trim();
  return normalizedValue && normalizedValue.length > 0 ? normalizedValue : '—';
}

function getCustomerStatusLabel(isActive: boolean): string {
  return isActive ? '活跃' : '停用';
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

export function parseCustomerSearchParams(searchParams: URLSearchParams): CustomerSearchFilters {
  const status = searchParams.get('status');

  return {
    keyword: normalizeKeywordValue(searchParams.get('keyword')),
    status: status === 'active' || status === 'inactive' ? status : '',
  };
}

export function buildCustomerSearchQuery(filters: CustomerSearchFilters): string {
  const params = new URLSearchParams();

  if (filters.keyword.trim()) {
    params.set('keyword', filters.keyword.trim());
  }

  if (filters.status) {
    params.set('status', filters.status);
  }

  return params.toString();
}

export function filterCustomerListItems(
  items: readonly CustomerListItem[],
  filters: CustomerSearchFilters,
): CustomerListItem[] {
  const keyword = filters.keyword.trim().toLowerCase();

  return items.filter((item) => {
    const matchesKeyword =
      !keyword ||
      includesKeyword(item.code, keyword) ||
      includesKeyword(item.name, keyword) ||
      includesKeyword(item.contactPerson, keyword);

    const matchesStatus =
      filters.status === '' ||
      (filters.status === 'active' ? item.isActive : !item.isActive);

    return matchesKeyword && matchesStatus;
  });
}

export function parseCustomerListPayload(payload: unknown): CustomerListItem[] {
  if (typeof payload !== 'object' || payload === null || !('data' in payload) || !Array.isArray(payload.data)) {
    throw new Error('客户列表响应格式无效');
  }

  return payload.data as CustomerListItem[];
}

export function buildCustomerListRows(items: readonly CustomerListItem[]): CustomerListRow[] {
  return items.map((item) => ({
    id: item.id,
    code: item.code,
    name: item.name,
    contactPerson: getDisplayValue(item.contactPerson),
    contactPhone: getDisplayValue(item.contactPhone),
    creditLimit: getDisplayValue(item.creditLimitLabel),
    status: getCustomerStatusLabel(item.isActive),
    detailHref: `${CUSTOMER_PAGE_PRESENTATION.detailHrefBase}/${encodeURIComponent(item.id)}`,
  }));
}
