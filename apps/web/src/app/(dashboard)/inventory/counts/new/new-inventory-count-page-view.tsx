import Link from 'next/link';

import { ActionButton, PageHeader } from '@/components/ui';

import type {
  NewInventoryCountSection,
  NewInventoryCountStep,
} from './new-inventory-count-page';

type NewInventoryCountPageScaffoldProps = {
  title: string;
  summary: string;
  backLabel: string;
  backHref: string;
  primaryActionLabel: string;
  steps: readonly NewInventoryCountStep[];
  sections: readonly NewInventoryCountSection[];
};

export function NewInventoryCountPageScaffold({
  title,
  summary,
  backLabel,
  backHref,
  primaryActionLabel,
  steps,
  sections,
}: NewInventoryCountPageScaffoldProps) {
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
      <div data-testid="new-inventory-count-header">
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
              <ActionButton label={primaryActionLabel} tone="primary" disabled />
            </>
          }
        />
      </div>

      <section
        data-testid="new-inventory-count-steps"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 16,
        }}
      >
        {steps.map((step, index) => (
          <article
            key={step.id}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E5E0D8',
              borderRadius: 16,
              padding: 20,
              display: 'grid',
              gap: 8,
            }}
          >
            <div style={{ fontSize: 12, color: '#888888', textTransform: 'uppercase' }}>
              Step {index + 1}
            </div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>{step.title}</h2>
            <p style={{ margin: 0, fontSize: 13, color: '#666666', lineHeight: 1.6 }}>{step.description}</p>
          </article>
        ))}
      </section>

      <section
        data-testid="new-inventory-count-sections"
        style={{
          display: 'grid',
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
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>
              {section.title}
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: '#666666', lineHeight: 1.6 }}>{section.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
