'use client';

import Link from 'next/link';
import { BarChart3, TrendingUp, Package, DollarSign, FileText } from 'lucide-react';
import { PageHeader, KPICard } from '@/components/ui';

const kpis = [
    { label: '月度入库额', value: '¥1.2M', hint: '同比 +15%', tone: 'neutral' as const },
    { label: '月度出库额', value: '¥980K', hint: '同比 +8%', tone: 'neutral' as const },
    { label: '库存周转率', value: '4.2', hint: '行业均值 3.5', tone: 'warning' as const },
    { label: '毛利率', value: '32%', hint: '环比 +2.1%', tone: 'success' as const },
];

const reports = [
    { title: '库存价值报表', desc: '按分类、仓库汇总库存价值', icon: Package, slug: 'inventory-value' },
    { title: '采购分析报表', desc: '供应商、品类维度采购分析', icon: BarChart3, slug: 'purchase-analysis' },
    { title: '销售趋势报表', desc: '销售额、出库量趋势分析', icon: TrendingUp, slug: 'sales-trend' },
    { title: '利润分析报表', desc: '毛利率、净利率分析', icon: DollarSign, slug: 'profit-analysis' },
    { title: '操作审计报表', desc: '用户操作、变更日志审计', icon: FileText, slug: 'audit-trail' },
];

export default function ReportsPage() {
    return (
        <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 28, overflow: 'auto' }}>
            <PageHeader title="报表中心" />

            <div style={{ display: 'flex', gap: 20 }}>
                {kpis.map(kpi => <KPICard key={kpi.label} {...kpi} />)}
            </div>

            {/* Report entries */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {reports.map(report => {
                    const Icon = report.icon;
                    return (
                        <Link key={report.slug} href={`/reports/${report.slug}`} style={{
                            flex: '1 1 calc(20% - 16px)', minWidth: 200,
                            background: '#fff', border: '1px solid #E0DDD8',
                            borderRadius: 8, padding: 24,
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            gap: 12, textDecoration: 'none', color: 'inherit',
                            transition: 'box-shadow 0.15s',
                        }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: 12,
                                background: 'rgba(192,90,60,0.08)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Icon size={24} color="#C05A3C" />
                            </div>
                            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display-family), sans-serif', textAlign: 'center' }}>
                                {report.title}
                            </h3>
                            <p style={{ margin: 0, fontSize: 12, color: '#888', textAlign: 'center', lineHeight: 1.5 }}>
                                {report.desc}
                            </p>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
