import { Module } from '@nestjs/common';
import { AuditService } from './application/audit.service';
import { AUDIT_STORE_TOKEN, InMemoryAuditStore } from './application/audit.store';

@Module({
  providers: [
    {
      provide: AUDIT_STORE_TOKEN,
      useClass: InMemoryAuditStore,
    },
    AuditService,
  ],
  exports: [AUDIT_STORE_TOKEN, AuditService],
})
export class AuditModule {}
