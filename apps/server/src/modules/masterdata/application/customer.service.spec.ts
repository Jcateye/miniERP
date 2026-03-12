import { describe, expect, it, beforeEach } from '@jest/globals';
import { CustomerService } from './customer.service';
import { InMemoryCustomerRepository } from '../infrastructure/in-memory-customer.repository';
import {
  CustomerCodeDuplicateError,
  CustomerNotFoundError,
  CustomerValidationError,
} from '../domain/customer.errors';

describe('CustomerService', () => {
  const tenantId = 'tenant-1';
  let service: CustomerService;

  function createService(): CustomerService {
    return new CustomerService(new InMemoryCustomerRepository());
  }

  beforeEach(() => {
    service = createService();
  });

  describe('create', () => {
    it('creates a customer with required fields', async () => {
      const result = await service.create(tenantId, {
        code: 'CUST-001',
        name: 'John Doe',
      });

      expect(result.id).toBeDefined();
      expect(result.code).toBe('CUST-001');
      expect(result.name).toBe('John Doe');
      expect(result.isActive).toBe(true);
      expect(result.tenantId).toBe(tenantId);
    });

    it('creates a customer with optional fields', async () => {
      const result = await service.create(tenantId, {
        code: 'CUST-002',
        name: 'Jane Smith',
        contactPerson: 'Jane Smith',
        contactPhone: '+1-555-0300',
        email: 'jane@example.com',
        address: '789 Pine St',
      });

      expect(result.contactPerson).toBe('Jane Smith');
      expect(result.contactPhone).toBe('+1-555-0300');
      expect(result.email).toBe('jane@example.com');
      expect(result.address).toBe('789 Pine St');
    });

    it('rejects duplicate code', async () => {
      await service.create(tenantId, { code: 'CUST-DUP', name: 'First' });

      await expect(
        service.create(tenantId, { code: 'CUST-DUP', name: 'Second' }),
      ).rejects.toBeInstanceOf(CustomerCodeDuplicateError);
    });

    it('rejects missing code', async () => {
      await expect(
        service.create(tenantId, { code: '', name: 'Test' }),
      ).rejects.toBeInstanceOf(CustomerValidationError);
    });

    it('rejects missing name', async () => {
      await expect(
        service.create(tenantId, { code: 'CUST-NO-NAME', name: '' }),
      ).rejects.toBeInstanceOf(CustomerValidationError);
    });
  });

  describe('findById', () => {
    it('returns customer by id', async () => {
      const created = await service.create(tenantId, {
        code: 'CUST-FIND',
        name: 'Find Me',
      });

      const result = await service.findById(tenantId, created.id);
      expect(result).toEqual(created);
    });

    it('throws when not found', async () => {
      await expect(
        service.findById(tenantId, 'nonexistent'),
      ).rejects.toBeInstanceOf(CustomerNotFoundError);
    });
  });

  describe('findByCode', () => {
    it('returns customer by code', async () => {
      const created = await service.create(tenantId, {
        code: 'CUST-CODE',
        name: 'Code Search',
      });

      const result = await service.findByCode(tenantId, 'CUST-CODE');
      expect(result).toEqual(created);
    });

    it('returns null when code not found', async () => {
      const result = await service.findByCode(tenantId, 'NONEXISTENT');
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      await service.create(tenantId, { code: 'CUST-A', name: 'Alice' });
      await service.create(tenantId, { code: 'CUST-B', name: 'Bob' });
      await service.create(tenantId, { code: 'CUST-C', name: 'Charlie' });
    });

    it('returns all customers', async () => {
      const results = await service.findAll(tenantId);
      expect(results).toHaveLength(3);
    });

    it('filters by code', async () => {
      const results = await service.findAll(tenantId, { code: 'CUST-A' });
      expect(results).toHaveLength(1);
      expect(results[0]?.code).toBe('CUST-A');
    });

    it('filters by name', async () => {
      const results = await service.findAll(tenantId, { name: 'Bob' });
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
        code: 'CUST-UPD',
        name: 'Original',
      });

      const updated = await service.update(tenantId, created.id, {
        name: 'Updated',
      });
      expect(updated?.name).toBe('Updated');
    });

    it('updates isActive', async () => {
      const created = await service.create(tenantId, {
        code: 'CUST-ACTIVE',
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
      ).rejects.toBeInstanceOf(CustomerNotFoundError);
    });

    it('rejects empty name', async () => {
      const created = await service.create(tenantId, {
        code: 'CUST-EMPTY-NAME',
        name: 'Original',
      });

      await expect(
        service.update(tenantId, created.id, { name: '' }),
      ).rejects.toBeInstanceOf(CustomerValidationError);
    });
  });

  describe('delete', () => {
    it('deletes existing customer', async () => {
      const created = await service.create(tenantId, {
        code: 'CUST-DEL',
        name: 'To Delete',
      });

      const result = await service.delete(tenantId, created.id);
      expect(result).toBe(true);

      await expect(
        service.findById(tenantId, created.id),
      ).rejects.toBeInstanceOf(CustomerNotFoundError);
    });

    it('throws when not found', async () => {
      await expect(
        service.delete(tenantId, 'nonexistent'),
      ).rejects.toBeInstanceOf(CustomerNotFoundError);
    });
  });

  describe('tenant isolation', () => {
    it('isolates customers by tenant', async () => {
      const tenant1Cust = await service.create('tenant-1', {
        code: 'CUST-T1',
        name: 'Tenant 1 Customer',
      });

      const tenant2Cust = await service.create('tenant-2', {
        code: 'CUST-T1', // Same code different tenant
        name: 'Tenant 2 Customer',
      });

      expect(tenant1Cust.tenantId).toBe('tenant-1');
      expect(tenant2Cust.tenantId).toBe('tenant-2');

      const tenant1Results = await service.findAll('tenant-1');
      const tenant2Results = await service.findAll('tenant-2');

      expect(tenant1Results).toHaveLength(1);
      expect(tenant2Results).toHaveLength(1);
    });
  });
});
