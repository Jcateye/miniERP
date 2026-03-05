'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PageHeader, KPICard } from '@/components/ui';

export default function ReportDetailPage() {
    return (
        <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 24, overflow: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Link href="/reports" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 32, borderRadius: 6, border: '1px solid #E0DDD8',
                    background: '#fff', textDecoration: 'none',
                }}>
                    <ArrowLeft size={16} color="#666" />
                </Link>
                <PageHeader title="库存价值报表" subtitle="按分类、仓库维度的库存价值汇总" />
            </div>

            {/* Chart placeholder */}
            <div style={{
                background: '#fff', border: '1px solid #E0DDD8',
                borderRadius: 8, padding: 24, height: 280,
                display: 'flex', flexDirection: 'column', gap: 12,
            }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display-family), sans-serif' }}>
                    库存价值趋势
                </h3>
                <div style={{
                    flex: 1, display: 'flex', alignItems: 'flex-end', gap: 4, padding: '0 8px',
                }}>
                    {[65, 72, 58, 80, 95, 88, 92, 78, 85, 90, 96, 100].map((h, i) => (
                        <div key={i} style={{
                            flex: 1, height: `${h}%`, background: `rgba(192,90,60,${0.3 + h / 200})`,
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.3s',
                        }} />
                    ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888' }}>
                    {['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'].map(m => (
                        <span key={m}>{m}</span>
                    ))}
                </div>
            </div>

            {/* Summary cards */}
            <div style={{ display: 'flex', gap: 20 }}>
                <KPICard label="总库存价值" value="¥2.8M" hint="12月数据" />
                <KPICard label="线材类" value="¥1.26M" hint="占比 45%" tone="warning" />
                <KPICard label="转接类" value="¥700K" hint="占比 25%" tone="info" />
                <KPICard label="月环比" value="+8.3%" hint="增长中" tone="success" />
            </div>
        </div>
    );
}
