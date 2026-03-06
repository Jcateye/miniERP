import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';

import type { TemplateAction, TemplateActionTone, TemplateTag, TemplateTone } from '@/contracts';

const toneMap: Record<TemplateTone, { bg: string; color: string; border: string }> = {
  neutral: { bg: 'rgba(26,26,26,0.06)', color: 'var(--color-text-primary)', border: 'var(--color-border)' },
  success: { bg: 'var(--color-success-bg)', color: 'var(--color-success)', border: 'rgba(46,125,50,0.16)' },
  warning: { bg: 'rgba(192,90,60,0.12)', color: 'var(--color-terracotta)', border: 'rgba(192,90,60,0.18)' },
  danger: { bg: 'rgba(217,79,79,0.12)', color: 'var(--color-error)', border: 'rgba(217,79,79,0.18)' },
  info: { bg: 'rgba(92,124,138,0.12)', color: 'var(--color-info)', border: 'rgba(92,124,138,0.18)' },
};

const actionToneMap: Record<TemplateActionTone, CSSProperties> = {
  primary: {
    background: 'var(--color-terracotta)',
    color: '#fff',
    border: '1px solid var(--color-terracotta)',
  },
  secondary: {
    background: '#fff',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border-strong)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    border: '1px solid transparent',
  },
  danger: {
    background: 'rgba(217,79,79,0.12)',
    color: 'var(--color-error)',
    border: '1px solid rgba(217,79,79,0.18)',
  },
};

export const styles = {
  page: {
    minHeight: '100vh',
    padding: '32px 36px 40px',
    background:
      'radial-gradient(circle at top right, rgba(192,90,60,0.10), transparent 32%), linear-gradient(180deg, rgba(255,255,255,0.7), rgba(245,243,239,0.96))',
    color: 'var(--color-text-primary)',
  } satisfies CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 20,
    marginBottom: 24,
  } satisfies CSSProperties,
  title: {
    fontFamily: 'var(--font-display-family), sans-serif',
    fontSize: 30,
    fontWeight: 700,
    lineHeight: 1.05,
    margin: 0,
    letterSpacing: '-0.03em',
  } satisfies CSSProperties,
  description: {
    maxWidth: 720,
    margin: '8px 0 0',
    fontSize: 14,
    lineHeight: 1.6,
    color: 'var(--color-text-secondary)',
  } satisfies CSSProperties,
  metaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  } satisfies CSSProperties,
  actionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    flexWrap: 'wrap',
  } satisfies CSSProperties,
  readinessRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  } satisfies CSSProperties,
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.7fr) minmax(300px, 0.9fr)',
    gap: 20,
  } satisfies CSSProperties,
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr) minmax(280px, 0.75fr)',
    gap: 20,
  } satisfies CSSProperties,
  card: {
    background: 'rgba(255,255,255,0.84)',
    border: '1px solid rgba(224,221,214,0.92)',
    borderRadius: 18,
    boxShadow: '0 18px 48px rgba(26,26,26,0.06)',
    backdropFilter: 'blur(14px)',
  } satisfies CSSProperties,
  cardBody: {
    padding: 20,
  } satisfies CSSProperties,
  cardTitle: {
    fontSize: 16,
    fontWeight: 650,
    margin: 0,
  } satisfies CSSProperties,
  cardDesc: {
    margin: '6px 0 0',
    fontSize: 13,
    lineHeight: 1.5,
    color: 'var(--color-text-secondary)',
  } satisfies CSSProperties,
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
  } satisfies CSSProperties,
  fieldCard: {
    border: '1px solid rgba(224,221,214,0.92)',
    borderRadius: 14,
    padding: 14,
    background: 'rgba(245,243,239,0.72)',
  } satisfies CSSProperties,
  fieldLabel: {
    fontSize: 12,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  } satisfies CSSProperties,
  fieldValue: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: 600,
    lineHeight: 1.5,
  } satisfies CSSProperties,
  tableWrap: {
    overflowX: 'auto',
  } satisfies CSSProperties,
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  } satisfies CSSProperties,
  th: {
    padding: '12px 14px',
    textAlign: 'left',
    color: 'var(--color-text-muted)',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    borderBottom: '1px solid rgba(224,221,214,0.92)',
  } satisfies CSSProperties,
  td: {
    padding: '14px',
    borderBottom: '1px solid rgba(224,221,214,0.72)',
    verticalAlign: 'top',
  } satisfies CSSProperties,
};

