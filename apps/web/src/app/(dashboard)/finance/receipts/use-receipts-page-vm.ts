'use client';

import { useMemo } from 'react';

import type { ReceiptListItem } from './receipts-page';

const SEED_RECEIPT_LIST_ITEMS: readonly ReceiptListItem[] = [
  {
    id: 'rec_1',
    code: 'DOC-REC-20260306-008',
    customerName: '中兴通讯',
    receiptDate: '2026-03-06',
    amountLabel: '¥128,000',
    methodLabel: '银行转账',
    reconciledAmountLabel: '¥128,000',
    status: 'settled',
  },
  {
    id: 'rec_2',
    code: 'DOC-REC-20260307-002',
    customerName: '华南电子',
    receiptDate: '2026-03-07',
    amountLabel: '¥86,400',
    methodLabel: '承兑汇票',
    reconciledAmountLabel: '¥32,000',
    status: 'confirmed',
  },
];

export function getSeedReceiptListItems(): ReceiptListItem[] {
  return [...SEED_RECEIPT_LIST_ITEMS];
}

export function useReceiptsPageVm() {
  const items = useMemo(() => getSeedReceiptListItems(), []);

  return {
    items,
    isSeedData: true,
  };
}
