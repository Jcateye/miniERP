import {
  type CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuditService } from '../../audit/application/audit.service';
import { PlatformAccessService } from '../../platform/application/platform-access.service';
import { TenantContextService } from '../tenant/tenant-context.service';
import { IamGuard } from './iam.guard';
import type { AuthContext } from './auth-context';

describe('IamGuard', () => {
  function createContext(authContext?: AuthContext): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          authContext,
          headers: {},
        }),
      }),
      getHandler: () => ({}),
      getClass: () => class TestClass {},
    } as unknown as ExecutionContext;
  }

  function createGuard(
    requiredPermissions: string[],
    context: { tenantId: string; requestId: string },
    options?: { platformAction?: string },
  ): { guard: CanActivate; auditService: { recordAuthorization: jest.Mock }; platformAccessService: { assertCrossTenantAllowed: jest.Mock } } {
    const reflector = {
      getAllAndOverride: jest
        .fn()
        .mockImplementation((key: string) =>
          key === 'required_permissions' ? requiredPermissions : options?.platformAction,
        ),
    } as unknown as Reflector;

    const tenantContextService = {
      getRequiredContext: jest.fn().mockReturnValue(context),
    } as unknown as TenantContextService;

    const auditService = {
      recordAuthorization: jest.fn(),
    };

    const platformAccessService = {
      assertCrossTenantAllowed: jest.fn(),
    };

    return {
      guard: new IamGuard(
        reflector,
        tenantContextService,
        auditService as unknown as AuditService,
        platformAccessService as unknown as PlatformAccessService,
      ),
      auditService,
      platformAccessService,
    };
  }

  it('throws forbidden when auth context is missing', () => {
    const { guard } = createGuard(['evidence:link:create'], { tenantId: '1001', requestId: 'req-1' });

    expect(() => guard.canActivate(createContext())).toThrow(ForbiddenException);
  });

  it('throws forbidden when auth tenant differs from context tenant', () => {
    const { guard } = createGuard(['evidence:link:create'], { tenantId: '1001', requestId: 'req-1' });

    expect(() =>
      guard.canActivate(
        createContext({
          tenantId: '1002',
          actorId: '2001',
          permissions: ['evidence:link:create'],
          role: 'tenant_admin',
        }),
      ),
    ).toThrow(ForbiddenException);
  });

  it('throws forbidden when required permission is missing', () => {
    const { guard } = createGuard(['evidence:link:create'], { tenantId: '1001', requestId: 'req-1' });

    expect(() =>
      guard.canActivate(
        createContext({
          tenantId: '1001',
          actorId: '2001',
          permissions: ['evidence:link:read'],
          role: 'tenant_admin',
        }),
      ),
    ).toThrow(ForbiddenException);
  });

  it('allows when permissions satisfy requirements', () => {
    const { guard } = createGuard(['evidence:link:create'], { tenantId: '1001', requestId: 'req-1' });

    expect(
      guard.canActivate(
        createContext({
          tenantId: '1001',
          actorId: '2001',
          permissions: ['evidence:*'],
          role: 'tenant_admin',
        }),
      ),
    ).toBe(true);
  });

  it('enforces platform action via platform access service', () => {
    const { guard, platformAccessService } = createGuard(
      ['platform:audit:read'],
      { tenantId: '1001', requestId: 'req-1' },
      { platformAction: 'platform.audit.read' },
    );

    guard.canActivate(
      createContext({
        tenantId: '9999',
        actorId: '1',
        permissions: ['platform:audit:read'],
        role: 'platform_admin',
      }),
    );

    expect(platformAccessService.assertCrossTenantAllowed).toHaveBeenCalledWith({
      role: 'platform_admin',
      action: 'platform.audit.read',
    });
  });
});
