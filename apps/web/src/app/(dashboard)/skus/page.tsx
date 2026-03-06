'use client';

import { useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { PageHeader, ActionButton } from '@/components/ui/page-header';
import { SearchBar } from '@/components/ui/search-bar';
import { FilterTabs } from '@/components/ui/filter-tabs';
import type { FilterTabItem } from '@/components/ui/filter-tabs';
import { DataTable } from '@/components/ui/data-table';
import type { TableColumn } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { QuickPreview } from '@/components/ui/quick-preview';

/* -------- mock data -------- */

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

const filterTabs: FilterTabItem[] = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '在售' },
  { key: 'inactive', label: '停售' },
  { key: 'draft', label: '草稿' },
];

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

/* -------- page -------- */

export default function SKUWorkbenchPage() {
  const [selectedRow, setSelectedRow] = useState<Record<string, string> | null>(null);

  return (
    <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 24, height: '100vh', overflow: 'hidden' }}>
      {/* 1. PageHeader — 标题 + 操作按钮 */}
      <PageHeader
        title="SKU 管理"
        subtitle="SKU 粒度 · 管理工作台"
        actions={
          <>
            <ActionButton label="导入" icon={<Download size={14} />} tone="secondary" />
            <ActionButton label="导出" icon={<Download size={14} />} tone="secondary" />
            <ActionButton label="新建 SKU" icon={<Plus size={14} />} tone="primary" />
          </>
        }
      />

      {/* 2. SearchBar — 搜索 + 高级筛选 */}
      <SearchBar
        placeholder="搜索 SKU编码, 名称, 产品编码, 规格码..."
        showAdvancedFilter
      />

      {/* 3. FilterTabs — 状态标签切换 + 统计 */}
      <FilterTabs
        tabs={filterTabs}
        summary={`显示 1 到 5 / 总 ${skuRows.length} 条`}
      />

      {/* 4. DataTable + QuickPreview */}
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

        {/* 5. QuickPreview 侧边预览面板 */}
        {selectedRow && (
          <QuickPreview
            heading={selectedRow.code}
            subheading={selectedRow.name}
            fields={[
              { label: '分类', value: selectedRow.category },
              { label: '实物库存', value: selectedRow.stock },
              { label: '安全库存', value: selectedRow.minStock },
            ]}
            onClose={() => setSelectedRow(null)}
            actions={
              <>
                <ActionButton label="入库" tone="primary" />
                <ActionButton label="查看" tone="secondary" />
              </>
            }
          />
        )}
      </div>
    </div>
  );
}
