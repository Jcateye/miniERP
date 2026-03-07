'use client';

import { Suspense, useMemo } from 'react';

import { DataTable, type TableColumn } from '@/components/ui';

import {
  buildAdjustmentListRows,
  ADJUSTMENT_LIST_COLUMNS,
  ADJUSTMENT_PAGE_PRESENTATION,
  type AdjustmentListRow,
} from './adjustments-page';
import { InventoryAdjustmentsPageScaffold } from './adjustments-page-view';
import { useAdjustmentsPageVm } from './use-adjustments-page-vm';

function getAdjustmentTableColumns(): TableColumn[] {
  return ADJUSTMENT_LIST_COLUMNS.map((column) => ({
    key: column.key,
    label: column.label,
    width:
      column.key === 'documentNumber'
        ? 180
        : column.key === 'warehouseName'
          ? 140
          : column.key === 'date'
            ? 120
            : column.key === 'lineCount'
              ? 80
              : column.key === 'quantity'
                ? 100
                : column.key === 'reason'
                  ? 180
                  : undefined,
  })) satisfies TableColumn[];
}

function InventoryAdjustmentsPageContent() {
  const { items } = useAdjustmentsPageVm();
  const rows = useMemo<AdjustmentListRow[]>(() => buildAdjustmentListRows(items), [items]);
  const columns = useMemo(() => getAdjustmentTableColumns(), []);

  return (
    <InventoryAdjustmentsPageScaffold
      title={ADJUSTMENT_PAGE_PRESENTATION.title}
      summary={ADJUSTMENT_PAGE_PRESENTATION.summary}
      primaryActionLabel={ADJUSTMENT_PAGE_PRESENTATION.primaryActionLabel}
      table={<DataTable columns={columns} rows={rows as unknown as Record<string, string>[]} showPagination={false} />}
    />
  );
}

export default function InventoryAdjustmentsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '32px 40px', fontSize: 14, color: '#666666', background: '#F5F3EF' }}>
          正在加载库存调整列表...
        </div>
      }
    >
      <InventoryAdjustmentsPageContent />
    </Suspense>
  );
}
