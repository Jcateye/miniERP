'use client';

import { useState } from 'react';
import { PageHeader, ActionButton, DataTable, StatusBadge } from '@/components/ui';
import type { TableColumn } from '@/components/ui';

const secondaryNavItems = [
  { label: '产品分类', key: 'categories', icon: '📦' },
  { label: '仓库管理', key: 'warehouses', icon: '🏭' },
  { label: '计量单位', key: 'units', icon: '📏' },
];

const categoryRows = [
  { id: '1', code: 'CAT-CABLE', name: '线材', count: '126', status: '启用' },
  { id: '2', code: 'CAT-ADAPTER', name: '转接', count: '45', status: '启用' },
  { id: '3', code: 'CAT-ACCESSORY', name: '配件', count: '63', status: '启用' },
  { id: '4', code: 'CAT-PERIPHERAL', name: '周边', count: '18', status: '停用' },
];

const columns: TableColumn[] = [
  { key: 'code', label: '编码', width: 160 },
  { key: 'name', label: '名称', width: 200 },
  { key: 'count', label: 'SKU数', width: 100 },
  {
    key: 'status',
    label: '状态',
    width: 80,
    render: (value) => <StatusBadge label={value} tone={value === '启用' ? 'success' : 'danger'} />,
  },
];

export default function MasterDataPage() {
  const [activeNav, setActiveNav] = useState('categories');

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Secondary Nav */}
      <div style={{
        width: 220,
        background: '#FFFFFF',
        borderRight: '1px solid #D1CCC4',
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}>
        <h3 style={{
          margin: '0 0 16px', padding: '0 24px',
          fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display-family), sans-serif',
        }}>
          主数据配置
        </h3>
        {secondaryNavItems.map(item => (
          <button
            key={item.key}
            onClick={() => setActiveNav(item.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 24px', width: '100%',
              background: activeNav === item.key ? '#F5F3EF' : 'transparent',
              borderLeft: activeNav === item.key ? '3px solid #C05A3C' : '3px solid transparent',
              border: 'none', borderRight: 'none', borderTop: 'none', borderBottom: 'none',
              fontSize: 13, fontWeight: activeNav === item.key ? 600 : 500,
              color: activeNav === item.key ? '#1a1a1a' : '#666666',
              cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
            }}
          >
            <span>{item.icon}</span> {item.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <PageHeader
          title="产品分类"
          subtitle="管理产品分类主数据"
          actions={<ActionButton label="+ 新建分类" tone="primary" />}
        />

        <DataTable
          columns={columns}
          rows={categoryRows}
          totalPages={1}
          totalItems={categoryRows.length}
        />
      </div>
    </div>
  );
}
