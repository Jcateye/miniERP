import Link from 'next/link';

import { PageHeader } from '@/components/ui';

import type { ManufacturingOverviewMetric, ManufacturingOverviewQuickLink } from './manufacturing-overview-page';

type ManufacturingOverviewPageScaffoldProps = {
  title: string;
  summary: string;
  metrics: readonly ManufacturingOverviewMetric[];
  quickLinks: readonly ManufacturingOverviewQuickLink[];
};

export function ManufacturingOverviewPageScaffold({
  title,
  summary,
  metrics,
  quickLinks,
}: ManufacturingOverviewPageScaffoldProps) {
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
      <div data-testid="manufacturing-overview-topbar">
        <PageHeader title={title} subtitle={summary} />
      </div>

      <div
        data-testid="manufacturing-overview-metrics"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 16,
        }}
      >
        {metrics.map((metric) => (
          <section
            key={metric.id}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5E0D8',
              borderRadius: 16,
              padding: 20,
              display: 'grid',
              gap: 8,
            }}
          >
            <div style={{ fontSize: 13, color: '#777777' }}>{metric.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A' }}>{metric.value}</div>
          </section>
        ))}
      </div>

      <section
        data-testid="manufacturing-overview-quick-links"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E5E0D8',
          borderRadius: 16,
          padding: 20,
          display: 'grid',
          gap: 16,
        }}
      >
        <div style={{ display: 'grid', gap: 4 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>制造域入口</h2>
          <p style={{ margin: 0, fontSize: 13, color: '#777777' }}>聚合生产订单、工单、BOM 与质检的常用入口。</p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 16,
          }}
        >
          {quickLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              style={{
                display: 'grid',
                gap: 6,
                padding: '16px 18px',
                borderRadius: 14,
                border: '1px solid #E5E0D8',
                textDecoration: 'none',
                color: 'inherit',
                background: '#FCFBF8',
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>{link.title}</div>
              <div style={{ fontSize: 13, color: '#777777', lineHeight: 1.5 }}>{link.description}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
