import {
  buildCustomersNavigationTarget,
  buildCustomersRequestPath,
} from './use-customers-page-vm';

describe('customers page vm', () => {
  it('builds request path from active customer filters', () => {
    expect(
      buildCustomersRequestPath({
        keyword: ' Alice ',
        status: 'active',
      }),
    ).toBe('/api/bff/customers?keyword=Alice&status=active');
  });

  it('builds navigation target from pathname and filters', () => {
    expect(
      buildCustomersNavigationTarget('/mdm/customers', {
        keyword: ' Alice ',
        status: '',
      }),
    ).toBe('/mdm/customers?keyword=Alice');

    expect(
      buildCustomersNavigationTarget('/mdm/customers', {
        keyword: ' ',
        status: '',
      }),
    ).toBe('/mdm/customers');
  });
});
