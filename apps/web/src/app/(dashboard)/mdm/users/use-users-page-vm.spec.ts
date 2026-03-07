import { getSeedUserListItems } from './use-users-page-vm';

describe('users page vm', () => {
  it('returns seeded user items while upstream source is pending', () => {
    expect(getSeedUserListItems()).toEqual([
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
    ]);
  });

  it('returns fresh array and item objects on every call', () => {
    const first = getSeedUserListItems();
    const second = getSeedUserListItems();

    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    expect(second[0]?.username).toBe('zhangsan');
  });
});
