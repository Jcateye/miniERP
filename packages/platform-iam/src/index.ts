import {
  type Action,
  type AuthzResult,
  type Obligations,
  hasPermission,
  parseAction,
  parseResource,
  toPermissionCode,
} from '@minierp/platform-policy';

export interface GrantedPermissionsStore {
  listGrantedPermissions(input: {
    readonly tenantId: string;
    readonly userId: string;
  }): Promise<readonly string[]>;
}

export interface Authorizer {
  authorize(input: {
    readonly tenantId: string;
    readonly userId: string;
    readonly action: string;
    readonly resource: string;
    readonly context?: Record<string, unknown>;
  }): Promise<AuthzResult>;
}

export function createAuthorizer(deps: {
  readonly store: GrantedPermissionsStore;
}): Authorizer {
  return {
    async authorize(input): Promise<AuthzResult> {
      const resource = parseResource(input.resource);
      const action: Action = parseAction(input.action);

      const requiredPermission = toPermissionCode({
        resource,
        action,
      });

      const grantedPermissions = await deps.store.listGrantedPermissions({
        tenantId: input.tenantId,
        userId: input.userId,
      });

      const obligations: Obligations = {};

      if (hasPermission(grantedPermissions, requiredPermission)) {
        return {
          decision: 'allow',
          obligations,
        };
      }

      return {
        decision: 'deny',
        obligations,
        reason: 'MISSING_PERMISSION',
      };
    },
  };
}
