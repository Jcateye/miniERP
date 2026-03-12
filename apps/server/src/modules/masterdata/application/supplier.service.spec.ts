import { describe, expect, it, beforeEach } from '@jest/globals';
import { SupplierService } from './supplier.service';
import { InMemorySupplierRepository } from '../infrastructure/in-memory-supplier.repository';
import {
  SupplierCodeDuplicateError,
  SupplierNotFoundError,
  SupplierValidationError,
} from '../domain/supplier.errors';

describe('SupplierService', () => {
  const tenantId = 'tenant-1';
  let service: SupplierService;

  function createService(): SupplierService {
    return new SupplierService(new InMemorySupplierRepository());
  }

  beforeEach(() => {
    service = createService();
  });

  describe('create', () => {
    it('creates a supplier with required fields', async () => {
      const result = await service.create(tenantId, {
        code: 'SUP-001',
        name: 'Acme Corp',
      });

      expect(result.id).toBeDefined();
      expect(result.code).toBe('SUP-001');
      expect(result.name).toBe('Acme Corp');
      expect(result.isActive).toBe(true);
      expect(result.tenantId).toBe(tenantId);
    });

    it('creates a supplier with optional fields', async () => {
      const result = await service.create(tenantId, {
        code: 'SUP-002',
        name: 'Beta Inc',
        contactPerson: 'Jane Smith',
        contactPhone: '+1-555-0200',
        email: 'jane@beta.com',
        address: '456 Oak Ave',
      });

      expect(result.contactPerson).toBe('Jane Smith');
      expect(result.contactPhone).toBe('+1-555-0200');
      expect(result.email).toBe('jane@beta.com');
      expect(result.address).toBe('456 Oak Ave');
    });

    it('rejects duplicate code', async () => {
      await service.create(tenantId, { code: 'SUP-DUP', name: 'First' });

      await expect(
        service.create(tenantId, { code: 'SUP-DUP', name: 'Second' }),
      ).rejects.toBeInstanceOf(SupplierCodeDuplicateError);
    });

    it('rejects missing code', async () => {
      await expect(
        service.create(tenantId, { code: '', name: 'Test' }),
      ).rejects.toBeInstanceOf(SupplierValidationError);
    });

    it('rejects missing name', async () => {
      await expect(
        service.create(tenantId, { code: 'SUP-NO-NAME', name: '' }),
      ).rejects.toBeInstanceOf(SupplierValidationError);
    });
  });

  describe('findById', () => {
    it('returns supplier by id', async () => {
      const created = await service.create(tenantId, {
        code: 'SUP-FIND',
        name: 'Find Me',
      });

      const result = await service.findById(tenantId, created.id);
      expect(result).toEqual(created);
    });

    it('throws when not found', async () => {
      await expect(
        service.findById(tenantId, 'nonexistent'),
      ).rejects.toBeInstanceOf(SupplierNotFoundError);
    });
  });

  describe('findByCode', () => {
    it('returns supplier by code', async () => {
      const created = await service.create(tenantId, {
        code: 'SUP-CODE',
        name: 'Code Search',
      });

      const result = await service.findByCode(tenantId, 'SUP-CODE');
      expect(result).toEqual(created);
    });

    it('returns null when code not found', async () => {
      const result = await service.findByCode(tenantId, 'NONEXISTENT');
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      await service.create(tenantId, { code: 'SUP-A', name: 'Alpha Corp' });
      await service.create(tenantId, { code: 'SUP-B', name: 'Beta Inc' });
      await service.create(tenantId, { code: 'SUP-C', name: 'Gamma LLC' });
    });

    it('returns all suppliers', async () => {
      const results = await service.findAll(tenantId);
      expect(results).toHaveLength(3);
    });

    it('filters by code', async () => {
      const results = await service.findAll(tenantId, { code: 'SUP-A' });
      expect(results).toHaveLength(1);
      expect(results[0]?.code).toBe('SUP-A');
    });

    it('filters by name', async () => {
      const results = await service.findAll(tenantId, { name: 'Beta' });
      expect(results).toHaveLength(1);
    });

    it('filters by isActive', async () => {
      const all = await service.findAll(tenantId);
      await service.update(tenantId, all[0].id, { isActive: false });
      const results = await service.findAll(tenantId, { isActive: true });
      expect(results).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('updates name', async () => {
      const created = await service.create(tenantId, {
        code: 'SUP-UPD',
        name: 'Original',
      });

      const updated = await service.update(tenantId, created.id, {
        name: 'Updated',
      });
      expect(updated?.name).toBe('Updated');
    });

    it('updates isActive', async () => {
      const created = await service.create(tenantId, {
        code: 'SUP-ACTIVE',
        name: 'Active Test',
      });

      const updated = await service.update(tenantId, created.id, {
        isActive: false,
      });
      expect(updated?.isActive).toBe(false);
    });

    it('throws when not found', async () => {
      await expect(
        service.update(tenantId, 'nonexistent', { name: 'Updated' }),
      ).rejects.toBeInstanceOf(SupplierNotFoundError);
    });

    it('rejects empty name', async () => {
      const created = await service.create(tenantId, {
        code: 'SUP-EMPTY-NAME',
        name: 'Original',
      });

      await expect(
        service.update(tenantId, created.id, { name: '' }),
      ).rejects.toBeInstanceOf(SupplierValidationError);
    });
  });

  describe('delete', () => {
    it('deletes existing supplier', async () => {
      const created = await service.create(tenantId, {
        code: 'SUP-DEL',
        name: 'To Delete',
      });

      const result = await service.delete(tenantId, created.id);
      expect(result).toBe(true);

      await expect(
        service.findById(tenantId, created.id),
      ).rejects.toBeInstanceOf(SupplierNotFoundError);
    });

    it('throws when not found', async () => {
      await expect(
        service.delete(tenantId, 'nonexistent'),
      ).rejects.toBeInstanceOf(SupplierNotFoundError);
    });
  });

  describe('tenant isolation', () => {
    it('isolates suppliers by tenant', async () => {
      const tenant1Sup = await service.create('tenant-1', {
        code: 'SUP-T1',
        name: 'Tenant 1 Supplier',
      });

      const tenant2Sup = await service.create('tenant-2', {
        code: 'SUP-T1', // Same code different tenant
        name: 'Tenant 2 Supplier',
      });

      expect(tenant1Sup.tenantId).toBe('tenant-1');
      expect(tenant2Sup.tenantId).toBe('tenant-2');

      const tenant1Results = await service.findAll('tenant-1');
      const tenant2Results = await service.findAll('tenant-2');

      expect(tenant1Results).toHaveLength(1);
      expect(tenant2Results).toHaveLength(1);
    });
  });
});
