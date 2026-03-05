'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  ShoppingCart,
  Truck,
  Warehouse,
  ClipboardCheck,
  Settings,
} from 'lucide-react';
import type { ComponentType } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ size?: number; color?: string }>;
}

const navItems: NavItem[] = [
  { label: 'SKU 管理', href: '/skus', icon: LayoutGrid },
  { label: '采购管理', href: '/purchasing/overview', icon: ShoppingCart },
  { label: '销售出库', href: '/sales/overview', icon: Truck },
  { label: '库存中心', href: '/inventory', icon: Warehouse },
  { label: '盘点', href: '/stocktake', icon: ClipboardCheck },
  { label: '设置', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isHome = pathname === '/';

  return (
    <aside
      style={{
        width: 260,
        minWidth: 260,
        background: '#1a1a1a',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        padding: '40px 28px',
        gap: 32,
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 10,
          height: 10,
          background: '#C05A3C',
        }} />
        <span style={{
          fontFamily: 'var(--font-display-family), sans-serif',
          fontSize: 16,
          fontWeight: 700,
          color: '#F5F3EF',
          letterSpacing: 2,
        }}>
          MINIERP
        </span>
      </Link>

      {/* Navigation */}
      <nav style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        flex: 1,
      }}>
        {/* Home / 工作台 is a special case */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '10px 12px',
            borderRadius: 4,
            background: isHome ? '#2a2a2a' : 'transparent',
            textDecoration: 'none',
            transition: 'background 0.15s',
          }}
        >
          <LayoutGrid size={20} color={isHome ? '#C05A3C' : '#666666'} />
          <span style={{
            fontFamily: 'var(--font-display-family), sans-serif',
            fontSize: 13,
            fontWeight: isHome ? 600 : 500,
            color: isHome ? '#C05A3C' : '#666666',
            letterSpacing: 1,
          }}>
            工作台
          </span>
        </Link>

        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const IconComp = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '10px 12px',
                borderRadius: 4,
                background: active ? '#2a2a2a' : 'transparent',
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
            >
              <IconComp size={20} color={active ? '#C05A3C' : '#666666'} />
              <span style={{
                fontFamily: 'var(--font-display-family), sans-serif',
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                color: active ? '#C05A3C' : '#666666',
                letterSpacing: 1,
              }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
