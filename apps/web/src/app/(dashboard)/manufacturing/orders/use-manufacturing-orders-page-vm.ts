'use client';

import { useMemo } from 'react';

import type { ManufacturingOrderListItem } from './manufacturing-orders-page';

const SEED_MANUFACTURING_ORDER_LIST_ITEMS: readonly ManufacturingOrderListItem[] = [
  {
    id: 'mo_1',
    orderNumber: 'DOC-MO-20260308-001',
    itemName: 'Mac mini M4 装配批次 A',
    bomVersion: 'BOM v2026.03',
    plannedQuantityLabel: '120 台',
    plannedStartAtLabel: '03-10 08:30',
    ownerName: '李计划',
    statusLabel: '已下达',
  },
  {
    id: 'mo_2',
    orderNumber: 'DOC-MO-20260308-002',
    itemName: 'Studio Display 总装批次 B',
    bomVersion: 'BOM v2026.02',
    plannedQuantityLabel: '48 台',
    plannedStartAtLabel: '03-11 13:00',
    ownerName: '周排产',
    statusLabel: '待齐套',
  },
];

export function getSeedManufacturingOrderListItems(): ManufacturingOrderListItem[] {
  return SEED_MANUFACTURING_ORDER_LIST_ITEMS.map((item) => ({ ...item }));
}

export function useManufacturingOrdersPageVm() {
  const items = useMemo(() => getSeedManufacturingOrderListItems(), []);

  return {
    items,
    isSeedData: true,
  };
}
