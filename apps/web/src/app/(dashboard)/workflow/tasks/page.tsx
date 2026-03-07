'use client';

import { Suspense, useMemo } from 'react';

import { ActionButton, DataTable, type TableColumn } from '@/components/ui';

import {
  buildWorkflowTaskListRows,
  WORKFLOW_TASK_LIST_COLUMNS,
  WORKFLOW_TASK_PAGE_PRESENTATION,
  type WorkflowTaskListRow,
} from './tasks-page';
import { WorkflowTasksPageScaffold } from './tasks-page-view';
import { useWorkflowTasksPageVm } from './use-tasks-page-vm';

function getWorkflowTaskTableColumns(): TableColumn[] {
  return WORKFLOW_TASK_LIST_COLUMNS.map((column) => ({
    key: column.key,
    label: column.label,
    width:
      column.key === 'documentNumber'
        ? 140
        : column.key === 'documentType'
          ? 90
          : column.key === 'applicantName'
            ? 100
            : column.key === 'summary'
              ? 220
              : column.key === 'amount'
                ? 100
                : 160,
    render:
      column.key === 'actions'
        ? (value) =>
            value === 'approve-reject' ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <ActionButton label="通过" tone="secondary" disabled />
                <ActionButton label="驳回" tone="primary" disabled />
              </div>
            ) : (
              <ActionButton label="查看" tone="secondary" disabled />
            )
        : undefined,
  })) satisfies TableColumn[];
}

function WorkflowTasksPageContent() {
  const { keywordInput, scopeInput, setKeywordInput, setScopeInput, visibleItems } = useWorkflowTasksPageVm();
  const rows = useMemo<WorkflowTaskListRow[]>(() => buildWorkflowTaskListRows(visibleItems), [visibleItems]);
  const tableRows = useMemo<Record<string, string>[]>(
    () =>
      rows.map(({ id, documentNumber, documentType, applicantName, summary, amount, actions }) => ({
        id,
        documentNumber,
        documentType,
        applicantName,
        summary,
        amount,
        actions,
      })),
    [rows],
  );
  const columns = useMemo(() => getWorkflowTaskTableColumns(), []);

  return (
    <WorkflowTasksPageScaffold
      title={WORKFLOW_TASK_PAGE_PRESENTATION.title}
      summary={WORKFLOW_TASK_PAGE_PRESENTATION.summary}
      searchPlaceholder={WORKFLOW_TASK_PAGE_PRESENTATION.searchPlaceholder}
      keyword={keywordInput}
      onKeywordChange={setKeywordInput}
      activeScope={scopeInput}
      onScopeChange={setScopeInput}
      table={<DataTable columns={columns} rows={tableRows} showPagination={false} />}
    />
  );
}

export default function WorkflowTasksPage() {
  return (
    <Suspense fallback={null}>
      <WorkflowTasksPageContent />
    </Suspense>
  );
}
