import type { ReactNode } from 'react';

import { ActionButton, PageHeader } from '@/components/ui';

type OrganizationsPageScaffoldProps = {
  title: string;
  summary: string;
  primaryActionLabel: string;
  table: ReactNode;
};

export function OrganizationsPageScaffold({
  title,
  summary,
  primaryActionLabel,
  table,
}: OrganizationsPageScaffoldProps) {
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
      <div data-testid="organizations-topbar">
        <PageHeader
          title={title}
          subtitle={summary}
          actions={<ActionButton label={primaryActionLabel} tone="primary" disabled />}
        />
      </div>

      <div data-testid="organizations-table">{table}</div>
    </div>
  );
}
