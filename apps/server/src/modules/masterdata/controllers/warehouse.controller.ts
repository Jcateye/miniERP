import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RequirePermissions } from '../../../common/iam/require-permissions.decorator';
import {
  type CreateWarehouseCommand,
  type UpdateWarehouseCommand,
  WarehouseValidationError,
} from '../domain';
import { WarehouseService } from '../application/warehouse.service';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';

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

  throw new WarehouseValidationError('isActive must be true or false');
}

function parseCreateWarehouseCommand(payload: unknown): CreateWarehouseCommand {
  if (typeof payload !== 'object' || payload === null) {
    throw new WarehouseValidationError('Request body must be an object');
  }

  const candidate = payload as Record<string, unknown>;

  if (!isNonEmptyString(candidate.code)) {
    throw new WarehouseValidationError('code is required');
  }

  if (!isNonEmptyString(candidate.name)) {
    throw new WarehouseValidationError('name is required');
  }

  if (!isOptionalNullableString(candidate.address)) {
    throw new WarehouseValidationError('address must be string or null');
  }

  if (!isOptionalNullableString(candidate.contactPerson)) {
    throw new WarehouseValidationError('contactPerson must be string or null');
  }

  if (!isOptionalNullableString(candidate.contactPhone)) {
    throw new WarehouseValidationError('contactPhone must be string or null');
  }

  return {
    code: candidate.code.trim(),
    name: candidate.name.trim(),
    address: normalizeOptionalNullableString(candidate.address),
    contactPerson: normalizeOptionalNullableString(candidate.contactPerson),
    contactPhone: normalizeOptionalNullableString(candidate.contactPhone),
  };
}

function parseUpdateWarehouseCommand(payload: unknown): UpdateWarehouseCommand {
  if (typeof payload !== 'object' || payload === null) {
    throw new WarehouseValidationError('Request body must be an object');
  }

  const candidate = payload as Record<string, unknown>;

  if (
    candidate.name !== undefined &&
    candidate.name !== null &&
    !isNonEmptyString(candidate.name)
  ) {
    throw new WarehouseValidationError('name cannot be empty');
  }

  if (!isOptionalNullableString(candidate.address)) {
    throw new WarehouseValidationError('address must be string or null');
  }

  if (!isOptionalNullableString(candidate.contactPerson)) {
    throw new WarehouseValidationError('contactPerson must be string or null');
  }

  if (!isOptionalNullableString(candidate.contactPhone)) {
    throw new WarehouseValidationError('contactPhone must be string or null');
  }

  if (
    candidate.isActive !== undefined &&
    typeof candidate.isActive !== 'boolean'
  ) {
    throw new WarehouseValidationError('isActive must be boolean');
  }

  return {
    name:
      candidate.name === undefined || candidate.name === null
        ? undefined
        : candidate.name.trim(),
    address: normalizeOptionalNullableString(candidate.address),
    contactPerson: normalizeOptionalNullableString(candidate.contactPerson),
    contactPhone: normalizeOptionalNullableString(candidate.contactPhone),
    isActive: candidate.isActive,
  };
}

@RequirePermissions('masterdata.warehouse.read')
@Controller('warehouses')
export class WarehouseController {
  constructor(
    private readonly warehouseService: WarehouseService,
    private readonly tenantContextService: TenantContextService,
  ) {}

  @Get()
  async list(
    @Query('code') code?: string,
    @Query('name') name?: string,
    @Query('isActive') isActive?: string,
  ) {
    const ctx = this.tenantContextService.getRequiredContext();
    const data = await this.warehouseService.findAll(ctx.tenantId, {
      code,
      name,
      isActive: parseOptionalBoolean(isActive),
    });

    return {
      data,
      total: data.length,
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const ctx = this.tenantContextService.getRequiredContext();
    return this.warehouseService.findById(ctx.tenantId, id);
  }

  @Post()
  @RequirePermissions('masterdata.warehouse.write')
  async create(@Body() body: unknown) {
    const ctx = this.tenantContextService.getRequiredContext();
    const command = parseCreateWarehouseCommand(body);
    return this.warehouseService.create(ctx.tenantId, command);
  }

  @Patch(':id')
  @RequirePermissions('masterdata.warehouse.write')
  async update(@Param('id') id: string, @Body() body: unknown) {
    const ctx = this.tenantContextService.getRequiredContext();
    const command = parseUpdateWarehouseCommand(body);
    return this.warehouseService.update(ctx.tenantId, id, command);
  }

  @Delete(':id')
  @RequirePermissions('masterdata.warehouse.write')
  async remove(@Param('id') id: string) {
    const ctx = this.tenantContextService.getRequiredContext();
    await this.warehouseService.delete(ctx.tenantId, id);

    return {
      id,
      deleted: true,
    };
  }
}
