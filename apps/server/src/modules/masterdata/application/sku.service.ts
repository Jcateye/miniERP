import { Injectable, Inject } from '@nestjs/common';
import type {
  SkuEntity,
  SkuRepository,
  CreateSkuCommand,
  UpdateSkuCommand,
  SkuQueryFilter,
} from '../domain/sku.types';
import {
  SkuCodeDuplicateError,
  SkuNotFoundError,
  SkuValidationError,
} from '../domain/sku.errors';

export const SKU_REPOSITORY_TOKEN = Symbol('SKU_REPOSITORY');

@Injectable()
export class SkuService {
  constructor(
    @Inject(SKU_REPOSITORY_TOKEN)
    private readonly repository: SkuRepository,
  ) {}

  async create(
    tenantId: string,
    command: CreateSkuCommand,
  ): Promise<SkuEntity> {
    this.validateCreateCommand(command);

    const codeExists = await this.repository.existsByCode(
      tenantId,
      command.code,
    );
    if (codeExists) {
      throw new SkuCodeDuplicateError(command.code);
    }

    const now = new Date().toISOString();
    const entity: SkuEntity = {
      id: this.generateId(),
      tenantId,
      code: command.code,
      name: command.name,
      specification: command.specification ?? null,
      baseUnit: command.baseUnit,
      categoryId: command.categoryId ?? null,
      barcode: command.barcode ?? null,
      batchManaged: command.batchManaged ?? false,
      serialManaged: command.serialManaged ?? false,
      minStockQty: command.minStockQty ?? null,
      maxStockQty: command.maxStockQty ?? null,
      leadTimeDays: command.leadTimeDays ?? null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    return this.repository.save(tenantId, entity);
  }

  async findById(tenantId: string, id: string): Promise<SkuEntity> {
    const entity = await this.repository.findById(tenantId, id);
    if (!entity) {
      throw new SkuNotFoundError(id);
    }
    return entity;
  }

  async findByCode(tenantId: string, code: string): Promise<SkuEntity | null> {
    return this.repository.findByCode(tenantId, code);
  }

  async findAll(
    tenantId: string,
    filter?: SkuQueryFilter,
  ): Promise<readonly SkuEntity[]> {
    return this.repository.findAll(tenantId, filter);
  }

  async update(
    tenantId: string,
    id: string,
    command: UpdateSkuCommand,
  ): Promise<SkuEntity> {
    this.validateUpdateCommand(command);

    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new SkuNotFoundError(id);
    }

    const updated = await this.repository.update(tenantId, id, command);
    if (!updated) {
      throw new SkuNotFoundError(id);
    }
    return updated;
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new SkuNotFoundError(id);
    }

    return this.repository.delete(tenantId, id);
  }

  private validateCreateCommand(command: CreateSkuCommand): void {
    if (!command.code?.trim()) {
      throw new SkuValidationError('code is required');
    }
    if (!command.name?.trim()) {
      throw new SkuValidationError('name is required');
    }
    if (!command.baseUnit?.trim()) {
      throw new SkuValidationError('baseUnit is required');
    }
    if (
      command.leadTimeDays !== undefined &&
      command.leadTimeDays !== null &&
      (!Number.isInteger(command.leadTimeDays) || command.leadTimeDays < 0)
    ) {
      throw new SkuValidationError('leadTimeDays must be a non-negative integer');
    }
  }

  private validateUpdateCommand(command: UpdateSkuCommand): void {
    if (command.name !== undefined && !command.name?.trim()) {
      throw new SkuValidationError('name cannot be empty');
    }
    if (command.baseUnit !== undefined && !command.baseUnit?.trim()) {
      throw new SkuValidationError('baseUnit cannot be empty');
    }
    if (
      command.leadTimeDays !== undefined &&
      command.leadTimeDays !== null &&
      (!Number.isInteger(command.leadTimeDays) || command.leadTimeDays < 0)
    ) {
      throw new SkuValidationError('leadTimeDays must be a non-negative integer');
    }
  }

  private generateId(): string {
    return `sku_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
