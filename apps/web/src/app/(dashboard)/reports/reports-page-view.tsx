import type { ReactNode } from 'react';

import { PageHeader } from '@/components/ui';

import type { ReportsEntryGroup, ReportsKpiCard } from './reports-page';

type ReportsPageScaffoldProps = {
  title: string;
  summary: string;
  kpis: readonly ReportsKpiCard[];
  groups: readonly ReportsEntryGroup[];
};

function getKpiValueColor(accent: ReportsKpiCard['accent']): string {
  if (accent === 'warning') return '#C05A3C';
  if (accent === 'success') return '#2E7D32';
  return '#1A1A1A';
}

function ReportGroupCard({ group }: { group: ReportsEntryGroup }) {
  const isInverse = group.tone === 'inverse';

  return (
    <div
      style={{
        background: isInverse ? '#1A1A1A' : '#FFFFFF',
        color: isInverse ? '#F5F3EF' : '#1A1A1A',
        border: isInverse ? 'none' : '1px solid #E0DDD8',
        borderRadius: 8,
        padding: '24px 28px',
        display: 'grid',
        gap: 12,
      }}
    >
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{group.title}</h2>
      {group.items.map((item, index) => (
        <div
          key={item.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            borderBottom: index === group.items.length - 1 ? 'none' : `1px solid ${isInverse ? '#333333' : '#E8E4DD'}`,
            fontSize: 13,
          }}
        >
          <span style={{ color: '#C05A3C' }}>◌</span>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function ReportsQuickLinks({ group }: { group: ReportsEntryGroup }) {
  return (
    <div data-testid="reports-groups" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 20 }}>
      {group.items.map((item) => (
        <div
          key={item.id}
          style={{
            background: '#FFFFFF',
            border: '1px solid #E0DDD8',
            borderRadius: 8,
            padding: 24,
            display: 'grid',
            gap: 12,
            justifyItems: 'center',
          }}
        >
          <div style={{ color: '#C05A3C', fontSize: 28 }}>◌</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}

export function ReportsPageScaffold({ title, summary, kpis, groups }: ReportsPageScaffoldProps) {
  const mainGroups = groups.filter((group) => group.id !== 'quick-links');
  const quickLinks = groups.find((group) => group.id === 'quick-links');

  return (
    <div
      style={{
        padding: '32px 40px',
        display: 'grid',
        gap: 28,
        minHeight: '100%',
        background: '#F5F3EF',
      }}
    >
      <div data-testid="reports-topbar">
        <PageHeader title={title} subtitle={summary} />
      </div>

      <div data-testid="reports-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 20 }}>
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E0DDD8',
              borderRadius: 8,
              padding: '20px 24px',
              display: 'grid',
              gap: 8,
            }}
          >
            <div style={{ fontSize: 12, color: '#888888', fontWeight: 500 }}>{kpi.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: getKpiValueColor(kpi.accent) }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 20 }}>
        {mainGroups.map((group) => (
          <ReportGroupCard key={group.id} group={group} />
        ))}
      </div>

      {quickLinks ? <ReportsQuickLinks group={quickLinks} /> : null}
    </div>
  );
}
