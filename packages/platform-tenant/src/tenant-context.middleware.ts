import type { NextFunction, Request, Response } from 'express';
import type { TenantContext } from './tenant-context';
import { tenantContextStorage } from './tenant-context';
import type { NodeEnv } from './tenant-resolver';
import { resolveTenantId, TenantResolverError } from './tenant-resolver';

export interface TenantAuthenticatedRequest {
  readonly authContext?: {
    readonly tenantId?: string;
    readonly actorId?: string;
    readonly role?: string;
  };
}

const HEALTH_PATH_PATTERN = /\/health\/(live|ready)\/?$/u;
const SWAGGER_PATH_PATTERN = /\/docs(?:\/.*)?$|\/docs-(json|yaml)$/u;

function shouldBypassTenantValidation(
  requestPath: string,
  nodeEnv: NodeEnv,
): boolean {
  if (HEALTH_PATH_PATTERN.test(requestPath)) {
    return true;
  }

  return nodeEnv === 'development' && SWAGGER_PATH_PATTERN.test(requestPath);
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

export interface CreateTenantContextMiddlewareOptions {
  readonly tenantHeader: string;
  readonly nodeEnv: NodeEnv;
  readonly allowDevHeaderTenantFallback: boolean;
}

export function createTenantContextMiddleware(
  options: CreateTenantContextMiddlewareOptions,
) {
  const normalizedTenantHeader = options.tenantHeader.toLowerCase();

  return function tenantContextMiddleware(
    request: Request,
    response: Response,
    next: NextFunction,
  ): void {
    const requestPath = request.path ?? request.originalUrl ?? '';
    if (shouldBypassTenantValidation(requestPath, options.nodeEnv)) {
      next();
      return;
    }

    const authenticatedRequest = request as Request & TenantAuthenticatedRequest;

    const headerTenantId = readHeaderValue(request, normalizedTenantHeader);
    const authTenantId = authenticatedRequest.authContext?.tenantId;
    const authRole = authenticatedRequest.authContext?.role;

    let resolved;
    try {
      resolved = resolveTenantId({
        authTenantId,
        authRole,
        headerTenantId,
        nodeEnv: options.nodeEnv,
        allowDevHeaderTenantFallback: options.allowDevHeaderTenantFallback,
      });
    } catch (error) {
      if (error instanceof TenantResolverError) {
        const status = error.code === 'TENANT_MISMATCH' ? 403 : 400;
        response.status(status).json({
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }

      throw error;
    }

    const requestId = readHeaderValue(request, 'x-request-id') ?? crypto.randomUUID();
    const actorId = authenticatedRequest.authContext?.actorId;

    const context: TenantContext = {
      tenantId: resolved.tenantId,
      requestId,
      actorId,
    };

    tenantContextStorage.run(context, () => {
      next();
    });
  };
}
