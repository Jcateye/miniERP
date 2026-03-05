import Link from 'next/link';

import { settingsSecondaryNav } from '@/lib/navigation/route-manifest';

export default function SettingsLandingPage() {
  return (
    <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header>
        <h1
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 700,
            color: '#1A1A1A',
            fontFamily: 'var(--font-display-family), sans-serif',
          }}
        >
          设置入口
        </h1>
        <p style={{ margin: '8px 0 0', fontSize: 13, color: '#6B6860' }}>
          以新版页面为主入口，统一访问系统设置与运营工具。
        </p>
      </header>

      <div style={{ display: 'grid', gap: 20 }}>
        {settingsSecondaryNav.map((group) => (
          <section key={group.key} style={{ display: 'grid', gap: 12 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 14,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#888888',
              }}
            >
              {group.label}
            </h2>
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    padding: '16px 18px',
                    borderRadius: 8,
                    background: '#FFFFFF',
                    border: '1px solid #E0DDD8',
                    display: 'grid',
                    gap: 8,
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#1A1A1A',
                      fontFamily: 'var(--font-display-family), sans-serif',
                    }}
                  >
                    {item.label}
                  </span>
                  <span style={{ fontSize: 12, lineHeight: 1.6, color: '#6B6860' }}>{item.description}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
