import { getSeedGlAccountListItems } from './use-gl-accounts-page-vm';

describe('gl accounts page vm', () => {
  it('returns seeded gl account items while upstream source is pending', () => {
    expect(getSeedGlAccountListItems()).toEqual([
      {
        id: 'gl_1001',
        code: '1001',
        name: '银行存款',
        categoryLabel: '资产',
        currencyControlledLabel: '否',
        parentAccountLabel: null,
        statusLabel: '启用',
        level: 0,
      },
      {
        id: 'gl_100101',
        code: '100101',
        name: '工行基本户',
        categoryLabel: '资产',
        currencyControlledLabel: '否',
        parentAccountLabel: '银行存款',
        statusLabel: '启用',
        level: 1,
      },
    ]);
  });

  it('returns fresh array and item objects on every call', () => {
    const first = getSeedGlAccountListItems();
    const second = getSeedGlAccountListItems();

    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    expect(second[0]?.name).toBe('银行存款');
  });
});
