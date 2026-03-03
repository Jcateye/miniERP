import type { EvidencePanelProps } from '@/contracts';

import { EmptyState, SurfaceCard, TemplateBadge } from '@/components/layouts';

export function EvidencePanel({
  title,
  description,
  stats,
  tags,
  activeTag,
  items,
  uploadSlot,
  emptySlot,
  footerSlot,
}: EvidencePanelProps) {
  return (
    <SurfaceCard title={title} description={description} actions={uploadSlot}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10, marginBottom: 14 }}>
        {stats.map((stat) => (
          <div
            key={stat.key}
            style={{
              border: '1px solid rgba(224,221,214,0.92)',
              borderRadius: 12,
              padding: 12,
              background: 'rgba(245,243,239,0.68)',
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{stat.label}</div>
            <div style={{ marginTop: 8, fontSize: 20, fontWeight: 700 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {tags.map((tag) => (
          <TemplateBadge
            key={tag.key}
            label={tag.count !== undefined ? `${tag.label} · ${tag.count}` : tag.label}
            tone={activeTag === tag.key ? tag.tone ?? 'warning' : tag.tone ?? 'neutral'}
          />
        ))}
      </div>

      {items.length === 0 ? (
        emptySlot ?? <EmptyState title="暂无凭证" description="当前页还没有上传文件、照片或签收凭证。" />
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                border: '1px solid rgba(224,221,214,0.92)',
                borderRadius: 14,
                padding: 14,
                background: 'rgba(255,255,255,0.72)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 650 }}>{item.fileName}</div>
                  <div style={{ marginTop: 4, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    {item.tagLabel} · {item.uploadedBy} · {item.uploadedAt}
                  </div>
                </div>
                <TemplateBadge label={item.status} tone={item.status === 'active' ? 'success' : 'info'} />
              </div>
              {item.note ? (
                <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
                  {item.note}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {footerSlot ? <div style={{ marginTop: 14 }}>{footerSlot}</div> : null}
    </SurfaceCard>
  );
}
