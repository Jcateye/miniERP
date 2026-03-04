import { Injectable } from '@nestjs/common';
import { tenantContextStorage, type TenantContext } from './tenant-context';

@Injectable()
export class TenantContextService {
  getContext(): TenantContext | undefined {
    return tenantContextStorage.getStore();
  }

  getRequiredContext(): TenantContext {
    const context = this.getContext();

    if (!context) {
      throw new Error(
        'Tenant context is not available in current execution context',
      );
    }

    return context;
  }
}
