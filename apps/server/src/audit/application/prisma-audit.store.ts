import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PlatformDbService } from '../../database/platform-db.service';
import { resolveTenantDbId } from '../../modules/masterdata/infrastructure/prisma-tenant-id.resolver';
import type { AuditEvent, IAuditStore } from './audit.store';

@Injectable()
export class PrismaAuditStore implements IAuditStore {
  private readonly logger = new Logger(PrismaAuditStore.name);

  constructor(private readonly platformDb: PlatformDbService) {}

  append(event: AuditEvent): void {
    try {
      void this.platformDb
        .withTenantTx(async (tx) => {
          const tenantDbId = await resolveTenantDbId(tx, event.tenantId);

          await tx.auditLog.create({
            data: {
              requestId: event.requestId,
              tenantId: tenantDbId,
              actorId: event.actorId,
              action: event.action,
              entityType: event.entityType,
              entityId: event.entityId,
              result: event.result,
              reason: event.reason,
              metadata: event.metadata as unknown as Prisma.InputJsonValue,
              occurredAt: new Date(event.occurredAt),
            },
          });
        })
        .catch((error: unknown) => {
          this.logger.error('Failed to persist audit log', error as Error);
        });
    } catch (error: unknown) {
      this.logger.error('Failed to persist audit log', error as Error);
    }
  }
}
