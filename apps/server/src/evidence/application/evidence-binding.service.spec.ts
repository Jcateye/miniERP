import { ForbiddenException } from '@nestjs/common';
import { AuditService } from '../../audit/application/audit.service';
import { TenantContextService } from '../../common/tenant/tenant-context.service';
import { InMemoryEvidenceBindingRepository } from '../infrastructure/evidence-binding.repository';
import { EvidenceBindingService } from './evidence-binding.service';

describe('EvidenceBindingService', () => {
  function createService(context: { tenantId: string; requestId: string; actorId?: string }) {
    const tenantContextService = {
      getRequiredContext: jest.fn().mockReturnValue(context),
    } as unknown as TenantContextService;

    const auditService = {
      recordEvidenceBinding: jest.fn(),
    } as unknown as AuditService;

    const repository = new InMemoryEvidenceBindingRepository();

    return {
      service: new EvidenceBindingService(repository, tenantContextService, auditService),
      repository,
      auditService,
    };
  }

  it('creates document-level binding', () => {
    const { service, repository } = createService({ tenantId: '1001', requestId: 'req-1', actorId: '2001' });

    const result = service.bindEvidence({
      evidenceId: '5001',
      entityType: 'grn',
      entityId: '3001',
      bindingLevel: 'document',
      tag: 'invoice',
    });

    expect(result.bindingLevel).toBe('document');
    expect(result.lineId).toBeUndefined();
    expect(repository.findByTenant('1001')).toHaveLength(1);
  });

  it('creates line-level binding when lineId is provided', () => {
    const { service } = createService({ tenantId: '1001', requestId: 'req-1', actorId: '2001' });

    const result = service.bindEvidence({
      evidenceId: '5001',
      entityType: 'stocktake',
      entityId: '3001',
      bindingLevel: 'line',
      lineId: '901',
      tag: 'discrepancy-photo',
    });

    expect(result.bindingLevel).toBe('line');
    expect(result.lineId).toBe('901');
  });

  it('throws when trying to bind to another tenant', () => {
    const { service } = createService({ tenantId: '1001', requestId: 'req-1', actorId: '2001' });

    expect(() =>
      service.bindEvidence({
        evidenceId: '5001',
        entityType: 'outbound',
        entityId: '3001',
        bindingLevel: 'document',
        tag: 'proof',
        tenantId: '1002',
      }),
    ).toThrow(ForbiddenException);
  });

  it('is idempotent for same tenant/evidence/entity/scope/line', () => {
    const { service, repository } = createService({ tenantId: '1001', requestId: 'req-1', actorId: '2001' });

    const first = service.bindEvidence({
      evidenceId: '5001',
      entityType: 'grn',
      entityId: '3001',
      bindingLevel: 'line',
      lineId: '901',
      tag: 'discrepancy-photo',
    });

    const second = service.bindEvidence({
      evidenceId: '5001',
      entityType: 'grn',
      entityId: '3001',
      bindingLevel: 'line',
      lineId: '901',
      tag: 'discrepancy-photo',
    });

    expect(second.id).toBe(first.id);
    expect(repository.findByTenant('1001')).toHaveLength(1);
  });
});
