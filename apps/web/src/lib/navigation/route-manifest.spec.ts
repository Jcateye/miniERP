import {
  getPrimaryNavItem,
  getPrimarySecondaryNav,
  isRouteActive,
} from './route-manifest';

describe('route manifest navigation', () => {
  it('matches primary domains by business prefixes instead of exact href only', () => {
    expect(getPrimaryNavItem('/workspace')?.key).toBe('workspace');
    expect(getPrimaryNavItem('/mdm/items')?.key).toBe('mdm');
    expect(getPrimaryNavItem('/reports/sales')?.key).toBe('reports');
  });

  it('resolves secondary navigation for the active primary section', () => {
    const reportGroups = getPrimarySecondaryNav('/reports/finance');
    const reportItems = reportGroups.flatMap((group) => group.items.map((item) => item.label));

    expect(reportItems).toContain('报表中心');
  });

  it('treats child routes as active for expandable secondary menu items', () => {
    expect(isRouteActive('/workspace', '/workspace')).toBe(true);
    expect(isRouteActive('/reports/sales', '/reports')).toBe(true);
  });
});
