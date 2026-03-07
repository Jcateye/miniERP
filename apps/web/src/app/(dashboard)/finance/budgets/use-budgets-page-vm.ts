'use client';

import { useMemo } from 'react';

import type { BudgetListItem } from './budgets-page';

const SEED_BUDGET_LIST_ITEMS: readonly BudgetListItem[] = [
  {
    id: 'bdg_2026_q1',
    code: 'BDG-2026-Q1',
    name: '采购部Q1预算',
    periodLabel: '2026-Q1',
    budgetAmountLabel: '¥500K',
    usedAmountLabel: '¥320K',
    remainingAmountLabel: '¥180K',
    statusLabel: '执行中',
  },
  {
    id: 'bdg_2026_q2',
    code: 'BDG-2026-Q2',
    name: '市场部Q2预算',
    periodLabel: '2026-Q2',
    budgetAmountLabel: '¥300K',
    usedAmountLabel: '¥120K',
    remainingAmountLabel: '¥180K',
    statusLabel: '草稿',
  },
];

export function getSeedBudgetListItems(): BudgetListItem[] {
  return SEED_BUDGET_LIST_ITEMS.map((item) => ({ ...item }));
}

export function useBudgetsPageVm() {
  const items = useMemo(() => getSeedBudgetListItems(), []);

  return {
    items,
    isSeedData: true,
  };
}
