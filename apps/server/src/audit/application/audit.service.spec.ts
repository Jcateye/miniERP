import { InMemoryAuditStore } from './audit.store';
import { AuditService } from './audit.service';
import type { AuditEvent } from './audit.store';

describe('AuditService', () => {
  it('records authorization audit with minimum required fields', () => {
    const store = new InMemoryAuditStore();
    const service = new AuditService(store);

    service.recordAuthorization({
      requestId: 'req-1',
      tenantId: '1001',
      actorId: '2001',
      action: 'iam.authorize',
      entityType: 'evidence',
      entityId: '3001',
      result: 'deny',
      reason: 'MISSING_PERMISSION',
    });

    const events: AuditEvent[] = store.getAll();
    expect(events).toHaveLength(1);
    const event = events[0];
    expect(event.requestId).toBe('req-1');
    expect(event.tenantId).toBe('1001');
    expect(event.actorId).toBe('2001');
    expect(event.action).toBe('iam.authorize');
    expect(event.entityType).toBe('evidence');
    expect(event.entityId).toBe('3001');
    expect(event.result).toBe('deny');
    expect(typeof event.occurredAt).toBe('string');
  });
});
