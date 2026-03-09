'use client';

import { Suspense, useMemo } from 'react';

import { DataTable, type TableColumn } from '@/components/ui';

import {
  buildInventoryCountListRows,
  INVENTORY_COUNT_LIST_COLUMNS,
  INVENTORY_COUNT_PAGE_PRESENTATION,
} from './counts-page';
import { InventoryCountsPageScaffold } from './counts-page-view';
import { useCountsPageVm } from './use-counts-page-vm';

function getInventoryCountTableColumns(): TableColumn[] {
  return INVENTORY_COUNT_LIST_COLUMNS.map((column) => ({
    key: column.key,
    label: column.label,
    width:
      column.key === 'countNumber'
        ? 150
        : column.key === 'warehouseName'
          ? 120
          : column.key === 'date'
            ? 110
            : column.key === 'lineCount'
              ? 90
              : column.key === 'differenceCount'
                ? 90
                : column.key === 'ownerName'
                  ? 100
                  : 100,
  })) satisfies TableColumn[];
}

function InventoryCountsPageContent() {
  const { keywordInput, setKeywordInput, filterInput, setFilterInput, visibleItems } = useCountsPageVm();
  const rows = useMemo(() => buildInventoryCountListRows(visibleItems), [visibleItems]);
  const tableRows = useMemo<Record<string, string>[]>(
    () =>
      rows.map(({ id, countNumber, warehouseName, date, lineCount, differenceCount, ownerName, status }) => ({
        id,
        countNumber,
        warehouseName,
        date,
        lineCount,
        differenceCount,
        ownerName,
        status,
      })),
    [rows],
  );
  const columns = useMemo(() => getInventoryCountTableColumns(), []);

  return (
    <InventoryCountsPageScaffold
      title={INVENTORY_COUNT_PAGE_PRESENTATION.title}
      summary={INVENTORY_COUNT_PAGE_PRESENTATION.summary}
      primaryActionLabel={INVENTORY_COUNT_PAGE_PRESENTATION.primaryActionLabel}
      searchPlaceholder={INVENTORY_COUNT_PAGE_PRESENTATION.searchPlaceholder}
      keyword={keywordInput}
      onKeywordChange={setKeywordInput}
      activeFilter={filterInput}
      onFilterChange={setFilterInput}
      table={<DataTable columns={columns} rows={tableRows} showPagination={false} />}
    />
  );
}

export default function InventoryCountsPage() {
  return (
    <Suspense fallback={null}>
      <InventoryCountsPageContent />
    </Suspense>
  );
}
