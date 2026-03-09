import type { ReactNode } from 'react';

import { ActionButton, PageHeader, SearchBar } from '@/components/ui';

type InventoryLedgerPageScaffoldProps = {
  title: string;
  summary: string;
  searchPlaceholder: string;
  table: ReactNode;
};

export function InventoryLedgerPageScaffold({
  title,
  summary,
  searchPlaceholder,
  table,
}: InventoryLedgerPageScaffoldProps) {
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
      <div data-testid="inventory-ledger-topbar">
        <PageHeader
          title={title}
          subtitle={summary}
          actions={<ActionButton label="导出" tone="secondary" disabled />}
        />
      </div>

      <div data-testid="inventory-ledger-search">
        <SearchBar placeholder={searchPlaceholder} value="" onSearchChange={() => undefined} maxWidth={9999} />
      </div>

      <div data-testid="inventory-ledger-table">{table}</div>
    </div>
  );
}
