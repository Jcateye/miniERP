'use client';

import { PageHeader, ActionButton, TabPanel, FormInput } from '@/components/ui';
import type { Tab } from '@/components/ui';

export default function TenantSettingsPage() {
    const tabs: Tab[] = [
        {
            key: 'basic',
            label: '基础配置',
            content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[
                        { label: '默认货币', value: 'CNY (人民币)' },
                        { label: '时区', value: 'Asia/Shanghai (UTC+8)' },
                        { label: '日期格式', value: 'YYYY-MM-DD' },
                        { label: '库存计价方式', value: '加权平均法' },
                    ].map(item => (
                        <div key={item.label} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '12px 0', borderBottom: '1px solid #F0EDE8',
                        }}>
                            <span style={{ fontSize: 13, color: '#888' }}>{item.label}</span>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{item.value}</span>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            key: 'notification',
            label: '通知设置',
            content: <div style={{ fontSize: 13, color: '#888' }}>通知配置项...</div>,
        },
        {
            key: 'integration',
            label: '集成',
            content: <div style={{ fontSize: 13, color: '#888' }}>第三方集成配置...</div>,
        },
    ];

    return (
        <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 24, minHeight: '100%', overflow: 'auto' }}>
            <PageHeader
                title="租户设置"
                actions={<ActionButton label="保存" tone="primary" />}
            />

            {/* Info Cards */}
            <div style={{ display: 'flex', gap: 24 }}>
                <div style={{
                    flex: 1, background: '#fff', border: '1px solid #E0DDD8',
                    borderRadius: 8, padding: 24, display: 'flex', flexDirection: 'column', gap: 16,
                }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display-family), sans-serif' }}>
                        租户信息
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <FormInput label="租户名称" value="MiniERP Demo" />
                        <FormInput label="租户编码" value="DEMO-001" />
                        <FormInput label="联系人" value="张三" />
                        <FormInput label="联系邮箱" value="admin@minierp.cn" />
                    </div>
                </div>

                <div style={{
                    width: 280, background: '#fff', border: '1px solid #E0DDD8',
                    borderRadius: 8, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
                }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display-family), sans-serif' }}>
                        租户 Logo
                    </h3>
                    <div style={{
                        width: 80, height: 80, borderRadius: 8, background: '#F5F3EF',
                        border: '2px dashed #D1CCC4', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, color: '#888',
                    }}>
                        上传
                    </div>
                    <span style={{ fontSize: 12, color: '#888' }}>支持 PNG, JPG, SVG</span>
                </div>
            </div>

            {/* Tabs */}
            <TabPanel tabs={tabs} />
        </div>
    );
}
