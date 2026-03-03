import { HeaderActions, HeaderTag, MetricTile, PageFrame, ReadinessStrip, styles } from './template-shared';

import type { OverviewLayoutProps } from '@/contracts';

export function OverviewLayout({
  contract,
  searchSlot,
  todoSlot,
  quickActionsSlot,
  timelineSlot,
}: OverviewLayoutProps) {
  return (
    <PageFrame>
      <ReadinessStrip labels={contract.readiness} />
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>{contract.header.title}</h1>
          <p style={styles.description}>{contract.summary}</p>
          <div style={styles.metaRow}>
            {contract.header.statusTag ? <HeaderTag tag={contract.header.statusTag} /> : null}
          </div>
        </div>
        <HeaderActions
          primaryAction={contract.header.primaryAction}
          secondaryActions={contract.header.secondaryActions}
        />
      </header>

      {searchSlot ? <div style={{ marginBottom: 20 }}>{searchSlot}</div> : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.max(contract.metrics.length, 1)}, minmax(0, 1fr))`,
          gap: 16,
          marginBottom: 20,
        }}
      >
        {contract.metrics.map((metric) => (
          <MetricTile
            key={metric.key}
            label={metric.label}
            value={metric.value}
            hint={metric.hint}
            tone={metric.tone}
          />
        ))}
      </div>

      <div style={styles.grid2}>
        <div style={{ display: 'grid', gap: 20 }}>
          {todoSlot}
          {timelineSlot}
        </div>
        <div style={{ display: 'grid', gap: 20 }}>{quickActionsSlot}</div>
      </div>
    </PageFrame>
  );
}
