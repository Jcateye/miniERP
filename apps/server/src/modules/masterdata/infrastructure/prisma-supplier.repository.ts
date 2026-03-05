import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import type {
  SupplierEntity,
  SupplierQueryFilter,
  SupplierRepository,
  UpdateSupplierCommand,
} from '../domain/supplier.types';
import { resolveTenantDbId } from './prisma-tenant-id.resolver';

function toDbId(value: string): bigint | null {
  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

function mapSupplierEntity(row: {
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
}): SupplierEntity {
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
export class PrismaSupplierRepository implements SupplierRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(tenantId: string, id: string): Promise<SupplierEntity | null> {
    const supplierId = toDbId(id);
    if (supplierId === null) {
      return null;
    }

    const tenantDbId = await resolveTenantDbId(this.prisma, tenantId);
    const row = await this.prisma.supplier.findFirst({
      where: {
        tenantId: tenantDbId,
        id: supplierId,
        deletedAt: null,
      },
    });

    return row ? mapSupplierEntity(row) : null;
  }

  async findByCode(
    tenantId: string,
    code: string,
  ): Promise<SupplierEntity | null> {
    const tenantDbId = await resolveTenantDbId(this.prisma, tenantId);
    const row = await this.prisma.supplier.findFirst({
      where: {
        tenantId: tenantDbId,
        code,
        deletedAt: null,
      },
    });

    return row ? mapSupplierEntity(row) : null;
  }

  async findAll(
    tenantId: string,
    filter?: SupplierQueryFilter,
  ): Promise<readonly SupplierEntity[]> {
    const tenantDbId = await resolveTenantDbId(this.prisma, tenantId);
    const rows = await this.prisma.supplier.findMany({
      where: {
        tenantId: tenantDbId,
        deletedAt: null,
        code: filter?.code ? { contains: filter.code } : undefined,
        name: filter?.name ? { contains: filter.name } : undefined,
        isActive: filter?.isActive !== undefined ? filter.isActive : undefined,
      },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });

    return rows.map((row) => mapSupplierEntity(row));
  }

  async save(
    tenantId: string,
    entity: Omit<SupplierEntity, 'tenantId'>,
  ): Promise<SupplierEntity> {
    const tenantDbId = await resolveTenantDbId(this.prisma, tenantId);
    const row = await this.prisma.supplier.create({
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

    return mapSupplierEntity(row);
  }

  async update(
    tenantId: string,
    id: string,
    updates: UpdateSupplierCommand,
  ): Promise<SupplierEntity | null> {
    const supplierId = toDbId(id);
    if (supplierId === null) {
      return null;
    }

    const tenantDbId = await resolveTenantDbId(this.prisma, tenantId);
    const row = await this.prisma.supplier.findFirst({
      where: {
        tenantId: tenantDbId,
        id: supplierId,
        deletedAt: null,
      },
    });

    if (!row) {
      return null;
    }

    const updated = await this.prisma.supplier.update({
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

    return mapSupplierEntity(updated);
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const supplierId = toDbId(id);
    if (supplierId === null) {
      return false;
    }

    const tenantDbId = await resolveTenantDbId(this.prisma, tenantId);
    const result = await this.prisma.supplier.updateMany({
      where: {
        tenantId: tenantDbId,
        id: supplierId,
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
    const count = await this.prisma.supplier.count({
      where: {
        tenantId: tenantDbId,
        code,
        deletedAt: null,
      },
    });

    return count > 0;
  }
}
