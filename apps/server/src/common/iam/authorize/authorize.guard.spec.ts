import { Test } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthorizeGuard } from './authorize.guard';
import { TenantContextService } from '../../tenant/tenant-context.service';
import { AuditService } from '../../../audit/application/audit.service';
import { PlatformAccessService } from '../../../platform/application/platform-access.service';
import { PrismaGrantedPermissionsStore } from '../rbac/granted-permissions.store';

function createExecutionContext(request: unknown): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

describe('AuthorizeGuard', () => {
  it('denies when authContext is missing', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthorizeGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: (key: string) =>
              key === 'authz_requirement'
                ? { resource: 'erp:policy', action: 'read' }
                : undefined,
          },
        },
        {
          provide: TenantContextService,
          useValue: {
            getRequiredContext: () => ({ tenantId: '1', requestId: 'req-1' }),
          },
        },
        {
          provide: AuditService,
          useValue: { recordAuthorization: jest.fn() },
        },
        {
          provide: PlatformAccessService,
          useValue: { assertCrossTenantAllowed: jest.fn() },
        },
        {
          provide: PrismaGrantedPermissionsStore,
          useValue: { listGrantedPermissions: async () => ['erp:*'] },
        },
      ],
    }).compile();

    const guard = moduleRef.get(AuthorizeGuard);

    await expect(
      guard.canActivate(createExecutionContext({})),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows when authorizer returns allow', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthorizeGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: (key: string) =>
              key === 'authz_requirement'
                ? { resource: 'erp:policy', action: 'read' }
                : undefined,
          },
        },
        {
          provide: TenantContextService,
          useValue: {
            getRequiredContext: () => ({ tenantId: '1', requestId: 'req-1' }),
          },
        },
        {
          provide: AuditService,
          useValue: { recordAuthorization: jest.fn() },
        },
        {
          provide: PlatformAccessService,
          useValue: { assertCrossTenantAllowed: jest.fn() },
        },
        {
          provide: PrismaGrantedPermissionsStore,
          useValue: { listGrantedPermissions: async () => ['erp:*'] },
        },
      ],
    }).compile();

    const guard = moduleRef.get(AuthorizeGuard);

    await expect(
      guard.canActivate(
        createExecutionContext({
          authContext: {
            tenantId: '1',
            actorId: '1',
            permissions: [],
            role: 'tenant_admin',
          },
          headers: {},
        }),
      ),
    ).resolves.toBe(true);
  });
});
