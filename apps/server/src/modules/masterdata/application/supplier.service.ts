import { Injectable, Inject } from '@nestjs/common';
import type {
  SupplierEntity,
  SupplierRepository,
  CreateSupplierCommand,
  UpdateSupplierCommand,
  SupplierQueryFilter,
} from '../domain/supplier.types';
import {
  SupplierCodeDuplicateError,
  SupplierNotFoundError,
  SupplierValidationError,
} from '../domain/supplier.errors';

export const SUPPLIER_REPOSITORY_TOKEN = Symbol('SUPPLIER_REPOSITORY');

@Injectable()
export class SupplierService {
  constructor(
    @Inject(SUPPLIER_REPOSITORY_TOKEN)
    private readonly repository: SupplierRepository,
  ) {}

  async create(
    tenantId: string,
    command: CreateSupplierCommand,
  ): Promise<SupplierEntity> {
    this.validateCreateCommand(command);

    const codeExists = await this.repository.existsByCode(
      tenantId,
      command.code,
    );
    if (codeExists) {
      throw new SupplierCodeDuplicateError(command.code);
    }

    const now = new Date().toISOString();
    const entity: SupplierEntity = {
      id: this.generateId(),
      tenantId,
      code: command.code,
      name: command.name,
      contactPerson: command.contactPerson ?? null,
      contactPhone: command.contactPhone ?? null,
      email: command.email ?? null,
      address: command.address ?? null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    return this.repository.save(tenantId, entity);
  }

  async findById(tenantId: string, id: string): Promise<SupplierEntity> {
    const entity = await this.repository.findById(tenantId, id);
    if (!entity) {
      throw new SupplierNotFoundError(id);
    }
    return entity;
  }

  async findByCode(
    tenantId: string,
    code: string,
  ): Promise<SupplierEntity | null> {
    return this.repository.findByCode(tenantId, code);
  }

  async findAll(
    tenantId: string,
    filter?: SupplierQueryFilter,
  ): Promise<readonly SupplierEntity[]> {
    return this.repository.findAll(tenantId, filter);
  }

  async update(
    tenantId: string,
    id: string,
    command: UpdateSupplierCommand,
  ): Promise<SupplierEntity> {
    this.validateUpdateCommand(command);

    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new SupplierNotFoundError(id);
    }

    const updated = await this.repository.update(tenantId, id, command);
    if (!updated) {
      throw new SupplierNotFoundError(id);
    }
    return updated;
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new SupplierNotFoundError(id);
    }

    return this.repository.delete(tenantId, id);
  }

  private validateCreateCommand(command: CreateSupplierCommand): void {
    if (!command.code?.trim()) {
      throw new SupplierValidationError('code is required');
    }
    if (!command.name?.trim()) {
      throw new SupplierValidationError('name is required');
    }
  }

  private validateUpdateCommand(command: UpdateSupplierCommand): void {
    if (command.name !== undefined && !command.name?.trim()) {
      throw new SupplierValidationError('name cannot be empty');
    }
  }

  private generateId(): string {
    return `sup_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
