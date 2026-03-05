'use client';

import Link from 'next/link';
import { Plus, UserPlus, ClipboardCheck, Truck, Search } from 'lucide-react';
import { PageHeader, KPICard } from '@/components/ui';

const kpis = [
  { label: '总库存 SKU', value: '14', hint: '合计234种', tone: 'neutral' as const },
  { label: '近七天 GRN', value: '3', hint: '待处理', tone: 'success' as const },
  { label: '待发货 OUT', value: '7', hint: '待拣货5', tone: 'warning' as const },
  { label: '预警 SKU', value: '2', hint: '低于安全库存', tone: 'danger' as const },
];

const todos = [
  { title: '14 个 SKU 低库存告警', desc: '库存不足80 — 需要立即补货', tag: '紧急', tone: 'danger' as const },
  { title: '3 个预入库 GRN 等待确认', desc: '验收完成 → 挂起确认 /1 天', tag: '待确认', tone: 'warning' as const },
  { title: '7 个待出库已过今日发货截点', desc: '预计延迟 ≈ 11 件 /1 天 → 2 班', tag: '注意', tone: 'info' as const },
];

const quickActions = [
  { label: '新建 SKU', icon: Plus, href: '/skus/new', fill: '#C05A3C' },
  { label: '创建入库 GRN', icon: UserPlus, href: '/purchasing/grn/new', fill: '#1a1a1a' },
  { label: '创建出库 OUT', icon: Truck, href: '/sales/out/new', fill: '#1a1a1a' },
  { label: '快速查询', icon: Search, href: '/inventory', fill: '#1a1a1a' },
];

const timeline = [
  { action: '入库 GRN-20260303-10112 已通', time: '1H前' },
  { action: '采购 PO-20260303-01666 创建', time: '2H前' },
  { action: '盘点 3MC PRN-B2XA-2X2 完成', time: '3H前' },
  { action: '出库 ST 处理 +252 调整', time: '7H前' },
];

export default function DashboardHomePage() {
  return (
    <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <PageHeader
        title="工作台"
        subtitle={`${new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'long' })}`}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#fff', border: '1px solid #E0DDD8', borderRadius: 6,
              padding: '0 12px', height: 40,
            }}>
              <Search size={16} color="#888" />
              <input placeholder="全文搜索 / 定位目标..." style={{
                border: 'none', outline: 'none', fontSize: 13, background: 'transparent', fontFamily: 'inherit', width: 200,
              }} />
            </div>
          </div>
        }
      />

      {/* KPI Row */}
      <div style={{ display: 'flex', gap: 20 }}>
        {kpis.map(kpi => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', gap: 20, flex: 1 }}>
        {/* Left: Todos */}
        <div style={{
          flex: 1,
          background: '#FFFFFF',
          border: '1px solid #E0DDD8',
          borderRadius: 8,
          padding: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display-family), sans-serif' }}>
              急需待办
            </h3>
            <span style={{ fontSize: 12, color: '#C05A3C', cursor: 'pointer' }}>查看全部</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {todos.map((item, idx) => (
              <div key={idx} style={{
                padding: '14px 16px',
                background: '#F5F3EF',
                borderRadius: 6,
                borderLeft: `3px solid ${item.tone === 'danger' ? '#D94F4F' : item.tone === 'warning' ? '#C05A3C' : '#5C7C8A'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: item.tone === 'danger' ? '#D94F4F' : item.tone === 'warning' ? '#C05A3C' : '#5C7C8A', textTransform: 'uppercase' }}>
                    {item.tag}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{item.title}</span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: '#888888' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Actions + Timeline */}
        <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Quick Actions */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E0DDD8',
            borderRadius: 8,
            padding: 20,
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display-family), sans-serif' }}>
              快捷入口
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.href} href={action.href} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderRadius: 6,
                    background: action.fill === '#C05A3C' ? '#C05A3C' : '#F5F3EF',
                    color: action.fill === '#C05A3C' ? '#fff' : '#1a1a1a',
                    textDecoration: 'none',
                    fontSize: 13,
                    fontWeight: 600,
                    transition: 'opacity 0.15s',
                  }}>
                    <Icon size={16} />
                    {action.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Timeline */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E0DDD8',
            borderRadius: 8,
            padding: 20,
            flex: 1,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display-family), sans-serif' }}>
                最近动作
              </h3>
              <span style={{ fontSize: 12, color: '#C05A3C', cursor: 'pointer' }}>完整日志</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {timeline.map((entry, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%', background: '#C05A3C',
                    marginTop: 6, flexShrink: 0,
                  }} />
                  <div>
                    <div style={{ fontSize: 13, color: '#1a1a1a' }}>{entry.action}</div>
                    <div style={{ fontSize: 11, color: '#888888', marginTop: 2 }}>{entry.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
