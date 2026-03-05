'use client';

import { Plus } from 'lucide-react';
import { PageHeader, FilterBar, DataTable, StatusBadge } from '@/components/ui';
import type { TableColumn, FilterConfig } from '@/components/ui';

const userRows = [
    { id: '1', name: '张三', email: 'zhang.san@company.com', role: '管理员', status: '活跃', lastLogin: '2026-03-03 10:30' },
    { id: '2', name: '李四', email: 'li.si@company.com', role: '采购员', status: '活跃', lastLogin: '2026-03-02 14:20' },
    { id: '3', name: '王五', email: 'wang.wu@company.com', role: '仓管员', status: '已禁用', lastLogin: '2026-02-28 09:00' },
];

const roleFilter: FilterConfig = {
    key: 'role',
    label: '所有角色',
    options: [
        { label: '管理员', value: 'admin' },
        { label: '采购员', value: 'purchaser' },
        { label: '仓管员', value: 'warehouse' },
    ],
};

const columns: TableColumn[] = [
    { key: 'name', label: '姓名', width: 120 },
    { key: 'email', label: '邮箱', width: 220 },
    { key: 'role', label: '角色', width: 100 },
    {
        key: 'status',
        label: '状态',
        width: 80,
        render: (value) => <StatusBadge label={value} tone={value === '活跃' ? 'success' : 'danger'} />,
    },
    { key: 'lastLogin', label: '最后登录', width: 160 },
];

export default function UsersPage() {
    return (
        <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 24, height: '100vh', overflow: 'hidden' }}>
            <PageHeader
                title="用户管理"
                actions={
                    <button style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 20px', borderRadius: 8, border: 'none',
                        background: '#C05A3C', color: '#fff', fontSize: 13,
                        fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                        <Plus size={14} /> 添加用户
                    </button>
                }
            />

            <FilterBar
                searchPlaceholder="搜索用户姓名、邮箱..."
                filters={[roleFilter]}
            />

            <DataTable
                columns={columns}
                rows={userRows}
                totalPages={1}
                totalItems={userRows.length}
            />
        </div>
    );
}
