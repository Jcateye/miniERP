import {
  buildWarehousesNavigationTarget,
  buildWarehousesRequestPath,
} from './use-warehouses-page-vm';

describe('warehouses page vm', () => {
  it('builds request path without forwarding local keyword filters upstream', () => {
    expect(
      buildWarehousesRequestPath({
        keyword: ' WH-001 ',
      }),
    ).toBe('/api/bff/warehouses');
  });

  it('builds navigation target from pathname and keyword', () => {
    expect(
      buildWarehousesNavigationTarget('/mdm/warehouses', {
        keyword: ' 深圳 ',
      }),
    ).toBe('/mdm/warehouses?keyword=%E6%B7%B1%E5%9C%B3');

    expect(
      buildWarehousesNavigationTarget('/mdm/warehouses', {
        keyword: ' ',
      }),
    ).toBe('/mdm/warehouses');
  });
});
