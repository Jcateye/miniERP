import { HeaderActions, HeaderTag, PageFrame, ReadinessStrip, styles } from './template-shared';

import type { WorkbenchLayoutProps } from '@/contracts';

export function WorkbenchLayout({
  contract,
  toolbarSlot,
  resultsSlot,
  detailSlot,
  bulkBarSlot,
}: WorkbenchLayoutProps) {
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

      <div style={{ marginBottom: 18 }}>{toolbarSlot}</div>
      <div style={styles.grid2}>
        <div style={{ display: 'grid', gap: 18 }}>
          {resultsSlot}
          {bulkBarSlot}
        </div>
        <div style={{ display: 'grid', gap: 18 }}>{detailSlot}</div>
      </div>
    </PageFrame>
  );
}
