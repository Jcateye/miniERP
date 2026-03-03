import { createHmac } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { createAuthContextMiddleware } from './auth-context.middleware';

describe('authContextMiddleware', () => {
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

  it('rejects request when signature is invalid', () => {
    const middleware = createAuthContextMiddleware({ secret });
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
    const next = jest.fn() as NextFunction;

    middleware(request, response, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'AUTH_INVALID_CONTEXT',
        message: 'Missing or invalid authenticated context',
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('skips auth validation for health endpoint', () => {
    const middleware = createAuthContextMiddleware({ secret });
    const request = createRequest({});
    Object.assign(request, {
      path: '/health/live',
      originalUrl: '/health/live',
    });
    const { response, status } = createResponse();
    const next = jest.fn() as NextFunction;

    middleware(request, response, next);

    expect(next).toHaveBeenCalled();
    expect(status).not.toHaveBeenCalled();
  });

  it('skips auth validation for prefixed health endpoint', () => {
    const middleware = createAuthContextMiddleware({ secret });
    const request = createRequest({});
    Object.assign(request, {
      path: '/api/health/ready',
      originalUrl: '/api/health/ready',
    });
    const { response, status } = createResponse();
    const next = jest.fn() as NextFunction;

    middleware(request, response, next);

    expect(next).toHaveBeenCalled();
    expect(status).not.toHaveBeenCalled();
  });

  it('attaches parsed auth context when payload and signature are valid', () => {
    const middleware = createAuthContextMiddleware({ secret });
    const encoded = encodeContext({
      tenantId: '1001',
      actorId: '2001',
      permissions: [' evidence:link:create '],
      role: 'tenant_admin',
    });
    const request = createRequest({
      'x-auth-context': encoded,
      'x-auth-context-signature': sign(encoded),
    }) as Request & { authContext?: unknown };
    const { response } = createResponse();

    middleware(request, response, () => {
      expect(request.authContext).toEqual({
        tenantId: '1001',
        actorId: '2001',
        permissions: ['evidence:link:create'],
        role: 'tenant_admin',
      });
    });
  });
});
