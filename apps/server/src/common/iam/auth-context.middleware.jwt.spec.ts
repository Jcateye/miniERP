import { createHmac } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { createAuthContextMiddleware } from './auth-context.middleware';

describe('authContextMiddleware (jwt)', () => {
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

  function signJwt(payload: {
    tenantId: string;
    sub: string;
    secret: string;
    schemaName?: string;
  }): string {
    return jwt.sign(
      {
        tenantId: payload.tenantId,
        ...(payload.schemaName ? { schemaName: payload.schemaName } : {}),
      },
      payload.secret,
      {
        algorithm: 'HS256',
        subject: payload.sub,
        expiresIn: '1h',
      },
    );
  }

  it('attaches authContext from Authorization Bearer JWT in jwt mode', async () => {
    const jwtSecret = 'test-jwt-secret';
    const token = signJwt({
      tenantId: 'TENANT-1001',
      sub: '9001',
      secret: jwtSecret,
      schemaName: 'tenant_1001',
    });

    const middleware = createAuthContextMiddleware({
      authMode: 'jwt',
      secret: 'ignored-hmac-secret',
      jwtHs256Secret: jwtSecret,
      nodeEnv: 'test',
    });

    const request = createRequest({
      authorization: `Bearer ${token}`,
    }) as Request & { authContext?: unknown };

    const { response, status } = createResponse();

    await new Promise<void>((resolve) => {
      middleware(request, response, (() => {
        resolve();
      }) as NextFunction);
      setImmediate(resolve);
    });

    expect(status).not.toHaveBeenCalled();
    expect(request.authContext).toEqual({
      tenantId: 'TENANT-1001',
      actorId: '9001',
      permissions: [],
      role: 'operator',
      schemaName: 'tenant_1001',
    });
  });

  it('prefers JWT over x-auth-context in both mode', async () => {
    const jwtSecret = 'test-jwt-secret';
    const token = signJwt({
      tenantId: 'TENANT-1001',
      sub: '9001',
      secret: jwtSecret,
      schemaName: 'tenant_1001',
    });

    const secret = 'hmac-secret';
    const hmacPayload = Buffer.from(
      JSON.stringify({
        tenantId: 'TENANT-2002',
        actorId: '2001',
        permissions: ['evidence:*'],
        role: 'tenant_admin',
      }),
      'utf8',
    ).toString('base64url');
    const signature = createHmac('sha256', secret)
      .update(hmacPayload)
      .digest('hex');

    const middleware = createAuthContextMiddleware({
      authMode: 'both',
      secret,
      jwtHs256Secret: jwtSecret,
      nodeEnv: 'test',
    });

    const request = createRequest({
      authorization: `Bearer ${token}`,
      'x-auth-context': hmacPayload,
      'x-auth-context-signature': signature,
    }) as Request & { authContext?: unknown };

    const { response, status } = createResponse();

    await new Promise<void>((resolve) => {
      middleware(request, response, (() => {
        resolve();
      }) as NextFunction);
      setImmediate(resolve);
    });

    expect(status).not.toHaveBeenCalled();
    expect(request.authContext).toEqual({
      tenantId: 'TENANT-1001',
      actorId: '9001',
      permissions: [],
      role: 'operator',
      schemaName: 'tenant_1001',
    });
  });

  it('rejects when JWT is invalid and x-auth-context is also present in both mode', async () => {
    const jwtSecret = 'test-jwt-secret';

    const badToken = signJwt({
      tenantId: 'TENANT-1001',
      sub: '9001',
      secret: 'wrong-secret',
    });

    const secret = 'hmac-secret';
    const hmacPayload = Buffer.from(
      JSON.stringify({
        tenantId: 'TENANT-2002',
        actorId: '2001',
        permissions: ['evidence:*'],
        role: 'tenant_admin',
      }),
      'utf8',
    ).toString('base64url');
    const signature = createHmac('sha256', secret)
      .update(hmacPayload)
      .digest('hex');

    const middleware = createAuthContextMiddleware({
      authMode: 'both',
      secret,
      jwtHs256Secret: jwtSecret,
      nodeEnv: 'test',
    });

    const request = createRequest({
      authorization: `Bearer ${badToken}`,
      'x-auth-context': hmacPayload,
      'x-auth-context-signature': signature,
    });

    const { response, status, json } = createResponse();

    await new Promise<void>((resolve) => {
      middleware(request, response, (() => resolve()) as NextFunction);
      setImmediate(resolve);
    });

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'AUTH_INVALID_CONTEXT',
        message: 'Missing or invalid authenticated context',
      },
    });
  });

  it('rejects when jwt mode is enabled but jwt secret missing', async () => {
    const token = signJwt({
      tenantId: 'TENANT-1001',
      sub: '9001',
      secret: 'test-jwt-secret',
    });

    const middleware = createAuthContextMiddleware({
      authMode: 'jwt',
      secret: 'ignored-hmac-secret',
      nodeEnv: 'test',
    });

    const request = createRequest({
      authorization: `Bearer ${token}`,
    });
    const { response, status, json } = createResponse();

    await new Promise<void>((resolve) => {
      middleware(request, response, (() => resolve()) as NextFunction);
      setImmediate(resolve);
    });

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'AUTH_INVALID_CONTEXT',
        message: 'JWT_HS256_SECRET is required for jwt auth mode',
      },
    });
  });
});
