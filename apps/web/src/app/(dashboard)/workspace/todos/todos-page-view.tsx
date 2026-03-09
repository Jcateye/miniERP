import type { ReactNode } from 'react';

import { PageHeader, SearchBar } from '@/components/ui';

import type { WorkspaceTodoScope } from './todos-page';

type WorkspaceTodosPageScaffoldProps = {
  title: string;
  summary: string;
  searchPlaceholder: string;
  keyword?: string;
  onKeywordChange?: (value: string) => void;
  activeScope: WorkspaceTodoScope;
  onScopeChange?: (scope: WorkspaceTodoScope) => void;
  table: ReactNode;
};

const WORKSPACE_TODO_SCOPE_OPTIONS: ReadonlyArray<{ value: WorkspaceTodoScope; label: string }> = [
  { value: 'mine-pending', label: '待我审批' },
  { value: 'mine-approved', label: '我已审批' },
  { value: 'initiated-by-me', label: '我发起的' },
];

export function getNextWorkspaceTodoScope(
  nextScope: WorkspaceTodoScope,
  activeScope: WorkspaceTodoScope,
): WorkspaceTodoScope {
  return nextScope === activeScope ? '' : nextScope;
}

export function WorkspaceTodosPageScaffold({
  title,
  summary,
  searchPlaceholder,
  keyword = '',
  onKeywordChange,
  activeScope,
  onScopeChange,
  table,
}: WorkspaceTodosPageScaffoldProps) {
  return (
    <div
      style={{
        padding: '32px 40px',
        display: 'grid',
        gap: 24,
        minHeight: '100%',
        background: '#F5F3EF',
      }}
    >
      <div data-testid="workspace-todos-topbar">
        <PageHeader title={title} subtitle={summary} />
      </div>

      <div data-testid="workspace-todos-search">
        <SearchBar
          placeholder={searchPlaceholder}
          value={keyword}
          onSearchChange={onKeywordChange}
          maxWidth={9999}
        />
      </div>

      <div data-testid="workspace-todos-filter-chips" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {WORKSPACE_TODO_SCOPE_OPTIONS.map((option) => {
          const isActive = option.value === activeScope;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onScopeChange?.(getNextWorkspaceTodoScope(option.value, activeScope))}
              style={{
                borderRadius: 4,
                border: isActive ? '1px solid #C05A3C' : '1px solid #D1CCC4',
                background: isActive ? '#C05A3C' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#666666',
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div data-testid="workspace-todos-table">{table}</div>
    </div>
  );
}
