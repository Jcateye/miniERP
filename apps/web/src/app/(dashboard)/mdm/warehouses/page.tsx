'use client';

import { Suspense, useMemo } from 'react';

import { ActionButton, DataTable, type TableColumn } from '@/components/ui';

import {
  buildWarehouseListRows,
  WAREHOUSE_LIST_COLUMNS,
  WAREHOUSE_PAGE_PRESENTATION,
  type WarehouseListRow,
} from './warehouses-page';
import { WarehousesPageScaffold } from './warehouses-page-view';
import { useWarehousesPageVm } from './use-warehouses-page-vm';

function getWarehouseTableColumns(): TableColumn[] {
  return WAREHOUSE_LIST_COLUMNS.map((column) => ({
    key: column.key,
    label: column.label,
    width:
      column.key === 'code'
        ? 100
        : column.key === 'name'
          ? 140
          : column.key === 'warehouseType'
            ? 80
            : column.key === 'address'
              ? 160
              : column.key === 'contactPerson'
                ? 100
                : column.key === 'locationManaged'
                  ? 80
                  : undefined,
  })) satisfies TableColumn[];
}

function WarehousesPageContent() {
  const { error, keywordInput, loading, setKeywordInput, loadItems, visibleItems } = useWarehousesPageVm();
  const rows = useMemo<WarehouseListRow[]>(() => buildWarehouseListRows(visibleItems), [visibleItems]);
  const columns = useMemo(() => getWarehouseTableColumns(), []);

  const tableContent = loading ? (
    <div style={{ padding: '24px', background: '#FFFFFF', border: '1px solid #E8E4DD', borderRadius: 4 }}>
      正在加载仓库列表...
    </div>
  ) : error ? (
    <div
      style={{
        display: 'grid',
        gap: 12,
        padding: '24px',
        background: '#FFFFFF',
        border: '1px solid #E8E4DD',
        borderRadius: 4,
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>仓库列表加载失败</div>
      <div style={{ fontSize: 13, color: '#666666', lineHeight: 1.6 }}>{error}</div>
      <div>
        <ActionButton label="重试" tone="secondary" onClick={() => void loadItems()} />
      </div>
    </div>
  ) : rows.length === 0 ? (
    <div
      style={{ padding: '24px', background: '#FFFFFF', border: '1px solid #E8E4DD', borderRadius: 4, fontSize: 13, color: '#666666' }}
    >
      暂无匹配仓库。
    </div>
  ) : (
    <DataTable columns={columns} rows={rows as unknown as Record<string, string>[]} totalPages={1} currentPage={1} totalItems={rows.length} />
  );

  return (
    <WarehousesPageScaffold
      title={WAREHOUSE_PAGE_PRESENTATION.title}
      summary={WAREHOUSE_PAGE_PRESENTATION.summary}
      primaryActionLabel={WAREHOUSE_PAGE_PRESENTATION.primaryActionLabel}
      searchPlaceholder={WAREHOUSE_PAGE_PRESENTATION.searchPlaceholder}
      keyword={keywordInput}
      onKeywordChange={setKeywordInput}
      table={tableContent}
    />
  );
}

export default function WarehousesPage() {
  return (
    <Suspense fallback={null}>
      <WarehousesPageContent />
    </Suspense>
  );
}
