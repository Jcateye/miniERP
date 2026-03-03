import type { LineEvidenceDrawerProps } from '@/contracts';

import { EmptyState, TemplateBadge } from '@/components/layouts';

export function LineEvidenceDrawer({
  open,
  title,
  line,
  tags,
  activeTag,
  items,
  uploadSlot,
  emptySlot,
  onClose,
}: LineEvidenceDrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      style={{
        position: 'sticky',
        top: 20,
        border: '1px solid rgba(224,221,214,0.92)',
        borderRadius: 18,
        background: 'rgba(255,255,255,0.92)',
        boxShadow: '0 18px 48px rgba(26,26,26,0.08)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 18px 14px',
          borderBottom: '1px solid rgba(224,221,214,0.92)',
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            行级凭证
          </div>
          <div style={{ marginTop: 6, fontSize: 16, fontWeight: 700 }}>{title}</div>
          <div style={{ marginTop: 4, fontSize: 13, color: 'var(--color-text-secondary)' }}>
            #{line.lineNo} · {line.skuCode} · {line.skuName}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            border: '1px solid rgba(224,221,214,0.92)',
            background: 'rgba(245,243,239,0.78)',
            borderRadius: 10,
            padding: '8px 10px',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          关闭
        </button>
      </div>

      <div style={{ padding: 18, display: 'grid', gap: 14 }}>
        <div
          style={{
            border: '1px solid rgba(224,221,214,0.92)',
            borderRadius: 14,
            padding: 14,
            background: 'rgba(245,243,239,0.72)',
            display: 'grid',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <TemplateBadge label={`期望 ${line.expectedQty ?? '-'}`} tone="neutral" />
            <TemplateBadge label={`实收 ${line.actualQty ?? '-'}`} tone="info" />
            {line.diffQty ? <TemplateBadge label={`差异 ${line.diffQty}`} tone="warning" /> : null}
          </div>
          {line.reason ? <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{line.reason}</div> : null}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {tags.map((tag) => (
            <TemplateBadge
              key={tag.key}
              label={tag.count !== undefined ? `${tag.label} · ${tag.count}` : tag.label}
              tone={activeTag === tag.key ? tag.tone ?? 'warning' : tag.tone ?? 'neutral'}
            />
          ))}
        </div>

        {uploadSlot}

        {items.length === 0 ? (
          emptySlot ?? <EmptyState title="暂无行级凭证" description="该 SKU 行还没有补充差异照片、标签或序列号附件。" />
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
                <div style={{ fontSize: 14, fontWeight: 650 }}>{item.fileName}</div>
                <div style={{ marginTop: 4, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  {item.tagLabel} · {item.uploadedAt}
                </div>
                {item.note ? (
                  <div style={{ marginTop: 8, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    {item.note}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
