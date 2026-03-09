'use client';

import { Suspense, useMemo } from 'react';

import { ActionButton, DataTable, type TableColumn } from '@/components/ui';

import {
  buildPurchaseOrderListRows,
  PURCHASE_ORDER_LIST_COLUMNS,
  PURCHASE_ORDER_PAGE_PRESENTATION,
} from './purchase-orders-page';
import { ProcurePurchaseOrdersPageScaffold } from './purchase-orders-page-view';
import { usePurchaseOrdersPageVm } from './use-purchase-orders-page-vm';

function getPurchaseOrderTableColumns(): TableColumn[] {
  return PURCHASE_ORDER_LIST_COLUMNS.map((column) => ({
    key: column.key,
    label: column.label,
    width:
      column.key === 'orderNumber'
        ? 150
        : column.key === 'supplierName'
          ? 150
          : column.key === 'orderedAt'
            ? 110
            : column.key === 'amount'
              ? 100
              : column.key === 'lineCount'
                ? 80
                : column.key === 'status'
                  ? 90
                  : 120,
    render:
      column.key === 'actions'
        ? () => <ActionButton label="查看" tone="secondary" disabled />
        : undefined,
  })) satisfies TableColumn[];
}

function ProcurePurchaseOrdersPageContent() {
  const { keywordInput, setKeywordInput, filterInput, setFilterInput, visibleItems } = usePurchaseOrdersPageVm();
  const rows = useMemo(() => buildPurchaseOrderListRows(visibleItems), [visibleItems]);
  const tableRows = useMemo<Record<string, string>[]>(
    () =>
      rows.map(({ id, orderNumber, supplierName, orderedAt, amount, lineCount, status, actions }) => ({
        id,
        orderNumber,
        supplierName,
        orderedAt,
        amount,
        lineCount,
        status,
        actions,
      })),
    [rows],
  );
  const columns = useMemo(() => getPurchaseOrderTableColumns(), []);

  return (
    <ProcurePurchaseOrdersPageScaffold
      title={PURCHASE_ORDER_PAGE_PRESENTATION.title}
      summary={PURCHASE_ORDER_PAGE_PRESENTATION.summary}
      primaryActionLabel={PURCHASE_ORDER_PAGE_PRESENTATION.primaryActionLabel}
      searchPlaceholder={PURCHASE_ORDER_PAGE_PRESENTATION.searchPlaceholder}
      keyword={keywordInput}
      onKeywordChange={setKeywordInput}
      activeFilter={filterInput}
      onFilterChange={setFilterInput}
      table={<DataTable columns={columns} rows={tableRows} showPagination={false} />}
    />
  );
}

export default function ProcurePurchaseOrdersPage() {
  return (
    <Suspense fallback={null}>
      <ProcurePurchaseOrdersPageContent />
    </Suspense>
  );
}
