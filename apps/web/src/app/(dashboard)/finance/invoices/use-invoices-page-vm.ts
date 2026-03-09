'use client';

import { useMemo } from 'react';

import type { InvoiceListItem } from './invoices-page';

const SEED_INVOICE_LIST_ITEMS: readonly InvoiceListItem[] = [
  {
    id: 'inv_1',
    code: 'DOC-INV-20260306-003',
    counterpartyName: '华为技术',
    issuedDate: '2026-03-06',
    amountLabel: '¥45,200',
    outstandingAmountLabel: '¥12,000',
    categoryLabel: '增值税专票',
    status: 'issued',
  },
  {
    id: 'inv_2',
    code: 'DOC-INV-20260307-001',
    counterpartyName: '立讯精密',
    issuedDate: '2026-03-07',
    amountLabel: '¥18,960',
    outstandingAmountLabel: '¥18,960',
    categoryLabel: '电子发票',
    status: 'draft',
  },
];

export function getSeedInvoiceListItems(): InvoiceListItem[] {
  return SEED_INVOICE_LIST_ITEMS.map((item) => ({ ...item }));
}

export function useInvoicesPageVm() {
  const items = useMemo(() => getSeedInvoiceListItems(), []);

  return {
    items,
    isSeedData: true,
  };
}
