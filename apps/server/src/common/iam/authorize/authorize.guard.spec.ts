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

  it('allows using inline auth context permissions in non-production when RBAC store is unavailable', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthorizeGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: (key: string) =>
              key === 'authz_requirement'
                ? { resource: 'erp:document', action: 'read' }
                : undefined,
          },
        },
        {
          provide: TenantContextService,
          useValue: {
            getRequiredContext: () => ({ tenantId: '1001', requestId: 'req-1' }),
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
          useValue: {
            listGrantedPermissions: async () => {
              throw new Error('ERROR: permission denied for table tenants');
            },
          },
        },
      ],
    }).compile();

    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    try {
      const guard = moduleRef.get(AuthorizeGuard);

      await expect(
        guard.canActivate(
          createExecutionContext({
            authContext: {
              tenantId: '1001',
              actorId: '9001',
              permissions: ['erp:document:read'],
              role: 'tenant_admin',
            },
            headers: {},
          }),
        ),
      ).resolves.toBe(true);
    } finally {
      process.env.NODE_ENV = previousNodeEnv;
    }
  });
});
