'use client';

import { useMemo } from 'react';

import type { AdjustmentListItem } from './adjustments-page';

const SEED_ADJUSTMENT_LIST_ITEMS: readonly AdjustmentListItem[] = [
  {
    id: 'adj_1',
    documentNumber: 'DOC-ADJ-20260306-002',
    warehouseName: '深圳总仓',
    dateLabel: '2026-03-06',
    lineCountLabel: '3',
    quantityLabel: '-4',
    reasonLabel: '盘点差异调整',
    statusLabel: '已过账',
  },
  {
    id: 'adj_2',
    documentNumber: 'DOC-ADJ-20260307-001',
    warehouseName: '苏州成品仓',
    dateLabel: '2026-03-07',
    lineCountLabel: '2',
    quantityLabel: '+6',
    reasonLabel: '库位纠偏',
    statusLabel: '草稿',
  },
];

export function getSeedAdjustmentListItems(): AdjustmentListItem[] {
  return SEED_ADJUSTMENT_LIST_ITEMS.map((item) => ({ ...item }));
}

export function useAdjustmentsPageVm() {
  const items = useMemo(() => getSeedAdjustmentListItems(), []);

  return {
    items,
    isSeedData: true,
  };
}
