import { InMemoryAuditStore } from './audit.store';
import { AuditService } from './audit.service';

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

    const events = store.getAll();
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual(
      expect.objectContaining({
        requestId: 'req-1',
        tenantId: '1001',
        actorId: '2001',
        action: 'iam.authorize',
        entityType: 'evidence',
        entityId: '3001',
        result: 'deny',
        occurredAt: expect.any(String),
      }),
    );
  });
});
