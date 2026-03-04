export interface AuditEvent {
  readonly requestId: string;
  readonly tenantId: string;
  readonly actorId: string;
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly result: 'allow' | 'deny' | 'success' | 'fail';
  readonly reason?: string;
  readonly occurredAt: string;
  readonly metadata?: Record<string, unknown>;
}

export interface IAuditStore {
  append(event: AuditEvent): void;
}

export const AUDIT_STORE_TOKEN = 'AUDIT_STORE' as const;

export class InMemoryAuditStore implements IAuditStore {
  private readonly events: AuditEvent[] = [];

  append(event: AuditEvent): void {
    this.events.push(event);
  }

  getAll(): AuditEvent[] {
    return [...this.events];
  }
}
