import type { QcRecordStatus } from '@minierp/shared';

import type { TemplateFamily, TemplateFamilyVariant } from '@/contracts/template-contracts';

export type QualityRecordScope = '' | 'mine-pending' | 'mine-closed' | 'mine-recorded';

export type QualityRecordListItem = {
  readonly id: string;
  readonly recordNumber: string;
  readonly inspectionTypeLabel: string | null;
  readonly sourceNumber: string | null;
  readonly subjectLabel: string | null;
  readonly inspectorName: string | null;
  readonly conclusionLabel: string | null;
  readonly status: QcRecordStatus;
  readonly initiatedByMe?: boolean;
};

export type QualityRecordListColumnKey =
  | 'recordNumber'
  | 'inspectionType'
  | 'sourceNumber'
  | 'subject'
  | 'inspectorName'
  | 'conclusion'
  | 'actions';

export type QualityRecordListColumn = {
  readonly key: QualityRecordListColumnKey;
  readonly label: string;
};

export type QualityRecordListRow = {
  readonly id: string;
  readonly recordNumber: string;
  readonly inspectionType: string;
  readonly sourceNumber: string;
  readonly subject: string;
  readonly inspectorName: string;
  readonly conclusion: string;
  readonly actions: 'inspect-review' | 'view-only';
};

export type QualityRecordSearchFilters = {
  readonly keyword: string;
  readonly scope: QualityRecordScope;
};

export type QualityRecordPagePresentation = {
  readonly family: TemplateFamily;
  readonly variant: TemplateFamilyVariant;
  readonly title: string;
  readonly summary: string;
  readonly searchPlaceholder: string;
  readonly apiBasePath: string;
};

export const QUALITY_RECORD_PAGE_PRESENTATION: QualityRecordPagePresentation = {
  family: 'T2',
  variant: 'search-list',
  title: '质检记录工作台',
  summary: '来料检验 · 过程检验 · 出货检验',
  searchPlaceholder: '搜索记录编号, 批次, 物料, 质检员...',
  apiBasePath: '/api/bff/quality/records',
};

export const QUALITY_RECORD_LIST_COLUMNS: readonly QualityRecordListColumn[] = [
  { key: 'recordNumber', label: '记录编号' },
  { key: 'inspectionType', label: '检验类型' },
  { key: 'sourceNumber', label: '批次 / 单据' },
  { key: 'subject', label: '物料 / 订单' },
  { key: 'inspectorName', label: '质检员' },
  { key: 'conclusion', label: '结论' },
  { key: 'actions', label: '操作' },
];

function getDisplayValue(value: string | null | undefined): string {
  const normalizedValue = value?.trim();
  return normalizedValue && normalizedValue.length > 0 ? normalizedValue : '—';
}

function includesKeyword(source: string | null | undefined, keyword: string): boolean {
  if (!keyword) {
    return true;
  }

  return source?.toLowerCase().includes(keyword.toLowerCase()) ?? false;
}

function matchesScope(item: QualityRecordListItem, scope: QualityRecordScope): boolean {
  if (!scope) {
    return true;
  }

  if (scope === 'mine-pending') {
    return item.status === 'pending';
  }

  if (scope === 'mine-closed') {
    return item.status === 'passed' || item.status === 'failed' || item.status === 'waived' || item.status === 'closed';
  }

  return item.initiatedByMe === true;
}

export function parseQualityRecordSearchParams(searchParams: URLSearchParams): QualityRecordSearchFilters {
  const scope = searchParams.get('scope');

  return {
    keyword: searchParams.get('keyword')?.trim() ?? '',
    scope:
      scope === 'mine-pending' || scope === 'mine-closed' || scope === 'mine-recorded'
        ? scope
        : '',
  };
}

export function buildQualityRecordSearchQuery(filters: QualityRecordSearchFilters): string {
  const params = new URLSearchParams();

  if (filters.keyword.trim()) {
    params.set('keyword', filters.keyword.trim());
  }

  if (filters.scope) {
    params.set('scope', filters.scope);
  }

  return params.toString();
}

export function filterQualityRecordListItems(
  items: readonly QualityRecordListItem[],
  filters: QualityRecordSearchFilters,
): QualityRecordListItem[] {
  const keyword = filters.keyword.trim().toLowerCase();

  return items.filter((item) => {
    const matchesKeyword =
      !keyword ||
      includesKeyword(item.recordNumber, keyword) ||
      includesKeyword(item.sourceNumber, keyword) ||
      includesKeyword(item.subjectLabel, keyword) ||
      includesKeyword(item.inspectorName, keyword);

    return matchesKeyword && matchesScope(item, filters.scope);
  });
}

export function buildQualityRecordListRows(items: readonly QualityRecordListItem[]): QualityRecordListRow[] {
  return items.map((item) => ({
    id: item.id,
    recordNumber: item.recordNumber,
    inspectionType: getDisplayValue(item.inspectionTypeLabel),
    sourceNumber: getDisplayValue(item.sourceNumber),
    subject: getDisplayValue(item.subjectLabel),
    inspectorName: getDisplayValue(item.inspectorName),
    conclusion: getDisplayValue(item.conclusionLabel),
    actions: item.status === 'pending' ? 'inspect-review' : 'view-only',
  }));
}
