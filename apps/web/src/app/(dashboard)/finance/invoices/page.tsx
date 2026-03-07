'use client';

import { Suspense, useMemo } from 'react';

import { DataTable, type TableColumn } from '@/components/ui';

import {
  buildInvoiceListRows,
  INVOICE_LIST_COLUMNS,
  INVOICE_PAGE_PRESENTATION,
  type InvoiceListRow,
} from './invoices-page';
import { InvoicesPageScaffold } from './invoices-page-view';
import { useInvoicesPageVm } from './use-invoices-page-vm';

function getInvoiceTableColumns(): TableColumn[] {
  return INVOICE_LIST_COLUMNS.map((column) => ({
    key: column.key,
    label: column.label,
    width:
      column.key === 'code'
        ? 130
        : column.key === 'counterpartyName'
          ? 120
          : column.key === 'issuedDate'
            ? 100
            : column.key === 'amount'
              ? 100
              : column.key === 'outstandingAmount'
                ? 100
                : column.key === 'category'
                  ? 100
                  : undefined,
  })) satisfies TableColumn[];
}

function FinanceInvoicesPageContent() {
  const { items } = useInvoicesPageVm();
  const rows = useMemo<InvoiceListRow[]>(() => buildInvoiceListRows(items), [items]);
  const columns = useMemo(() => getInvoiceTableColumns(), []);

  return (
    <InvoicesPageScaffold
      title={INVOICE_PAGE_PRESENTATION.title}
      summary={INVOICE_PAGE_PRESENTATION.summary}
      primaryActionLabel={INVOICE_PAGE_PRESENTATION.primaryActionLabel}
      seedNotice={INVOICE_PAGE_PRESENTATION.seedNotice}
      table={<DataTable columns={columns} rows={rows as unknown as Record<string, string>[]} />}
    />
  );
}

export default function FinanceInvoicesPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '32px 40px', fontSize: 14, color: '#666666', background: '#F5F3EF' }}>
          正在加载发票列表...
        </div>
      }
    >
      <FinanceInvoicesPageContent />
    </Suspense>
  );
}
