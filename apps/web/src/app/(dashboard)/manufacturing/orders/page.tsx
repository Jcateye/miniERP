'use client';

import { Suspense, useMemo } from 'react';

import { DataTable, type TableColumn } from '@/components/ui';

import {
  buildManufacturingOrderListRows,
  MANUFACTURING_ORDER_LIST_COLUMNS,
  MANUFACTURING_ORDER_PAGE_PRESENTATION,
  type ManufacturingOrderListRow,
} from './manufacturing-orders-page';
import { ManufacturingOrdersPageScaffold } from './manufacturing-orders-page-view';
import { useManufacturingOrdersPageVm } from './use-manufacturing-orders-page-vm';

function getManufacturingOrderTableColumns(): TableColumn[] {
  return MANUFACTURING_ORDER_LIST_COLUMNS.map((column) => ({
    key: column.key,
    label: column.label,
    width:
      column.key === 'orderNumber'
        ? 170
        : column.key === 'itemName'
          ? 220
          : column.key === 'bomVersion'
            ? 120
            : column.key === 'plannedQuantity'
              ? 100
              : column.key === 'plannedStartAt'
                ? 120
                : column.key === 'ownerName'
                  ? 100
                  : undefined,
  })) satisfies TableColumn[];
}

function ManufacturingOrdersPageContent() {
  const { items } = useManufacturingOrdersPageVm();
  const rows = useMemo<ManufacturingOrderListRow[]>(() => buildManufacturingOrderListRows(items), [items]);
  const columns = useMemo(() => getManufacturingOrderTableColumns(), []);

  return (
    <ManufacturingOrdersPageScaffold
      title={MANUFACTURING_ORDER_PAGE_PRESENTATION.title}
      summary={MANUFACTURING_ORDER_PAGE_PRESENTATION.summary}
      primaryActionLabel={MANUFACTURING_ORDER_PAGE_PRESENTATION.primaryActionLabel}
      table={<DataTable columns={columns} rows={rows as unknown as Record<string, string>[]} showPagination={false} />}
    />
  );
}

export default function ManufacturingOrdersPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '32px 40px', fontSize: 14, color: '#666666', background: '#F5F3EF' }}>
          正在加载生产订单列表...
        </div>
      }
    >
      <ManufacturingOrdersPageContent />
    </Suspense>
  );
}
