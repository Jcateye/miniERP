import { getSeedEndpointListItems } from './use-endpoints-page-vm';

describe('integration endpoints page vm', () => {
  it('returns seeded endpoint items while upstream source is pending', () => {
    expect(getSeedEndpointListItems()).toEqual([
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
    ]);
  });

  it('returns fresh array and item objects on every call', () => {
    const first = getSeedEndpointListItems();
    const second = getSeedEndpointListItems();

    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    expect(second[0]?.name).toBe('ERP-WMS 同步');
  });
});
