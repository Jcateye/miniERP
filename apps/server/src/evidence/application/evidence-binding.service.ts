import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuditService } from '../../audit/application/audit.service';
import { TenantContextService } from '../../common/tenant/tenant-context.service';
import {
  evidenceBindingSchema,
  type EvidenceBindingInput,
} from '../domain/evidence-binding.schema';
import {
  InMemoryEvidenceBindingRepository,
  type EvidenceBindingRecord,
} from '../infrastructure/evidence-binding.repository';

@Injectable()
export class EvidenceBindingService {
  constructor(
    private readonly repository: InMemoryEvidenceBindingRepository = new InMemoryEvidenceBindingRepository(),
    private readonly tenantContextService: TenantContextService,
    private readonly auditService: AuditService,
  ) {}

  bindEvidence(input: EvidenceBindingInput): EvidenceBindingRecord {
    const parsedInput = evidenceBindingSchema.parse(input);
    const context = this.tenantContextService.getRequiredContext();
    const tenantId = parsedInput.tenantId ?? context.tenantId;

    if (tenantId !== context.tenantId) {
      this.auditService.recordEvidenceBinding({
        requestId: context.requestId,
        tenantId: context.tenantId,
        actorId: context.actorId ?? 'unknown',
        action: 'evidence.bind',
        entityType: parsedInput.entityType,
        entityId: parsedInput.entityId,
        result: 'deny',
        reason: 'TENANT_MISMATCH',
      });
      throw new ForbiddenException('Cross-tenant evidence binding is forbidden');
    }

    const existingRecord = this.repository.findByUniqueKey({
      tenantId,
      evidenceId: parsedInput.evidenceId,
      entityType: parsedInput.entityType,
      entityId: parsedInput.entityId,
      bindingLevel: parsedInput.bindingLevel,
      lineId: parsedInput.lineId,
    });

    if (existingRecord) {
      return existingRecord;
    }

    const createdRecord = this.repository.create({
      tenantId,
      evidenceId: parsedInput.evidenceId,
      entityType: parsedInput.entityType,
      entityId: parsedInput.entityId,
      bindingLevel: parsedInput.bindingLevel,
      lineId: parsedInput.lineId,
      tag: parsedInput.tag,
    });

    this.auditService.recordEvidenceBinding({
      requestId: context.requestId,
      tenantId: context.tenantId,
      actorId: context.actorId ?? 'unknown',
      action: 'evidence.bind',
      entityType: parsedInput.entityType,
      entityId: parsedInput.entityId,
      result: 'success',
      metadata: {
        evidenceId: parsedInput.evidenceId,
        bindingLevel: parsedInput.bindingLevel,
        lineId: parsedInput.lineId,
      },
    });

    return createdRecord;
  }
}
