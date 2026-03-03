import { RequirePlatformAction } from './require-platform-action.decorator';

describe('RequirePlatformAction', () => {
  it('returns a decorator function', () => {
    const decorator = RequirePlatformAction('platform.audit.read');
    expect(typeof decorator).toBe('function');
  });
});
