import { Injectable } from '@nestjs/common';
import { redactAuditMetadata } from '../domain/audit-redactor';
import { InMemoryAuditStore, type AuditEvent, type AuditStore } from './audit.store';

interface RecordAuditInput {
  readonly requestId: string;
  readonly tenantId: string;
  readonly actorId: string;
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly result: AuditEvent['result'];
  readonly reason?: string;
  readonly metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  constructor(private readonly auditStore: AuditStore = new InMemoryAuditStore()) {}

  recordAuthorization(input: RecordAuditInput): void {
    this.recordEvent(input);
  }

  recordEvidenceBinding(input: RecordAuditInput): void {
    this.recordEvent(input);
  }

  private recordEvent(input: RecordAuditInput): void {
    this.auditStore.append({
      ...input,
      metadata: redactAuditMetadata(input.metadata),
      occurredAt: new Date().toISOString(),
    });
  }
}
