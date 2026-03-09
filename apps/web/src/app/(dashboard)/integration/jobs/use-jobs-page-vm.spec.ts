import { getSeedIntegrationJobListItems } from './use-jobs-page-vm';

describe('integration jobs page vm', () => {
  it('returns seeded integration job items while upstream source is pending', () => {
    expect(getSeedIntegrationJobListItems()).toEqual([
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
    ]);
  });

  it('returns fresh array and item objects on every call', () => {
    const first = getSeedIntegrationJobListItems();
    const second = getSeedIntegrationJobListItems();

    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    expect(second[0]?.name).toBe('客户主数据同步');
  });
});
