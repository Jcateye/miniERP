export type Decision = 'allow' | 'deny';

export type Obligations = {
  readonly data?: unknown;
  readonly fields?: {
    readonly allow?: readonly string[];
    readonly deny?: readonly string[];
  };
  readonly buttons?: {
    readonly allow?: readonly string[];
    readonly deny?: readonly string[];
  };
  readonly workflow?: {
    readonly allowTransitions?: readonly string[];
    readonly denyTransitions?: readonly string[];
  };
};

export type AuthzResult = {
  readonly decision: Decision;
  readonly obligations: Obligations;
  readonly reason?: string;
};

export const ALLOWED_ACTIONS = [
  'read',
  'create',
  'update',
  'delete',
  'approve',
  'post',
  'export',
  '*',
] as const;

export type Action = (typeof ALLOWED_ACTIONS)[number];

const RESOURCE_SEGMENT_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

export type Resource = string & { readonly __resourceBrand: unique symbol };

export function parseAction(value: string): Action {
  const normalized = value.trim();
  if ((ALLOWED_ACTIONS as readonly string[]).includes(normalized)) {
    return normalized as Action;
  }

  throw new Error(`Invalid action: ${value}`);
}

export function parseResource(value: string): Resource {
  const normalized = value.trim();
  const segments = normalized.split(':');
  if (segments.length < 2 || segments.length > 3) {
    throw new Error(`Invalid resource format: ${value}`);
  }

  for (const segment of segments) {
    if (!RESOURCE_SEGMENT_PATTERN.test(segment)) {
      throw new Error(`Invalid resource segment: ${segment}`);
    }
  }

  return normalized as Resource;
}

export function toPermissionCode(input: {
  readonly resource: string;
  readonly action: string;
}): string {
  const resource = parseResource(input.resource);
  const action = parseAction(input.action);
  return `${resource}:${action}`;
}

export function hasPermission(
  grantedPermissions: readonly string[],
  requiredPermission: string,
): boolean {
  const required = requiredPermission.trim();
  if (required.length === 0) {
    return false;
  }

  const grantedSet = new Set(
    grantedPermissions.map((permission) => permission.trim()).filter(Boolean),
  );

  if (grantedSet.has(required)) {
    return true;
  }

  const requiredSegments = required.split(':');
  if (requiredSegments.length < 3) {
    return false;
  }

  const appWildcard = `${requiredSegments[0]}:*`;
  return grantedSet.has(appWildcard);
}

function intersectStrings(
  a?: readonly string[],
  b?: readonly string[],
): readonly string[] | undefined {
  if (!a || !b) {
    return a ?? b;
  }

  const bSet = new Set(b);
  return a.filter((item) => bSet.has(item));
}

function unionStrings(
  a?: readonly string[],
  b?: readonly string[],
): readonly string[] | undefined {
  if (!a && !b) {
    return undefined;
  }

  const result = new Set<string>();
  for (const item of a ?? []) {
    result.add(item);
  }
  for (const item of b ?? []) {
    result.add(item);
  }

  return [...result];
}

export function mergeObligations(a: Obligations, b: Obligations): Obligations {
  const fieldsAllow = intersectStrings(a.fields?.allow, b.fields?.allow);
  const fieldsDeny = unionStrings(a.fields?.deny, b.fields?.deny);
  const fields =
    fieldsAllow || fieldsDeny
      ? {
          allow: fieldsAllow,
          deny: fieldsDeny,
        }
      : undefined;

  const buttonsAllow = intersectStrings(a.buttons?.allow, b.buttons?.allow);
  const buttonsDeny = unionStrings(a.buttons?.deny, b.buttons?.deny);
  const buttons =
    buttonsAllow || buttonsDeny
      ? {
          allow: buttonsAllow,
          deny: buttonsDeny,
        }
      : undefined;

  const workflowAllowTransitions = unionStrings(
    a.workflow?.allowTransitions,
    b.workflow?.allowTransitions,
  );
  const workflowDenyTransitions = unionStrings(
    a.workflow?.denyTransitions,
    b.workflow?.denyTransitions,
  );
  const workflow =
    workflowAllowTransitions || workflowDenyTransitions
      ? {
          allowTransitions: workflowAllowTransitions,
          denyTransitions: workflowDenyTransitions,
        }
      : undefined;

  // data 当前是占位（未来若定义为可组合 filter，将采用 AND 组合）。
  // 为避免引入顺序相关语义，这里仅在两边完全一致时保留 data。
  const data = a.data === b.data ? a.data : undefined;

  return {
    ...(data !== undefined ? { data } : {}),
    ...(fields ? { fields } : {}),
    ...(buttons ? { buttons } : {}),
    ...(workflow ? { workflow } : {}),
  };
}
