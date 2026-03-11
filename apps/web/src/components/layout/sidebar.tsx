'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Boxes,
  ShoppingCart,
  Truck,
  Warehouse,
  Landmark,
  Factory,
  Workflow,
} from 'lucide-react';
import type { ComponentType } from 'react';

import { getPrimaryNavItem, primaryNav, type PrimaryRouteItem } from '@/lib/navigation/route-manifest';

const navIconMap: Record<PrimaryRouteItem['icon'], ComponentType<{ size?: number; color?: string }>> = {
  workspace: LayoutGrid,
  mdm: Boxes,
  procure: ShoppingCart,
  sales: Truck,
  inventory: Warehouse,
  finance: Landmark,
  manufacturing: Factory,
  workflow: Workflow,
  platform: LayoutGrid,
};

export default function Sidebar() {
  const pathname = usePathname();
  const activePrimary = getPrimaryNavItem(pathname);

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
      <Link href="/workspace" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
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
        {primaryNav.map((item) => {
          const active = activePrimary?.key === item.key;
          const IconComp = navIconMap[item.icon];

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
