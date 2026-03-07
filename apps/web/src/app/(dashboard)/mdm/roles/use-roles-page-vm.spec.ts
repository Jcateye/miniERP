import { getSeedRoleListItems } from './use-roles-page-vm';

describe('roles page vm', () => {
  it('returns seeded role items while upstream source is pending', () => {
    expect(getSeedRoleListItems()).toEqual([
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
    ]);
  });

  it('returns fresh array and item objects on every call', () => {
    const first = getSeedRoleListItems();
    const second = getSeedRoleListItems();

    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    expect(second[0]?.name).toBe('系统管理员');
  });
});
