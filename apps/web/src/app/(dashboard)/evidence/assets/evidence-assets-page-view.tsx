import type { ReactNode } from 'react';

import { ActionButton, PageHeader, SearchBar } from '@/components/ui';

import { EVIDENCE_ASSET_FILTER_OPTIONS, getNextEvidenceAssetFilter, type EvidenceAssetFilter } from './evidence-assets-page';

type EvidenceAssetsPageScaffoldProps = {
  title: string;
  summary: string;
  searchPlaceholder: string;
  keyword?: string;
  onKeywordChange?: (value: string) => void;
  activeFilter: EvidenceAssetFilter;
  onFilterChange?: (filter: EvidenceAssetFilter) => void;
  table: ReactNode;
};

export function EvidenceAssetsPageScaffold({
  title,
  summary,
  searchPlaceholder,
  keyword = '',
  onKeywordChange,
  activeFilter,
  onFilterChange,
  table,
}: EvidenceAssetsPageScaffoldProps) {
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
      <div data-testid="evidence-assets-topbar">
        <PageHeader title={title} subtitle={summary} />
      </div>

      <div data-testid="evidence-assets-search">
        <SearchBar
          placeholder={searchPlaceholder}
          value={keyword}
          onSearchChange={onKeywordChange}
          maxWidth={9999}
        />
      </div>

      <div data-testid="evidence-assets-filters" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {EVIDENCE_ASSET_FILTER_OPTIONS.map((option) => {
          const isActive = option.value === activeFilter;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onFilterChange?.(getNextEvidenceAssetFilter(option.value, activeFilter))}
              style={{
                borderRadius: 4,
                border: isActive ? '1px solid #1A1A1A' : '1px solid #D1CCC4',
                background: isActive ? '#1A1A1A' : '#FFFFFF',
                color: isActive ? '#F5F3EF' : '#666666',
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

      <div data-testid="evidence-assets-table">{table}</div>
    </div>
  );
}
