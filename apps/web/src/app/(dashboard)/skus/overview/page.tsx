'use client';

import { PageHeader, KPICard } from '@/components/ui';

export default function SKUOverviewPage() {
  const kpis = [
    { label: '在售 SKU', value: '234', hint: '+12 本月新增', tone: 'neutral' as const },
    { label: '库存总值', value: '¥2.8M', hint: '环比 +8.3%', tone: 'success' as const },
    { label: '低库存预警', value: '14', hint: '低于安全库存', tone: 'danger' as const },
    { label: '缺货 SKU', value: '3', hint: '需要立即补货', tone: 'warning' as const },
  ];

  return (
    <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 28 }}>
      <PageHeader title="SKU 概览" subtitle="库存健康状态一览" />

      <div style={{ display: 'flex', gap: 20 }}>
        {kpis.map(kpi => <KPICard key={kpi.label} {...kpi} />)}
      </div>

      {/* Charts area */}
      <div style={{ display: 'flex', gap: 20, flex: 1 }}>
        <div style={{
          flex: 1, background: '#fff', border: '1px solid #E0DDD8',
          borderRadius: 8, padding: 24, minHeight: 300,
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display-family), sans-serif' }}>
            库存分布
          </h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: '线材', value: '45%', color: '#C05A3C' },
              { label: '转接', value: '25%', color: '#5C7C8A' },
              { label: '周边', value: '18%', color: '#2E7D32' },
              { label: '其他', value: '12%', color: '#888888' },
            ].map(item => (
              <div key={item.label} style={{
                padding: '12px 20px', borderRadius: 8,
                background: `${item.color}12`, border: `1px solid ${item.color}30`,
                display: 'flex', flexDirection: 'column', gap: 4, minWidth: 120,
              }}>
                <span style={{ fontSize: 12, color: '#888' }}>{item.label}</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: item.color, fontFamily: 'var(--font-display-family), sans-serif' }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          width: 360, background: '#fff', border: '1px solid #E0DDD8',
          borderRadius: 8, padding: 24,
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display-family), sans-serif' }}>
            补货预警 TOP
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { code: 'CAB-HDMI-2M', stock: 12, min: 80 },
              { code: 'ADP-USBC-VGA', stock: 25, min: 60 },
              { code: 'CONN-RJ45E', stock: 45, min: 100 },
            ].map(item => (
              <div key={item.code} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', background: 'rgba(217,79,79,0.06)', borderRadius: 6,
                borderLeft: '3px solid #D94F4F',
              }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{item.code}</span>
                <span style={{ fontSize: 12, color: '#D94F4F' }}>
                  {item.stock} / {item.min}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
