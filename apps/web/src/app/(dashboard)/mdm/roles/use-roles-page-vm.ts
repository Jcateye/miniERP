'use client';

import { useMemo } from 'react';

import type { RoleListItem } from './roles-page';

const SEED_ROLE_LIST_ITEMS: readonly RoleListItem[] = [
  {
    id: 'role_001',
    name: '系统管理员',
    description: '拥有所有系统权限',
    permissionCountLabel: '全部',
    userCountLabel: '2',
    statusLabel: '启用',
  },
  {
    id: 'role_002',
    name: '采购员',
    description: '负责采购流程与供应商协同',
    permissionCountLabel: '12',
    userCountLabel: '5',
    statusLabel: '启用',
  },
];

export function getSeedRoleListItems(): RoleListItem[] {
  return SEED_ROLE_LIST_ITEMS.map((item) => ({ ...item }));
}

export function useRolesPageVm() {
  const items = useMemo(() => getSeedRoleListItems(), []);

  return {
    items,
  };
}
