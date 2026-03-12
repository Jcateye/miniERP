import { Injectable } from '@nestjs/common';
import type {
  SkuEntity,
  SkuRepository,
  SkuQueryFilter,
  UpdateSkuCommand,
} from '../domain/sku.types';

@Injectable()
export class InMemorySkuRepository implements SkuRepository {
  private readonly store = new Map<string, Map<string, SkuEntity>>();

  private getTenantStore(tenantId: string): Map<string, SkuEntity> {
    let tenantStore = this.store.get(tenantId);
    if (!tenantStore) {
      tenantStore = new Map();
      this.store.set(tenantId, tenantStore);
    }
    return tenantStore;
  }

  findById(tenantId: string, id: string): Promise<SkuEntity | null> {
    const tenantStore = this.getTenantStore(tenantId);
    return Promise.resolve(tenantStore.get(id) ?? null);
  }

  findByCode(tenantId: string, code: string): Promise<SkuEntity | null> {
    const tenantStore = this.getTenantStore(tenantId);
    for (const entity of tenantStore.values()) {
      if (entity.code === code) {
        return Promise.resolve(entity);
      }
    }
    return Promise.resolve(null);
  }

  findAll(
    tenantId: string,
    filter?: SkuQueryFilter,
  ): Promise<readonly SkuEntity[]> {
    const tenantStore = this.getTenantStore(tenantId);
    let results = [...tenantStore.values()];

    if (filter) {
      if (filter.code) {
        results = results.filter((e) => e.code.includes(filter.code!));
      }
      if (filter.name) {
        results = results.filter((e) => e.name.includes(filter.name!));
      }
      if (filter.categoryId !== undefined) {
        results = results.filter((e) => e.categoryId === filter.categoryId);
      }
      if (filter.isActive !== undefined) {
        results = results.filter((e) => e.isActive === filter.isActive);
      }
    }

    return Promise.resolve(
      results.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    );
  }

  save(
    tenantId: string,
    entity: Omit<SkuEntity, 'tenantId'>,
  ): Promise<SkuEntity> {
    const tenantStore = this.getTenantStore(tenantId);
    const fullEntity: SkuEntity = { ...entity, tenantId };
    tenantStore.set(entity.id, fullEntity);
    return Promise.resolve(fullEntity);
  }

  update(
    tenantId: string,
    id: string,
    updates: UpdateSkuCommand,
  ): Promise<SkuEntity | null> {
    const tenantStore = this.getTenantStore(tenantId);
    const existing = tenantStore.get(id);
    if (!existing) {
      return Promise.resolve(null);
    }

    const updated: SkuEntity = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    tenantStore.set(id, updated);
    return Promise.resolve(updated);
  }

  delete(tenantId: string, id: string): Promise<boolean> {
    const tenantStore = this.getTenantStore(tenantId);
    return Promise.resolve(tenantStore.delete(id));
  }

  async existsByCode(tenantId: string, code: string): Promise<boolean> {
    const existing = await this.findByCode(tenantId, code);
    return existing !== null;
  }
}
