'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { getPrimarySecondaryNav, isRouteActive } from '@/lib/navigation/route-manifest';

export default function DashboardSecondaryNav() {
  const pathname = usePathname();
  const groups = getPrimarySecondaryNav(pathname);

  if (groups.length === 0) {
    return null;
  }

  return (
    <aside
      style={{
        width: 276,
        minWidth: 276,
        background: '#FFFFFF',
        borderRight: '1px solid #D1CCC4',
        padding: '28px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
      }}
    >
      {groups.map((group) => (
        <section key={group.key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
            const itemActive = isRouteActive(pathname, item.href, item.matchPrefixes);
            const hasActiveChild = item.children?.some((child) => isRouteActive(pathname, child.href, child.matchPrefixes));

            return (
              <div key={item.href} style={{ display: 'grid', gap: 4 }}>
                <Link
                  href={item.href}
                  style={{
                    display: 'grid',
                    gap: 4,
                    padding: '12px 22px',
                    borderLeft: itemActive ? '3px solid #C05A3C' : '3px solid transparent',
                    background: itemActive ? '#F5F3EF' : 'transparent',
                    color: '#1A1A1A',
                    textDecoration: 'none',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: itemActive ? 700 : 600 }}>{item.label}</span>
                  <span style={{ fontSize: 12, color: '#666666', lineHeight: 1.5 }}>{item.description}</span>
                </Link>

                {item.children && (itemActive || hasActiveChild) ? (
                  <div style={{ display: 'grid', gap: 2, padding: '0 12px 0 30px' }}>
                    {item.children.map((child) => {
                      const childActive = isRouteActive(pathname, child.href, child.matchPrefixes);

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          style={{
                            display: 'grid',
                            gap: 2,
                            padding: '10px 12px',
                            borderRadius: 6,
                            textDecoration: 'none',
                            background: childActive ? '#EFE7DE' : 'transparent',
                            color: childActive ? '#1A1A1A' : '#666666',
                          }}
                        >
                          <span style={{ fontSize: 12, fontWeight: childActive ? 700 : 600 }}>{child.label}</span>
                          <span style={{ fontSize: 11, lineHeight: 1.45 }}>{child.description}</span>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </section>
      ))}
    </aside>
  );
}
