import Link from 'next/link';
import { ShieldX } from 'lucide-react';

export default function ForbiddenPage() {
    return (
        <div style={{
            minHeight: '100vh',
            background: '#F5F3EF',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            fontFamily: 'var(--font-body-family), sans-serif',
        }}>
            <ShieldX size={64} color="#C05A3C" />
            <h1 style={{
                fontFamily: 'var(--font-display-family), sans-serif',
                fontSize: 72,
                fontWeight: 700,
                color: '#1a1a1a',
                margin: 0,
                lineHeight: 1,
            }}>
                403
            </h1>
            <p style={{
                fontSize: 20,
                fontWeight: 500,
                color: '#888888',
                margin: 0,
                fontFamily: 'var(--font-display-family), sans-serif',
            }}>
                无权限访问
            </p>
            <p style={{
                fontSize: 14,
                color: '#AAAAAA',
                margin: 0,
            }}>
                您没有权限访问该页面，请联系管理员获取权限
            </p>
            <Link href="/" style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 32px',
                borderRadius: 8,
                background: '#C05A3C',
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
                fontFamily: 'var(--font-display-family), sans-serif',
            }}>
                返回首页
            </Link>
        </div>
    );
}
