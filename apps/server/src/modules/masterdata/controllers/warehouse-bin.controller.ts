import {
  BadRequestException,
  Delete,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Body,
} from '@nestjs/common';
import { RequirePermissions } from '../../../common/iam/require-permissions.decorator';
import { PrismaService } from '../../../database/prisma.service';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';
import { resolveTenantDbId } from '../infrastructure/prisma-tenant-id.resolver';

function parseOptionalBoolean(value?: string): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return undefined;
}

function isOptionalNullableString(
  value: unknown,
): value is string | null | undefined {
  return value === undefined || value === null || typeof value === 'string';
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeOptionalNullableString(
  value: string | null | undefined,
): string | null | undefined {
  if (value === undefined || value === null) {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function parseBinStatus(value: unknown): 'active' | 'inactive' | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === 'active' || value === 'inactive') {
    return value;
  }

  throw new BadRequestException('status must be active or inactive');
}

function parseCreateWarehouseBinCommand(payload: unknown) {
  if (typeof payload !== 'object' || payload === null) {
    throw new BadRequestException('Request body must be an object');
  }

  const candidate = payload as Record<string, unknown>;

  if (!isNonEmptyString(candidate.warehouseId)) {
    throw new BadRequestException('warehouseId is required');
  }

  if (!isNonEmptyString(candidate.code)) {
    throw new BadRequestException('code is required');
  }

  if (!isNonEmptyString(candidate.name)) {
    throw new BadRequestException('name is required');
  }

  if (!isOptionalNullableString(candidate.zoneCode)) {
    throw new BadRequestException('zoneCode must be string or null');
  }

  if (!isOptionalNullableString(candidate.binType)) {
    throw new BadRequestException('binType must be string or null');
  }

  return {
    warehouseId: candidate.warehouseId.trim(),
    code: candidate.code.trim(),
    name: candidate.name.trim(),
    zoneCode: normalizeOptionalNullableString(candidate.zoneCode),
    binType: normalizeOptionalNullableString(candidate.binType),
    status: parseBinStatus(candidate.status) ?? 'active',
  };
}

function parseUpdateWarehouseBinCommand(payload: unknown) {
  if (typeof payload !== 'object' || payload === null) {
    throw new BadRequestException('Request body must be an object');
  }

  const candidate = payload as Record<string, unknown>;

  if (
    candidate.name !== undefined &&
    candidate.name !== null &&
    !isNonEmptyString(candidate.name)
  ) {
    throw new BadRequestException('name cannot be empty');
  }

  if (!isOptionalNullableString(candidate.zoneCode)) {
    throw new BadRequestException('zoneCode must be string or null');
  }

  if (!isOptionalNullableString(candidate.binType)) {
    throw new BadRequestException('binType must be string or null');
  }

  return {
    name:
      candidate.name === undefined || candidate.name === null
        ? undefined
        : candidate.name.trim(),
    zoneCode: normalizeOptionalNullableString(candidate.zoneCode),
    binType: normalizeOptionalNullableString(candidate.binType),
    status: parseBinStatus(candidate.status),
  };
}

function toDbId(value: string): bigint | null {
  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

function mapWarehouseBinRow(row: {
  id: bigint;
  tenantId: bigint;
  warehouseId: bigint;
  binCode: string;
  binName: string;
  zoneCode: string | null;
  binType: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id.toString(),
    tenantId: row.tenantId.toString(),
    warehouseId: row.warehouseId.toString(),
    code: row.binCode,
    name: row.binName,
    binCode: row.binCode,
    binName: row.binName,
    zoneCode: row.zoneCode,
    binType: row.binType,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

@RequirePermissions('masterdata.warehouse-bin.read')
@Controller('warehouse-bins')
export class WarehouseBinController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContextService: TenantContextService,
  ) {}

  @Get()
  async list(
    @Query('warehouseId') warehouseId?: string,
    @Query('code') code?: string,
    @Query('name') name?: string,
    @Query('isActive') isActive?: string,
  ) {
    const ctx = this.tenantContextService.getRequiredContext();
    const tenantDbId = await resolveTenantDbId(this.prisma, ctx.tenantId);
    const active = parseOptionalBoolean(isActive);

    const data = await this.prisma.warehouseBin.findMany({
      where: {
        tenantId: tenantDbId,
        deletedAt: null,
        warehouseId:
          warehouseId === undefined ? undefined : toDbId(warehouseId) ?? BigInt(-1),
        binCode: code ? { contains: code } : undefined,
        binName: name ? { contains: name } : undefined,
        status: active === undefined ? undefined : active ? 'active' : { not: 'active' },
      },
      orderBy: [{ warehouseId: 'asc' }, { binCode: 'asc' }, { id: 'asc' }],
    });

    return {
      data: data.map(mapWarehouseBinRow),
      total: data.length,
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const binId = toDbId(id);
    if (binId === null) {
      return null;
    }

    const ctx = this.tenantContextService.getRequiredContext();
    const tenantDbId = await resolveTenantDbId(this.prisma, ctx.tenantId);
    const row = await this.prisma.warehouseBin.findFirst({
      where: {
        id: binId,
        tenantId: tenantDbId,
        deletedAt: null,
      },
    });

    return row ? mapWarehouseBinRow(row) : null;
  }

  @Post()
  @RequirePermissions('masterdata.warehouse-bin.write')
  async create(@Body() body: unknown) {
    const command = parseCreateWarehouseBinCommand(body);
    const warehouseId = toDbId(command.warehouseId);
    if (warehouseId === null) {
      throw new BadRequestException('warehouseId must be bigint-compatible');
    }

    const ctx = this.tenantContextService.getRequiredContext();
    const tenantDbId = await resolveTenantDbId(this.prisma, ctx.tenantId);
    const warehouse = await this.prisma.warehouse.findFirst({
      where: {
        id: warehouseId,
        tenantId: tenantDbId,
        deletedAt: null,
      },
    });

    if (!warehouse) {
      throw new NotFoundException(
        `Warehouse with id ${command.warehouseId} not found`,
      );
    }

    const row = await this.prisma.warehouseBin.create({
      data: {
        tenantId: tenantDbId,
        warehouseId,
        binCode: command.code,
        binName: command.name,
        zoneCode: command.zoneCode,
        binType: command.binType,
        status: command.status,
        createdBy: ctx.actorId,
        updatedBy: ctx.actorId,
      },
    });

    return mapWarehouseBinRow(row);
  }

  @Patch(':id')
  @RequirePermissions('masterdata.warehouse-bin.write')
  async update(@Param('id') id: string, @Body() body: unknown) {
    const binId = toDbId(id);
    if (binId === null) {
      throw new BadRequestException('id must be bigint-compatible');
    }

    const command = parseUpdateWarehouseBinCommand(body);
    const ctx = this.tenantContextService.getRequiredContext();
    const tenantDbId = await resolveTenantDbId(this.prisma, ctx.tenantId);
    const existing = await this.prisma.warehouseBin.findFirst({
      where: {
        id: binId,
        tenantId: tenantDbId,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException(`Warehouse bin with id ${id} not found`);
    }

    const row = await this.prisma.warehouseBin.update({
      where: { id: existing.id },
      data: {
        binName: command.name,
        zoneCode: command.zoneCode,
        binType: command.binType,
        status: command.status,
        updatedBy: ctx.actorId,
      },
    });

    return mapWarehouseBinRow(row);
  }

  @Delete(':id')
  @RequirePermissions('masterdata.warehouse-bin.write')
  async remove(@Param('id') id: string) {
    const binId = toDbId(id);
    if (binId === null) {
      throw new BadRequestException('id must be bigint-compatible');
    }

    const ctx = this.tenantContextService.getRequiredContext();
    const tenantDbId = await resolveTenantDbId(this.prisma, ctx.tenantId);
    const result = await this.prisma.warehouseBin.updateMany({
      where: {
        id: binId,
        tenantId: tenantDbId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        deletedBy: ctx.actorId,
        updatedBy: ctx.actorId,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException(`Warehouse bin with id ${id} not found`);
    }

    return {
      id,
      deleted: true,
    };
  }
}
