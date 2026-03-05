'use client';

import { PageHeader, FilterBar, DataTable, StatusBadge } from '@/components/ui';
import type { TableColumn, FilterConfig } from '@/components/ui';

const logRows = [
    { id: '1', time: '2026-03-03 10:30:45', method: 'GET', path: '/api/v1/skus', status: '200', duration: '42ms', client: 'ERP-Sync-Client' },
    { id: '2', time: '2026-03-03 10:28:12', method: 'POST', path: '/api/v1/grn', status: '201', duration: '128ms', client: 'ERP-Sync-Client' },
    { id: '3', time: '2026-03-03 10:25:03', method: 'GET', path: '/api/v1/inventory', status: '500', duration: '2541ms', client: 'ERP-Sync-Client' },
];

const filters: FilterConfig[] = [
    { key: 'method', label: '请求方法', options: [{ label: 'GET', value: 'GET' }, { label: 'POST', value: 'POST' }] },
    { key: 'status', label: '状态码', options: [{ label: '2xx', value: '2xx' }, { label: '4xx', value: '4xx' }, { label: '5xx', value: '5xx' }] },
    { key: 'client', label: '客户端', options: [{ label: 'ERP-Sync-Client', value: 'erp-sync' }] },
];

const columns: TableColumn[] = [
    { key: 'time', label: '时间', width: 180 },
    {
        key: 'method', label: '方法', width: 70, render: (v) => (
            <span style={{ fontWeight: 700, color: v === 'GET' ? '#5C7C8A' : '#C05A3C', fontSize: 12 }}>{v}</span>
        )
    },
    { key: 'path', label: '路径', width: 200 },
    {
        key: 'status', label: '状态', width: 80, render: (v) => (
            <StatusBadge label={v} tone={v.startsWith('2') ? 'success' : v.startsWith('5') ? 'danger' : 'warning'} />
        )
    },
    { key: 'duration', label: '耗时', width: 80 },
    { key: 'client', label: '客户端', width: 160 },
];

export default function ApiLogsPage() {
    return (
        <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 24, height: '100vh', overflow: 'hidden' }}>
            <PageHeader title="API 调用日志" />
            <FilterBar searchPlaceholder="搜索路径..." filters={filters} />
            <DataTable columns={columns} rows={logRows} totalPages={1} totalItems={logRows.length} />
        </div>
    );
}
