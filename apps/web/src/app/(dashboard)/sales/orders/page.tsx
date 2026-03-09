'use client';

import { Suspense, useMemo } from 'react';

import { ActionButton, DataTable, type TableColumn } from '@/components/ui';

import {
  buildSalesOrderListRows,
  SALES_ORDER_LIST_COLUMNS,
  SALES_ORDER_PAGE_PRESENTATION,
} from './orders-page';
import { SalesOrdersPageScaffold } from './orders-page-view';
import { useOrdersPageVm } from './use-orders-page-vm';

function getSalesOrderTableColumns(): TableColumn[] {
  return SALES_ORDER_LIST_COLUMNS.map((column) => ({
    key: column.key,
    label: column.label,
    width:
      column.key === 'orderNumber'
        ? 150
        : column.key === 'customerName'
          ? 140
          : column.key === 'orderDate'
            ? 110
            : column.key === 'amount'
              ? 100
              : column.key === 'deliveryDate'
                ? 100
                : column.key === 'status'
                  ? 90
                  : 120,
    render:
      column.key === 'actions'
        ? () => <ActionButton label="查看" tone="secondary" disabled />
        : undefined,
  })) satisfies TableColumn[];
}

function SalesOrdersPageContent() {
  const { keywordInput, setKeywordInput, filterInput, setFilterInput, visibleItems } = useOrdersPageVm();
  const rows = useMemo(() => buildSalesOrderListRows(visibleItems), [visibleItems]);
  const tableRows = useMemo<Record<string, string>[]>(
    () =>
      rows.map(({ id, orderNumber, customerName, orderDate, amount, deliveryDate, status, actions }) => ({
        id,
        orderNumber,
        customerName,
        orderDate,
        amount,
        deliveryDate,
        status,
        actions,
      })),
    [rows],
  );
  const columns = useMemo(() => getSalesOrderTableColumns(), []);

  return (
    <SalesOrdersPageScaffold
      title={SALES_ORDER_PAGE_PRESENTATION.title}
      summary={SALES_ORDER_PAGE_PRESENTATION.summary}
      primaryActionLabel={SALES_ORDER_PAGE_PRESENTATION.primaryActionLabel}
      searchPlaceholder={SALES_ORDER_PAGE_PRESENTATION.searchPlaceholder}
      keyword={keywordInput}
      onKeywordChange={setKeywordInput}
      activeFilter={filterInput}
      onFilterChange={setFilterInput}
      table={<DataTable columns={columns} rows={tableRows} showPagination={false} />}
    />
  );
}

export default function SalesOrdersPage() {
  return (
    <Suspense fallback={null}>
      <SalesOrdersPageContent />
    </Suspense>
  );
}
