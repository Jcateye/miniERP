export interface EvidenceBindingRecord {
  readonly id: string;
  readonly tenantId: string;
  readonly evidenceId: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly bindingLevel: 'document' | 'line';
  readonly lineId?: string;
  readonly tag: string;
  readonly createdAt: string;
}

interface FindByUniqueKeyInput {
  readonly tenantId: string;
  readonly evidenceId: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly bindingLevel: 'document' | 'line';
  readonly lineId?: string;
}

export class InMemoryEvidenceBindingRepository {
  private readonly records: EvidenceBindingRecord[] = [];

  findByUniqueKey(input: FindByUniqueKeyInput): EvidenceBindingRecord | undefined {
    return this.records.find((record) => {
      return (
        record.tenantId === input.tenantId &&
        record.evidenceId === input.evidenceId &&
        record.entityType === input.entityType &&
        record.entityId === input.entityId &&
        record.bindingLevel === input.bindingLevel &&
        record.lineId === input.lineId
      );
    });
  }

  create(record: Omit<EvidenceBindingRecord, 'id' | 'createdAt'>): EvidenceBindingRecord {
    const createdRecord: EvidenceBindingRecord = {
      ...record,
      id: String(this.records.length + 1),
      createdAt: new Date().toISOString(),
    };

    this.records.push(createdRecord);
    return createdRecord;
  }

  findByTenant(tenantId: string): EvidenceBindingRecord[] {
    return this.records.filter((record) => record.tenantId === tenantId);
  }
}
