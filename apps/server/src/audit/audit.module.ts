import { Module } from '@nestjs/common';
import { AuditService } from './application/audit.service';
import { AUDIT_STORE_TOKEN, InMemoryAuditStore } from './application/audit.store';
import { PrismaAuditStore } from './application/prisma-audit.store';

@Module({
  providers: [
    InMemoryAuditStore,
    PrismaAuditStore,
    {
      provide: AUDIT_STORE_TOKEN,
      useFactory: (
        inMemoryAuditStore: InMemoryAuditStore,
        prismaAuditStore: PrismaAuditStore,
      ) =>
        (process.env.NODE_ENV ?? 'development') === 'test'
          ? inMemoryAuditStore
          : prismaAuditStore,
      inject: [InMemoryAuditStore, PrismaAuditStore],
    },
    AuditService,
  ],
  exports: [AUDIT_STORE_TOKEN, AuditService],
})
export class AuditModule {}
