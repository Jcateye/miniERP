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

export interface AuditStore {
  append(event: AuditEvent): void;
}

export class InMemoryAuditStore implements AuditStore {
  private readonly events: AuditEvent[] = [];

  append(event: AuditEvent): void {
    this.events.push(event);
  }

  getAll(): AuditEvent[] {
    return [...this.events];
  }
}
