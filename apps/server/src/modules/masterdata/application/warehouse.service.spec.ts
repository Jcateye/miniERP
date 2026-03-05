import { describe, expect, it, beforeEach } from '@jest/globals';
import { WarehouseService, WAREHOUSE_REPOSITORY_TOKEN } from './warehouse.service';
import { InMemoryWarehouseRepository } from '../infrastructure/in-memory-warehouse.repository';
import {
  WarehouseCodeDuplicateError,
  WarehouseNotFoundError,
  WarehouseValidationError,
} from '../domain/warehouse.errors';

describe('WarehouseService', () => {
  const tenantId = 'tenant-1';
  let service: WarehouseService;
  let repository: InMemoryWarehouseRepository;

  function createService(): WarehouseService {
    repository = new InMemoryWarehouseRepository();
    return new WarehouseService(repository);
  }

  beforeEach(() => {
    service = createService();
  });

  describe('create', () => {
    it('creates a warehouse with required fields', async () => {
      const result = await service.create(tenantId, {
        code: 'WH-001',
        name: 'Main Warehouse',
      });

      expect(result.id).toBeDefined();
      expect(result.code).toBe('WH-001');
      expect(result.name).toBe('Main Warehouse');
      expect(result.isActive).toBe(true);
      expect(result.tenantId).toBe(tenantId);
    });

    it('creates a warehouse with optional fields', async () => {
      const result = await service.create(tenantId, {
        code: 'WH-002',
        name: 'Branch Warehouse',
        address: '123 Main St',
        contactPerson: 'John Doe',
        contactPhone: '+1-555-0100',
      });

      expect(result.address).toBe('123 Main St');
      expect(result.contactPerson).toBe('John Doe');
      expect(result.contactPhone).toBe('+1-555-0100');
    });

    it('rejects duplicate code', async () => {
      await service.create(tenantId, {
        code: 'WH-DUP',
        name: 'First',
      });

      await expect(
        service.create(tenantId, {
          code: 'WH-DUP',
          name: 'Second',
        }),
      ).rejects.toBeInstanceOf(WarehouseCodeDuplicateError);
    });

    it('rejects missing code', async () => {
      await expect(
        service.create(tenantId, {
          code: '',
          name: 'Test',
        }),
      ).rejects.toBeInstanceOf(WarehouseValidationError);
    });

    it('rejects missing name', async () => {
      await expect(
        service.create(tenantId, {
          code: 'WH-NO-NAME',
          name: '',
        }),
      ).rejects.toBeInstanceOf(WarehouseValidationError);
    });
  });

  describe('findById', () => {
    it('returns warehouse by id', async () => {
      const created = await service.create(tenantId, {
        code: 'WH-FIND',
        name: 'Find Me',
      });

      const result = await service.findById(tenantId, created.id);
      expect(result).toEqual(created);
    });

    it('throws when not found', async () => {
      await expect(service.findById(tenantId, 'nonexistent')).rejects.toBeInstanceOf(
        WarehouseNotFoundError,
      );
    });
  });

  describe('findByCode', () => {
    it('returns warehouse by code', async () => {
      const created = await service.create(tenantId, {
        code: 'WH-CODE',
        name: 'Code Search',
      });

      const result = await service.findByCode(tenantId, 'WH-CODE');
      expect(result).toEqual(created);
    });

    it('returns null when code not found', async () => {
      const result = await service.findByCode(tenantId, 'NONEXISTENT');
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      await service.create(tenantId, { code: 'WH-A', name: 'Alpha Warehouse' });
      await service.create(tenantId, { code: 'WH-B', name: 'Beta Warehouse' });
      await service.create(tenantId, { code: 'WH-C', name: 'Gamma Warehouse' });
    });

    it('returns all warehouses', async () => {
      const results = await service.findAll(tenantId);
      expect(results).toHaveLength(3);
    });

    it('filters by code', async () => {
      const results = await service.findAll(tenantId, { code: 'WH-A' });
      expect(results).toHaveLength(1);
      expect(results[0]?.code).toBe('WH-A');
    });

    it('filters by name', async () => {
      const results = await service.findAll(tenantId, { name: 'Alpha' });
      expect(results).toHaveLength(1);
    });

    it('filters by isActive', async () => {
      const all = await service.findAll(tenantId);
      await service.update(tenantId, all[0]!.id, { isActive: false });
      const results = await service.findAll(tenantId, { isActive: true });
      expect(results).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('updates name', async () => {
      const created = await service.create(tenantId, {
        code: 'WH-UPD',
        name: 'Original',
      });

      const updated = await service.update(tenantId, created.id, { name: 'Updated' });
      expect(updated?.name).toBe('Updated');
    });

    it('updates isActive', async () => {
      const created = await service.create(tenantId, {
        code: 'WH-ACTIVE',
        name: 'Active Test',
      });

      const updated = await service.update(tenantId, created.id, { isActive: false });
      expect(updated?.isActive).toBe(false);
    });

    it('throws when not found', async () => {
      await expect(
        service.update(tenantId, 'nonexistent', { name: 'Updated' }),
      ).rejects.toBeInstanceOf(WarehouseNotFoundError);
    });

    it('rejects empty name', async () => {
      const created = await service.create(tenantId, {
        code: 'WH-EMPTY-NAME',
        name: 'Original',
      });

      await expect(
        service.update(tenantId, created.id, { name: '' }),
      ).rejects.toBeInstanceOf(WarehouseValidationError);
    });
  });

  describe('delete', () => {
    it('deletes existing warehouse', async () => {
      const created = await service.create(tenantId, {
        code: 'WH-DEL',
        name: 'To Delete',
      });

      const result = await service.delete(tenantId, created.id);
      expect(result).toBe(true);

      await expect(service.findById(tenantId, created.id)).rejects.toBeInstanceOf(
        WarehouseNotFoundError,
      );
    });

    it('throws when not found', async () => {
      await expect(service.delete(tenantId, 'nonexistent')).rejects.toBeInstanceOf(
        WarehouseNotFoundError,
      );
    });
  });

  describe('tenant isolation', () => {
    it('isolates warehouses by tenant', async () => {
      const tenant1Wh = await service.create('tenant-1', {
        code: 'WH-T1',
        name: 'Tenant 1 Warehouse',
      });

      const tenant2Wh = await service.create('tenant-2', {
        code: 'WH-T1', // Same code different tenant
        name: 'Tenant 2 Warehouse',
      });

      expect(tenant1Wh.tenantId).toBe('tenant-1');
      expect(tenant2Wh.tenantId).toBe('tenant-2');

      const tenant1Results = await service.findAll('tenant-1');
      const tenant2Results = await service.findAll('tenant-2');

      expect(tenant1Results).toHaveLength(1);
      expect(tenant2Results).toHaveLength(1);
    });
  });
});
