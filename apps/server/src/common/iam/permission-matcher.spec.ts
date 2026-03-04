import { hasAllRequiredPermissions } from './permission-matcher';

describe('hasAllRequiredPermissions', () => {
  it('returns true on exact permission match', () => {
    expect(
      hasAllRequiredPermissions(
        ['evidence:link:create'],
        ['evidence:link:create'],
      ),
    ).toBe(true);
  });

  it('returns false when permission is missing', () => {
    expect(
      hasAllRequiredPermissions(
        ['evidence:link:read'],
        ['evidence:link:create'],
      ),
    ).toBe(false);
  });

  it('supports wildcard prefix permissions', () => {
    expect(
      hasAllRequiredPermissions(
        ['evidence:*'],
        ['evidence:link:create', 'evidence:asset:update'],
      ),
    ).toBe(true);
  });
});
