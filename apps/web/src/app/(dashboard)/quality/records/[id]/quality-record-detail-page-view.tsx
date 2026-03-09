import Link from 'next/link';

import { ActionButton, PageHeader } from '@/components/ui';

import type { QualityRecordDetailSection, QualityRecordDetailSummaryItem } from './quality-record-detail-page';

type QualityRecordDetailPageScaffoldProps = {
  title: string;
  summary: string;
  backLabel: string;
  backHref: string;
  summaryItems: readonly QualityRecordDetailSummaryItem[];
  sections: readonly QualityRecordDetailSection[];
};

export function QualityRecordDetailPageScaffold({
  title,
  summary,
  backLabel,
  backHref,
  summaryItems,
  sections,
}: QualityRecordDetailPageScaffoldProps) {
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
      <div data-testid="quality-record-detail-header">
        <PageHeader
          title={title}
          subtitle={summary}
          actions={
            <>
              <Link
                href={backHref}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  color: '#666666',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {backLabel}
              </Link>
              <ActionButton label="发起处置" tone="primary" disabled />
            </>
          }
        />
      </div>

      <section
        data-testid="quality-record-detail-summary"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 16,
        }}
      >
        {summaryItems.map((item) => (
          <div
            key={item.id}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5E0D8',
              borderRadius: 16,
              padding: 20,
              display: 'grid',
              gap: 8,
            }}
          >
            <div style={{ fontSize: 13, color: '#777777' }}>{item.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>{item.value}</div>
          </div>
        ))}
      </section>

      <section
        data-testid="quality-record-detail-sections"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 16,
        }}
      >
        {sections.map((section) => (
          <article
            key={section.id}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5E0D8',
              borderRadius: 16,
              padding: 20,
              display: 'grid',
              gap: 8,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>{section.title}</h2>
            <p style={{ margin: 0, fontSize: 13, color: '#666666', lineHeight: 1.6 }}>{section.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
