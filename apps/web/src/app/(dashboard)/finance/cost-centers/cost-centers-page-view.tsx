import type { ReactNode } from 'react';

import { ActionButton, PageHeader } from '@/components/ui';

type CostCentersPageScaffoldProps = {
  title: string;
  summary: string;
  primaryActionLabel: string;
  seedNotice: string;
  table: ReactNode;
};

export function CostCentersPageScaffold({
  title,
  summary,
  primaryActionLabel,
  seedNotice,
  table,
}: CostCentersPageScaffoldProps) {
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
      <div data-testid="cost-centers-topbar">
        <PageHeader
          title={title}
          subtitle={summary}
          actions={<ActionButton label={primaryActionLabel} tone="primary" disabled />}
        />
      </div>

      <div
        data-testid="cost-centers-seed-notice"
        style={{
          padding: '12px 16px',
          background: '#FFF7E8',
          border: '1px solid #F0D7A6',
          borderRadius: 4,
          fontSize: 13,
          lineHeight: 1.6,
          color: '#7A5A17',
        }}
      >
        {seedNotice}
      </div>

      <div data-testid="cost-centers-table">{table}</div>
    </div>
  );
}
