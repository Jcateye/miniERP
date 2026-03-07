'use client';

import { useMemo } from 'react';

import type { OrganizationListItem } from './organizations-page';

const SEED_ORGANIZATION_LIST_ITEMS: readonly OrganizationListItem[] = [
  {
    id: 'org_001',
    code: 'ORG-001',
    name: '深圳总部有限公司',
    typeLabel: '公司',
    parentName: null,
    statusLabel: '活跃',
  },
  {
    id: 'org_002',
    code: 'ORG-002',
    name: '华南供应链中心',
    typeLabel: '业务单元',
    parentName: '深圳总部有限公司',
    statusLabel: '活跃',
  },
];

export function getSeedOrganizationListItems(): OrganizationListItem[] {
  return SEED_ORGANIZATION_LIST_ITEMS.map((item) => ({ ...item }));
}

export function useOrganizationsPageVm() {
  const items = useMemo(() => getSeedOrganizationListItems(), []);

  return {
    items,
  };
}
