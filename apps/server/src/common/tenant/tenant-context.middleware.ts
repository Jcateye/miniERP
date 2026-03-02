import type { NextFunction, Request, Response } from 'express';
import { tenantContextStorage } from './tenant-context';

export function createTenantContextMiddleware(tenantHeader: string) {
  const normalizedTenantHeader = tenantHeader.toLowerCase();

  return function tenantContextMiddleware(request: Request, response: Response, next: NextFunction): void {
    const tenantId = readHeaderValue(request, normalizedTenantHeader);

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
      (typeof request.headers['x-request-id'] === 'string' ? request.headers['x-request-id'] : undefined) ??
      crypto.randomUUID();

    const actorId = readHeaderValue(request, 'x-actor-id');

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

function readHeaderValue(request: Request, headerName: string): string | undefined {
  const value = request.header(headerName);

  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
