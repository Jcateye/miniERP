import { getSeedCostCenterListItems } from './use-cost-centers-page-vm';

describe('cost centers page vm', () => {
  it('returns seeded cost center items while upstream source is pending', () => {
    expect(getSeedCostCenterListItems()).toEqual([
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
    ]);
  });

  it('returns fresh array and item objects on every call', () => {
    const first = getSeedCostCenterListItems();
    const second = getSeedCostCenterListItems();

    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    expect(second[0]?.name).toBe('深圳生产中心');
  });
});
