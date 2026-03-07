'use client';

import { useMemo } from 'react';

import type { UserListItem } from './users-page';

const SEED_USER_LIST_ITEMS: readonly UserListItem[] = [
  {
    id: 'user_001',
    username: 'zhangsan',
    name: '张三',
    roleLabel: '管理员',
    departmentLabel: '采购部',
    lastLoginLabel: '2 分钟前',
    statusLabel: '在线',
  },
  {
    id: 'user_002',
    username: 'lisi',
    name: '李四',
    roleLabel: '采购员',
    departmentLabel: '采购部',
    lastLoginLabel: '30 分钟前',
    statusLabel: '在线',
  },
];

export function getSeedUserListItems(): UserListItem[] {
  return SEED_USER_LIST_ITEMS.map((item) => ({ ...item }));
}

export function useUsersPageVm() {
  const items = useMemo(() => getSeedUserListItems(), []);

  return {
    items,
  };
}
