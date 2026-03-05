'use client';

import { PageHeader, KPICard, TabPanel } from '@/components/ui';
import type { Tab } from '@/components/ui';

export default function SKUDetailPage() {
  const sku = {
    code: 'ADP-USBC-VGA',
    name: 'USB-C 转 VGA 适配器',
    category: '转接',
    barcode: '6901234567890',
    unit: '个',
    price: '¥79.00',
    stock: '340',
    minStock: '60',
  };

  const tabs: Tab[] = [
    {
      key: 'inventory',
      label: '库存明细',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { warehouse: 'SZ-DC-01', onHand: 200, reserved: 15 },
            { warehouse: 'SZ-DC-02', onHand: 140, reserved: 8 },
          ].map((row) => (
            <div key={row.warehouse} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', background: '#F5F3EF', borderRadius: 6,
            }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{row.warehouse}</span>
              <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
                <span>在手: <strong>{row.onHand}</strong></span>
                <span style={{ color: '#888' }}>占用: {row.reserved}</span>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'ledger',
      label: '流水记录',
      content: (
        <div style={{ fontSize: 13, color: '#888' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { time: '2026-03-03 10:30', type: 'GRN入库', delta: '+50', ref: 'GRN-20260303-003' },
              { time: '2026-03-02 14:20', type: 'OUT出库', delta: '-20', ref: 'OUT-20260302-007' },
              { time: '2026-03-01 09:00', type: '盘点调整', delta: '+5', ref: 'ADJ-20260301-001' },
            ].map((entry, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '10px 0', borderBottom: '1px solid #F0EDE8',
              }}>
                <span style={{ width: 140, color: '#888', fontSize: 12 }}>{entry.time}</span>
                <span style={{ width: 80, fontWeight: 600, color: '#1a1a1a' }}>{entry.type}</span>
                <span style={{ width: 60, fontWeight: 700, color: entry.delta.startsWith('+') ? '#2E7D32' : '#D94F4F' }}>
                  {entry.delta}
                </span>
                <span style={{ color: '#C05A3C' }}>{entry.ref}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: 'docs',
      label: '关联单据',
      content: (
        <div style={{ fontSize: 13, color: '#888', padding: 16 }}>
          暂无关联单据记录
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 24, height: '100vh', overflow: 'auto' }}>
      <PageHeader
        title={sku.name}
        subtitle={`${sku.code} · ${sku.category}`}
        actions={
          <div style={{ display: 'flex', gap: 12 }}>
            <button style={{
              padding: '10px 20px', borderRadius: 8, border: '1px solid #D1CCC4',
              background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              编辑
            </button>
            <button style={{
              padding: '10px 20px', borderRadius: 8, border: 'none',
              background: '#C05A3C', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              补货
            </button>
          </div>
        }
      />

      {/* Info cards row */}
      <div style={{ display: 'flex', gap: 20 }}>
        {[
          { label: '条码', value: sku.barcode },
          { label: '单位', value: sku.unit },
          { label: '含税单价', value: sku.price },
          { label: '实物库存', value: sku.stock },
          { label: '安全库存', value: sku.minStock },
        ].map(item => (
          <div key={item.label} style={{
            flex: 1,
            background: '#FFFFFF',
            border: '1px solid #E0DDD8',
            borderRadius: 8,
            padding: '16px 20px',
          }}>
            <div style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {item.label}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 6, fontFamily: 'var(--font-display-family), sans-serif' }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <TabPanel tabs={tabs} />
    </div>
  );
}
