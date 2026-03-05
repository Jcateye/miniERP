import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import type {
  CustomerEntity,
  CustomerQueryFilter,
  CustomerRepository,
  UpdateCustomerCommand,
} from '../domain/customer.types';
import { resolveTenantDbId } from './prisma-tenant-id.resolver';

function toDbId(value: string): bigint | null {
  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

function mapCustomerEntity(row: {
  id: bigint;
  tenantId: bigint;
  code: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): CustomerEntity {
  return {
    id: row.id.toString(),
    tenantId: row.tenantId.toString(),
    code: row.code,
    name: row.name,
    contactPerson: row.contactName,
    contactPhone: row.phone,
    email: row.email,
    address: row.address,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(tenantId: string, id: string): Promise<CustomerEntity | null> {
    const customerId = toDbId(id);
    if (customerId === null) {
      return null;
    }

    const tenantDbId = await resolveTenantDbId(this.prisma, tenantId);
    const row = await this.prisma.customer.findFirst({
      where: {
        tenantId: tenantDbId,
        id: customerId,
        deletedAt: null,
      },
    });

    return row ? mapCustomerEntity(row) : null;
  }

  async findByCode(
    tenantId: string,
    code: string,
  ): Promise<CustomerEntity | null> {
    const tenantDbId = await resolveTenantDbId(this.prisma, tenantId);
    const row = await this.prisma.customer.findFirst({
      where: {
        tenantId: tenantDbId,
        code,
        deletedAt: null,
      },
    });

    return row ? mapCustomerEntity(row) : null;
  }

  async findAll(
    tenantId: string,
    filter?: CustomerQueryFilter,
  ): Promise<readonly CustomerEntity[]> {
    const tenantDbId = await resolveTenantDbId(this.prisma, tenantId);
    const rows = await this.prisma.customer.findMany({
      where: {
        tenantId: tenantDbId,
        deletedAt: null,
        code: filter?.code ? { contains: filter.code } : undefined,
        name: filter?.name ? { contains: filter.name } : undefined,
        isActive: filter?.isActive !== undefined ? filter.isActive : undefined,
      },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });

    return rows.map((row) => mapCustomerEntity(row));
  }

  async save(
    tenantId: string,
    entity: Omit<CustomerEntity, 'tenantId'>,
  ): Promise<CustomerEntity> {
    const tenantDbId = await resolveTenantDbId(this.prisma, tenantId);
    const row = await this.prisma.customer.create({
      data: {
        tenantId: tenantDbId,
        code: entity.code,
        name: entity.name,
        contactName: entity.contactPerson,
        phone: entity.contactPhone,
        email: entity.email,
        address: entity.address,
        isActive: entity.isActive,
      },
    });

    return mapCustomerEntity(row);
  }

  async update(
    tenantId: string,
    id: string,
    updates: UpdateCustomerCommand,
  ): Promise<CustomerEntity | null> {
    const customerId = toDbId(id);
    if (customerId === null) {
      return null;
    }

    const tenantDbId = await resolveTenantDbId(this.prisma, tenantId);
    const row = await this.prisma.customer.findFirst({
      where: {
        tenantId: tenantDbId,
        id: customerId,
        deletedAt: null,
      },
    });

    if (!row) {
      return null;
    }

    const updated = await this.prisma.customer.update({
      where: { id: row.id },
      data: {
        name: updates.name,
        contactName: updates.contactPerson,
        phone: updates.contactPhone,
        email: updates.email,
        address: updates.address,
        isActive: updates.isActive,
      },
    });

    return mapCustomerEntity(updated);
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const customerId = toDbId(id);
    if (customerId === null) {
      return false;
    }

    const tenantDbId = await resolveTenantDbId(this.prisma, tenantId);
    const result = await this.prisma.customer.updateMany({
      where: {
        tenantId: tenantDbId,
        id: customerId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        deletedBy: 'system',
      },
    });

    return result.count > 0;
  }

  async existsByCode(tenantId: string, code: string): Promise<boolean> {
    const tenantDbId = await resolveTenantDbId(this.prisma, tenantId);
    const count = await this.prisma.customer.count({
      where: {
        tenantId: tenantDbId,
        code,
        deletedAt: null,
      },
    });

    return count > 0;
  }
}
