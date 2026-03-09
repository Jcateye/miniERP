'use client';

import { useMemo } from 'react';

import type { IntegrationJobListItem } from './jobs-page';

const SEED_INTEGRATION_JOB_LIST_ITEMS: readonly IntegrationJobListItem[] = [
  {
    id: 'job_customer_sync',
    name: '客户主数据同步',
    endpointName: 'ERP-CRM 同步',
    scheduleLabel: '每 30 分钟',
    lastRunLabel: '10 分钟前',
    nextRunLabel: '20 分钟后',
    statusLabel: '运行中',
  },
  {
    id: 'job_order_retry',
    name: '销售订单补偿',
    endpointName: 'ERP-WMS 同步',
    scheduleLabel: '失败后每 15 分钟重试',
    lastRunLabel: '今天 09:30',
    nextRunLabel: '今天 09:45',
    statusLabel: '暂停',
  },
];

export function getSeedIntegrationJobListItems(): IntegrationJobListItem[] {
  return SEED_INTEGRATION_JOB_LIST_ITEMS.map((item) => ({ ...item }));
}

export function useIntegrationJobsPageVm() {
  const items = useMemo(() => getSeedIntegrationJobListItems(), []);

  return {
    items,
  };
}
