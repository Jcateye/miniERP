import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createAuthorizer } from '@minierp/platform-iam';
import { AuditService } from '../../../audit/application/audit.service';
import { PlatformAccessService } from '../../../platform/application/platform-access.service';
import { TenantContextService } from '../../tenant/tenant-context.service';
import type { AuthenticatedRequest } from '../auth-context';
import { PLATFORM_ACTION_METADATA_KEY } from '../iam.guard';
import { PrismaGrantedPermissionsStore } from '../rbac/granted-permissions.store';
import { authzContextStorage } from './authz-context';

export const AUTHZ_METADATA_KEY = 'authz_requirement';

interface AuthzRequirement {
  readonly resource: string;
  readonly action: string;
  readonly context?: Record<string, unknown>;
}

function readAuthzRequirement(
  reflector: Reflector,
  context: ExecutionContext,
): AuthzRequirement | undefined {
  return reflector.getAllAndOverride<AuthzRequirement>(AUTHZ_METADATA_KEY, [
    context.getHandler(),
    context.getClass(),
  ]);
}

function readPlatformAction(
  reflector: Reflector,
  context: ExecutionContext,
): string | undefined {
  return reflector.getAllAndOverride<string>(PLATFORM_ACTION_METADATA_KEY, [
    context.getHandler(),
    context.getClass(),
  ]);
}

function normalizePermissions(
  permissions: readonly string[],
): readonly string[] {
  return permissions.map((permission) => permission.trim()).filter(Boolean);
}

@Injectable()
export class AuthorizeGuard implements CanActivate {
  private readonly authorizer: ReturnType<typeof createAuthorizer>;

  constructor(
    private readonly reflector: Reflector,
    private readonly tenantContextService: TenantContextService,
    private readonly auditService: AuditService,
    private readonly platformAccessService: PlatformAccessService,
    grantedPermissionsStore: PrismaGrantedPermissionsStore,
  ) {
    this.authorizer = createAuthorizer({ store: grantedPermissionsStore });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requirement = readAuthzRequirement(this.reflector, context);
    if (!requirement) {
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

      throw new ForbiddenException({
        category: 'permission',
        code: 'PERMISSION_AUTH_CONTEXT_MISSING',
        message: 'Authenticated context is required',
      });
    }

    const platformAction = readPlatformAction(this.reflector, context);
    if (platformAction) {
      this.platformAccessService.assertCrossTenantAllowed({
        role: authContext.role,
        action: platformAction,
      });
    } else if (authContext.tenantId !== tenantContext.tenantId) {
      this.auditService.recordAuthorization({
        requestId: tenantContext.requestId,
        tenantId: tenantContext.tenantId,
        actorId: authContext.actorId,
        action: 'iam.authorize',
        entityType: 'request',
        entityId: tenantContext.requestId,
        result: 'deny',
        reason: 'TENANT_MISMATCH',
      });

      throw new ForbiddenException({
        category: 'permission',
        code: 'PERMISSION_TENANT_MISMATCH',
        message: 'Cross-tenant access is forbidden',
      });
    }

    const authzInput = {
      tenantId: tenantContext.tenantId,
      userId: authContext.actorId,
      action: requirement.action,
      resource: requirement.resource,
      context: requirement.context,
    };

    const inlinePermissions =
      process.env.NODE_ENV === 'production'
        ? []
        : normalizePermissions(authContext.permissions);

    let authzResult =
      inlinePermissions.length > 0
        ? await createAuthorizer({
            store: {
              listGrantedPermissions: async () => inlinePermissions,
            },
          }).authorize(authzInput)
        : undefined;

    if (!authzResult || authzResult.decision !== 'allow') {
      try {
        authzResult = await this.authorizer.authorize(authzInput);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'unknown error';

        this.auditService.recordAuthorization({
          requestId: tenantContext.requestId,
          tenantId: tenantContext.tenantId,
          actorId: authContext.actorId,
          action: 'iam.authorize',
          entityType: 'request',
          entityId: tenantContext.requestId,
          result: 'deny',
          reason: 'AUTHZ_EVALUATION_ERROR',
        });

        throw new ForbiddenException({
          category: 'permission',
          code: 'PERMISSION_AUTHZ_EVALUATION_FAILED',
          message: 'Authorization evaluation failed',
          details:
            process.env.NODE_ENV === 'production'
              ? undefined
              : {
                  message,
                },
        });
      }
    }

    if (authzResult.decision !== 'allow') {
      this.auditService.recordAuthorization({
        requestId: tenantContext.requestId,
        tenantId: tenantContext.tenantId,
        actorId: authContext.actorId,
        action: 'iam.authorize',
        entityType: 'request',
        entityId: tenantContext.requestId,
        result: 'deny',
        reason: authzResult.reason ?? 'POLICY_DENY',
      });

      throw new ForbiddenException({
        category: 'permission',
        code: 'PERMISSION_DENIED',
        message: 'Permission denied',
      });
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

    authzContextStorage.enterWith({ result: authzResult });

    return true;
  }
}
