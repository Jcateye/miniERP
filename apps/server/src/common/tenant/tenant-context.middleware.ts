import type { NextFunction, Request, Response } from 'express';
import type { NodeEnv } from '@minierp/platform-tenant';
import { createTenantContextMiddleware as createPlatformTenantContextMiddleware } from '@minierp/platform-tenant';
import type { AuthenticatedRequest } from '../iam/auth-context';

export function createTenantContextMiddleware(
  tenantHeader: string,
  nodeEnv: NodeEnv = 'production',
  allowDevHeaderTenantFallback = false,
) {
  return createPlatformTenantContextMiddleware({
    tenantHeader,
    nodeEnv,
    allowDevHeaderTenantFallback,
  }) as unknown as (
    request: Request & AuthenticatedRequest,
    response: Response,
    next: NextFunction,
  ) => void;
}
