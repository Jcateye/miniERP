import { Module } from '@nestjs/common';
import { EvidenceController, EVIDENCE_BINDING_REPOSITORY_TOKEN } from './controllers/evidence.controller';
import { EvidenceBindingService } from '../../evidence/application/evidence-binding.service';
import { InMemoryEvidenceBindingRepository } from '../../evidence/infrastructure/evidence-binding.repository';
import { AuditModule } from '../../audit/audit.module';
import { TenantModule } from '../../common/tenant/tenant.module';

@Module({
  imports: [AuditModule, TenantModule],
  controllers: [EvidenceController],
  providers: [
    InMemoryEvidenceBindingRepository,
    EvidenceBindingService,
    {
      provide: EVIDENCE_BINDING_REPOSITORY_TOKEN,
      useExisting: InMemoryEvidenceBindingRepository,
    },
  ],
  exports: [EvidenceBindingService],
})
export class EvidenceModule {}
