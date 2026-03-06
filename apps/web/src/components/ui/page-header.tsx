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

interface ActionButtonProps {
    label: string;
    tone?: 'primary' | 'secondary' | 'ghost';
    icon?: ReactNode;
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
}

export function ActionButton({ label, tone = 'secondary', icon, onClick, disabled = false }: ActionButtonProps) {
    const styles: Record<string, React.CSSProperties> = {
        primary: {
            background: '#C05A3C',
            color: '#FFFFFF',
            border: 'none',
        },
        secondary: {
            background: '#FFFFFF',
            color: '#1a1a1a',
            border: '1px solid #D1CCC4',
        },
        ghost: {
            background: 'transparent',
            color: '#666666',
            border: '1px solid transparent',
        },
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                ...styles[tone],
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                borderRadius: 8,
                fontFamily: 'var(--font-display-family), sans-serif',
                fontSize: 13,
                fontWeight: 600,
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.15s',
                letterSpacing: 0.5,
                opacity: disabled ? 0.45 : 1,
            }}
        >
            {icon}
            {label}
        </button>
    );
}
