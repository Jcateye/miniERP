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
  });

  it('disables fixture fallback when NODE_ENV is missing', () => {
    delete process.env.NODE_ENV;

    expect(isFixtureFallbackEnabled()).toBe(false);
  });

  it('enables fixture fallback only in development/test', () => {
    process.env.NODE_ENV = 'development';
    expect(isFixtureFallbackEnabled()).toBe(true);

    process.env.NODE_ENV = 'test';
    expect(isFixtureFallbackEnabled()).toBe(true);

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
      ]),
    );
  });
});
