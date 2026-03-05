interface StatusBadgeProps {
    label: string;
    tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
}

const toneStyles: Record<string, { bg: string; color: string; border: string }> = {
    neutral: { bg: 'rgba(26,26,26,0.06)', color: '#666666', border: 'rgba(26,26,26,0.10)' },
    success: { bg: '#E8F5E9', color: '#2E7D32', border: 'rgba(46,125,50,0.16)' },
    warning: { bg: 'rgba(192,90,60,0.12)', color: '#C05A3C', border: 'rgba(192,90,60,0.18)' },
    danger: { bg: 'rgba(217,79,79,0.12)', color: '#D94F4F', border: 'rgba(217,79,79,0.18)' },
    info: { bg: 'rgba(92,124,138,0.12)', color: '#5C7C8A', border: 'rgba(92,124,138,0.18)' },
};

export function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
    const style = toneStyles[tone];

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 10px',
            borderRadius: 4,
            background: style.bg,
            color: style.color,
            border: `1px solid ${style.border}`,
            fontSize: 12,
            fontWeight: 600,
            lineHeight: 1,
            whiteSpace: 'nowrap',
        }}>
            {label}
        </span>
    );
}
