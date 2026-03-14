import { AsyncLocalStorage } from 'node:async_hooks';

export interface TenantContext {
  readonly tenantId: string;
  readonly requestId: string;
  readonly actorId?: string;
}

export const tenantContextStorage = new AsyncLocalStorage<TenantContext>();
