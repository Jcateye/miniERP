import { Injectable, Inject } from '@nestjs/common';
import type {
  CustomerEntity,
  CustomerRepository,
  CreateCustomerCommand,
  UpdateCustomerCommand,
  CustomerQueryFilter,
} from '../domain/customer.types';
import {
  CustomerCodeDuplicateError,
  CustomerNotFoundError,
  CustomerValidationError,
} from '../domain/customer.errors';

export const CUSTOMER_REPOSITORY_TOKEN = Symbol('CUSTOMER_REPOSITORY');

@Injectable()
export class CustomerService {
  constructor(
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly repository: CustomerRepository,
  ) {}

  async create(
    tenantId: string,
    command: CreateCustomerCommand,
  ): Promise<CustomerEntity> {
    this.validateCreateCommand(command);

    const codeExists = await this.repository.existsByCode(
      tenantId,
      command.code,
    );
    if (codeExists) {
      throw new CustomerCodeDuplicateError(command.code);
    }

    const now = new Date().toISOString();
    const entity: CustomerEntity = {
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

  async findById(tenantId: string, id: string): Promise<CustomerEntity> {
    const entity = await this.repository.findById(tenantId, id);
    if (!entity) {
      throw new CustomerNotFoundError(id);
    }
    return entity;
  }

  async findByCode(
    tenantId: string,
    code: string,
  ): Promise<CustomerEntity | null> {
    return this.repository.findByCode(tenantId, code);
  }

  async findAll(
    tenantId: string,
    filter?: CustomerQueryFilter,
  ): Promise<readonly CustomerEntity[]> {
    return this.repository.findAll(tenantId, filter);
  }

  async update(
    tenantId: string,
    id: string,
    command: UpdateCustomerCommand,
  ): Promise<CustomerEntity> {
    this.validateUpdateCommand(command);

    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new CustomerNotFoundError(id);
    }

    const updated = await this.repository.update(tenantId, id, command);
    if (!updated) {
      throw new CustomerNotFoundError(id);
    }
    return updated;
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const existing = await this.repository.findById(tenantId, id);
    if (!existing) {
      throw new CustomerNotFoundError(id);
    }

    return this.repository.delete(tenantId, id);
  }

  private validateCreateCommand(command: CreateCustomerCommand): void {
    if (!command.code?.trim()) {
      throw new CustomerValidationError('code is required');
    }
    if (!command.name?.trim()) {
      throw new CustomerValidationError('name is required');
    }
  }

  private validateUpdateCommand(command: UpdateCustomerCommand): void {
    if (command.name !== undefined && !command.name?.trim()) {
      throw new CustomerValidationError('name cannot be empty');
    }
  }

  private generateId(): string {
    return `cust_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
