interface KPICardProps {
    label: string;
    value: string | number;
    hint?: string;
    tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
}

const toneColors: Record<string, { border: string; valueFill: string; bg?: string }> = {
    neutral: { border: '#E0DDD8', valueFill: '#1a1a1a' },
    success: { border: '#2E7D32', valueFill: '#2E7D32', bg: '#E8F5E9' },
    warning: { border: '#C05A3C', valueFill: '#C05A3C', bg: 'rgba(192,90,60,0.08)' },
    danger: { border: '#D94F4F', valueFill: '#D94F4F', bg: 'rgba(217,79,79,0.08)' },
    info: { border: '#5C7C8A', valueFill: '#5C7C8A', bg: 'rgba(92,124,138,0.08)' },
};

export function KPICard({ label, value, hint, tone = 'neutral' }: KPICardProps) {
    const colors = toneColors[tone];

    return (
        <div style={{
            background: colors.bg || '#FFFFFF',
            border: `1px solid ${colors.border}`,
            borderRadius: 8,
            padding: '20px 24px',
            flex: 1,
            minWidth: 0,
        }}>
            <div style={{
                fontSize: 12,
                fontWeight: 500,
                color: '#888888',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.06em',
                marginBottom: 8,
            }}>
                {label}
            </div>
            <div style={{
                fontFamily: 'var(--font-display-family), sans-serif',
                fontSize: 28,
                fontWeight: 700,
                color: colors.valueFill,
                lineHeight: 1.2,
            }}>
                {value}
            </div>
            {hint && (
                <div style={{
                    fontSize: 12,
                    color: '#888888',
                    marginTop: 4,
                }}>
                    {hint}
                </div>
            )}
        </div>
    );
}
