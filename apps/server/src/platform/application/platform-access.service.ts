import { ForbiddenException, Injectable } from '@nestjs/common';

type PlatformRole = 'platform_admin' | 'tenant_admin' | 'operator';

interface CrossTenantAccessInput {
  readonly role: PlatformRole;
  readonly action: string;
}

const WHITELISTED_PLATFORM_ACTIONS = new Set<string>([
  'platform.audit.read',
  'platform.tenant.read',
]);

@Injectable()
export class PlatformAccessService {
  canCrossTenant(input: CrossTenantAccessInput): boolean {
    return (
      input.role === 'platform_admin' &&
      WHITELISTED_PLATFORM_ACTIONS.has(input.action)
    );
  }

  assertCrossTenantAllowed(input: CrossTenantAccessInput): void {
    if (!this.canCrossTenant(input)) {
      throw new ForbiddenException(
        'Cross-tenant platform action is not allowed',
      );
    }
  }
}
