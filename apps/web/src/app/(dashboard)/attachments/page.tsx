'use client';

import { PageHeader, FilterBar, DataTable, StatusBadge } from '@/components/ui';
import type { TableColumn, FilterConfig } from '@/components/ui';

const rows = [
    { id: '1', name: 'GRN-20260303-003-invoice.pdf', type: 'PDF', size: '2.4MB', entity: 'GRN-003', uploadTime: '2026-03-03 10:30', uploader: '张三' },
    { id: '2', name: 'delivery-photo-001.jpg', type: 'JPG', size: '1.8MB', entity: 'GRN-003', uploadTime: '2026-03-03 10:28', uploader: '李四' },
    { id: '3', name: 'quality-report-jan.xlsx', type: 'XLSX', size: '456KB', entity: 'SKU-1001', uploadTime: '2026-03-02 15:30', uploader: '王五' },
];

const filters: FilterConfig[] = [
    { key: 'type', label: '文件类型', options: [{ label: 'PDF', value: 'pdf' }, { label: '图片', value: 'image' }, { label: 'Excel', value: 'xlsx' }] },
    { key: 'entity', label: '关联单据', options: [{ label: 'GRN', value: 'grn' }, { label: 'OUT', value: 'out' }, { label: 'SKU', value: 'sku' }] },
];

const columns: TableColumn[] = [
    { key: 'name', label: '文件名', width: 260 },
    {
        key: 'type', label: '类型', width: 70, render: (v) => (
            <StatusBadge label={v} tone="neutral" />
        )
    },
    { key: 'size', label: '大小', width: 80 },
    { key: 'entity', label: '关联', width: 100 },
    { key: 'uploadTime', label: '上传时间', width: 160 },
    { key: 'uploader', label: '上传人', width: 80 },
];

export default function AttachmentsPage() {
    return (
        <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 24, height: '100vh', overflow: 'hidden' }}>
            <PageHeader title="附件管理" />
            <FilterBar searchPlaceholder="搜索文件名..." filters={filters} />
            <DataTable columns={columns} rows={rows} totalPages={1} totalItems={rows.length} />
        </div>
    );
}
