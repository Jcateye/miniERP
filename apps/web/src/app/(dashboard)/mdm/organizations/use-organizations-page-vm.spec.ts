import { getSeedOrganizationListItems } from './use-organizations-page-vm';

describe('organizations page vm', () => {
  it('returns seeded organization items while upstream source is pending', () => {
    expect(getSeedOrganizationListItems()).toEqual([
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
    ]);
  });

  it('returns fresh array and item objects on every call', () => {
    const first = getSeedOrganizationListItems();
    const second = getSeedOrganizationListItems();

    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    expect(second[0]?.name).toBe('深圳总部有限公司');
  });
});
