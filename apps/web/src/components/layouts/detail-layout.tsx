import { HeaderActions, HeaderTag, PageFrame, ReadinessStrip, styles } from './template-shared';

import type { DetailLayoutProps } from '@/contracts';

export function DetailLayout({
  contract,
  primarySlot,
  secondarySlot,
  tertiarySlot,
  activeTabKey,
  tabContentSlot,
  quickActionsSlot,
}: DetailLayoutProps) {
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

      <div style={styles.grid3}>
        <div style={{ display: 'grid', gap: 18 }}>{primarySlot}</div>
        <div style={{ display: 'grid', gap: 18 }}>{secondarySlot}</div>
        <div style={{ display: 'grid', gap: 18 }}>
          {tertiarySlot}
          {quickActionsSlot}
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          {contract.tabs.map((tab) => {
            const active = tab.key === activeTabKey;
            return (
              <div
                key={tab.key}
                style={{
                  padding: '10px 14px',
                  borderRadius: 999,
                  border: active ? '1px solid var(--color-terracotta)' : '1px solid var(--color-border)',
                  background: active ? 'rgba(192,90,60,0.12)' : 'rgba(255,255,255,0.72)',
                  color: active ? 'var(--color-terracotta)' : 'var(--color-text-secondary)',
                  fontSize: 13,
                  fontWeight: 650,
                }}
              >
                {tab.label}
              </div>
            );
          })}
        </div>
        {tabContentSlot}
      </div>
    </PageFrame>
  );
}
