'use client';

import { Plus } from 'lucide-react';
import { PageHeader, DataTable, StatusBadge } from '@/components/ui';
import type { TableColumn } from '@/components/ui';

const clientRows = [
    { id: '1', name: 'ERP-Sync-Client', clientId: 'cli_8f2a3b...', scope: 'sku:read po:read grn:read', status: '活跃', created: '2026-02-01' },
];

const columns: TableColumn[] = [
    { key: 'name', label: '客户端名称', width: 180 },
    { key: 'clientId', label: 'Client ID', width: 160 },
    { key: 'scope', label: '权限范围', width: 220 },
    {
        key: 'status', label: '状态', width: 80,
        render: (v) => <StatusBadge label={v} tone={v === '活跃' ? 'success' : 'danger'} />,
    },
    { key: 'created', label: '创建时间', width: 120 },
];

export default function ApiClientsPage() {
    return (
        <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 24, minHeight: '100%', overflow: 'hidden' }}>
            <PageHeader
                title="API 客户端管理"
                actions={
                    <button style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 20px', borderRadius: 8, border: 'none',
                        background: '#C05A3C', color: '#fff', fontSize: 13,
                        fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                        <Plus size={14} /> 新建客户端
                    </button>
                }
            />
            <DataTable columns={columns} rows={clientRows} totalPages={1} totalItems={1} />
        </div>
    );
}
