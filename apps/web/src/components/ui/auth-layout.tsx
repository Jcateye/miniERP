import type { ReactNode } from 'react';

interface AuthLayoutProps {
    logoText?: string;
    tagline?: string;
    tagline2?: string;
    children: ReactNode;
    footer?: string;
}

export function AuthLayout({
    logoText = 'MINIERP',
    tagline = '轻量级进销存管理系统',
    tagline2 = '让库存管理更简单、更高效',
    children,
    footer = '© 2026 MiniERP. All rights reserved.',
}: AuthLayoutProps) {
    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            fontFamily: 'var(--font-body-family), sans-serif',
        }}>
            {/* Left dark panel */}
            <div style={{
                width: 560,
                minWidth: 560,
                background: '#1a1a1a',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 24,
                padding: 60,
                position: 'relative',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
                        {logoText}
                    </span>
                </div>
                <p style={{
                    fontSize: 16,
                    color: '#888888',
                    margin: 0,
                    fontFamily: 'var(--font-display-family), sans-serif',
                }}>
                    {tagline}
                </p>
                {tagline2 && (
                    <p style={{
                        fontSize: 14,
                        color: '#666666',
                        margin: 0,
                        fontFamily: 'var(--font-display-family), sans-serif',
                    }}>
                        {tagline2}
                    </p>
                )}
            </div>

            {/* Right content panel */}
            <div style={{
                flex: 1,
                background: '#F5F3EF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 120px',
                position: 'relative',
            }}>
                <div style={{ width: 420 }}>
                    {children}
                </div>
                {footer && (
                    <div style={{
                        position: 'absolute',
                        bottom: 40,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: 12,
                        color: '#AAAAAA',
                        fontFamily: 'var(--font-display-family), sans-serif',
                    }}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
