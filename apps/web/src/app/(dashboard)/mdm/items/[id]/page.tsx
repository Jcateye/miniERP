import Link from 'next/link';

function buildSummaryItems() {
  return [
    { label: '料号', value: 'SKU-0001' },
    { label: '品名', value: 'HDMI 高清线束（公对公）2米 黑色 / 2米' },
    { label: '尺寸', value: '2米' },
    { label: '颜色', value: '黑色' },
    { label: '型号', value: 'CAB-HDMI-2M' },
    { label: '平台', value: 'A23' },
  ] as const;
}

function buildElectricalItems() {
  return [
    { label: '认证', value: 'HDMI 2.0' },
    { label: '阻抗', value: '100Ω±10%' },
    { label: '线芯', value: 'AWG28' },
    { label: '护套', value: 'PVC' },
  ] as const;
}

function buildBottomSections() {
  return [
    {
      title: '引脚图',
      entries: ['Pin 1-19 定义待接入', '后续接入工程图 PDF 与图片预览'],
    },
    {
      title: '证书文档',
      entries: ['RoHS 证书待接入', 'REACH 证书待接入'],
    },
    {
      title: '报价记录',
      entries: ['最近报价：SKU-2026-03-001', '供应商报价待接入'],
    },
  ] as const;
}

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const summaryItems = buildSummaryItems();
  const electricalItems = buildElectricalItems();
  const bottomSections = buildBottomSections();

  return (
    <div style={{ padding: '32px 40px', display: 'grid', gap: 20, background: '#F5F3EF' }}>
      <section
        data-testid="item-detail-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'grid', gap: 8 }}>
          <Link href="/mdm/items" style={{ color: '#666666', textDecoration: 'none', fontSize: 13 }}>
            返回列表
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: 28, color: '#1A1A1A' }}>CAB-HDMI-2M</h1>
            <span style={{ color: '#4A7C59', fontSize: 12, fontWeight: 600 }}>在售</span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: '#666666', lineHeight: 1.6 }}>SKU 详情页 ({id}) · 基础参数 / 库存 / 记录</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            style={{
              minHeight: 40,
              padding: '0 14px',
              borderRadius: 8,
              border: '1px solid #1A1A1A',
              background: '#1A1A1A',
              color: '#FFFFFF',
              fontWeight: 600,
            }}
          >
            复制
          </button>
          <button
            type="button"
            style={{
              minHeight: 40,
              padding: '0 14px',
              borderRadius: 8,
              border: '1px solid #D1CCC4',
              background: '#FFFFFF',
              color: '#666666',
              fontWeight: 600,
            }}
          >
            编辑
          </button>
          <button
            type="button"
            style={{
              minHeight: 40,
              padding: '0 14px',
              borderRadius: 8,
              border: '1px solid #D1CCC4',
              background: '#FFFFFF',
              color: '#C05A3C',
              fontWeight: 600,
            }}
          >
            停用
          </button>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 300px', gap: 20 }}>
        <div
          data-testid="item-detail-summary"
          style={{
            padding: 18,
            borderRadius: 10,
            border: '1px solid #E8E4DD',
            background: '#FFFFFF',
            display: 'grid',
            gap: 10,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 16, color: '#1A1A1A' }}>基本信息</h2>
          {summaryItems.map((item) => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 13 }}>
              <span style={{ color: '#888888' }}>{item.label}</span>
              <span style={{ color: '#1A1A1A', fontWeight: 600 }}>{item.value}</span>
            </div>
          ))}
        </div>

        <div
          data-testid="item-detail-electrical"
          style={{
            padding: 18,
            borderRadius: 10,
            border: '1px solid #E8E4DD',
            background: '#FFFFFF',
            display: 'grid',
            gap: 10,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 16, color: '#1A1A1A' }}>电气参数</h2>
          {electricalItems.map((item) => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: 13 }}>
              <span style={{ color: '#888888' }}>{item.label}</span>
              <span style={{ color: '#1A1A1A', fontWeight: 600 }}>{item.value}</span>
            </div>
          ))}
        </div>

        <div
          data-testid="item-detail-stock-card"
          style={{
            padding: 18,
            borderRadius: 10,
            background: '#1A1A1A',
            color: '#F5F3EF',
            display: 'grid',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 13, color: '#CCCCCC' }}>库存价值</div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>342</div>
          <div style={{ display: 'grid', gap: 6, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>库存数量</span><span>57</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>在途数量</span><span>10</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>安全库存</span><span>32</span></div>
          </div>
        </div>
      </section>

      <section
        data-testid="item-detail-bottom-tabs"
        style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}
      >
        {bottomSections.map((section) => (
          <article
            key={section.title}
            style={{
              padding: 18,
              borderRadius: 10,
              border: '1px solid #E8E4DD',
              background: '#FFFFFF',
              display: 'grid',
              gap: 10,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 16, color: '#1A1A1A' }}>{section.title}</h2>
            <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 8, color: '#666666', fontSize: 13 }}>
              {section.entries.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </div>
  );
}
