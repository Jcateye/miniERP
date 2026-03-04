import { Module } from '@nestjs/common';
import { EvidenceController } from './controllers/evidence.controller';
import { EvidenceBindingService } from '../../evidence/application/evidence-binding.service';
import { InMemoryEvidenceBindingRepository } from '../../evidence/infrastructure/evidence-binding.repository';

@Module({
  controllers: [EvidenceController],
  providers: [EvidenceBindingService, InMemoryEvidenceBindingRepository],
  exports: [EvidenceBindingService],
})
export class EvidenceModule {}
