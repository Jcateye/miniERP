import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
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
            <FileQuestion size={64} color="#C05A3C" />
            <h1 style={{
                fontFamily: 'var(--font-display-family), sans-serif',
                fontSize: 72,
                fontWeight: 700,
                color: '#1a1a1a',
                margin: 0,
                lineHeight: 1,
            }}>
                404
            </h1>
            <p style={{
                fontSize: 20,
                fontWeight: 500,
                color: '#888888',
                margin: 0,
                fontFamily: 'var(--font-display-family), sans-serif',
            }}>
                页面不存在
            </p>
            <p style={{
                fontSize: 14,
                color: '#AAAAAA',
                margin: 0,
            }}>
                您访问的页面不存在或已被移除
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
