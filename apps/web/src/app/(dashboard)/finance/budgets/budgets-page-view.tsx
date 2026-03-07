import type { ReactNode } from 'react';

import { ActionButton, PageHeader } from '@/components/ui';

type BudgetsPageScaffoldProps = {
  title: string;
  summary: string;
  primaryActionLabel: string;
  table: ReactNode;
};

export function BudgetsPageScaffold({
  title,
  summary,
  primaryActionLabel,
  table,
}: BudgetsPageScaffoldProps) {
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
      <div data-testid="budgets-topbar">
        <PageHeader
          title={title}
          subtitle={summary}
          actions={<ActionButton label={primaryActionLabel} tone="primary" disabled />}
        />
      </div>

      <div data-testid="budgets-table">{table}</div>
    </div>
  );
}
