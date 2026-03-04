import { Injectable } from '@nestjs/common';
import type {
  WarehouseEntity,
  WarehouseRepository,
  WarehouseQueryFilter,
  UpdateWarehouseCommand,
} from '../domain/warehouse.types';

@Injectable()
export class InMemoryWarehouseRepository implements WarehouseRepository {
  private readonly store = new Map<string, Map<string, WarehouseEntity>>();

  private getTenantStore(tenantId: string): Map<string, WarehouseEntity> {
    let tenantStore = this.store.get(tenantId);
    if (!tenantStore) {
      tenantStore = new Map();
      this.store.set(tenantId, tenantStore);
    }
    return tenantStore;
  }

  async findById(tenantId: string, id: string): Promise<WarehouseEntity | null> {
    const tenantStore = this.getTenantStore(tenantId);
    return tenantStore.get(id) ?? null;
  }

  async findByCode(tenantId: string, code: string): Promise<WarehouseEntity | null> {
    const tenantStore = this.getTenantStore(tenantId);
    for (const entity of tenantStore.values()) {
      if (entity.code === code) {
        return entity;
      }
    }
    return null;
  }

  async findAll(
    tenantId: string,
    filter?: WarehouseQueryFilter,
  ): Promise<readonly WarehouseEntity[]> {
    const tenantStore = this.getTenantStore(tenantId);
    let results = [...tenantStore.values()];

    if (filter) {
      if (filter.code) {
        results = results.filter((e) => e.code.includes(filter.code!));
      }
      if (filter.name) {
        results = results.filter((e) => e.name.includes(filter.name!));
      }
      if (filter.isActive !== undefined) {
        results = results.filter((e) => e.isActive === filter.isActive);
      }
    }

    return results.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async save(
    tenantId: string,
    entity: Omit<WarehouseEntity, 'tenantId'>,
  ): Promise<WarehouseEntity> {
    const tenantStore = this.getTenantStore(tenantId);
    const fullEntity: WarehouseEntity = { ...entity, tenantId };
    tenantStore.set(entity.id, fullEntity);
    return fullEntity;
  }

  async update(
    tenantId: string,
    id: string,
    updates: UpdateWarehouseCommand,
  ): Promise<WarehouseEntity | null> {
    const tenantStore = this.getTenantStore(tenantId);
    const existing = tenantStore.get(id);
    if (!existing) {
      return null;
    }

    const updated: WarehouseEntity = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    tenantStore.set(id, updated);
    return updated;
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const tenantStore = this.getTenantStore(tenantId);
    return tenantStore.delete(id);
  }

  async existsByCode(tenantId: string, code: string): Promise<boolean> {
    const existing = await this.findByCode(tenantId, code);
    return existing !== null;
  }
}
