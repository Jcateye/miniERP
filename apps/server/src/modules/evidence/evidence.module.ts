import { Module } from '@nestjs/common';
import { AuditModule } from '../../audit/audit.module';
import { TenantModule } from '../../common/tenant/tenant.module';
import { EvidenceBindingService } from '../../evidence/application/evidence-binding.service';
import {
  EVIDENCE_BINDING_REPOSITORY_TOKEN,
  InMemoryEvidenceBindingRepository,
  PrismaEvidenceBindingRepository,
} from '../../evidence/infrastructure/evidence-binding.repository';
import { EvidenceController } from './controllers/evidence.controller';

@Module({
  imports: [AuditModule, TenantModule],
  controllers: [EvidenceController],
  providers: [
    InMemoryEvidenceBindingRepository,
    PrismaEvidenceBindingRepository,
    {
      provide: EVIDENCE_BINDING_REPOSITORY_TOKEN,
      useFactory: (
        inMemoryRepository: InMemoryEvidenceBindingRepository,
        prismaRepository: PrismaEvidenceBindingRepository,
      ) =>
        (process.env.NODE_ENV ?? 'development') === 'test'
          ? inMemoryRepository
          : prismaRepository,
      inject: [
        InMemoryEvidenceBindingRepository,
        PrismaEvidenceBindingRepository,
      ],
    },
    EvidenceBindingService,
  ],
  exports: [EvidenceBindingService],
})
export class EvidenceModule {}
