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
  type CreateCustomerCommand,
  type UpdateCustomerCommand,
  CustomerValidationError,
} from '../domain';
import { CustomerService } from '../application/customer.service';
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

  throw new CustomerValidationError('isActive must be true or false');
}

function parseCreateCustomerCommand(payload: unknown): CreateCustomerCommand {
  if (typeof payload !== 'object' || payload === null) {
    throw new CustomerValidationError('Request body must be an object');
  }

  const candidate = payload as Record<string, unknown>;

  if (!isNonEmptyString(candidate.code)) {
    throw new CustomerValidationError('code is required');
  }

  if (!isNonEmptyString(candidate.name)) {
    throw new CustomerValidationError('name is required');
  }

  if (!isOptionalNullableString(candidate.contactPerson)) {
    throw new CustomerValidationError('contactPerson must be string or null');
  }

  if (!isOptionalNullableString(candidate.contactPhone)) {
    throw new CustomerValidationError('contactPhone must be string or null');
  }

  if (!isOptionalNullableString(candidate.email)) {
    throw new CustomerValidationError('email must be string or null');
  }

  if (!isOptionalNullableString(candidate.address)) {
    throw new CustomerValidationError('address must be string or null');
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

function parseUpdateCustomerCommand(payload: unknown): UpdateCustomerCommand {
  if (typeof payload !== 'object' || payload === null) {
    throw new CustomerValidationError('Request body must be an object');
  }

  const candidate = payload as Record<string, unknown>;

  if (
    candidate.name !== undefined &&
    candidate.name !== null &&
    !isNonEmptyString(candidate.name)
  ) {
    throw new CustomerValidationError('name cannot be empty');
  }

  if (!isOptionalNullableString(candidate.contactPerson)) {
    throw new CustomerValidationError('contactPerson must be string or null');
  }

  if (!isOptionalNullableString(candidate.contactPhone)) {
    throw new CustomerValidationError('contactPhone must be string or null');
  }

  if (!isOptionalNullableString(candidate.email)) {
    throw new CustomerValidationError('email must be string or null');
  }

  if (!isOptionalNullableString(candidate.address)) {
    throw new CustomerValidationError('address must be string or null');
  }

  if (
    candidate.isActive !== undefined &&
    typeof candidate.isActive !== 'boolean'
  ) {
    throw new CustomerValidationError('isActive must be boolean');
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
    isActive: candidate.isActive,
  };
}

@RequirePermissions('masterdata.customer.read')
@Controller('customers')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly tenantContextService: TenantContextService,
  ) {}

  @Get()
  async list(
    @Query('code') code?: string,
    @Query('name') name?: string,
    @Query('isActive') isActive?: string,
  ) {
    const ctx = this.tenantContextService.getRequiredContext();
    const data = await this.customerService.findAll(ctx.tenantId, {
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
    return this.customerService.findById(ctx.tenantId, id);
  }

  @Post()
  @RequirePermissions('masterdata.customer.write')
  async create(@Body() body: unknown) {
    const ctx = this.tenantContextService.getRequiredContext();
    const command = parseCreateCustomerCommand(body);
    return this.customerService.create(ctx.tenantId, command);
  }

  @Patch(':id')
  @RequirePermissions('masterdata.customer.write')
  async update(@Param('id') id: string, @Body() body: unknown) {
    const ctx = this.tenantContextService.getRequiredContext();
    const command = parseUpdateCustomerCommand(body);
    return this.customerService.update(ctx.tenantId, id, command);
  }

  @Delete(':id')
  @RequirePermissions('masterdata.customer.write')
  async remove(@Param('id') id: string) {
    const ctx = this.tenantContextService.getRequiredContext();
    await this.customerService.delete(ctx.tenantId, id);

    return {
      id,
      deleted: true,
    };
  }
}
