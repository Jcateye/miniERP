import { createHmac } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { createAuthContextMiddleware } from './auth-context.middleware';

describe('authContextMiddleware (hmac + dev bypass)', () => {
  const secret = 'test-secret';

  function encodeContext(payload: Record<string, unknown>): string {
    return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  }

  function sign(value: string): string {
    return createHmac('sha256', secret).update(value).digest('hex');
  }

  function createRequest(headers: Record<string, string | undefined>): Request {
    return {
      headers,
      header: (name: string) => headers[name.toLowerCase()],
    } as unknown as Request;
  }

  function createResponse() {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });

    return {
      response: { status } as unknown as Response,
      status,
      json,
    };
  }

  async function runMiddleware(options: {
    readonly middleware: ReturnType<typeof createAuthContextMiddleware>;
    readonly request: Request;
    readonly response: Response;
  }): Promise<{ readonly nextCalled: boolean }> {
    let nextCalled = false;

    await new Promise<void>((resolve) => {
      let settled = false;

      const settle = () => {
        if (settled) {
          return;
        }
        settled = true;
        resolve();
      };

      const next = (() => {
        nextCalled = true;
        settle();
      }) as NextFunction;

      options.middleware(options.request, options.response, next);
      setImmediate(settle);
    });

    return { nextCalled };
  }

  it('rejects request when signature is invalid', async () => {
    const middleware = createAuthContextMiddleware({
      authMode: 'both',
      secret,
      nodeEnv: 'development',
    });

    const encoded = encodeContext({
      tenantId: '1001',
      actorId: '2001',
      permissions: ['evidence:link:create'],
      role: 'tenant_admin',
    });

    const request = createRequest({
      'x-auth-context': encoded,
      'x-auth-context-signature': '00',
    });

    const { response, status, json } = createResponse();

    const { nextCalled } = await runMiddleware({
      middleware,
      request,
      response,
    });

    expect(nextCalled).toBe(false);
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'AUTH_INVALID_CONTEXT',
        message: 'Missing or invalid authenticated context',
      },
    });
  });

  it('skips auth validation for health endpoint', async () => {
    const middleware = createAuthContextMiddleware({
      authMode: 'both',
      secret,
      nodeEnv: 'development',
    });

    const request = createRequest({});
    Object.assign(request, {
      path: '/health/live',
      originalUrl: '/health/live',
    });

    const { response, status } = createResponse();

    const { nextCalled } = await runMiddleware({
      middleware,
      request,
      response,
    });

    expect(nextCalled).toBe(true);
    expect(status).not.toHaveBeenCalled();
  });

  it('skips auth validation for prefixed health endpoint', async () => {
    const middleware = createAuthContextMiddleware({
      authMode: 'both',
      secret,
      nodeEnv: 'development',
    });

    const request = createRequest({});
    Object.assign(request, {
      path: '/api/health/ready',
      originalUrl: '/api/health/ready',
    });

    const { response, status } = createResponse();

    const { nextCalled } = await runMiddleware({
      middleware,
      request,
      response,
    });

    expect(nextCalled).toBe(true);
    expect(status).not.toHaveBeenCalled();
  });

  it('skips auth validation for swagger docs endpoint in development', async () => {
    const middleware = createAuthContextMiddleware({
      authMode: 'both',
      secret,
      nodeEnv: 'development',
    });

    const request = createRequest({});
    Object.assign(request, {
      path: '/api/docs',
      originalUrl: '/api/docs',
    });

    const { response, status } = createResponse();

    const { nextCalled } = await runMiddleware({
      middleware,
      request,
      response,
    });

    expect(nextCalled).toBe(true);
    expect(status).not.toHaveBeenCalled();
  });

  it('attaches development auth context when dev token is provided', async () => {
    const middleware = createAuthContextMiddleware({
      authMode: 'both',
      secret,
      nodeEnv: 'development',
    });

    const request = createRequest({
      authorization: 'Bearer dev-token',
      'x-tenant-id': '2002',
    }) as Request & { authContext?: unknown };

    const { response, status } = createResponse();

    const { nextCalled } = await runMiddleware({
      middleware,
      request,
      response,
    });

    expect(nextCalled).toBe(true);
    expect(status).not.toHaveBeenCalled();
    expect(request.authContext).toEqual({
      tenantId: '1',
      actorId: '9001',
      permissions: [
        'evidence:*',
        'erp:document:read',
        'masterdata.customer.read',
        'masterdata.customer.write',
        'masterdata.sku.read',
        'masterdata.sku.write',
        'masterdata.supplier.read',
        'masterdata.supplier.write',
        'masterdata.warehouse.read',
        'masterdata.warehouse.write',
      ],
      role: 'tenant_admin',
      schemaName: 'tenant_1',
    });
  });

  it('prefers signed auth context over dev-token fallback in development', async () => {
    const middleware = createAuthContextMiddleware({
      authMode: 'both',
      secret,
      nodeEnv: 'development',
    });

    const encoded = encodeContext({
      tenantId: '1001',
      actorId: '2001',
      permissions: ['erp:document:read'],
      role: 'tenant_admin',
      schemaName: 'tenant_1001',
    });

    const request = createRequest({
      authorization: 'Bearer dev-token',
      'x-auth-context': encoded,
      'x-auth-context-signature': sign(encoded),
    }) as Request & { authContext?: unknown };

    const { response, status } = createResponse();

    const { nextCalled } = await runMiddleware({
      middleware,
      request,
      response,
    });

    expect(nextCalled).toBe(true);
    expect(status).not.toHaveBeenCalled();
    expect(request.authContext).toEqual({
      tenantId: '1001',
      actorId: '2001',
      permissions: ['erp:document:read'],
      role: 'tenant_admin',
      schemaName: 'tenant_1001',
    });
  });

  it('does not allow dev token outside development', async () => {
    const middleware = createAuthContextMiddleware({
      authMode: 'both',
      secret,
      nodeEnv: 'test',
    });

    const request = createRequest({
      authorization: 'Bearer dev-token',
    });

    const { response, status, json } = createResponse();

    const { nextCalled } = await runMiddleware({
      middleware,
      request,
      response,
    });

    expect(nextCalled).toBe(false);
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'AUTH_INVALID_CONTEXT',
        message: 'Missing or invalid authenticated context',
      },
    });
  });

  it('does not attach dev auth context when authMode is jwt', async () => {
    const middleware = createAuthContextMiddleware({
      authMode: 'jwt',
      secret,
      jwtHs256Secret: 'jwt-secret',
      nodeEnv: 'development',
    });

    const request = createRequest({
      authorization: 'Bearer dev-token',
    });

    const { response, status, json } = createResponse();

    const { nextCalled } = await runMiddleware({
      middleware,
      request,
      response,
    });

    expect(nextCalled).toBe(false);
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'AUTH_INVALID_CONTEXT',
        message: 'Missing or invalid authenticated context',
      },
    });
  });

  it('does not skip auth validation for swagger docs endpoint in production', async () => {
    const middleware = createAuthContextMiddleware({
      authMode: 'both',
      secret,
      nodeEnv: 'production',
    });

    const request = createRequest({});
    Object.assign(request, {
      path: '/api/docs',
      originalUrl: '/api/docs',
    });

    const { response, status, json } = createResponse();

    const { nextCalled } = await runMiddleware({
      middleware,
      request,
      response,
    });

    expect(nextCalled).toBe(false);
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'AUTH_INVALID_CONTEXT',
        message: 'Missing or invalid authenticated context',
      },
    });
  });

  it('rejects request when schemaName is invalid in signed auth context', async () => {
    const middleware = createAuthContextMiddleware({
      authMode: 'both',
      secret,
      nodeEnv: 'test',
    });

    const encoded = encodeContext({
      tenantId: '1001',
      actorId: '2001',
      permissions: ['erp:document:read'],
      role: 'tenant_admin',
      schemaName: 'tenant-1001',
    });

    const request = createRequest({
      'x-auth-context': encoded,
      'x-auth-context-signature': sign(encoded),
    });

    const { response, status, json } = createResponse();

    const { nextCalled } = await runMiddleware({
      middleware,
      request,
      response,
    });

    expect(nextCalled).toBe(false);
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'AUTH_INVALID_CONTEXT',
        message: 'Authenticated context payload is invalid',
      },
    });
  });

  it('attaches parsed auth context when payload and signature are valid', async () => {
    const middleware = createAuthContextMiddleware({
      authMode: 'both',
      secret,
      nodeEnv: 'development',
    });

    const encoded = encodeContext({
      tenantId: '1001',
      actorId: '2001',
      permissions: [' evidence:link:create '],
      role: 'tenant_admin',
      schemaName: 'tenant_1001',
    });

    const request = createRequest({
      'x-auth-context': encoded,
      'x-auth-context-signature': sign(encoded),
    }) as Request & { authContext?: unknown };

    const { response } = createResponse();

    const { nextCalled } = await runMiddleware({
      middleware,
      request,
      response,
    });

    expect(nextCalled).toBe(true);
    expect(request.authContext).toEqual({
      tenantId: '1001',
      actorId: '2001',
      permissions: ['evidence:link:create'],
      role: 'tenant_admin',
      schemaName: 'tenant_1001',
    });
  });
});
