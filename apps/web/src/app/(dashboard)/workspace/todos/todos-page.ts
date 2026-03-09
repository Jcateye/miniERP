import type { WorkflowTaskStatus } from '@minierp/shared';

import type { TemplateFamily, TemplateFamilyVariant } from '@/contracts/template-contracts';

export type WorkspaceTodoScope = '' | 'mine-pending' | 'mine-approved' | 'initiated-by-me';

export type WorkspaceTodoListItem = {
  readonly id: string;
  readonly documentNumber: string;
  readonly documentTypeLabel: string | null;
  readonly applicantName: string | null;
  readonly summary: string | null;
  readonly amountLabel: string | null;
  readonly status: WorkflowTaskStatus;
  readonly initiatedByMe?: boolean;
};

export type WorkspaceTodoListColumnKey =
  | 'documentNumber'
  | 'documentType'
  | 'applicantName'
  | 'summary'
  | 'amount'
  | 'actions';

export type WorkspaceTodoListColumn = {
  readonly key: WorkspaceTodoListColumnKey;
  readonly label: string;
};

export type WorkspaceTodoListRow = {
  readonly id: string;
  readonly documentNumber: string;
  readonly documentType: string;
  readonly applicantName: string;
  readonly summary: string;
  readonly amount: string;
  readonly actions: 'approve-reject' | 'view-only';
};

export type WorkspaceTodoSearchFilters = {
  readonly keyword: string;
  readonly scope: WorkspaceTodoScope;
};

export type WorkspaceTodoPagePresentation = {
  readonly family: TemplateFamily;
  readonly variant: TemplateFamilyVariant;
  readonly title: string;
  readonly summary: string;
  readonly searchPlaceholder: string;
  readonly apiBasePath: string;
};

export const WORKSPACE_TODO_PAGE_PRESENTATION: WorkspaceTodoPagePresentation = {
  family: 'T2',
  variant: 'search-list',
  title: '工作空间待办',
  summary: '待审批 · 待处理 · 异常任务',
  searchPlaceholder: '搜索单据编号, 申请人, 摘要...',
  apiBasePath: '/api/bff/workspace/todos',
};

export const WORKSPACE_TODO_LIST_COLUMNS: readonly WorkspaceTodoListColumn[] = [
  { key: 'documentNumber', label: '单据编号' },
  { key: 'documentType', label: '类型' },
  { key: 'applicantName', label: '申请人' },
  { key: 'summary', label: '摘要' },
  { key: 'amount', label: '金额' },
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

function matchesScope(item: WorkspaceTodoListItem, scope: WorkspaceTodoScope): boolean {
  if (!scope) {
    return true;
  }

  if (scope === 'mine-pending') {
    return item.status === 'pending';
  }

  if (scope === 'mine-approved') {
    return item.status === 'approved';
  }

  return item.initiatedByMe === true;
}

export function parseWorkspaceTodoSearchParams(searchParams: URLSearchParams): WorkspaceTodoSearchFilters {
  const scope = searchParams.get('scope');

  return {
    keyword: searchParams.get('keyword')?.trim() ?? '',
    scope:
      scope === 'mine-pending' || scope === 'mine-approved' || scope === 'initiated-by-me'
        ? scope
        : '',
  };
}

export function buildWorkspaceTodoSearchQuery(filters: WorkspaceTodoSearchFilters): string {
  const params = new URLSearchParams();

  if (filters.keyword.trim()) {
    params.set('keyword', filters.keyword.trim());
  }

  if (filters.scope) {
    params.set('scope', filters.scope);
  }

  return params.toString();
}

export function filterWorkspaceTodoListItems(
  items: readonly WorkspaceTodoListItem[],
  filters: WorkspaceTodoSearchFilters,
): WorkspaceTodoListItem[] {
  const keyword = filters.keyword.trim().toLowerCase();

  return items.filter((item) => {
    const matchesKeyword =
      !keyword ||
      includesKeyword(item.documentNumber, keyword) ||
      includesKeyword(item.applicantName, keyword) ||
      includesKeyword(item.summary, keyword);

    return matchesKeyword && matchesScope(item, filters.scope);
  });
}

export function buildWorkspaceTodoListRows(items: readonly WorkspaceTodoListItem[]): WorkspaceTodoListRow[] {
  return items.map((item) => ({
    id: item.id,
    documentNumber: item.documentNumber,
    documentType: getDisplayValue(item.documentTypeLabel),
    applicantName: getDisplayValue(item.applicantName),
    summary: getDisplayValue(item.summary),
    amount: getDisplayValue(item.amountLabel),
    actions: item.status === 'pending' ? 'approve-reject' : 'view-only',
  }));
}
