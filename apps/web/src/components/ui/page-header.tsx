'use client';

import type { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <h1 style={{
                    fontFamily: 'var(--font-display-family), sans-serif',
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#1a1a1a',
                    margin: 0,
                    lineHeight: 1.3,
                }}>
                    {title}
                </h1>
                {subtitle && (
                    <p style={{
                        fontSize: 13,
                        color: '#888888',
                        margin: 0,
                        lineHeight: 1.5,
                    }}>
                        {subtitle}
                    </p>
                )}
            </div>
            {actions && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {actions}
                </div>
            )}
        </div>
    );
}
