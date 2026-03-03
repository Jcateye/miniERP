import type { NextFunction, Request, Response } from 'express';
import { createTenantContextMiddleware } from './tenant-context.middleware';
import { tenantContextStorage } from './tenant-context';

describe('tenantContextMiddleware', () => {
  function createRequest(
    headers: Record<string, string | undefined>,
    path = '/api/evidence',
  ): Request & { authContext?: unknown } {
    return {
      headers,
      path,
      originalUrl: path,
      header: (name: string) => headers[name.toLowerCase()],
    } as unknown as Request & { authContext?: unknown };
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

  it('returns TENANT_MISSING when tenant header is absent', () => {
    const middleware = createTenantContextMiddleware('x-tenant-id');
    const request = createRequest({});
    const { response, status, json } = createResponse();
    const next = jest.fn() as NextFunction;

    middleware(request, response, next);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'TENANT_MISSING',
        message: 'Missing required tenant header: x-tenant-id',
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('uses authenticated context tenant and actor when present', () => {
    const middleware = createTenantContextMiddleware('x-tenant-id');
    const request = createRequest({
      'x-request-id': 'req-fixed',
    });
    request.authContext = {
      tenantId: '1001',
      actorId: '2002',
      permissions: ['evidence:link:create'],
      role: 'tenant_admin',
    };
    const { response } = createResponse();

    middleware(request, response, () => {
      const context = tenantContextStorage.getStore();
      expect(context).toEqual({
        tenantId: '1001',
        actorId: '2002',
        requestId: 'req-fixed',
      });
    });
  });

  it('bypasses tenant requirement for health endpoints', () => {
    const middleware = createTenantContextMiddleware('x-tenant-id');
    const request = createRequest({}, '/health/live');
    const { response, status } = createResponse();
    const next = jest.fn() as NextFunction;

    middleware(request, response, next);

    expect(next).toHaveBeenCalled();
    expect(status).not.toHaveBeenCalled();
  });

  it('bypasses tenant requirement for prefixed health endpoints', () => {
    const middleware = createTenantContextMiddleware('x-tenant-id');
    const request = createRequest({}, '/api/health/live');
    const { response, status } = createResponse();
    const next = jest.fn() as NextFunction;

    middleware(request, response, next);

    expect(next).toHaveBeenCalled();
    expect(status).not.toHaveBeenCalled();
  });

  it('generates request id when x-request-id is not provided', () => {
    const middleware = createTenantContextMiddleware('x-tenant-id');
    const request = createRequest({
      'x-tenant-id': '1001',
    });
    const { response } = createResponse();

    middleware(request, response, () => {
      const context = tenantContextStorage.getStore();
      expect(context?.requestId).toBeDefined();
      expect(context?.requestId.length).toBeGreaterThan(0);
    });
  });
});
