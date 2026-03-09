import type { ReactNode } from 'react';

import { ActionButton, PageHeader } from '@/components/ui';

type ManufacturingOrdersPageScaffoldProps = {
  title: string;
  summary: string;
  primaryActionLabel: string;
  table: ReactNode;
};

export function ManufacturingOrdersPageScaffold({
  title,
  summary,
  primaryActionLabel,
  table,
}: ManufacturingOrdersPageScaffoldProps) {
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
      <div data-testid="manufacturing-orders-topbar">
        <PageHeader
          title={title}
          subtitle={summary}
          actions={<ActionButton label={primaryActionLabel} tone="primary" disabled />}
        />
      </div>

      <div data-testid="manufacturing-orders-table">{table}</div>
    </div>
  );
}
