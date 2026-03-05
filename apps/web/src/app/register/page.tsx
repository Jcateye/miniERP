'use client';

import Link from 'next/link';
import { AuthLayout } from '@/components/ui';

export default function RegisterPage() {
    return (
        <AuthLayout
            tagline="开启您的智慧库存管理之旅"
            tagline2={undefined}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 40 }}>
                <div>
                    <h1 style={{
                        fontFamily: 'var(--font-display-family), sans-serif',
                        fontSize: 24,
                        fontWeight: 700,
                        color: '#1a1a1a',
                        margin: '0 0 8px',
                    }}>
                        注册
                    </h1>
                    <p style={{ fontSize: 13, color: '#888888', margin: 0 }}>
                        创建您的 miniERP 账户
                    </p>
                </div>

                <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>姓</label>
                            <input
                                type="text"
                                placeholder="姓"
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
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>名</label>
                            <input
                                type="text"
                                placeholder="名"
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
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>公司名称</label>
                        <input
                            type="text"
                            placeholder="请输入公司名称"
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

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>邮箱</label>
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

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>密码</label>
                        <input
                            type="password"
                            placeholder="至少8位，包含字母和数字"
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
                            marginTop: 4,
                        }}
                    >
                        注 册
                    </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: 13, color: '#888888', margin: 0 }}>
                    已有账户？{' '}
                    <Link href="/login" style={{ color: '#C05A3C', textDecoration: 'none', fontWeight: 500 }}>
                        立即登录
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
