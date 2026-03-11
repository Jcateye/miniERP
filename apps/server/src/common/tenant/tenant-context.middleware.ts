import type { NextFunction, Request, Response } from 'express';
import type { AuthenticatedRequest } from '../iam/auth-context';
import { tenantContextStorage } from './tenant-context';

const HEALTH_PATH_PATTERN = /\/health\/(live|ready)\/?$/u;
const SWAGGER_PATH_PATTERN = /\/docs(?:\/.*)?$|\/docs-(json|yaml)$/u;

type NodeEnv = 'development' | 'test' | 'production';

function shouldBypassTenantValidation(
  requestPath: string,
  nodeEnv: NodeEnv,
): boolean {
  if (HEALTH_PATH_PATTERN.test(requestPath)) {
    return true;
  }

  return nodeEnv === 'development' && SWAGGER_PATH_PATTERN.test(requestPath);
}

export function createTenantContextMiddleware(
  tenantHeader: string,
  nodeEnv: NodeEnv = 'production',
) {
  const normalizedTenantHeader = tenantHeader.toLowerCase();

  return function tenantContextMiddleware(
    request: Request,
    response: Response,
    next: NextFunction,
  ): void {
    const requestPath = request.path ?? request.originalUrl ?? '';
    if (shouldBypassTenantValidation(requestPath, nodeEnv)) {
      next();
      return;
    }

    const authenticatedRequest = request as Request & AuthenticatedRequest;
    const headerTenantId = readHeaderValue(request, normalizedTenantHeader);
    const authTenantId = authenticatedRequest.authContext?.tenantId;
    const authRole = authenticatedRequest.authContext?.role;

    if (
      authTenantId &&
      headerTenantId &&
      authRole !== 'platform_admin' &&
      authTenantId.trim() !== headerTenantId.trim()
    ) {
      response.status(403).json({
        error: {
          code: 'TENANT_MISMATCH',
          message:
            'Tenant in authenticated context does not match tenant header',
        },
      });
      return;
    }

    const tenantId = authTenantId ?? headerTenantId;

    if (!tenantId) {
      response.status(400).json({
        error: {
          code: 'TENANT_MISSING',
          message: `Missing required tenant header: ${tenantHeader}`,
        },
      });
      return;
    }

    const requestId =
      readHeaderValue(request, 'x-request-id') ??
      (typeof request.headers['x-request-id'] === 'string'
        ? request.headers['x-request-id']
        : undefined) ??
      crypto.randomUUID();

    const actorId = authenticatedRequest.authContext?.actorId;

    tenantContextStorage.run(
      {
        tenantId,
        requestId,
        actorId,
      },
      () => {
        next();
      },
    );
  };
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
