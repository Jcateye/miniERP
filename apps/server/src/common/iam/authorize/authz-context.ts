import { AsyncLocalStorage } from 'node:async_hooks';
import type { AuthzResult } from '@minierp/platform-policy';

export type AuthzContext = {
  readonly result: AuthzResult;
};

export const authzContextStorage = new AsyncLocalStorage<AuthzContext>();

export function readAuthzResult(): AuthzResult | undefined {
  return authzContextStorage.getStore()?.result;
}

export function requireAuthzResult(): AuthzResult {
  const result = readAuthzResult();
  if (!result) {
    throw new Error(
      'Authorization context is not available in current execution context',
    );
  }

  return result;
}
