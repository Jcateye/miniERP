import { ActionButton, PageHeader, SearchBar } from '@/components/ui';
import type { ReactNode } from 'react';

type CustomersPageScaffoldProps = {
  title: string;
  summary: string;
  primaryActionLabel: string;
  primaryActionHref?: string;
  searchPlaceholder: string;
  keyword?: string;
  onKeywordChange?: (value: string) => void;
  table: ReactNode;
};

export function CustomersPageScaffold({
  title,
  summary,
  primaryActionLabel,
  primaryActionHref,
  searchPlaceholder,
  keyword = '',
  onKeywordChange,
  table,
}: CustomersPageScaffoldProps) {
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
      <div data-testid="customers-topbar">
        <PageHeader
          title={title}
          subtitle={summary}
          actions={<ActionButton label={primaryActionLabel} tone="primary" href={primaryActionHref} />}
        />
      </div>

      <div data-testid="customers-search">
        <SearchBar
          placeholder={searchPlaceholder}
          value={keyword}
          onSearchChange={onKeywordChange}
          maxWidth={9999}
        />
      </div>

      <div data-testid="customers-table">{table}</div>
    </div>
  );
}
