import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuditService } from '../../audit/application/audit.service';
import { PlatformAccessService } from '../../platform/application/platform-access.service';
import { TenantContextService } from '../tenant/tenant-context.service';
import type { AuthContext, AuthenticatedRequest } from './auth-context';
import { hasAllRequiredPermissions } from './permission-matcher';

export const REQUIRED_PERMISSIONS_METADATA_KEY = 'required_permissions';
export const PLATFORM_ACTION_METADATA_KEY = 'platform_action';

function readPlatformAction(
  reflector: Reflector,
  context: ExecutionContext,
): string | undefined {
  return reflector.getAllAndOverride<string>(PLATFORM_ACTION_METADATA_KEY, [
    context.getHandler(),
    context.getClass(),
  ]);
}

function validateTenantAlignment(
  authContext: AuthContext,
  tenantIdFromContext: string,
  requestId: string,
  auditService: AuditService,
): void {
  if (authContext.tenantId !== tenantIdFromContext) {
    auditService.recordAuthorization({
      requestId,
      tenantId: tenantIdFromContext,
      actorId: authContext.actorId,
      action: 'iam.authorize',
      entityType: 'request',
      entityId: requestId,
      result: 'deny',
      reason: 'TENANT_MISMATCH',
    });
    throw new ForbiddenException('Cross-tenant access is forbidden');
  }
}

@Injectable()
export class IamGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tenantContextService: TenantContextService,
    private readonly auditService: AuditService,
    private readonly platformAccessService: PlatformAccessService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(
        REQUIRED_PERMISSIONS_METADATA_KEY,
        [context.getHandler(), context.getClass()],
      ) ?? [];

    if (requiredPermissions.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<
        AuthenticatedRequest & { headers: Record<string, unknown> }
      >();
    const tenantContext = this.tenantContextService.getRequiredContext();
    const authContext = request.authContext;

    if (!authContext) {
      this.auditService.recordAuthorization({
        requestId: tenantContext.requestId,
        tenantId: tenantContext.tenantId,
        actorId: 'unknown',
        action: 'iam.authorize',
        entityType: 'request',
        entityId: tenantContext.requestId,
        result: 'deny',
        reason: 'AUTH_CONTEXT_MISSING',
      });
      throw new ForbiddenException('Authenticated context is required');
    }

    const platformAction = readPlatformAction(this.reflector, context);
    if (platformAction) {
      this.platformAccessService.assertCrossTenantAllowed({
        role: authContext.role,
        action: platformAction,
      });
    } else {
      validateTenantAlignment(
        authContext,
        tenantContext.tenantId,
        tenantContext.requestId,
        this.auditService,
      );
    }

    if (
      !hasAllRequiredPermissions(authContext.permissions, requiredPermissions)
    ) {
      this.auditService.recordAuthorization({
        requestId: tenantContext.requestId,
        tenantId: tenantContext.tenantId,
        actorId: authContext.actorId,
        action: 'iam.authorize',
        entityType: 'request',
        entityId: tenantContext.requestId,
        result: 'deny',
        reason: 'MISSING_PERMISSION',
      });
      throw new ForbiddenException('Permission denied');
    }

    this.auditService.recordAuthorization({
      requestId: tenantContext.requestId,
      tenantId: tenantContext.tenantId,
      actorId: authContext.actorId,
      action: 'iam.authorize',
      entityType: 'request',
      entityId: tenantContext.requestId,
      result: 'allow',
    });

    return true;
  }
}
