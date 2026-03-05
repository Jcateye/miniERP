'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { settingsSecondaryNav } from '@/lib/navigation/route-manifest';

function isRouteActive(pathname: string, href: string): boolean {
  if (pathname === href) {
    return true;
  }

  if (href === '/') {
    return pathname === '/';
  }

  return pathname.startsWith(`${href}/`);
}

export default function SettingsSecondaryNav() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 260,
        minWidth: 260,
        background: '#FFFFFF',
        borderRight: '1px solid #D1CCC4',
        padding: '28px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      <div style={{ padding: '0 22px' }}>
        <h2
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 700,
            fontFamily: 'var(--font-display-family), sans-serif',
            color: '#1A1A1A',
          }}
        >
          设置中心
        </h2>
      </div>

      {settingsSecondaryNav.map((group) => (
        <section key={group.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div
            style={{
              padding: '0 22px',
              fontSize: 11,
              color: '#888888',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            {group.label}
          </div>
          {group.items.map((item) => {
            const active = isRouteActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: 40,
                  padding: '10px 22px',
                  borderLeft: active ? '3px solid #C05A3C' : '3px solid transparent',
                  background: active ? '#F5F3EF' : 'transparent',
                  color: active ? '#1A1A1A' : '#666666',
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  textDecoration: 'none',
                  transition: 'background 0.15s ease',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </section>
      ))}
    </aside>
  );
}
