'use client';

import { PageHeader, ActionButton, Stepper, FormInput, FormSelect } from '@/components/ui';

const steps = [
  { label: '基本信息', description: '来源和仓库' },
  { label: '行明细', description: 'SKU + 数量' },
  { label: '差异与证据', description: '核对数量' },
  { label: '确认过账', description: '最终确认' },
];

export default function GRNNewPage() {
  return (
    <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 24, height: '100vh', overflow: 'auto' }}>
      <PageHeader
        title="新建入库单 (GRN)"
        subtitle="创建入库过账工作流"
        actions={
          <div style={{ display: 'flex', gap: 12 }}>
            <ActionButton label="取消" tone="ghost" />
            <ActionButton label="保存草稿" tone="secondary" />
            <ActionButton label="下一步" tone="primary" />
          </div>
        }
      />

      <Stepper steps={steps} currentStep={0} />

      {/* Form Content */}
      <div style={{ display: 'flex', gap: 32, flex: 1 }}>
        {/* Left Form */}
        <div style={{
          flex: 1,
          background: '#FFFFFF',
          border: '1px solid #D1CCC4',
          borderRadius: 8,
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display-family), sans-serif' }}>
            基本信息
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <FormSelect
              label="来源采购单"
              placeholder="选择 PO 单号"
              options={[
                { label: 'PO-20260303-001', value: 'po1' },
                { label: 'PO-20260302-005', value: 'po2' },
              ]}
            />
            <FormSelect
              label="入库仓库"
              placeholder="选择目标仓库"
              options={[
                { label: 'SZ-DC-01 (深圳主仓)', value: 'sz1' },
                { label: 'SZ-DC-02 (深圳副仓)', value: 'sz2' },
              ]}
            />
            <FormInput label="供应商" placeholder="自动带入" />
            <FormInput label="预计到货日" type="date" />
          </div>
          <div>
            <FormInput label="备注" placeholder="可选备注信息" />
          </div>
        </div>

        {/* Right PO Info card */}
        <div style={{
          width: 320,
          background: '#1a1a1a',
          borderRadius: 8,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          color: '#fff',
        }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#C05A3C', fontFamily: 'var(--font-display-family), sans-serif' }}>
            关联 PO 信息
          </h3>
          {[
            ['单号', 'PO-20260303-001'],
            ['供应商', 'Cable Source Ltd.'],
            ['SKU 数', '6 种'],
            ['总数量', '420 件'],
            ['总金额', '¥186,600'],
            ['状态', '已审批'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
              <span style={{ fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
