import type { TemplateFamily, TemplateFamilyVariant } from '@/contracts/template-contracts';

export type QuotationFilter = 'all' | 'draft' | 'sent' | 'accepted';

export type QuotationListItem = {
  readonly id: string;
  readonly quoteNumber: string;
  readonly customerName: string | null;
  readonly createdAtLabel: string | null;
  readonly validUntilLabel: string | null;
  readonly amountLabel: string | null;
  readonly versionLabel: string | null;
  readonly statusLabel: string | null;
  readonly filter: QuotationFilter;
};

export type QuotationListColumnKey =
  | 'quoteNumber'
  | 'customerName'
  | 'createdAt'
  | 'validUntil'
  | 'amount'
  | 'version'
  | 'status';

export type QuotationListColumn = {
  readonly key: QuotationListColumnKey;
  readonly label: string;
};

export type QuotationListRow = {
  readonly id: string;
  readonly quoteNumber: string;
  readonly customerName: string;
  readonly createdAt: string;
  readonly validUntil: string;
  readonly amount: string;
  readonly version: string;
  readonly status: string;
  readonly detailHref?: string;
};

export type QuotationSearchFilters = {
  readonly keyword: string;
  readonly filter: QuotationFilter;
};

export type QuotationPagePresentation = {
  readonly family: TemplateFamily;
  readonly variant: TemplateFamilyVariant;
  readonly title: string;
  readonly summary: string;
  readonly primaryActionLabel: string;
  readonly searchPlaceholder: string;
  readonly apiBasePath: string;
};

export const QUOTATION_PAGE_PRESENTATION: QuotationPagePresentation = {
  family: 'T2',
  variant: 'search-list',
  title: '报价管理',
  summary: '报价单 · 管理工作台',
  primaryActionLabel: '新建报价',
  searchPlaceholder: '搜索报价编号, 客户...',
  apiBasePath: '/api/bff/sales/quotations',
};

export const QUOTATION_FILTER_OPTIONS: ReadonlyArray<{ value: QuotationFilter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'draft', label: '草稿' },
  { value: 'sent', label: '已发送' },
  { value: 'accepted', label: '已接受' },
];

export const QUOTATION_LIST_COLUMNS: readonly QuotationListColumn[] = [
  { key: 'quoteNumber', label: '报价编号' },
  { key: 'customerName', label: '客户' },
  { key: 'createdAt', label: '报价日期' },
  { key: 'validUntil', label: '有效期至' },
  { key: 'amount', label: '金额' },
  { key: 'version', label: '版本' },
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

export function parseQuotationSearchParams(searchParams: URLSearchParams): QuotationSearchFilters {
  const filter = searchParams.get('filter');

  return {
    keyword: searchParams.get('keyword')?.trim() ?? '',
    filter: filter === 'draft' || filter === 'sent' || filter === 'accepted' ? filter : 'all',
  };
}

export function buildQuotationSearchQuery(filters: QuotationSearchFilters): string {
  const params = new URLSearchParams();

  if (filters.keyword.trim()) {
    params.set('keyword', filters.keyword.trim());
  }

  if (filters.filter !== 'all') {
    params.set('filter', filters.filter);
  }

  return params.toString();
}

export function getNextQuotationFilter(nextFilter: QuotationFilter, activeFilter: QuotationFilter): QuotationFilter {
  return nextFilter === activeFilter ? 'all' : nextFilter;
}

export function filterQuotationListItems(
  items: readonly QuotationListItem[],
  filters: QuotationSearchFilters,
): QuotationListItem[] {
  const keyword = filters.keyword.trim().toLowerCase();

  return items.filter((item) => {
    const matchesKeyword =
      !keyword || includesKeyword(item.quoteNumber, keyword) || includesKeyword(item.customerName, keyword);
    const matchesFilter = filters.filter === 'all' ? true : item.filter === filters.filter;

    return matchesKeyword && matchesFilter;
  });
}

export function buildQuotationListRows(items: readonly QuotationListItem[]): QuotationListRow[] {
  return items.map((item) => ({
    id: item.id,
    quoteNumber: item.quoteNumber,
    customerName: getDisplayValue(item.customerName),
    createdAt: getDisplayValue(item.createdAtLabel),
    validUntil: getDisplayValue(item.validUntilLabel),
    amount: getDisplayValue(item.amountLabel),
    version: getDisplayValue(item.versionLabel),
    status: getDisplayValue(item.statusLabel),
  }));
}

export function getSeedQuotationListItems(): QuotationListItem[] {
  return [
    {
      id: 'quo_001',
      quoteNumber: 'Q-20260305-018',
      customerName: '大疆创新',
      createdAtLabel: '2026-03-05',
      validUntilLabel: '2026-03-10',
      amountLabel: '¥95,400',
      versionLabel: 'V2',
      statusLabel: '已发送',
      filter: 'sent',
    } satisfies QuotationListItem,
    {
      id: 'quo_002',
      quoteNumber: 'Q-20260301-006',
      customerName: 'Apple采购组',
      createdAtLabel: '2026-03-01',
      validUntilLabel: '2026-03-08',
      amountLabel: '¥76,000',
      versionLabel: 'V1',
      statusLabel: '草稿',
      filter: 'draft',
    } satisfies QuotationListItem,
  ].map((item) => ({ ...item }));
}
