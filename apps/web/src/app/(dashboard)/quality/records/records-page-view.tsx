import type { ReactNode } from 'react';

import { PageHeader, SearchBar } from '@/components/ui';

import type { QualityRecordScope } from './records-page';

type QualityRecordsPageScaffoldProps = {
  title: string;
  summary: string;
  searchPlaceholder: string;
  keyword?: string;
  onKeywordChange?: (value: string) => void;
  activeScope: QualityRecordScope;
  onScopeChange?: (scope: QualityRecordScope) => void;
  table: ReactNode;
};

const QUALITY_RECORD_SCOPE_OPTIONS: ReadonlyArray<{ value: QualityRecordScope; label: string }> = [
  { value: 'mine-pending', label: '待我处理' },
  { value: 'mine-closed', label: '已判定' },
  { value: 'mine-recorded', label: '我记录的' },
];

export function getNextQualityRecordScope(
  nextScope: QualityRecordScope,
  activeScope: QualityRecordScope,
): QualityRecordScope {
  return nextScope === activeScope ? '' : nextScope;
}

export function QualityRecordsPageScaffold({
  title,
  summary,
  searchPlaceholder,
  keyword = '',
  onKeywordChange,
  activeScope,
  onScopeChange,
  table,
}: QualityRecordsPageScaffoldProps) {
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
      <div data-testid="quality-records-topbar">
        <PageHeader title={title} subtitle={summary} />
      </div>

      <div data-testid="quality-records-search">
        <SearchBar
          placeholder={searchPlaceholder}
          value={keyword}
          onSearchChange={onKeywordChange}
          maxWidth={9999}
        />
      </div>

      <div data-testid="quality-records-filter-chips" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {QUALITY_RECORD_SCOPE_OPTIONS.map((option) => {
          const isActive = option.value === activeScope;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onScopeChange?.(getNextQualityRecordScope(option.value, activeScope))}
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

      <div data-testid="quality-records-table">{table}</div>
    </div>
  );
}
