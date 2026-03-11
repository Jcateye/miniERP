import { createServerHeaders, isFixtureFallbackEnabled } from './server-fixtures';

function decodeAuthContext(encoded: string) {
  return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as {
    readonly tenantId: string;
    readonly actorId: string;
    readonly permissions: readonly string[];
    readonly role: string;
  };
}

describe('server-fixtures environment guards', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalSecret = process.env.AUTH_CONTEXT_SECRET;
  const originalFallbackFlag = process.env.MINIERP_ENABLE_BFF_FIXTURE_FALLBACK;

  afterEach(() => {
    if (typeof originalNodeEnv === 'undefined') {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }

    if (typeof originalSecret === 'undefined') {
      delete process.env.AUTH_CONTEXT_SECRET;
    } else {
      process.env.AUTH_CONTEXT_SECRET = originalSecret;
    }

    if (typeof originalFallbackFlag === 'undefined') {
      delete process.env.MINIERP_ENABLE_BFF_FIXTURE_FALLBACK;
    } else {
      process.env.MINIERP_ENABLE_BFF_FIXTURE_FALLBACK = originalFallbackFlag;
    }
  });

  it('disables fixture fallback when NODE_ENV is missing', () => {
    delete process.env.NODE_ENV;

    expect(isFixtureFallbackEnabled()).toBe(false);
  });

  it('enables fixture fallback only when development and explicit flag are both set', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.MINIERP_ENABLE_BFF_FIXTURE_FALLBACK;
    expect(isFixtureFallbackEnabled()).toBe(false);

    process.env.MINIERP_ENABLE_BFF_FIXTURE_FALLBACK = 'true';
    expect(isFixtureFallbackEnabled()).toBe(true);

    process.env.NODE_ENV = 'test';
    expect(isFixtureFallbackEnabled()).toBe(false);

    process.env.NODE_ENV = 'production';
    expect(isFixtureFallbackEnabled()).toBe(false);
  });

  it('throws when secret is missing outside development/test', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.AUTH_CONTEXT_SECRET;

    expect(() => createServerHeaders()).toThrow('AUTH_CONTEXT_SECRET is required outside development/test');
  });

  it('includes masterdata permissions in auth context', () => {
    process.env.NODE_ENV = 'test';
    const headers = createServerHeaders();
    const encodedContext = headers['x-auth-context'];
    const authContext = decodeAuthContext(encodedContext);

    expect(authContext.permissions).toEqual(
      expect.arrayContaining([
        'masterdata.warehouse.read',
        'masterdata.warehouse.write',
        'masterdata.supplier.read',
        'masterdata.supplier.write',
        'masterdata.customer.read',
        'masterdata.customer.write',
        'masterdata.sku.read',
        'masterdata.sku.write',
      ]),
    );
  });

  it('adds dev authorization header only in development', () => {
    process.env.NODE_ENV = 'development';
    const developmentHeaders = createServerHeaders();
    expect(developmentHeaders.authorization).toBe('Bearer dev-token');
    expect(developmentHeaders['x-tenant-id']).toBeDefined();

    process.env.NODE_ENV = 'test';
    const testHeaders = createServerHeaders();
    expect(testHeaders.authorization).toBeUndefined();
  });
});
