import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { AuditEvent, IAuditStore } from './audit.store';

@Injectable()
export class PrismaAuditStore implements IAuditStore {
  private readonly logger = new Logger(PrismaAuditStore.name);

  constructor(private readonly prisma: PrismaService) {}

  append(event: AuditEvent): void {
    let tenantId: bigint;
    try {
      tenantId = BigInt(event.tenantId);
    } catch {
      this.logger.warn(
        `Skip audit persistence because tenantId is not bigint-compatible: ${event.tenantId}`,
      );
      return;
    }

    void this.prisma.auditLog
      .create({
        data: {
          requestId: event.requestId,
          tenantId,
          actorId: event.actorId,
          action: event.action,
          entityType: event.entityType,
          entityId: event.entityId,
          result: event.result,
          reason: event.reason,
          metadata: event.metadata,
          occurredAt: new Date(event.occurredAt),
        },
      })
      .catch((error: unknown) => {
        this.logger.error('Failed to persist audit log', error as Error);
      });
  }
}