export function PageFrame({ children }: { children: ReactNode }) {
  return <div style={styles.page}>{children}</div>;
}

export function SurfaceCard({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section style={styles.card}>
      <div style={{ ...styles.cardBody, borderBottom: '1px solid rgba(224,221,214,0.72)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
          <div>
            <h2 style={styles.cardTitle}>{title}</h2>
            {description ? <p style={styles.cardDesc}>{description}</p> : null}
          </div>
          {actions}
        </div>
      </div>
      <div style={styles.cardBody}>{children}</div>
    </section>
  );
}

export function TemplateBadge({ label, tone = 'neutral' }: { label: string; tone?: TemplateTone }) {
  const style = toneMap[tone];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        borderRadius: 999,
        border: `1px solid ${style.border}`,
        background: style.bg,
        color: style.color,
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1,
      }}
    >
      {label}
    </span>
  );
}

export function HeaderTag({ tag }: { tag: TemplateTag }) {
  return <TemplateBadge label={tag.label} tone={tag.tone ?? 'neutral'} />;
}

export function HeaderActions({
  primaryAction,
  secondaryActions = [],
}: {
  primaryAction?: TemplateAction;
  secondaryActions?: TemplateAction[];
}) {
  const actions = [...secondaryActions, ...(primaryAction ? [primaryAction] : [])];

  if (actions.length === 0) {
    return null;
  }

  return (
    <div style={styles.actionRow}>
      {actions.map((action) => (
        <ActionButton key={action.key} action={action} />
      ))}
    </div>
  );
}

export function ActionButton({ action }: { action: TemplateAction }) {
  const tone = action.tone ?? 'secondary';
  const hasHref = Boolean(action.href);
  const disabled = action.disabled || !hasHref;
  const disabledHint = action.hint ?? (hasHref ? '当前动作不可用' : '该动作尚未接入后端能力，已禁用');
  const buttonStyle: CSSProperties = {
    ...actionToneMap[tone],
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    padding: '0 14px',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 650,
    textDecoration: 'none',
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  if (action.href && !disabled) {
    return (
      <Link href={action.href} style={buttonStyle} title={action.hint}>
        {action.label}
      </Link>
    );
  }

  return (
    <button type="button" disabled title={disabledHint} style={buttonStyle}>
      {action.label}
    </button>
  );
}

export function MetricTile({
  label,
  value,
  hint,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: TemplateTone;
}) {
  const color = toneMap[tone];

  return (
    <div
      style={{
        ...styles.card,
        padding: 18,
        borderLeft: `4px solid ${color.color}`,
      }}
    >
      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </div>
      <div style={{ marginTop: 10, fontSize: 30, fontFamily: 'var(--font-display-family), sans-serif', fontWeight: 700 }}>
        {value}
      </div>
      {hint ? <div style={{ marginTop: 6, fontSize: 13, color: 'var(--color-text-secondary)' }}>{hint}</div> : null}
    </div>
  );
}

export function ReadinessStrip({ labels }: { labels?: string[] }) {
  if (!labels || labels.length === 0) {
    return null;
  }

  return (
    <div style={styles.readinessRow}>
      {labels.map((label) => (
        <TemplateBadge key={label} label={label} tone={label === 'BE-READY' ? 'success' : 'info'} />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        border: '1px dashed var(--color-border-strong)',
        borderRadius: 16,
        padding: '20px 18px',
        background: 'rgba(245,243,239,0.68)',
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 650 }}>{title}</div>
      <div style={{ marginTop: 6, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
        {description}
      </div>
    </div>
  );
}
