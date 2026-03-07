'use client';

import { Suspense, useMemo } from 'react';

import { DataTable, type TableColumn } from '@/components/ui';

import {
  buildReceiptListRows,
  RECEIPT_LIST_COLUMNS,
  RECEIPT_PAGE_PRESENTATION,
  type ReceiptListRow,
} from './receipts-page';
import { ReceiptsPageScaffold } from './receipts-page-view';
import { useReceiptsPageVm } from './use-receipts-page-vm';

function getReceiptTableColumns(): TableColumn[] {
  return RECEIPT_LIST_COLUMNS.map((column) => ({
    key: column.key,
    label: column.label,
    width:
      column.key === 'code'
        ? 130
        : column.key === 'customerName'
          ? 120
          : column.key === 'receiptDate'
            ? 100
            : column.key === 'amount'
              ? 100
              : column.key === 'method'
                ? 80
                : column.key === 'reconciledAmount'
                  ? 100
                  : undefined,
  })) satisfies TableColumn[];
}

function ReceiptsPageContent() {
  const { items } = useReceiptsPageVm();
  const rows = useMemo<ReceiptListRow[]>(() => buildReceiptListRows(items), [items]);
  const columns = useMemo(() => getReceiptTableColumns(), []);

  return (
    <ReceiptsPageScaffold
      title={RECEIPT_PAGE_PRESENTATION.title}
      summary={RECEIPT_PAGE_PRESENTATION.summary}
      primaryActionLabel={RECEIPT_PAGE_PRESENTATION.primaryActionLabel}
      seedNotice={RECEIPT_PAGE_PRESENTATION.seedNotice}
      table={<DataTable columns={columns} rows={rows as unknown as Record<string, string>[]} />}
    />
  );
}

export default function FinanceReceiptsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '32px 40px', fontSize: 14, color: '#666666', background: '#F5F3EF' }}>
          正在加载收款列表...
        </div>
      }
    >
      <ReceiptsPageContent />
    </Suspense>
  );
}
