export type NodeEnv = 'development' | 'test' | 'production';

export type TenantIdSource = 'auth' | 'header';

export interface TenantResolverResult {
  readonly tenantId: string;
  readonly source: TenantIdSource;
}

export interface TenantResolverInput {
  readonly authTenantId?: string;
  readonly authRole?: string;
  readonly headerTenantId?: string;
  readonly nodeEnv: NodeEnv;
  readonly allowDevHeaderTenantFallback: boolean;
}

export type TenantResolverErrorCode = 'TENANT_MISSING' | 'TENANT_MISMATCH';

export class TenantResolverError extends Error {
  readonly code: TenantResolverErrorCode;

  constructor(code: TenantResolverErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

function normalize(value: string | undefined): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function resolveTenantId(input: TenantResolverInput): TenantResolverResult {
  const authTenantId = normalize(input.authTenantId);
  const headerTenantId = normalize(input.headerTenantId);

  if (
    authTenantId &&
    headerTenantId &&
    input.authRole !== 'platform_admin' &&
    authTenantId !== headerTenantId
  ) {
    throw new TenantResolverError(
      'TENANT_MISMATCH',
      'Tenant in authenticated context does not match tenant header',
    );
  }

  if (authTenantId) {
    return {
      tenantId: authTenantId,
      source: 'auth',
    };
  }

  if (
    input.nodeEnv === 'development' &&
    input.allowDevHeaderTenantFallback &&
    headerTenantId
  ) {
    return {
      tenantId: headerTenantId,
      source: 'header',
    };
  }

  if (headerTenantId) {
    // 在非 dev 或 fallback 关闭的情况下，header 不作为 tenantId 来源。
    throw new TenantResolverError(
      'TENANT_MISSING',
      'Authenticated tenant is required',
    );
  }

  throw new TenantResolverError(
    'TENANT_MISSING',
    'Authenticated tenant is required',
  );
}
