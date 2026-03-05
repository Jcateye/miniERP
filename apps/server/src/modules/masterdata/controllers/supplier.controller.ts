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
  type CreateSupplierCommand,
  type UpdateSupplierCommand,
  SupplierValidationError,
} from '../domain';
import { SupplierService } from '../application/supplier.service';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';

function isOptionalNullableString(value: unknown): value is string | null | undefined {
  return value === undefined || value === null || typeof value === 'string';
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeOptionalNullableString(value: string | null | undefined): string | null | undefined {
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

  throw new SupplierValidationError('isActive must be true or false');
}

function parseCreateSupplierCommand(payload: unknown): CreateSupplierCommand {
  if (typeof payload !== 'object' || payload === null) {
    throw new SupplierValidationError('Request body must be an object');
  }

  const candidate = payload as Record<string, unknown>;

  if (!isNonEmptyString(candidate.code)) {
    throw new SupplierValidationError('code is required');
  }

  if (!isNonEmptyString(candidate.name)) {
    throw new SupplierValidationError('name is required');
  }

  if (!isOptionalNullableString(candidate.contactPerson)) {
    throw new SupplierValidationError('contactPerson must be string or null');
  }

  if (!isOptionalNullableString(candidate.contactPhone)) {
    throw new SupplierValidationError('contactPhone must be string or null');
  }

  if (!isOptionalNullableString(candidate.email)) {
    throw new SupplierValidationError('email must be string or null');
  }

  if (!isOptionalNullableString(candidate.address)) {
    throw new SupplierValidationError('address must be string or null');
  }

  return {
    code: candidate.code.trim(),
    name: candidate.name.trim(),
    contactPerson: normalizeOptionalNullableString(candidate.contactPerson),
    contactPhone: normalizeOptionalNullableString(candidate.contactPhone),
    email: normalizeOptionalNullableString(candidate.email),
    address: normalizeOptionalNullableString(candidate.address),
  };
}

function parseUpdateSupplierCommand(payload: unknown): UpdateSupplierCommand {
  if (typeof payload !== 'object' || payload === null) {
    throw new SupplierValidationError('Request body must be an object');
  }

  const candidate = payload as Record<string, unknown>;

  if (
    candidate.name !== undefined &&
    candidate.name !== null &&
    !isNonEmptyString(candidate.name)
  ) {
    throw new SupplierValidationError('name cannot be empty');
  }

  if (!isOptionalNullableString(candidate.contactPerson)) {
    throw new SupplierValidationError('contactPerson must be string or null');
  }

  if (!isOptionalNullableString(candidate.contactPhone)) {
    throw new SupplierValidationError('contactPhone must be string or null');
  }

  if (!isOptionalNullableString(candidate.email)) {
    throw new SupplierValidationError('email must be string or null');
  }

  if (!isOptionalNullableString(candidate.address)) {
    throw new SupplierValidationError('address must be string or null');
  }

  if (
    candidate.isActive !== undefined &&
    typeof candidate.isActive !== 'boolean'
  ) {
    throw new SupplierValidationError('isActive must be boolean');
  }

  return {
    name:
      candidate.name === undefined || candidate.name === null
        ? undefined
        : candidate.name.trim(),
    contactPerson: normalizeOptionalNullableString(candidate.contactPerson),
    contactPhone: normalizeOptionalNullableString(candidate.contactPhone),
    email: normalizeOptionalNullableString(candidate.email),
    address: normalizeOptionalNullableString(candidate.address),
    isActive: candidate.isActive as boolean | undefined,
  };
}

@RequirePermissions('masterdata.supplier.read')
@Controller('suppliers')
export class SupplierController {
  constructor(
    private readonly supplierService: SupplierService,
    private readonly tenantContextService: TenantContextService,
  ) {}

  @Get()
  async list(
    @Query('code') code?: string,
    @Query('name') name?: string,
    @Query('isActive') isActive?: string,
  ) {
    const ctx = this.tenantContextService.getRequiredContext();
    const data = await this.supplierService.findAll(ctx.tenantId, {
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
    return this.supplierService.findById(ctx.tenantId, id);
  }

  @Post()
  @RequirePermissions('masterdata.supplier.write')
  async create(@Body() body: unknown) {
    const ctx = this.tenantContextService.getRequiredContext();
    const command = parseCreateSupplierCommand(body);
    return this.supplierService.create(ctx.tenantId, command);
  }

  @Patch(':id')
  @RequirePermissions('masterdata.supplier.write')
  async update(@Param('id') id: string, @Body() body: unknown) {
    const ctx = this.tenantContextService.getRequiredContext();
    const command = parseUpdateSupplierCommand(body);
    return this.supplierService.update(ctx.tenantId, id, command);
  }

  @Delete(':id')
  @RequirePermissions('masterdata.supplier.write')
  async remove(@Param('id') id: string) {
    const ctx = this.tenantContextService.getRequiredContext();
    await this.supplierService.delete(ctx.tenantId, id);

    return {
      id,
      deleted: true,
    };
  }
}
