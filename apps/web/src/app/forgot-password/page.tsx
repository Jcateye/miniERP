'use client';

import Link from 'next/link';
import { AuthLayout } from '@/components/ui';

export default function ForgotPasswordPage() {
    return (
        <AuthLayout
            tagline="轻量级进销存管理系统"
            tagline2={undefined}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 40 }}>
                <div>
                    <h1 style={{
                        fontFamily: 'var(--font-display-family), sans-serif',
                        fontSize: 24,
                        fontWeight: 700,
                        color: '#1a1a1a',
                        margin: '0 0 8px',
                    }}>
                        忘记密码
                    </h1>
                    <p style={{ fontSize: 13, color: '#888888', margin: 0 }}>
                        输入您的邮箱，我们将发送重置链接
                    </p>
                </div>

                <form style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>邮箱地址</label>
                        <input
                            type="email"
                            placeholder="admin@company.com"
                            style={{
                                padding: '10px 14px',
                                border: '1px solid #E0DDD8',
                                borderRadius: 6,
                                background: '#FFFFFF',
                                fontSize: 14,
                                color: '#1a1a1a',
                                outline: 'none',
                                fontFamily: 'inherit',
                                width: '100%',
                                boxSizing: 'border-box',
                            }}
                            onFocus={(e) => (e.target.style.borderColor = '#C05A3C')}
                            onBlur={(e) => (e.target.style.borderColor = '#E0DDD8')}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: 'linear-gradient(135deg, #C05A3C, #A84C31)',
                            border: 'none',
                            borderRadius: 6,
                            fontFamily: 'var(--font-display-family), sans-serif',
                            fontSize: 15,
                            fontWeight: 600,
                            color: '#FFFFFF',
                            cursor: 'pointer',
                            letterSpacing: '1px',
                        }}
                    >
                        发送重置链接
                    </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: 13, color: '#888888', margin: 0 }}>
                    想起密码了？{' '}
                    <Link href="/login" style={{ color: '#C05A3C', textDecoration: 'none', fontWeight: 500 }}>
                        返回登录
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
