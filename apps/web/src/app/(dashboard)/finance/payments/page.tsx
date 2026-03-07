'use client';

import { Suspense, useMemo } from 'react';

import { DataTable, type TableColumn } from '@/components/ui';

import {
  buildPaymentListRows,
  PAYMENT_LIST_COLUMNS,
  PAYMENT_PAGE_PRESENTATION,
  type PaymentListRow,
} from './payments-page';
import { PaymentsPageScaffold } from './payments-page-view';
import { usePaymentsPageVm } from './use-payments-page-vm';

function getPaymentTableColumns(): TableColumn[] {
  return PAYMENT_LIST_COLUMNS.map((column) => ({
    key: column.key,
    label: column.label,
    width:
      column.key === 'code'
        ? 130
        : column.key === 'supplierName'
          ? 120
          : column.key === 'paymentDate'
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

function PaymentsPageContent() {
  const { items } = usePaymentsPageVm();
  const rows = useMemo<PaymentListRow[]>(() => buildPaymentListRows(items), [items]);
  const columns = useMemo(() => getPaymentTableColumns(), []);

  return (
    <PaymentsPageScaffold
      title={PAYMENT_PAGE_PRESENTATION.title}
      summary={PAYMENT_PAGE_PRESENTATION.summary}
      primaryActionLabel={PAYMENT_PAGE_PRESENTATION.primaryActionLabel}
      seedNotice={PAYMENT_PAGE_PRESENTATION.seedNotice}
      table={<DataTable columns={columns} rows={rows as unknown as Record<string, string>[]} />}
    />
  );
}

export default function FinancePaymentsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '32px 40px', fontSize: 14, color: '#666666', background: '#F5F3EF' }}>
          正在加载付款列表...
        </div>
      }
    >
      <PaymentsPageContent />
    </Suspense>
  );
}
