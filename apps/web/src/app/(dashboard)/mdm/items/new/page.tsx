import Link from 'next/link';

const ITEM_CREATE_STEPS = ['基础信息', '规格与分类', '提交确认'] as const;

const ITEM_CREATE_SECTIONS = [
  {
    title: '基础信息',
    lines: ['物料编码：按主数据规则生成', '物料名称：支持中英文双语录入'],
  },
  {
    title: '规格与分类',
    lines: ['规格：最小必填字段', '分类：先提供单选占位，后续接 BFF'],
  },
  {
    title: '提交确认',
    lines: ['提交前校验基础单位', '提交后创建审计记录'],
  },
] as const;

export default function NewItemPage() {
  return (
    <div style={{ padding: '32px 40px', display: 'grid', gap: 20, background: '#F5F3EF' }}>
      <section
        data-testid="new-item-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'grid', gap: 8 }}>
          <Link href="/mdm/items" style={{ color: '#C05A3C', textDecoration: 'none', fontSize: 13 }}>
            返回物料列表
          </Link>
          <h1 style={{ margin: 0, fontSize: 28, color: '#1A1A1A' }}>新建物料</h1>
          <p style={{ margin: 0, fontSize: 14, color: '#666666', lineHeight: 1.6 }}>
            以最小 T4 向导承接物料创建流程，先覆盖必填字段与提交确认。
          </p>
        </div>
        <button
          type="button"
          style={{
            minHeight: 40,
            padding: '0 16px',
            borderRadius: 10,
            border: 'none',
            background: '#C05A3C',
            color: '#FFFFFF',
            fontWeight: 600,
            fontFamily: 'inherit',
          }}
        >
          创建物料草稿
        </button>
      </section>

      <section
        data-testid="new-item-steps"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
        }}
      >
        {ITEM_CREATE_STEPS.map((step, index) => (
          <div
            key={step}
            style={{
              padding: '16px 18px',
              borderRadius: 10,
              border: '1px solid #E8E4DD',
              background: '#FFFFFF',
              display: 'grid',
              gap: 6,
            }}
          >
            <div style={{ fontSize: 12, color: '#888888' }}>步骤 {index + 1}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>{step}</div>
          </div>
        ))}
      </section>

      <section
        data-testid="new-item-sections"
        style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
      >
        {ITEM_CREATE_SECTIONS.map((section) => (
          <article
            key={section.title}
            style={{
              padding: '18px',
              borderRadius: 10,
              border: '1px solid #E8E4DD',
              background: '#FFFFFF',
              display: 'grid',
              gap: 10,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 16, color: '#1A1A1A' }}>{section.title}</h2>
            <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 8, color: '#666666', fontSize: 13 }}>
              {section.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </div>
  );
}
