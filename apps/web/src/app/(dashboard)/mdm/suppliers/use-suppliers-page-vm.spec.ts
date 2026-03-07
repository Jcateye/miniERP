import {
  buildSuppliersNavigationTarget,
  getSeedSupplierListItems,
  getSuppliersNavigationReplaceTarget,
} from './use-suppliers-page-vm';

describe('suppliers page vm', () => {
  it('returns seeded supplier items while upstream source is pending', () => {
    expect(getSeedSupplierListItems()).toEqual([
      {
        id: 'supplier_001',
        code: 'V-001',
        name: '华为技术有限公司',
        contactPerson: '赵经理',
        qualificationExpiryLabel: '2026-06-15',
        cooperativeOrdersLabel: '42',
        statusLabel: '合格',
      },
      {
        id: 'supplier_002',
        code: 'V-002',
        name: '比亚迪供应链有限公司',
        contactPerson: '李经理',
        qualificationExpiryLabel: '2026-08-20',
        cooperativeOrdersLabel: '19',
        statusLabel: '合格',
      },
    ]);
  });

  it('returns fresh array and item objects on every call', () => {
    const first = getSeedSupplierListItems();
    const second = getSeedSupplierListItems();

    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    expect(second[0]?.code).toBe('V-001');
  });

  it('builds navigation target from pathname and keyword', () => {
    expect(
      buildSuppliersNavigationTarget('/mdm/suppliers', {
        keyword: ' 华为 ',
      }),
    ).toBe('/mdm/suppliers?keyword=%E5%8D%8E%E4%B8%BA');

    expect(
      buildSuppliersNavigationTarget('/mdm/suppliers', {
        keyword: ' ',
      }),
    ).toBe('/mdm/suppliers');
  });

  it('returns null when current URL already matches supplier keyword state', () => {
    expect(
      getSuppliersNavigationReplaceTarget(
        '/mdm/suppliers',
        new URLSearchParams('keyword=%E5%8D%8E%E4%B8%BA'),
        {
          keyword: ' 华为 ',
        },
      ),
    ).toBeNull();
  });

  it('returns next URL when supplier keyword state changes', () => {
    expect(
      getSuppliersNavigationReplaceTarget('/mdm/suppliers', new URLSearchParams('keyword=%E5%8D%8E%E4%B8%BA'), {
        keyword: ' 比亚迪 ',
      }),
    ).toBe('/mdm/suppliers?keyword=%E6%AF%94%E4%BA%9A%E8%BF%AA');
  });
});
