'use client';

import { useMemo } from 'react';

import type { GlAccountListItem } from './gl-accounts-page';

const SEED_GL_ACCOUNT_LIST_ITEMS: readonly GlAccountListItem[] = [
  {
    id: 'gl_1001',
    code: '1001',
    name: '银行存款',
    categoryLabel: '资产',
    currencyControlledLabel: '否',
    parentAccountLabel: null,
    statusLabel: '启用',
    level: 0,
  },
  {
    id: 'gl_100101',
    code: '100101',
    name: '工行基本户',
    categoryLabel: '资产',
    currencyControlledLabel: '否',
    parentAccountLabel: '银行存款',
    statusLabel: '启用',
    level: 1,
  },
];

export function getSeedGlAccountListItems(): GlAccountListItem[] {
  return SEED_GL_ACCOUNT_LIST_ITEMS.map((item) => ({ ...item }));
}

export function useGlAccountsPageVm() {
  const items = useMemo(() => getSeedGlAccountListItems(), []);

  return {
    items,
    isSeedData: true,
  };
}
