'use client';

import { useMemo } from 'react';

import type { EndpointListItem } from './endpoints-page';

const SEED_ENDPOINT_LIST_ITEMS: readonly EndpointListItem[] = [
  {
    id: 'endpoint_wms',
    name: 'ERP-WMS 同步',
    typeLabel: 'REST',
    url: 'https://wms.example.com/api',
    statusLabel: '连接',
    lastSyncedLabel: '3 分钟前',
  },
  {
    id: 'endpoint_mes',
    name: 'ERP-MES 推送',
    typeLabel: 'Webhook',
    url: 'https://mes.example.com/webhook/orders',
    statusLabel: '断开',
    lastSyncedLabel: '2 小时前',
  },
];

export function getSeedEndpointListItems(): EndpointListItem[] {
  return SEED_ENDPOINT_LIST_ITEMS.map((item) => ({ ...item }));
}

export function useEndpointsPageVm() {
  const items = useMemo(() => getSeedEndpointListItems(), []);

  return {
    items,
  };
}
