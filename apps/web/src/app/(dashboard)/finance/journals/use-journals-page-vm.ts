'use client';

import { useMemo } from 'react';

import type { JournalListItem } from './journals-page';

const SEED_JOURNAL_LIST_ITEMS: readonly JournalListItem[] = [
  {
    id: 'je_1',
    code: 'DOC-JE-20260307-004',
    journalDate: '2026-03-07',
    summaryLabel: '采购收货暂估入账',
    ledgerName: '总账账簿',
    debitAmountLabel: '¥45,200',
    creditAmountLabel: '¥45,200',
    status: 'posted',
  },
  {
    id: 'je_2',
    code: 'DOC-JE-20260308-001',
    journalDate: '2026-03-08',
    summaryLabel: '销售收款确认',
    ledgerName: '总账账簿',
    debitAmountLabel: '¥18,960',
    creditAmountLabel: '¥18,960',
    status: 'draft',
  },
];

export function getSeedJournalListItems(): JournalListItem[] {
  return SEED_JOURNAL_LIST_ITEMS.map((item) => ({ ...item }));
}

export function useJournalsPageVm() {
  const items = useMemo(() => getSeedJournalListItems(), []);

  return {
    items,
    isSeedData: true,
  };
}
