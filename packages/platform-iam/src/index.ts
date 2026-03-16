import {
  type Action,
  type AuthzResult,
  type Obligations,
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

const INVENTORY_WAREHOUSE_SCOPE_PATTERN =
  /^erp:inventory:read:warehouse=(.+)$/u;

function normalizeGrantedPermissions(
  grantedPermissions: readonly string[],
): readonly string[] {
  return grantedPermissions.map((permission) => permission.trim()).filter(Boolean);
}

function hasBroadInventoryReadPermission(granted: ReadonlySet<string>): boolean {
  return (
    granted.has('erp:*') ||
    granted.has('erp:inventory:*') ||
    granted.has('erp:inventory:read')
  );
}

function listInventoryReadWarehouseScopes(
  grantedPermissions: readonly string[],
): readonly string[] {
  return grantedPermissions
    .map((permission) => INVENTORY_WAREHOUSE_SCOPE_PATTERN.exec(permission))
    .filter((match): match is RegExpExecArray => match !== null)
    .map((match) => match[1]?.trim())
    .filter(
      (warehouseId): warehouseId is string =>
        typeof warehouseId === 'string' && warehouseId.length > 0,
    );
}

function computeInventoryReadObligationsFromWarehouses(
  allowedWarehouseIds: readonly string[],
): Obligations {
  return {
    data: {
      kind: 'prisma_where',
      where: {
        warehouseId: {
          in: [...allowedWarehouseIds],
        },
      },
    },
  };
}

function computeInventoryReadObligationsUnrestricted(): Obligations {
  return {
    data: {
      kind: 'prisma_where',
      where: {},
    },
  };
}

const DOCUMENT_WORKFLOW_ACTIONS_BASE = [
  'confirm',
  'validate',
  'pick',
  'close',
  'cancel',
] as const;

const DOCUMENT_WORKFLOW_ACTIONS_ALL = [
  ...DOCUMENT_WORKFLOW_ACTIONS_BASE,
  'post',
] as const;

type DocumentWorkflowAction = (typeof DOCUMENT_WORKFLOW_ACTIONS_ALL)[number];

function computeDocumentUpdateObligations(deps: {
  readonly granted: ReadonlySet<string>;
}): Obligations {
  const broadAllow = deps.granted.has('erp:*') || deps.granted.has('erp:document:*');

  const allowTransitions: readonly DocumentWorkflowAction[] = broadAllow
    ? DOCUMENT_WORKFLOW_ACTIONS_ALL
    : deps.granted.has('erp:document:post')
      ? DOCUMENT_WORKFLOW_ACTIONS_ALL
      : DOCUMENT_WORKFLOW_ACTIONS_BASE;

  return {
    workflow: {
      allowTransitions: [...allowTransitions],
    },
    buttons: {
      allow: [...allowTransitions],
    },
  };
}

function allowsPermission(
  grantedPermissions: readonly string[],
  requiredPermission: string,
): boolean {
  const required = requiredPermission.trim();
  if (required.length === 0) {
    return false;
  }

  const granted = new Set(
    grantedPermissions.map((permission) => permission.trim()).filter(Boolean),
  );

  if (granted.has(required)) {
    return true;
  }

  const requiredSegments = required.split(':');
  if (requiredSegments.length < 3) {
    return false;
  }

  const [app, resource] = requiredSegments;

  if (granted.has(`${app}:*`)) {
    return true;
  }

  if (granted.has(`${app}:${resource}:*`)) {
    return true;
  }

  // 注意：scoped permissions 不自动蕴含 unscoped allow。
  // 只有显式实现了 scope 解析 + obligations 下推的场景（例如 inventory read）才允许。

  return false;
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

      const grantedPermissions = normalizeGrantedPermissions(
        await deps.store.listGrantedPermissions({
          tenantId: input.tenantId,
          userId: input.userId,
        }),
      );

      // Special-case inventory read: only accept known scoped permissions (warehouse=...)
      // to avoid treating unknown scopes as broad allow.
      if (resource === 'erp:inventory' && action === 'read') {
        const granted = new Set(grantedPermissions);
        const broadAllow = hasBroadInventoryReadPermission(granted);
        const allowedWarehouseIds = listInventoryReadWarehouseScopes(
          grantedPermissions,
        );

        if (!broadAllow && allowedWarehouseIds.length === 0) {
          return {
            decision: 'deny',
            obligations: {},
            reason: 'MISSING_PERMISSION',
          };
        }

        return {
          decision: 'allow',
          obligations: broadAllow
            ? computeInventoryReadObligationsUnrestricted()
            : computeInventoryReadObligationsFromWarehouses(allowedWarehouseIds),
        };
      }

      if (!allowsPermission(grantedPermissions, requiredPermission)) {
        return {
          decision: 'deny',
          obligations: {},
          reason: 'MISSING_PERMISSION',
        };
      }

      if (resource === 'erp:document' && action === 'post') {
        return {
          decision: 'allow',
          obligations: {
            workflow: {
              allowTransitions: ['post'],
            },
            buttons: {
              allow: ['post'],
            },
          },
        };
      }

      if (resource === 'erp:document' && action === 'update') {
        return {
          decision: 'allow',
          obligations: computeDocumentUpdateObligations({
            granted: new Set(grantedPermissions),
          }),
        };
      }

      return {
        decision: 'allow',
        obligations: {} satisfies Obligations,
      };
    },
  };
}
