'use client';

import { useState } from 'react';
import { Download, Plus, Search, SlidersHorizontal } from 'lucide-react';
import { PageHeader, ActionButton, DataTable, StatusBadge } from '@/components/ui';
import type { TableColumn } from '@/components/ui';

const skuRows = [
  { id: '1', code: 'CAB-HDMI-2M', name: 'HDMI 2m 高速线缆/散装', category: '线材', unitPrice: '89元/条', stock: '562', minStock: '80', status: '在售' },
  { id: '2', code: 'CONN-RJ45E-CAT6', name: 'RJ45 水晶头 CAT6', category: '线材/配件', unitPrice: '0.5元/只', stock: '1300', minStock: '100', status: '在售' },
  { id: '3', code: 'ADP-USBC-VGA', name: 'USB-C 转 VGA 适配器', category: '转接', unitPrice: '79元', stock: '340', minStock: '0', status: '在售' },
  { id: '4', code: 'FAN-USB-FD', name: 'Krall FD 便携风扇/防静电', category: '周边', unitPrice: '1W', stock: '5667', minStock: '200', status: '停售' },
  { id: '5', code: 'USB-A-XX...', name: 'USB-A 线 X 1.5 m/杂件', category: '', unitPrice: '', stock: '', minStock: '', status: '' },
];

const statusToneMap: Record<string, 'success' | 'danger' | 'neutral'> = {
  '在售': 'success',
  '停售': 'danger',
};

const filterTabs = ['全部', '在售', '停售', '草稿'];

const columns: TableColumn[] = [
  { key: 'code', label: '编码', width: 160 },
  { key: 'name', label: '名称/产品描述', width: 220 },
  { key: 'category', label: '分类', width: 100 },
  { key: 'unitPrice', label: '含税单价', width: 100 },
  { key: 'stock', label: '实物库存', width: 90 },
  { key: 'minStock', label: '安全库存', width: 90 },
  {
    key: 'status',
    label: '状态',
    width: 80,
    render: (value) => value ? <StatusBadge label={value} tone={statusToneMap[value] || 'neutral'} /> : null,
  },
];

export default function SKUWorkbenchPage() {
  const [selectedRow, setSelectedRow] = useState<Record<string, string> | null>(null);

  return (
    <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 24, height: '100vh', overflow: 'hidden' }}>
      <PageHeader
        title="SKU 管理"
        subtitle="SKU 粒度 · 管理工作台"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ActionButton label="导入" icon={<Download size={14} />} tone="secondary" />
            <ActionButton label="导出" icon={<Download size={14} />} tone="secondary" />
            <ActionButton label="新建 SKU" icon={<Plus size={14} />} tone="primary" />
          </div>
        }
      />

      {/* Search + Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#fff', border: '1px solid #E0DDD8', borderRadius: 6,
          padding: '0 12px', height: 40, flex: 1, maxWidth: 400,
        }}>
          <Search size={16} color="#888" />
          <input placeholder="搜索 SKU编码, 名称, 产品编码, 规格码..." style={{
            border: 'none', outline: 'none', fontSize: 13, background: 'transparent', fontFamily: 'inherit', width: '100%',
          }} />
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '0 14px', height: 40, border: '1px solid #E0DDD8',
          borderRadius: 6, background: '#fff', fontSize: 13, cursor: 'pointer', color: '#666', fontFamily: 'inherit',
        }}>
          <SlidersHorizontal size={14} /> 高级筛选
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {filterTabs.map((tab, idx) => (
          <button key={tab} style={{
            padding: '6px 14px',
            borderRadius: 4,
            border: idx === 0 ? '1px solid #1a1a1a' : '1px solid #E0DDD8',
            background: idx === 0 ? '#1a1a1a' : 'transparent',
            color: idx === 0 ? '#fff' : '#666',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}>
            {tab}
          </button>
        ))}
        <span style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>
          显示 1 到 5 / 总 {skuRows.length} 条
        </span>
      </div>

      {/* Table + Quick Preview */}
      <div style={{ display: 'flex', gap: 0, flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <DataTable
            columns={columns}
            rows={skuRows}
            totalPages={2}
            currentPage={1}
            totalItems={skuRows.length}
            onRowClick={setSelectedRow}
            selectedRowId={selectedRow?.id}
          />
        </div>

        {/* Quick Preview */}
        {selectedRow && (
          <div style={{
            width: 280,
            background: '#FFFFFF',
            borderLeft: '1px solid #E0DDD8',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display-family), sans-serif' }}>
                快速预览
              </h3>
              <button onClick={() => setSelectedRow(null)} style={{
                border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16, color: '#888',
              }}>×</button>
            </div>
            <div style={{ fontFamily: 'var(--font-display-family), sans-serif', fontSize: 16, fontWeight: 700 }}>
              {selectedRow.code}
            </div>
            <div style={{ fontSize: 13, color: '#666' }}>{selectedRow.name}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['分类', selectedRow.category],
                ['实物库存', selectedRow.stock],
                ['安全库存', selectedRow.minStock],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#888' }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{value || '—'}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <ActionButton label="导入库" tone="primary" />
              <ActionButton label="查看" tone="secondary" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
