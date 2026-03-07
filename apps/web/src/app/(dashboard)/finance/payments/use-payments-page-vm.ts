'use client';

import { useMemo } from 'react';

import type { PaymentListItem } from './payments-page';

const SEED_PAYMENT_LIST_ITEMS: readonly PaymentListItem[] = [
  {
    id: 'pay_1',
    code: 'DOC-PAY-20260304-012',
    supplierName: '华为技术',
    paymentDate: '2026-03-04',
    amountLabel: '¥45,200',
    methodLabel: '电汇',
    reconciledAmountLabel: '¥45,200',
    status: 'confirmed',
  },
  {
    id: 'pay_2',
    code: 'DOC-PAY-20260305-003',
    supplierName: '立讯精密',
    paymentDate: '2026-03-05',
    amountLabel: '¥12,800',
    methodLabel: '承兑汇票',
    reconciledAmountLabel: '¥4,000',
    status: 'settled',
  },
];

export function getSeedPaymentListItems(): PaymentListItem[] {
  return SEED_PAYMENT_LIST_ITEMS.map((item) => ({ ...item }));
}

export function usePaymentsPageVm() {
  const items = useMemo(() => getSeedPaymentListItems(), []);

  return {
    items,
    isSeedData: true,
  };
}
