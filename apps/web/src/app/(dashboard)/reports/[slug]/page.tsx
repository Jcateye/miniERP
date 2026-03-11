import { notFound } from 'next/navigation';

const REPORT_DETAIL_CONTENT = {
  sku: {
    title: 'SKU 报表详情',
    summary: 'SKU 分类、活跃度与新增趋势分析',
    metrics: [
      { label: '总 SKU 数', value: '1,284' },
      { label: '本月新增', value: '+47' },
      { label: '活跃率', value: '78.5%' },
    ],
  },
  inventory: {
    title: '库存报表详情',
    summary: '库存余额、周转率与呆滞物料分析',
    metrics: [
      { label: '库存总量', value: '45,672' },
      { label: '周转率', value: '4.8x' },
      { label: '呆滞 SKU', value: '36' },
    ],
  },
  purchase: {
    title: '采购报表详情',
    summary: '采购趋势、供应商份额与价格波动分析',
    metrics: [
      { label: '本月采购额', value: '¥328,450' },
      { label: '活跃供应商', value: '42' },
      { label: '价格波动项', value: '18' },
    ],
  },
  sales: {
    title: '销售报表详情',
    summary: '销售趋势、客户排行与履约表现分析',
    metrics: [
      { label: '本月销售额', value: '¥512,890' },
      { label: '活跃客户', value: '86' },
      { label: '准时发货率', value: '94.2%' },
    ],
  },
  finance: {
    title: '财务报表详情',
    summary: '利润、费用结构与现金流表现分析',
    metrics: [
      { label: '毛利率', value: '28.4%' },
      { label: '经营现金流', value: '¥182,000' },
      { label: '期间费用率', value: '12.1%' },
    ],
  },
  quotation: {
    title: '报价报表详情',
    summary: '报价转化率、时效与客户阶段分析',
    metrics: [
      { label: '本月报价单', value: '118' },
      { label: '转化率', value: '36.7%' },
      { label: '平均响应时长', value: '4.2h' },
    ],
  },
} as const;

type ReportSlug = keyof typeof REPORT_DETAIL_CONTENT;

type ReportDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { slug } = await params;
  const detail = REPORT_DETAIL_CONTENT[slug as ReportSlug];

  if (!detail) {
    notFound();
  }

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
      <div style={{ display: 'grid', gap: 6 }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#1A1A1A' }}>{detail.title}</div>
        <div style={{ fontSize: 14, color: '#666666' }}>{detail.summary}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 20 }}>
        {detail.metrics.map((metric) => (
          <div
            key={metric.label}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E0DDD8',
              borderRadius: 8,
              padding: '20px 24px',
              display: 'grid',
              gap: 8,
            }}
          >
            <div style={{ fontSize: 12, color: '#888888' }}>{metric.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#1A1A1A' }}>{metric.value}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E0DDD8',
          borderRadius: 8,
          padding: '28px 32px',
          display: 'grid',
          gap: 12,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>分析视图</div>
        <div style={{ fontSize: 13, color: '#666666', lineHeight: 1.7 }}>
          当前页面承接对应报表分类的明细入口，后续会接入时间筛选、图表区与导出能力。现阶段先确保二级菜单和报表中心卡片都能进入真实详情页。
        </div>
        <div
          style={{
            minHeight: 320,
            borderRadius: 8,
            border: '1px dashed #D1CCC4',
            background: 'linear-gradient(180deg, #FCFAF6 0%, #F2ECE3 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#888888',
            fontSize: 14,
          }}
        >
          图表与明细区域占位
        </div>
      </div>
    </div>
  );
}
