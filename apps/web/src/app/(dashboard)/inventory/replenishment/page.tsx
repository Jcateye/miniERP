'use client';

import { Suspense, useMemo } from 'react';

import { DataTable, type TableColumn } from '@/components/ui';

import {
  buildReplenishmentListRows,
  REPLENISHMENT_LIST_COLUMNS,
  REPLENISHMENT_PAGE_PRESENTATION,
  type ReplenishmentListRow,
} from './replenishment-page';
import { InventoryReplenishmentPageScaffold } from './replenishment-page-view';
import { useReplenishmentPageVm } from './use-replenishment-page-vm';

function getReplenishmentTableColumns(): TableColumn[] {
  return REPLENISHMENT_LIST_COLUMNS.map((column) => ({
    key: column.key,
    label: column.label,
    width:
      column.key === 'itemCode'
        ? 140
        : column.key === 'itemName'
          ? 160
          : column.key === 'currentStock'
            ? 90
            : column.key === 'safetyStock'
              ? 90
              : column.key === 'gap'
                ? 80
                : column.key === 'suggestedPurchaseQuantity'
                  ? 110
                  : undefined,
  })) satisfies TableColumn[];
}

function InventoryReplenishmentPageContent() {
  const { items } = useReplenishmentPageVm();
  const rows = useMemo<ReplenishmentListRow[]>(() => buildReplenishmentListRows(items), [items]);
  const columns = useMemo(() => getReplenishmentTableColumns(), []);

  return (
    <InventoryReplenishmentPageScaffold
      title={REPLENISHMENT_PAGE_PRESENTATION.title}
      summary={REPLENISHMENT_PAGE_PRESENTATION.summary}
      primaryActionLabel={REPLENISHMENT_PAGE_PRESENTATION.primaryActionLabel}
      table={<DataTable columns={columns} rows={rows as unknown as Record<string, string>[]} showPagination={false} />}
    />
  );
}

export default function InventoryReplenishmentPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '32px 40px', fontSize: 14, color: '#666666', background: '#F5F3EF' }}>
          正在加载补货建议列表...
        </div>
      }
    >
      <InventoryReplenishmentPageContent />
    </Suspense>
  );
}
