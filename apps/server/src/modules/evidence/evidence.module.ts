import { Module } from '@nestjs/common';
import { EvidenceController, EVIDENCE_BINDING_REPOSITORY_TOKEN } from './controllers/evidence.controller';
import { EvidenceBindingService } from '../../evidence/application/evidence-binding.service';
import { InMemoryEvidenceBindingRepository } from '../../evidence/infrastructure/evidence-binding.repository';

@Module({
  controllers: [EvidenceController],
  providers: [
    EvidenceBindingService,
    {
      provide: EVIDENCE_BINDING_REPOSITORY_TOKEN,
      useClass: InMemoryEvidenceBindingRepository,
    },
  ],
  exports: [EvidenceBindingService],
})
export class EvidenceModule {}
