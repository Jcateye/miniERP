'use client';

import { PageHeader, ActionButton, Stepper } from '@/components/ui';

const steps = [
  { label: '选择 SO', description: '来源和仓库' },
  { label: '拣货明细', description: 'SKU + 数量' },
  { label: '包装确认', description: '包装信息' },
  { label: '确认出库', description: '最终确认' },
];

const lineItems = [
  { sku: 'CAB-HDMI-2M', name: 'HDMI 2m 高速线缆', qty: 50, picked: 50, status: '已拣' },
  { sku: 'ADP-USBC-VGA', name: 'USB-C 转 VGA 适配器', qty: 30, picked: 28, status: '差异' },
  { sku: 'CONN-RJ45E', name: 'RJ45 水晶头 CAT6', qty: 200, picked: 200, status: '已拣' },
];

export default function OUTNewPage() {
  return (
    <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 24, height: '100vh', overflow: 'auto' }}>
      <PageHeader
        title="新建出库单 (OUT)"
        subtitle="销售出库过账工作流"
        actions={
          <div style={{ display: 'flex', gap: 12 }}>
            <ActionButton label="取消" tone="ghost" />
            <ActionButton label="保存草稿" tone="secondary" />
            <ActionButton label="下一步" tone="primary" />
          </div>
        }
      />

      <Stepper steps={steps} currentStep={1} />

      {/* Line items */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}>
        <div style={{
          background: '#fff',
          border: '1px solid #D1CCC4',
          borderRadius: 8,
          overflow: 'hidden',
          flex: 1,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            padding: '12px 20px', background: '#F5F3EF',
            borderBottom: '1px solid #E0DDD8',
            gap: 0,
          }}>
            {['SKU', '产品名称', '需求数量', '已拣数量', '状态'].map(h => (
              <div key={h} style={{
                flex: 1, fontSize: 12, fontWeight: 600, color: '#888',
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                {h}
              </div>
            ))}
          </div>
          {lineItems.map((item, idx) => (
            <div key={idx} style={{
              display: 'flex', alignItems: 'center',
              padding: '14px 20px',
              borderBottom: idx < lineItems.length - 1 ? '1px solid #F0EDE8' : undefined,
            }}>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#C05A3C' }}>{item.sku}</div>
              <div style={{ flex: 1, fontSize: 13 }}>{item.name}</div>
              <div style={{ flex: 1, fontSize: 13 }}>{item.qty}</div>
              <div style={{
                flex: 1, fontSize: 13, fontWeight: 600,
                color: item.picked < item.qty ? '#D94F4F' : '#2E7D32',
              }}>
                {item.picked}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{
                  padding: '4px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600,
                  background: item.status === '已拣' ? '#E8F5E9' : 'rgba(217,79,79,0.12)',
                  color: item.status === '已拣' ? '#2E7D32' : '#D94F4F',
                }}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { label: '总 SKU 数', value: '3 种' },
            { label: '需求总量', value: '280 件' },
            { label: '已拣总量', value: '278 件' },
            { label: '差异数量', value: '-2 件' },
          ].map(item => (
            <div key={item.label} style={{
              flex: 1, background: '#fff', border: '1px solid #E0DDD8',
              borderRadius: 8, padding: '16px 20px',
            }}>
              <div style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {item.label}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6, fontFamily: 'var(--font-display-family), sans-serif' }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
