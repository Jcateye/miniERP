import { Module } from '@nestjs/common';
import { EvidenceController } from './controllers/evidence.controller';
import { EvidenceBindingService } from './application/evidence-binding.service';
import { InMemoryEvidenceBindingRepository } from './infrastructure/evidence-binding.repository';
import { TenantContextService } from '../../common/tenant/tenant-context.service';
import { AuditService } from '../../audit/application/audit.service';
import { AUDIT_STORE_TOKEN, InMemoryAuditStore } from '../../audit/application/audit.store';

@Module({
  controllers: [EvidenceController],
  providers: [
    TenantContextService,
    InMemoryEvidenceBindingRepository,
    EvidenceBindingService,
    {
      provide: AUDIT_STORE_TOKEN,
      useClass: InMemoryAuditStore,
    },
    AuditService,
  ],
  exports: [EvidenceBindingService],
})
export class EvidenceModule {}
