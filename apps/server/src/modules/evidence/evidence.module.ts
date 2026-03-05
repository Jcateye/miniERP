import { Module } from '@nestjs/common';
import { EvidenceController, EVIDENCE_BINDING_REPOSITORY_TOKEN } from './controllers/evidence.controller';
import { EvidenceBindingService } from '../../evidence/application/evidence-binding.service';
import { InMemoryEvidenceBindingRepository } from '../../evidence/infrastructure/evidence-binding.repository';
import { AuditService } from '../../audit/application/audit.service';
import {
  AUDIT_STORE_TOKEN,
  InMemoryAuditStore,
} from '../../audit/application/audit.store';
import { TenantContextService } from '../../common/tenant/tenant-context.service';

@Module({
  controllers: [EvidenceController],
  providers: [
    TenantContextService,
    {
      provide: AUDIT_STORE_TOKEN,
      useClass: InMemoryAuditStore,
    },
    AuditService,
    EvidenceBindingService,
    {
      provide: EVIDENCE_BINDING_REPOSITORY_TOKEN,
      useClass: InMemoryEvidenceBindingRepository,
    },
  ],
  exports: [EvidenceBindingService],
})
export class EvidenceModule {}
