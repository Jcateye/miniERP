'use client';

import { Suspense, useMemo } from 'react';

import { DataTable, type TableColumn } from '@/components/ui';

import {
  buildInventoryBalanceListRows,
  INVENTORY_BALANCE_LIST_COLUMNS,
  INVENTORY_BALANCE_PAGE_PRESENTATION,
} from './balances-page';
import { InventoryBalancesPageScaffold } from './balances-page-view';
import { useBalancesPageVm } from './use-balances-page-vm';

function getInventoryBalanceTableColumns(): TableColumn[] {
  return INVENTORY_BALANCE_LIST_COLUMNS.map((column) => ({
    key: column.key,
    label: column.label,
    width:
      column.key === 'itemCode'
        ? 120
        : column.key === 'itemName'
          ? 180
          : column.key === 'warehouseName'
            ? 100
            : column.key === 'onHand'
              ? 80
              : column.key === 'available'
                ? 80
                : column.key === 'reserved'
                  ? 80
                  : column.key === 'safetyStock'
                    ? 90
                    : 90,
  })) satisfies TableColumn[];
}

function InventoryBalancesPageContent() {
  const { keywordInput, setKeywordInput, filterInput, setFilterInput, visibleItems } = useBalancesPageVm();
  const rows = useMemo(() => buildInventoryBalanceListRows(visibleItems), [visibleItems]);
  const tableRows = useMemo<Record<string, string>[]>(
    () =>
      rows.map(({ id, itemCode, itemName, warehouseName, onHand, available, reserved, safetyStock, status }) => ({
        id,
        itemCode,
        itemName,
        warehouseName,
        onHand,
        available,
        reserved,
        safetyStock,
        status,
      })),
    [rows],
  );
  const columns = useMemo(() => getInventoryBalanceTableColumns(), []);

  return (
    <InventoryBalancesPageScaffold
      title={INVENTORY_BALANCE_PAGE_PRESENTATION.title}
      summary={INVENTORY_BALANCE_PAGE_PRESENTATION.summary}
      primaryActionLabel={INVENTORY_BALANCE_PAGE_PRESENTATION.primaryActionLabel}
      searchPlaceholder={INVENTORY_BALANCE_PAGE_PRESENTATION.searchPlaceholder}
      keyword={keywordInput}
      onKeywordChange={setKeywordInput}
      activeFilter={filterInput}
      onFilterChange={setFilterInput}
      table={<DataTable columns={columns} rows={tableRows} showPagination={false} />}
    />
  );
}

export default function InventoryBalancesPage() {
  return (
    <Suspense fallback={null}>
      <InventoryBalancesPageContent />
    </Suspense>
  );
}
