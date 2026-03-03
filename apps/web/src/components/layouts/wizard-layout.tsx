import { HeaderActions, HeaderTag, MetricTile, PageFrame, ReadinessStrip, styles } from './template-shared';

import type { WizardLayoutProps } from '@/contracts';

export function WizardLayout({ contract, editorSlot, summarySlot }: WizardLayoutProps) {
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${contract.steps.length}, minmax(0, 1fr))`,
          gap: 10,
          marginBottom: 18,
        }}
      >
        {contract.steps.map((step, index) => {
          const active = step.status === 'current';
          return (
            <div
              key={step.key}
              style={{
                ...styles.card,
                padding: 16,
                borderColor: active ? 'rgba(192,90,60,0.42)' : 'rgba(224,221,214,0.92)',
                background: active ? 'rgba(255,248,244,0.92)' : 'rgba(255,255,255,0.76)',
              }}
            >
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Step {index + 1}
              </div>
              <div style={{ marginTop: 8, fontSize: 15, fontWeight: 650 }}>{step.title}</div>
              {step.description ? (
                <div style={{ marginTop: 4, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {step.description}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.max(contract.summaryMetrics.length, 1)}, minmax(0, 1fr))`,
          gap: 14,
          marginBottom: 18,
        }}
      >
        {contract.summaryMetrics.map((metric) => (
          <MetricTile key={metric.key} label={metric.label} value={metric.value} hint={metric.hint} tone={metric.tone} />
        ))}
      </div>

      <div style={styles.grid2}>
        <div>{editorSlot}</div>
        <div>{summarySlot}</div>
      </div>
    </PageFrame>
  );
}
