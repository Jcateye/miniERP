'use client';

import { useState } from 'react';
import { PageHeader, ActionButton } from '@/components/ui';

const roles = [
    { id: '1', name: '管理员', desc: '拥有所有权限', count: 2 },
    { id: '2', name: '采购员', desc: '采购相关权限', count: 3 },
    { id: '3', name: '仓管员', desc: '库存和盘点权限', count: 4 },
    { id: '4', name: '销售员', desc: '销售和出库权限', count: 2 },
    { id: '5', name: '只读用户', desc: '仅查看权限', count: 5 },
];

const permissionGroups = [
    {
        group: 'SKU 管理',
        permissions: [
            { key: 'sku.view', label: '查看 SKU', checked: true },
            { key: 'sku.create', label: '创建 SKU', checked: true },
            { key: 'sku.edit', label: '编辑 SKU', checked: true },
            { key: 'sku.delete', label: '删除 SKU', checked: false },
        ],
    },
    {
        group: '采购管理',
        permissions: [
            { key: 'po.view', label: '查看 PO', checked: true },
            { key: 'po.create', label: '创建 PO', checked: false },
            { key: 'grn.view', label: '查看 GRN', checked: true },
            { key: 'grn.post', label: '过账 GRN', checked: false },
        ],
    },
    {
        group: '库存管理',
        permissions: [
            { key: 'inv.view', label: '查看库存', checked: true },
            { key: 'inv.adjust', label: '库存调整', checked: false },
            { key: 'stocktake.view', label: '查看盘点', checked: true },
            { key: 'stocktake.execute', label: '执行盘点', checked: false },
        ],
    },
];

export default function RolesPage() {
    const [activeRole, setActiveRole] = useState('2');

    return (
        <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 24, minHeight: '100%', overflow: 'hidden' }}>
            <PageHeader
                title="角色权限配置"
                actions={<ActionButton label="保存" tone="primary" />}
            />

            <div style={{ display: 'flex', gap: 24, flex: 1, minHeight: 0 }}>
                {/* Left: Role List */}
                <div style={{
                    width: 220, background: '#fff', border: '1px solid #E0DDD8',
                    borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column',
                }}>
                    <div style={{
                        padding: '14px 16px', background: '#F5F3EF',
                        borderBottom: '1px solid #E0DDD8', fontSize: 12, fontWeight: 600, color: '#888',
                    }}>
                        角色列表
                    </div>
                    {roles.map(role => (
                        <button
                            key={role.id}
                            onClick={() => setActiveRole(role.id)}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '12px 16px', width: '100%',
                                background: activeRole === role.id ? '#F5F3EF' : '#fff',
                                borderLeft: activeRole === role.id ? '3px solid #C05A3C' : '3px solid transparent',
                                border: 'none', borderBottom: '1px solid #F0EDE8',
                                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                            }}
                        >
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{role.name}</div>
                                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{role.desc}</div>
                            </div>
                            <span style={{ fontSize: 11, color: '#888' }}>{role.count}人</span>
                        </button>
                    ))}
                </div>

                {/* Right: Permissions */}
                <div style={{
                    flex: 1, background: '#fff', border: '1px solid #E0DDD8',
                    borderRadius: 8, padding: 24, overflowY: 'auto',
                    display: 'flex', flexDirection: 'column', gap: 24,
                }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display-family), sans-serif' }}>
                        {roles.find(r => r.id === activeRole)?.name} — 权限配置
                    </h3>

                    {permissionGroups.map(group => (
                        <div key={group.group}>
                            <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>
                                {group.group}
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                {group.permissions.map(perm => (
                                    <label key={perm.key} style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '10px 14px', borderRadius: 6,
                                        background: perm.checked ? 'rgba(192,90,60,0.06)' : '#F5F3EF',
                                        cursor: 'pointer', fontSize: 13,
                                    }}>
                                        <input
                                            type="checkbox"
                                            defaultChecked={perm.checked}
                                            style={{ width: 16, height: 16, accentColor: '#C05A3C' }}
                                        />
                                        {perm.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
