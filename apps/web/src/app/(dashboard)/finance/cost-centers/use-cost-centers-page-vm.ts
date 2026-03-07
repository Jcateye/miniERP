'use client';

import { useMemo } from 'react';

import type { CostCenterListItem } from './cost-centers-page';

const SEED_COST_CENTER_LIST_ITEMS: readonly CostCenterListItem[] = [
  {
    id: 'cc_1',
    code: 'CC-PROD-SZ',
    name: '深圳生产中心',
    ownerName: '王生产经理',
    statusLabel: '启用',
  },
  {
    id: 'cc_2',
    code: 'CC-SHARED',
    name: '共享服务中心',
    ownerName: '李共享经理',
    statusLabel: '停用',
  },
];

export function getSeedCostCenterListItems(): CostCenterListItem[] {
  return SEED_COST_CENTER_LIST_ITEMS.map((item) => ({ ...item }));
}

export function useCostCentersPageVm() {
  const items = useMemo(() => getSeedCostCenterListItems(), []);

  return {
    items,
    isSeedData: true,
  };
}
