'use client';

import { useMemo } from 'react';

import type { ReplenishmentListItem } from './replenishment-page';

const SEED_REPLENISHMENT_LIST_ITEMS: readonly ReplenishmentListItem[] = [
  {
    id: 'rep_1',
    itemCode: 'ADP-USBC-VGA',
    itemName: 'USB-C转VGA转换器',
    currentStockLabel: '15',
    safetyStockLabel: '50',
    gapLabel: '-35',
    suggestedPurchaseQuantityLabel: '100',
    leadTimeLabel: '7 天',
  },
  {
    id: 'rep_2',
    itemCode: 'CAB-HDMI-2M',
    itemName: 'HDMI 2米线',
    currentStockLabel: '22',
    safetyStockLabel: '40',
    gapLabel: '-18',
    suggestedPurchaseQuantityLabel: '60',
    leadTimeLabel: '5 天',
  },
];

export function getSeedReplenishmentListItems(): ReplenishmentListItem[] {
  return SEED_REPLENISHMENT_LIST_ITEMS.map((item) => ({ ...item }));
}

export function useReplenishmentPageVm() {
  const items = useMemo(() => getSeedReplenishmentListItems(), []);

  return {
    items,
    isSeedData: true,
  };
}
