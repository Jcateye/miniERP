import { describe, expect, it, beforeEach } from '@jest/globals';
import { SkuService } from './sku.service';
import { InMemorySkuRepository } from '../infrastructure/in-memory-sku.repository';
import {
  SkuCodeDuplicateError,
  SkuNotFoundError,
  SkuValidationError,
} from '../domain/sku.errors';

describe('SkuService', () => {
  const tenantId = 'tenant-1';
  let service: SkuService;
  let repository: InMemorySkuRepository;

  function createService(): SkuService {
    repository = new InMemorySkuRepository();
    return new SkuService(repository);
  }

  beforeEach(() => {
    service = createService();
  });

  describe('create', () => {
    it('creates a SKU with required fields', async () => {
      const result = await service.create(tenantId, {
        code: 'SKU-001',
        name: 'Test SKU',
        baseUnit: 'PCS',
      });

      expect(result.id).toBeDefined();
      expect(result.code).toBe('SKU-001');
      expect(result.name).toBe('Test SKU');
      expect(result.baseUnit).toBe('PCS');
      expect(result.isActive).toBe(true);
      expect(result.tenantId).toBe(tenantId);
    });

    it('creates a SKU with optional fields', async () => {
      const result = await service.create(tenantId, {
        code: 'SKU-002',
        name: 'Test SKU 2',
        baseUnit: 'KG',
        specification: '100g per unit',
        categoryId: 'cat-1',
        itemType: 'finished_goods',
        taxCodeId: '1013',
        taxRate: '13.00',
        barcode: '6901001000999',
        batchManaged: true,
        serialManaged: false,
        shelfLifeDays: 365,
        minStockQty: '12.5',
        maxStockQty: '120.5',
        leadTimeDays: 7,
      });

      expect(result.specification).toBe('100g per unit');
      expect(result.categoryId).toBe('cat-1');
      expect(result.itemType).toBe('finished_goods');
      expect(result.taxCodeId).toBe('1013');
      expect(result.taxRate).toBe('13.00');
      expect(result.barcode).toBe('6901001000999');
      expect(result.batchManaged).toBe(true);
      expect(result.serialManaged).toBe(false);
      expect(result.shelfLifeDays).toBe(365);
      expect(result.minStockQty).toBe('12.5');
      expect(result.maxStockQty).toBe('120.5');
      expect(result.leadTimeDays).toBe(7);
    });

    it('rejects duplicate code', async () => {
      await service.create(tenantId, {
        code: 'SKU-DUP',
        name: 'First',
        baseUnit: 'PCS',
      });

      await expect(
        service.create(tenantId, {
          code: 'SKU-DUP',
          name: 'Second',
          baseUnit: 'PCS',
        }),
      ).rejects.toBeInstanceOf(SkuCodeDuplicateError);
    });

    it('rejects missing code', async () => {
      await expect(
        service.create(tenantId, {
          code: '',
          name: 'Test',
          baseUnit: 'PCS',
        }),
      ).rejects.toBeInstanceOf(SkuValidationError);
    });

    it('rejects missing name', async () => {
      await expect(
        service.create(tenantId, {
          code: 'SKU-NO-NAME',
          name: '',
          baseUnit: 'PCS',
        }),
      ).rejects.toBeInstanceOf(SkuValidationError);
    });

    it('rejects missing baseUnit', async () => {
      await expect(
        service.create(tenantId, {
          code: 'SKU-NO-UNIT',
          name: 'Test',
          baseUnit: '',
        }),
      ).rejects.toBeInstanceOf(SkuValidationError);
    });

    it('rejects negative leadTimeDays', async () => {
      await expect(
        service.create(tenantId, {
          code: 'SKU-NEG-LEAD',
          name: 'Test',
          baseUnit: 'PCS',
          leadTimeDays: -1,
        }),
      ).rejects.toBeInstanceOf(SkuValidationError);
    });

    it('rejects negative shelfLifeDays', async () => {
      await expect(
        service.create(tenantId, {
          code: 'SKU-NEG-SHELF',
          name: 'Test',
          baseUnit: 'PCS',
          shelfLifeDays: -1,
        }),
      ).rejects.toBeInstanceOf(SkuValidationError);
    });
  });

  describe('findById', () => {
    it('returns SKU by id', async () => {
      const created = await service.create(tenantId, {
        code: 'SKU-FIND',
        name: 'Find Me',
        baseUnit: 'PCS',
      });

      const result = await service.findById(tenantId, created.id);
      expect(result).toEqual(created);
    });

    it('throws when not found', async () => {
      await expect(
        service.findById(tenantId, 'nonexistent'),
      ).rejects.toBeInstanceOf(SkuNotFoundError);
    });
  });

  describe('findByCode', () => {
    it('returns SKU by code', async () => {
      const created = await service.create(tenantId, {
        code: 'SKU-CODE',
        name: 'Code Search',
        baseUnit: 'PCS',
      });

      const result = await service.findByCode(tenantId, 'SKU-CODE');
      expect(result).toEqual(created);
    });

    it('returns null when code not found', async () => {
      const result = await service.findByCode(tenantId, 'NONEXISTENT');
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      await service.create(tenantId, {
        code: 'SKU-A',
        name: 'Alpha',
        baseUnit: 'PCS',
        categoryId: 'cat-1',
      });
      await service.create(tenantId, {
        code: 'SKU-B',
        name: 'Beta',
        baseUnit: 'KG',
        categoryId: 'cat-2',
      });
      await service.create(tenantId, {
        code: 'SKU-C',
        name: 'Gamma',
        baseUnit: 'PCS',
        categoryId: 'cat-1',
      });
    });

    it('returns all SKUs', async () => {
      const results = await service.findAll(tenantId);
      expect(results).toHaveLength(3);
    });

    it('filters by code', async () => {
      const results = await service.findAll(tenantId, { code: 'SKU-A' });
      expect(results).toHaveLength(1);
      expect(results[0]?.code).toBe('SKU-A');
    });

    it('filters by name', async () => {
      const results = await service.findAll(tenantId, { name: 'Alpha' });
      expect(results).toHaveLength(1);
    });

    it('filters by categoryId', async () => {
      const results = await service.findAll(tenantId, { categoryId: 'cat-1' });
      expect(results).toHaveLength(2);
    });

    it('filters by isActive', async () => {
      await service.update(tenantId, (await service.findAll(tenantId))[0].id, {
        isActive: false,
      });
      const results = await service.findAll(tenantId, { isActive: true });
      expect(results).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('updates name', async () => {
      const created = await service.create(tenantId, {
        code: 'SKU-UPD',
        name: 'Original',
        baseUnit: 'PCS',
      });

      const updated = await service.update(tenantId, created.id, {
        name: 'Updated',
      });
      expect(updated?.name).toBe('Updated');
    });

    it('updates isActive', async () => {
      const created = await service.create(tenantId, {
        code: 'SKU-ACTIVE',
        name: 'Active Test',
        baseUnit: 'PCS',
      });

      const updated = await service.update(tenantId, created.id, {
        isActive: false,
      });
      expect(updated?.isActive).toBe(false);
    });

    it('updates richer item fields', async () => {
      const created = await service.create(tenantId, {
        code: 'SKU-RICH-UPD',
        name: 'Rich Fields',
        baseUnit: 'PCS',
      });

      const updated = await service.update(tenantId, created.id, {
        itemType: 'consumable',
        taxCodeId: '1009',
        taxRate: '9.00',
        barcode: '6901001888888',
        batchManaged: true,
        serialManaged: true,
        shelfLifeDays: 180,
        minStockQty: '8',
        maxStockQty: '80',
        leadTimeDays: 15,
      });

      expect(updated.itemType).toBe('consumable');
      expect(updated.taxCodeId).toBe('1009');
      expect(updated.taxRate).toBe('9.00');
      expect(updated.barcode).toBe('6901001888888');
      expect(updated.batchManaged).toBe(true);
      expect(updated.serialManaged).toBe(true);
      expect(updated.shelfLifeDays).toBe(180);
      expect(updated.minStockQty).toBe('8');
      expect(updated.maxStockQty).toBe('80');
      expect(updated.leadTimeDays).toBe(15);
    });

    it('throws when not found', async () => {
      await expect(
        service.update(tenantId, 'nonexistent', { name: 'Updated' }),
      ).rejects.toBeInstanceOf(SkuNotFoundError);
    });

    it('rejects empty name', async () => {
      const created = await service.create(tenantId, {
        code: 'SKU-EMPTY-NAME',
        name: 'Original',
        baseUnit: 'PCS',
      });

      await expect(
        service.update(tenantId, created.id, { name: '' }),
      ).rejects.toBeInstanceOf(SkuValidationError);
    });

    it('rejects negative leadTimeDays on update', async () => {
      const created = await service.create(tenantId, {
        code: 'SKU-NEG-LEAD-UPD',
        name: 'Original',
        baseUnit: 'PCS',
      });

      await expect(
        service.update(tenantId, created.id, { leadTimeDays: -3 }),
      ).rejects.toBeInstanceOf(SkuValidationError);
    });

    it('rejects negative shelfLifeDays on update', async () => {
      const created = await service.create(tenantId, {
        code: 'SKU-NEG-SHELF-UPD',
        name: 'Original',
        baseUnit: 'PCS',
      });

      await expect(
        service.update(tenantId, created.id, { shelfLifeDays: -2 }),
      ).rejects.toBeInstanceOf(SkuValidationError);
    });
  });

  describe('delete', () => {
    it('deletes existing SKU', async () => {
      const created = await service.create(tenantId, {
        code: 'SKU-DEL',
        name: 'To Delete',
        baseUnit: 'PCS',
      });

      const result = await service.delete(tenantId, created.id);
      expect(result).toBe(true);

      await expect(
        service.findById(tenantId, created.id),
      ).rejects.toBeInstanceOf(SkuNotFoundError);
    });

    it('throws when not found', async () => {
      await expect(
        service.delete(tenantId, 'nonexistent'),
      ).rejects.toBeInstanceOf(SkuNotFoundError);
    });
  });

  describe('tenant isolation', () => {
    it('isolates SKUs by tenant', async () => {
      const tenant1Sku = await service.create('tenant-1', {
        code: 'SKU-T1',
        name: 'Tenant 1 SKU',
        baseUnit: 'PCS',
      });

      const tenant2Sku = await service.create('tenant-2', {
        code: 'SKU-T1', // Same code different tenant
        name: 'Tenant 2 SKU',
        baseUnit: 'PCS',
      });

      expect(tenant1Sku.tenantId).toBe('tenant-1');
      expect(tenant2Sku.tenantId).toBe('tenant-2');

      const tenant1Results = await service.findAll('tenant-1');
      const tenant2Results = await service.findAll('tenant-2');

      expect(tenant1Results).toHaveLength(1);
      expect(tenant2Results).toHaveLength(1);
    });
  });
});
