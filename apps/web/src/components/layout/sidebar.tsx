'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: '运营工作台', href: '/' },
  { label: 'SKU 管理', href: '/skus' },
  { label: '采购概览', href: '/purchasing/overview' },
  { label: 'GRN 工作台', href: '/purchasing/grn' },
  { label: '销售概览', href: '/sales/overview' },
  { label: '报价工作台', href: '/sales/quotations' },
  { label: 'OUT 工作台', href: '/sales/out' },
  { label: '库存查询', href: '/inventory' },
  { label: '盘点工作台', href: '/stocktake' },
  { label: '设置中心', href: '/settings' },
  { label: '帮助说明', href: '/help' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: '260px',
        minWidth: '260px',
        background:
          'linear-gradient(180deg, rgba(26,26,26,0.98), rgba(26,26,26,0.94)), radial-gradient(circle at top left, rgba(192,90,60,0.24), transparent 28%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div style={{ padding: '24px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontFamily: 'var(--font-display-family), sans-serif', fontSize: 18, fontWeight: 700, letterSpacing: '0.08em' }}>
          miniERP
        </div>
        <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.6, color: 'rgba(255,255,255,0.54)' }}>
          Stage 1 收口页
          <br />
          T1 / T2 / T3 / T4 模板装配
        </div>
      </div>

      <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'block',
                marginBottom: 6,
                padding: '11px 12px',
                borderRadius: 14,
                color: active ? '#fff' : 'rgba(255,255,255,0.62)',
                background: active ? 'rgba(192,90,60,0.86)' : 'transparent',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                border: active ? '1px solid rgba(255,255,255,0.10)' : '1px solid transparent',
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '16px 18px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.46)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Gate
        </div>
        <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
          {['DFP-READY', 'BE-READY', 'FE-E-READY'].map((label) => (
            <div
              key={label}
              style={{
                padding: '8px 10px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.06)',
                fontSize: 12,
                color: 'rgba(255,255,255,0.84)',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
