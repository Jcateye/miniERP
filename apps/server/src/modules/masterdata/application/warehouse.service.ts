import { Injectable, Inject } from '@nestjs/common';
import type {
  WarehouseEntity,
  WarehouseRepository,
  CreateWarehouseCommand,
  UpdateWarehouseCommand,
  WarehouseQueryFilter,
} from '../domain/warehouse.types';
import {
  WarehouseCodeDuplicateError,
  WarehouseNotFoundError,
  WarehouseValidationError,
} from '../domain/warehouse.errors';

export const WAREHOUSE_REPOSITORY_TOKEN = Symbol('WAREHOUSE_REPOSITORY');

@Injectable()
export class WarehouseService {
  constructor(
    @Inject(WAREHOUSE_REPOSITORY_TOKEN)
    private readonly repository: WarehouseRepository,
  ) {}

  async create(
    tenantId: string,
    command: CreateWarehouseCommand,
  ): Promise<WarehouseEntity> {
    this.validateCreateCommand(command);

    const codeExists = await this.repository.existsByCode(
      tenantId,
      command.code,
    );
    if (codeExists) {
      throw new WarehouseCodeDuplicateError(command.code);
    }

    const now = new Date().toISOString();
    const entity: WarehouseEntity = {
      id: this.generateId(),
      tenantId,
      code: command.code,
      name: command.name,
      address: command.address ?? null,
      contactPerson: command.contactPerson ?? null,
      contactPhone: command.contactPhone ?? null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    return this.repository.save(tenantId, entity);
  }

  async findById(tenantId: string, id: string): Promise<WarehouseEntity> {
    const entity = await this.repository.findById(tenantId, id);
    if (!entity) {
      throw new WarehouseNotFoundError(id);
    }
    return entity;
  }

  async findByCode(
    tenantId: string,
    code: string,
  ): Promise<WarehouseEntity | null> {
    return this.repository.findByCode(tenantId, code);
  }

  async findAll(
    tenantId: string,
    filter?: WarehouseQueryFilter,
  ): Promise<readonly WarehouseEntity[]> {
    return this.repository.findAll(tenantId, filter);
  }

  async update(
    tenantId: string,
    id: string,
    command: UpdateWarehouseCommand,
  ): Promise<WarehouseEntity> {
    this.validateUpdateCommand(command);

    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new WarehouseNotFoundError(id);
    }

    const updated = await this.repository.update(tenantId, id, command);
    if (!updated) {
      throw new WarehouseNotFoundError(id);
    }
    return updated;
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new WarehouseNotFoundError(id);
    }

    return this.repository.delete(tenantId, id);
  }

  private validateCreateCommand(command: CreateWarehouseCommand): void {
    if (!command.code?.trim()) {
      throw new WarehouseValidationError('code is required');
    }
    if (!command.name?.trim()) {
      throw new WarehouseValidationError('name is required');
    }
  }

  private validateUpdateCommand(command: UpdateWarehouseCommand): void {
    if (command.name !== undefined && !command.name?.trim()) {
      throw new WarehouseValidationError('name cannot be empty');
    }
  }

  private generateId(): string {
    return `wh_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
