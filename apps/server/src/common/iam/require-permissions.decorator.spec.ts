import { RequirePermissions } from './require-permissions.decorator';

describe('RequirePermissions', () => {
  it('returns a decorator function', () => {
    const decorator = RequirePermissions('evidence:link:create');
    expect(typeof decorator).toBe('function');
  });
});
