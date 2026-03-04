import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { AuditService } from '../audit/application/audit.service';
import {
  AUDIT_STORE_TOKEN,
  InMemoryAuditStore,
} from '../audit/application/audit.store';
import { TenantContextService } from '../common/tenant/tenant-context.service';

@Module({
  controllers: [DocumentsController],
  providers: [
    TenantContextService,
    {
      provide: AUDIT_STORE_TOKEN,
      useClass: InMemoryAuditStore,
    },
    AuditService,
  ],
})
export class DocumentsModule {}
