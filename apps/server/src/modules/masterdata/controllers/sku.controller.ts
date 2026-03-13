import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { RequirePermissions } from '../../../common/iam/require-permissions.decorator';
import {
  type CreateSkuCommand,
  type UpdateSkuCommand,
  SkuValidationError,
} from '../domain';
import { SkuService } from '../application/sku.service';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';

function isOptionalNullableString(
  value: unknown,
): value is string | null | undefined {
  return value === undefined || value === null || typeof value === 'string';
}

function isOptionalNullableBoolean(
  value: unknown,
): value is boolean | null | undefined {
  return value === undefined || value === null || typeof value === 'boolean';
}

function isOptionalNullableInteger(
  value: unknown,
): value is number | null | undefined {
  return (
    value === undefined ||
    value === null ||
    (typeof value === 'number' && Number.isInteger(value))
  );
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

  throw new SkuValidationError('isActive must be true or false');
}

function parseCreateSkuCommand(payload: unknown): CreateSkuCommand {
  if (typeof payload !== 'object' || payload === null) {
    throw new SkuValidationError('Request body must be an object');
  }

  const candidate = payload as Record<string, unknown>;

  if (!isNonEmptyString(candidate.code)) {
    throw new SkuValidationError('code is required');
  }

  if (!isNonEmptyString(candidate.name)) {
    throw new SkuValidationError('name is required');
  }

  if (!isOptionalNullableString(candidate.specification)) {
    throw new SkuValidationError('specification must be string or null');
  }

  if (!isNonEmptyString(candidate.baseUnit)) {
    throw new SkuValidationError('baseUnit is required');
  }

  if (!isOptionalNullableString(candidate.categoryId)) {
    throw new SkuValidationError('categoryId must be string or null');
  }
  if (!isOptionalNullableString(candidate.itemType)) {
    throw new SkuValidationError('itemType must be string or null');
  }
  if (!isOptionalNullableString(candidate.taxRate)) {
    throw new SkuValidationError('taxRate must be string or null');
  }

  if (!isOptionalNullableString(candidate.barcode)) {
    throw new SkuValidationError('barcode must be string or null');
  }

  if (!isOptionalNullableBoolean(candidate.batchManaged)) {
    throw new SkuValidationError('batchManaged must be boolean or null');
  }

  if (!isOptionalNullableBoolean(candidate.serialManaged)) {
    throw new SkuValidationError('serialManaged must be boolean or null');
  }

  if (!isOptionalNullableString(candidate.minStockQty)) {
    throw new SkuValidationError('minStockQty must be string or null');
  }

  if (!isOptionalNullableString(candidate.maxStockQty)) {
    throw new SkuValidationError('maxStockQty must be string or null');
  }

  if (!isOptionalNullableInteger(candidate.leadTimeDays)) {
    throw new SkuValidationError('leadTimeDays must be integer or null');
  }
  if (!isOptionalNullableInteger(candidate.shelfLifeDays)) {
    throw new SkuValidationError('shelfLifeDays must be integer or null');
  }

  return {
    code: candidate.code.trim(),
    name: candidate.name.trim(),
    specification: normalizeOptionalNullableString(candidate.specification),
    baseUnit: candidate.baseUnit.trim(),
    categoryId: normalizeOptionalNullableString(candidate.categoryId),
    itemType: normalizeOptionalNullableString(candidate.itemType),
    taxRate: normalizeOptionalNullableString(candidate.taxRate),
    barcode: normalizeOptionalNullableString(candidate.barcode),
    batchManaged:
      candidate.batchManaged === undefined || candidate.batchManaged === null
        ? undefined
        : candidate.batchManaged,
    serialManaged:
      candidate.serialManaged === undefined || candidate.serialManaged === null
        ? undefined
        : candidate.serialManaged,
    minStockQty: normalizeOptionalNullableString(candidate.minStockQty),
    maxStockQty: normalizeOptionalNullableString(candidate.maxStockQty),
    shelfLifeDays:
      candidate.shelfLifeDays === undefined || candidate.shelfLifeDays === null
        ? undefined
        : candidate.shelfLifeDays,
    leadTimeDays:
      candidate.leadTimeDays === undefined || candidate.leadTimeDays === null
        ? undefined
        : candidate.leadTimeDays,
  };
}

