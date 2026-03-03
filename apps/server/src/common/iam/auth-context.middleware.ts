import { createHmac, timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import type { AuthContext, AuthenticatedRequest } from './auth-context';

const HEALTH_PATH_PATTERN = /\/health\/(live|ready)\/?$/u;

interface AuthContextMiddlewareOptions {
  readonly secret: string;
}

function parseAuthContext(value: string): AuthContext | undefined {
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as Partial<AuthContext>;

    if (!parsed || typeof parsed !== 'object') {
      return undefined;
    }

    if (
      typeof parsed.tenantId !== 'string' ||
      typeof parsed.actorId !== 'string' ||
      !Array.isArray(parsed.permissions) ||
      typeof parsed.role !== 'string'
    ) {
      return undefined;
    }

    if (parsed.tenantId.trim().length === 0 || parsed.actorId.trim().length === 0) {
      return undefined;
    }

    if (parsed.role !== 'platform_admin' && parsed.role !== 'tenant_admin' && parsed.role !== 'operator') {
      return undefined;
    }

    const permissions = parsed.permissions
      .filter((permission): permission is string => typeof permission === 'string')
      .map((permission) => permission.trim())
      .filter((permission) => permission.length > 0);

    return {
      tenantId: parsed.tenantId.trim(),
      actorId: parsed.actorId.trim(),
      permissions,
      role: parsed.role,
    };
  } catch {
    return undefined;
  }
}

function computeSignature(payload: string, secret: string): Buffer {
  return createHmac('sha256', secret).update(payload).digest();
}

function isSignatureValid(payload: string, signature: string, secret: string): boolean {
  const provided = Buffer.from(signature, 'hex');
  const expected = computeSignature(payload, secret);

  if (provided.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(provided, expected);
}

function readHeaderValue(request: Request, headerName: string): string | undefined {
  const value = request.header(headerName);
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function createAuthContextMiddleware(options: AuthContextMiddlewareOptions) {
  return function authContextMiddleware(request: Request, response: Response, next: NextFunction): void {
    const requestPath = request.path ?? request.originalUrl ?? '';
    if (HEALTH_PATH_PATTERN.test(requestPath)) {
      next();
      return;
    }

    const encodedContext = readHeaderValue(request, 'x-auth-context');
    const signature = readHeaderValue(request, 'x-auth-context-signature');

    if (!encodedContext || !signature || !isSignatureValid(encodedContext, signature, options.secret)) {
      response.status(401).json({
        error: {
          code: 'AUTH_INVALID_CONTEXT',
          message: 'Missing or invalid authenticated context',
        },
      });
      return;
    }

    const authContext = parseAuthContext(encodedContext);

    if (!authContext) {
      response.status(401).json({
        error: {
          code: 'AUTH_INVALID_CONTEXT',
          message: 'Authenticated context payload is invalid',
        },
      });
      return;
    }

    const authenticatedRequest = request as Request & AuthenticatedRequest;
    Object.assign(authenticatedRequest, {
      authContext,
    });

    next();
  };
}
