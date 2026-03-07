import type { ReactNode } from 'react';

import { ActionButton, PageHeader, SearchBar } from '@/components/ui';

type SuppliersPageScaffoldProps = {
  title: string;
  summary: string;
  primaryActionLabel: string;
  searchPlaceholder: string;
  keyword?: string;
  onKeywordChange?: (value: string) => void;
  table: ReactNode;
};

export function SuppliersPageScaffold({
  title,
  summary,
  primaryActionLabel,
  searchPlaceholder,
  keyword = '',
  onKeywordChange,
  table,
}: SuppliersPageScaffoldProps) {
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
      <div data-testid="suppliers-topbar">
        <PageHeader
          title={title}
          subtitle={summary}
          actions={<ActionButton label={primaryActionLabel} tone="primary" disabled />}
        />
      </div>

      <div data-testid="suppliers-search">
        <SearchBar
          placeholder={searchPlaceholder}
          value={keyword}
          onSearchChange={onKeywordChange}
          maxWidth={9999}
        />
      </div>

      <div data-testid="suppliers-table">{table}</div>
    </div>
  );
}
