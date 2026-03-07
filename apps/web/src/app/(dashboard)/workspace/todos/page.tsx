'use client';

import { Suspense, useMemo } from 'react';

import { ActionButton, DataTable, type TableColumn } from '@/components/ui';

import {
  buildWorkspaceTodoListRows,
  WORKSPACE_TODO_LIST_COLUMNS,
  WORKSPACE_TODO_PAGE_PRESENTATION,
  type WorkspaceTodoListRow,
} from './todos-page';
import { WorkspaceTodosPageScaffold } from './todos-page-view';
import { useWorkspaceTodosPageVm } from './use-todos-page-vm';

function getWorkspaceTodoTableColumns(): TableColumn[] {
  return WORKSPACE_TODO_LIST_COLUMNS.map((column) => ({
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

function WorkspaceTodosPageContent() {
  const { keywordInput, scopeInput, setKeywordInput, setScopeInput, visibleItems } = useWorkspaceTodosPageVm();
  const rows = useMemo<WorkspaceTodoListRow[]>(() => buildWorkspaceTodoListRows(visibleItems), [visibleItems]);
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
  const columns = useMemo(() => getWorkspaceTodoTableColumns(), []);

  return (
    <WorkspaceTodosPageScaffold
      title={WORKSPACE_TODO_PAGE_PRESENTATION.title}
      summary={WORKSPACE_TODO_PAGE_PRESENTATION.summary}
      searchPlaceholder={WORKSPACE_TODO_PAGE_PRESENTATION.searchPlaceholder}
      keyword={keywordInput}
      onKeywordChange={setKeywordInput}
      activeScope={scopeInput}
      onScopeChange={setScopeInput}
      table={<DataTable columns={columns} rows={tableRows} showPagination={false} />}
    />
  );
}

export default function WorkspaceTodosPage() {
  return (
    <Suspense fallback={null}>
      <WorkspaceTodosPageContent />
    </Suspense>
  );
}
