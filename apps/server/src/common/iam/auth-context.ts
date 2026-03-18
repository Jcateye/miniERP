export interface AuthContext {
  readonly tenantId: string;
  readonly actorId: string;
  readonly permissions: readonly string[];
  readonly role: 'platform_admin' | 'tenant_admin' | 'operator';
  readonly schemaName?: string;
}

export interface AuthenticatedRequest {
  readonly authContext?: AuthContext;
  readonly headers: Record<string, unknown>;
  readonly path?: string;
  readonly originalUrl?: string;
}
