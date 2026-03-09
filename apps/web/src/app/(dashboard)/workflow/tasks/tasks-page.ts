import type { WorkflowTaskStatus } from '@minierp/shared';

import type { TemplateFamily, TemplateFamilyVariant } from '@/contracts/template-contracts';

export type WorkflowTaskScope = '' | 'mine-pending' | 'mine-approved' | 'initiated-by-me';

export type WorkflowTaskListItem = {
  readonly id: string;
  readonly documentNumber: string;
  readonly documentTypeLabel: string | null;
  readonly applicantName: string | null;
  readonly summary: string | null;
  readonly amountLabel: string | null;
  readonly status: WorkflowTaskStatus;
  readonly initiatedByMe?: boolean;
};

export type WorkflowTaskListColumnKey =
  | 'documentNumber'
  | 'documentType'
  | 'applicantName'
  | 'summary'
  | 'amount'
  | 'actions';

export type WorkflowTaskListColumn = {
  readonly key: WorkflowTaskListColumnKey;
  readonly label: string;
};

export type WorkflowTaskListRow = {
  readonly id: string;
  readonly documentNumber: string;
  readonly documentType: string;
  readonly applicantName: string;
  readonly summary: string;
  readonly amount: string;
  readonly actions: 'approve-reject' | 'view-only';
};

export type WorkflowTaskSearchFilters = {
  readonly keyword: string;
  readonly scope: WorkflowTaskScope;
};

export type WorkflowTaskPagePresentation = {
  readonly family: TemplateFamily;
  readonly variant: TemplateFamilyVariant;
  readonly title: string;
  readonly summary: string;
  readonly searchPlaceholder: string;
  readonly apiBasePath: string;
};

export const WORKFLOW_TASK_PAGE_PRESENTATION: WorkflowTaskPagePresentation = {
  family: 'T2',
  variant: 'search-list',
  title: '审批任务',
  summary: '待我审批 · 我已审批 · 审批管理',
  searchPlaceholder: '搜索审批单号, 申请人...',
  apiBasePath: '/api/bff/workflow/tasks',
};

export const WORKFLOW_TASK_LIST_COLUMNS: readonly WorkflowTaskListColumn[] = [
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

function matchesScope(item: WorkflowTaskListItem, scope: WorkflowTaskScope): boolean {
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

export function parseWorkflowTaskSearchParams(searchParams: URLSearchParams): WorkflowTaskSearchFilters {
  const scope = searchParams.get('scope');

  return {
    keyword: searchParams.get('keyword')?.trim() ?? '',
    scope:
      scope === 'mine-pending' || scope === 'mine-approved' || scope === 'initiated-by-me'
        ? scope
        : '',
  };
}

export function buildWorkflowTaskSearchQuery(filters: WorkflowTaskSearchFilters): string {
  const params = new URLSearchParams();

  if (filters.keyword.trim()) {
    params.set('keyword', filters.keyword.trim());
  }

  if (filters.scope) {
    params.set('scope', filters.scope);
  }

  return params.toString();
}

export function filterWorkflowTaskListItems(
  items: readonly WorkflowTaskListItem[],
  filters: WorkflowTaskSearchFilters,
): WorkflowTaskListItem[] {
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

export function buildWorkflowTaskListRows(items: readonly WorkflowTaskListItem[]): WorkflowTaskListRow[] {
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
