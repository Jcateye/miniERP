'use client';

import { PageHeader, ActionButton, TabPanel, FormInput } from '@/components/ui';
import type { Tab } from '@/components/ui';

export default function ProfilePage() {
    const tabs: Tab[] = [
        {
            key: 'devices',
            label: '登录设备',
            content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                        { device: 'Chrome — macOS', ip: '192.168.1.100', time: '2026-03-03 10:30', current: true },
                        { device: 'Safari — iOS', ip: '10.0.0.15', time: '2026-03-02 08:20', current: false },
                    ].map((item, idx) => (
                        <div key={idx} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '12px 16px', background: '#F5F3EF', borderRadius: 6,
                        }}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{item.device}</div>
                                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>IP: {item.ip} · {item.time}</div>
                            </div>
                            {item.current && (
                                <span style={{
                                    fontSize: 11, fontWeight: 600, color: '#2E7D32',
                                    background: '#E8F5E9', padding: '4px 10px', borderRadius: 4,
                                }}>
                                    当前设备
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            ),
        },
        {
            key: 'notifications',
            label: '通知偏好',
            content: <div style={{ fontSize: 13, color: '#888' }}>通知偏好设置...</div>,
        },
    ];

    return (
        <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 24, minHeight: '100%', overflow: 'auto' }}>
            <PageHeader
                title="个人中心"
                subtitle="管理您的账户信息和偏好设置"
                actions={<ActionButton label="保存" tone="primary" />}
            />

            {/* Profile cards */}
            <div style={{ display: 'flex', gap: 24 }}>
                <div style={{
                    flex: 1, background: '#fff', border: '1px solid #E0DDD8',
                    borderRadius: 8, padding: 24, display: 'flex', flexDirection: 'column', gap: 16,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: '50%', background: '#C05A3C',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 700, fontSize: 18, fontFamily: 'var(--font-display-family), sans-serif',
                        }}>
                            张
                        </div>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display-family), sans-serif' }}>张三</div>
                            <div style={{ fontSize: 12, color: '#888' }}>管理员 · DEMO-001</div>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <FormInput label="姓名" value="张三" />
                        <FormInput label="邮箱" value="zhang.san@company.com" />
                        <FormInput label="手机" value="138****8888" />
                        <FormInput label="职位" value="系统管理员" />
                    </div>
                </div>

                <div style={{
                    flex: 1, background: '#fff', border: '1px solid #E0DDD8',
                    borderRadius: 8, padding: 24, display: 'flex', flexDirection: 'column', gap: 16,
                }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display-family), sans-serif' }}>
                        修改密码
                    </h3>
                    <FormInput label="当前密码" type="password" placeholder="请输入当前密码" />
                    <FormInput label="新密码" type="password" placeholder="至少8位" />
                    <FormInput label="确认新密码" type="password" placeholder="再次输入新密码" />
                </div>
            </div>

            <TabPanel tabs={tabs} />
        </div>
    );
}
