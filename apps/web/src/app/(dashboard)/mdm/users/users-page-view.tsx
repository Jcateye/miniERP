import type { ReactNode } from 'react';

import { ActionButton, PageHeader } from '@/components/ui';

type UsersPageScaffoldProps = {
  title: string;
  summary: string;
  primaryActionLabel: string;
  table: ReactNode;
};

export function UsersPageScaffold({
  title,
  summary,
  primaryActionLabel,
  table,
}: UsersPageScaffoldProps) {
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
      <div data-testid="users-topbar">
        <PageHeader
          title={title}
          subtitle={summary}
          actions={<ActionButton label={primaryActionLabel} tone="primary" disabled />}
        />
      </div>

      <div data-testid="users-table">{table}</div>
    </div>
  );
}
