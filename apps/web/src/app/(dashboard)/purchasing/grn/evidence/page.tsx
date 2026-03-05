'use client';

import { PageHeader, ActionButton, Stepper, StatusBadge } from '@/components/ui';

const steps = [
    { label: '基本信息', description: '来源和仓库' },
    { label: '行明细', description: 'SKU + 数量' },
    { label: '差异与证据', description: '核对数量' },
    { label: '确认过账', description: '最终确认' },
];

const lines = [
    { sku: 'CAB-HDMI-2M', name: 'HDMI 2m 高速线缆', expected: 100, actual: 98, diff: -2, hasCert: true },
    { sku: 'ADP-USBC-VGA', name: 'USB-C 转 VGA 适配器', expected: 50, actual: 50, diff: 0, hasCert: false },
    { sku: 'CONN-RJ45E', name: 'RJ45 水晶头 CAT6', expected: 500, actual: 492, diff: -8, hasCert: true },
];

export default function GRNEvidencePage() {
    return (
        <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 24, height: '100vh', overflow: 'auto' }}>
            <PageHeader
                title="GRN 差异与证据"
                subtitle="核对数量差异并上传凭证"
                actions={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <ActionButton label="上一步" tone="secondary" />
                        <ActionButton label="下一步" tone="primary" />
                    </div>
                }
            />

            <Stepper steps={steps} currentStep={2} />

            {/* Diff table */}
            <div style={{
                background: '#fff', border: '1px solid #E0DDD8', borderRadius: 8, overflow: 'hidden', flex: 1,
            }}>
                <div style={{
                    display: 'flex', padding: '12px 20px', background: '#F5F3EF',
                    borderBottom: '1px solid #E0DDD8',
                }}>
                    {['SKU', '产品名称', '期望数量', '实际数量', '差异', '证据', '操作'].map(h => (
                        <div key={h} style={{
                            flex: 1, fontSize: 12, fontWeight: 600, color: '#888',
                            textTransform: 'uppercase', letterSpacing: '0.04em',
                        }}>
                            {h}
                        </div>
                    ))}
                </div>
                {lines.map((line, idx) => (
                    <div key={idx} style={{
                        display: 'flex', alignItems: 'center', padding: '14px 20px',
                        borderBottom: idx < lines.length - 1 ? '1px solid #F0EDE8' : undefined,
                    }}>
                        <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#C05A3C' }}>{line.sku}</div>
                        <div style={{ flex: 1, fontSize: 13 }}>{line.name}</div>
                        <div style={{ flex: 1, fontSize: 13 }}>{line.expected}</div>
                        <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{line.actual}</div>
                        <div style={{ flex: 1 }}>
                            {line.diff !== 0 ? (
                                <StatusBadge label={`${line.diff}`} tone="danger" />
                            ) : (
                                <StatusBadge label="一致" tone="success" />
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            {line.hasCert ? (
                                <StatusBadge label="已上传" tone="success" />
                            ) : (
                                <StatusBadge label="待上传" tone="warning" />
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            <button style={{
                                padding: '6px 14px', borderRadius: 4, border: '1px solid #C05A3C',
                                background: 'transparent', color: '#C05A3C', fontSize: 12,
                                fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                            }}>
                                上传证据
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
