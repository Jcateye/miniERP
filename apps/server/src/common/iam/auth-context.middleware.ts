import { createHmac, timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import type { AuthContext, AuthenticatedRequest } from './auth-context';

const HEALTH_PATH_PATTERN = /\/health\/(live|ready)\/?$/u;
const SWAGGER_PATH_PATTERN = /\/docs(?:\/.*)?$|\/docs-(json|yaml)$/u;
const DEV_AUTHORIZATION_HEADER = 'Bearer dev-token';
const DEV_AUTH_TENANT_ID = '1';
const DEV_AUTH_ACTOR_ID = 'dev-user';
const DEV_AUTH_PERMISSIONS = [
  'evidence:*',
  'masterdata.customer.read',
  'masterdata.customer.write',
  'masterdata.sku.read',
  'masterdata.sku.write',
  'masterdata.supplier.read',
  'masterdata.supplier.write',
  'masterdata.warehouse.read',
  'masterdata.warehouse.write',
] as const;

interface AuthContextMiddlewareOptions {
  readonly secret: string;
  readonly nodeEnv: 'development' | 'test' | 'production';
}

function shouldBypassAuth(
  requestPath: string,
  nodeEnv: AuthContextMiddlewareOptions['nodeEnv'],
): boolean {
  if (HEALTH_PATH_PATTERN.test(requestPath)) {
    return true;
  }

  return nodeEnv === 'development' && SWAGGER_PATH_PATTERN.test(requestPath);
}

function parseAuthContext(value: string): AuthContext | undefined {
  try {
    const parsed = JSON.parse(
      Buffer.from(value, 'base64url').toString('utf8'),
    ) as Partial<AuthContext>;

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

    if (
      parsed.tenantId.trim().length === 0 ||
      parsed.actorId.trim().length === 0
    ) {
      return undefined;
    }

    if (
      parsed.role !== 'platform_admin' &&
      parsed.role !== 'tenant_admin' &&
      parsed.role !== 'operator'
    ) {
      return undefined;
    }

    const permissions = parsed.permissions
      .filter(
        (permission): permission is string => typeof permission === 'string',
      )
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

function isSignatureValid(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const provided = Buffer.from(signature, 'hex');
  const expected = computeSignature(payload, secret);

  if (provided.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(provided, expected);
}

function readHeaderValue(
  request: Request,
  headerName: string,
): string | undefined {
  const value = request.header(headerName);
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function tryAttachDevelopmentAuthContext(
  request: Request,
  nodeEnv: AuthContextMiddlewareOptions['nodeEnv'],
): boolean {
  if (nodeEnv !== 'development') {
    return false;
  }

  const authorization = readHeaderValue(request, 'authorization');
  if (authorization !== DEV_AUTHORIZATION_HEADER) {
    return false;
  }

  const authenticatedRequest = request as Request & AuthenticatedRequest;
  Object.assign(authenticatedRequest, {
    // 开发环境认证绕过固定到测试租户/用户，避免依赖可变 tenant header 配置。
    authContext: {
      tenantId: DEV_AUTH_TENANT_ID,
      actorId: DEV_AUTH_ACTOR_ID,
      permissions: [...DEV_AUTH_PERMISSIONS],
      role: 'tenant_admin' as const,
    },
  });

  return true;
}

export function createAuthContextMiddleware(
  options: AuthContextMiddlewareOptions,
) {
  return function authContextMiddleware(
    request: Request,
    response: Response,
    next: NextFunction,
  ): void {
    const requestPath = request.path ?? request.originalUrl ?? '';
    if (shouldBypassAuth(requestPath, options.nodeEnv)) {
      next();
      return;
    }

    if (tryAttachDevelopmentAuthContext(request, options.nodeEnv)) {
      next();
      return;
    }

    const encodedContext = readHeaderValue(request, 'x-auth-context');
    const signature = readHeaderValue(request, 'x-auth-context-signature');

    if (
      !encodedContext ||
      !signature ||
      !isSignatureValid(encodedContext, signature, options.secret)
    ) {
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
