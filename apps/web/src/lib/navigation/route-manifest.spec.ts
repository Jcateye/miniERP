import {
  getPrimaryNavItem,
  getPrimarySecondaryNav,
  isRouteActive,
} from './route-manifest';

describe('route manifest navigation', () => {
  it('matches primary domains by business prefixes instead of exact href only', () => {
    expect(getPrimaryNavItem('/quality/records')?.key).toBe('manufacturing');
    expect(getPrimaryNavItem('/integration/jobs')?.key).toBe('platform');
    expect(getPrimaryNavItem('/finance/receipts/new')?.key).toBe('finance');
  });

  it('resolves secondary navigation for the active primary section', () => {
    const financeGroups = getPrimarySecondaryNav('/finance/receipts');
    const financeItems = financeGroups.flatMap((group) => group.items.map((item) => item.label));

    expect(financeItems).toContain('发票管理');
    expect(financeItems).toContain('收款管理');
    expect(financeItems).toContain('期间结账');
  });

  it('treats child routes as active for expandable secondary menu items', () => {
    expect(isRouteActive('/inventory/counts/new', '/inventory/counts')).toBe(true);
    expect(isRouteActive('/reports/sales', '/reports')).toBe(true);
  });
});
