'use client';

import { Suspense, useMemo } from 'react';

import { DataTable, type TableColumn } from '@/components/ui';

import {
  buildInventoryLedgerRows,
  getSeedInventoryLedgerItems,
  INVENTORY_LEDGER_COLUMNS,
  INVENTORY_LEDGER_PAGE_PRESENTATION,
} from './ledger-page';
import { InventoryLedgerPageScaffold } from './ledger-page-view';

function getInventoryLedgerTableColumns(): TableColumn[] {
  return INVENTORY_LEDGER_COLUMNS.map((column) => ({
    key: column.key,
    label: column.label,
    width:
      column.key === 'date'
        ? 110
        : column.key === 'itemCode'
          ? 150
          : column.key === 'warehouseName'
            ? 110
            : column.key === 'businessType'
              ? 120
              : column.key === 'direction'
                ? 80
                : column.key === 'quantity'
                  ? 80
                  : column.key === 'documentNumber'
                    ? 170
                    : 100,
  })) satisfies TableColumn[];
}

function InventoryLedgerPageContent() {
  const rows = useMemo(() => buildInventoryLedgerRows(getSeedInventoryLedgerItems()), []);
  const tableRows = useMemo<Record<string, string>[]>(
    () =>
      rows.map(({ id, date, itemCode, warehouseName, businessType, direction, quantity, documentNumber, operatorName }) => ({
        id,
        date,
        itemCode,
        warehouseName,
        businessType,
        direction,
        quantity,
        documentNumber,
        operatorName,
      })),
    [rows],
  );
  const columns = useMemo(() => getInventoryLedgerTableColumns(), []);

  return (
    <InventoryLedgerPageScaffold
      title={INVENTORY_LEDGER_PAGE_PRESENTATION.title}
      summary={INVENTORY_LEDGER_PAGE_PRESENTATION.summary}
      searchPlaceholder={INVENTORY_LEDGER_PAGE_PRESENTATION.searchPlaceholder}
      table={<DataTable columns={columns} rows={tableRows} showPagination={false} />}
    />
  );
}

export default function InventoryLedgerPage() {
  return (
    <Suspense fallback={null}>
      <InventoryLedgerPageContent />
    </Suspense>
  );
}
