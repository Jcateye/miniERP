import { ForbiddenException } from '@nestjs/common';
import { PlatformAccessService } from './platform-access.service';

describe('PlatformAccessService', () => {
  const service = new PlatformAccessService();

  it('allows platform admin to execute whitelisted actions', () => {
    expect(
      service.canCrossTenant({
        role: 'platform_admin',
        action: 'platform.audit.read',
      }),
    ).toBe(true);
  });

  it('rejects non-platform roles for cross-tenant action', () => {
    expect(() =>
      service.assertCrossTenantAllowed({
        role: 'tenant_admin',
        action: 'platform.audit.read',
      }),
    ).toThrow(ForbiddenException);
  });

  it('rejects unapproved action even for platform admin', () => {
    expect(() =>
      service.assertCrossTenantAllowed({
        role: 'platform_admin',
        action: 'platform.evidence.delete',
      }),
    ).toThrow(ForbiddenException);
  });
});
