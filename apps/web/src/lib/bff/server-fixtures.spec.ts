import { createServerHeaders, isFixtureFallbackEnabled } from './server-fixtures';

function decodeAuthContext(encoded: string) {
  return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as {
    readonly tenantId: string;
    readonly actorId: string;
    readonly permissions: readonly string[];
    readonly role: string;
    readonly schemaName?: string;
  };
}

describe('server-fixtures environment guards', () => {
  const env = process.env as Record<string, string | undefined>;
  const originalNodeEnv = env.NODE_ENV;
  const originalSecret = env.AUTH_CONTEXT_SECRET;
  const originalFallbackFlag = env.MINIERP_ENABLE_BFF_FIXTURE_FALLBACK;

  afterEach(() => {
    if (typeof originalNodeEnv === 'undefined') {
      delete env.NODE_ENV;
    } else {
      env.NODE_ENV = originalNodeEnv;
    }

    if (typeof originalSecret === 'undefined') {
      delete env.AUTH_CONTEXT_SECRET;
    } else {
      env.AUTH_CONTEXT_SECRET = originalSecret;
    }

    if (typeof originalFallbackFlag === 'undefined') {
      delete env.MINIERP_ENABLE_BFF_FIXTURE_FALLBACK;
    } else {
      env.MINIERP_ENABLE_BFF_FIXTURE_FALLBACK = originalFallbackFlag;
    }
  });

  it('disables fixture fallback when NODE_ENV is missing', () => {
    delete env.NODE_ENV;

    expect(isFixtureFallbackEnabled()).toBe(false);
  });

  it('enables fixture fallback only when development and explicit flag are both set', () => {
    env.NODE_ENV = 'development';
    delete env.MINIERP_ENABLE_BFF_FIXTURE_FALLBACK;
    expect(isFixtureFallbackEnabled()).toBe(false);

    env.MINIERP_ENABLE_BFF_FIXTURE_FALLBACK = 'true';
    expect(isFixtureFallbackEnabled()).toBe(true);

    env.NODE_ENV = 'test';
    expect(isFixtureFallbackEnabled()).toBe(false);

    env.NODE_ENV = 'production';
    expect(isFixtureFallbackEnabled()).toBe(false);
  });

  it('throws when secret is missing outside development/test', () => {
    env.NODE_ENV = 'production';
    delete env.AUTH_CONTEXT_SECRET;

    expect(() => createServerHeaders()).toThrow('AUTH_CONTEXT_SECRET is required outside development/test');
  });

  it('includes schemaName in auth context', () => {
    env.NODE_ENV = 'test';
    env.MINIERP_TENANT_SCHEMA = 'tenant_1001';

    const headers = createServerHeaders();
    const authContext = decodeAuthContext(headers['x-auth-context']);

    expect(authContext.schemaName).toBe('tenant_1001');
  });

  it('includes masterdata and document permissions in auth context', () => {
    env.NODE_ENV = 'test';
    const headers = createServerHeaders();
    const encodedContext = headers['x-auth-context'];
    const authContext = decodeAuthContext(encodedContext);

    expect(authContext.permissions).toEqual(
      expect.arrayContaining([
        'erp:document:read',
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
    env.NODE_ENV = 'development';
    const developmentHeaders = createServerHeaders();
    expect(developmentHeaders.authorization).toBe('Bearer dev-token');
    expect(developmentHeaders['x-tenant-id']).toBeUndefined();
    expect(decodeAuthContext(developmentHeaders['x-auth-context']).tenantId).toBe(
      '1',
    );
    expect(decodeAuthContext(developmentHeaders['x-auth-context']).actorId).toBe(
      'dev-user',
    );

    env.NODE_ENV = 'test';
    const testHeaders = createServerHeaders();
    expect(testHeaders.authorization).toBeUndefined();
    expect(testHeaders['x-tenant-id']).toBeDefined();
  });
});