function parseUpdateSkuCommand(payload: unknown): UpdateSkuCommand {
  if (typeof payload !== 'object' || payload === null) {
    throw new SkuValidationError('Request body must be an object');
  }

  const candidate = payload as Record<string, unknown>;

  if (
    candidate.name !== undefined &&
    candidate.name !== null &&
    !isNonEmptyString(candidate.name)
  ) {
    throw new SkuValidationError('name cannot be empty');
  }

  if (!isOptionalNullableString(candidate.specification)) {
    throw new SkuValidationError('specification must be string or null');
  }

  if (
    candidate.baseUnit !== undefined &&
    candidate.baseUnit !== null &&
    !isNonEmptyString(candidate.baseUnit)
  ) {
    throw new SkuValidationError('baseUnit cannot be empty');
  }

  if (!isOptionalNullableString(candidate.categoryId)) {
    throw new SkuValidationError('categoryId must be string or null');
  }
  if (!isOptionalNullableString(candidate.itemType)) {
    throw new SkuValidationError('itemType must be string or null');
  }
  if (!isOptionalNullableString(candidate.taxRate)) {
    throw new SkuValidationError('taxRate must be string or null');
  }

  if (!isOptionalNullableString(candidate.barcode)) {
    throw new SkuValidationError('barcode must be string or null');
  }

  if (!isOptionalNullableBoolean(candidate.batchManaged)) {
    throw new SkuValidationError('batchManaged must be boolean or null');
  }

  if (!isOptionalNullableBoolean(candidate.serialManaged)) {
    throw new SkuValidationError('serialManaged must be boolean or null');
  }

  if (!isOptionalNullableString(candidate.minStockQty)) {
    throw new SkuValidationError('minStockQty must be string or null');
  }

  if (!isOptionalNullableString(candidate.maxStockQty)) {
    throw new SkuValidationError('maxStockQty must be string or null');
  }

  if (!isOptionalNullableInteger(candidate.leadTimeDays)) {
    throw new SkuValidationError('leadTimeDays must be integer or null');
  }
  if (!isOptionalNullableInteger(candidate.shelfLifeDays)) {
    throw new SkuValidationError('shelfLifeDays must be integer or null');
  }

  if (
    candidate.isActive !== undefined &&
    typeof candidate.isActive !== 'boolean'
  ) {
    throw new SkuValidationError('isActive must be boolean');
  }

  return {
    name:
      candidate.name === undefined || candidate.name === null
        ? undefined
        : candidate.name.trim(),
    specification: normalizeOptionalNullableString(candidate.specification),
    baseUnit:
      candidate.baseUnit === undefined || candidate.baseUnit === null
        ? undefined
        : candidate.baseUnit.trim(),
    categoryId: normalizeOptionalNullableString(candidate.categoryId),
    itemType: normalizeOptionalNullableString(candidate.itemType),
    taxRate: normalizeOptionalNullableString(candidate.taxRate),
    barcode: normalizeOptionalNullableString(candidate.barcode),
    batchManaged:
      candidate.batchManaged === undefined || candidate.batchManaged === null
        ? undefined
        : candidate.batchManaged,
    serialManaged:
      candidate.serialManaged === undefined || candidate.serialManaged === null
        ? undefined
        : candidate.serialManaged,
    minStockQty: normalizeOptionalNullableString(candidate.minStockQty),
    maxStockQty: normalizeOptionalNullableString(candidate.maxStockQty),
    shelfLifeDays:
      candidate.shelfLifeDays === undefined || candidate.shelfLifeDays === null
        ? undefined
        : candidate.shelfLifeDays,
    leadTimeDays:
      candidate.leadTimeDays === undefined || candidate.leadTimeDays === null
        ? undefined
        : candidate.leadTimeDays,
    isActive: candidate.isActive,
  };
}

@RequirePermissions('masterdata.sku.read')
@Controller('skus')
export class SkuController {
  constructor(
    private readonly skuService: SkuService,
    private readonly tenantContextService: TenantContextService,
  ) {}

  @Get()
  async list(
    @Query('code') code?: string,
    @Query('name') name?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isActive') isActive?: string,
  ) {
    const ctx = this.tenantContextService.getRequiredContext();
    const data = await this.skuService.findAll(ctx.tenantId, {
      code,
      name,
      categoryId,
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
    return this.skuService.findById(ctx.tenantId, id);
  }

  @Post()
  @RequirePermissions('masterdata.sku.write')
  async create(@Body() body: unknown) {
    const ctx = this.tenantContextService.getRequiredContext();
    const command = parseCreateSkuCommand(body);
    return this.skuService.create(ctx.tenantId, command);
  }

  @Put(':id')
  @RequirePermissions('masterdata.sku.write')
  async update(@Param('id') id: string, @Body() body: unknown) {
    const ctx = this.tenantContextService.getRequiredContext();
    const command = parseUpdateSkuCommand(body);
    return this.skuService.update(ctx.tenantId, id, command);
  }

  @Delete(':id')
  @RequirePermissions('masterdata.sku.write')
  async remove(@Param('id') id: string) {
    const ctx = this.tenantContextService.getRequiredContext();
    await this.skuService.delete(ctx.tenantId, id);

    return {
      id,
      deleted: true,
    };
  }
}
