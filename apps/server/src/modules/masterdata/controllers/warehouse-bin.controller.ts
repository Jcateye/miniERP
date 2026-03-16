import {
  BadRequestException,
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
import { TenantContextService } from '../../../common/tenant/tenant-context.service';
import {
  type CreateWarehouseBinCommand,
  type UpdateWarehouseBinCommand,
  WarehouseBinService,
} from '../application/warehouse-bin.service';

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

function parseCreateWarehouseBinCommand(
  payload: unknown,
): CreateWarehouseBinCommand {
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

function parseUpdateWarehouseBinCommand(
  payload: unknown,
): UpdateWarehouseBinCommand {
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

@RequirePermissions('masterdata.warehouse-bin.read')
@Controller('warehouse-bins')
export class WarehouseBinController {
  constructor(
    private readonly warehouseBinService: WarehouseBinService,
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

    return this.warehouseBinService.list(ctx.tenantId, {
      warehouseId,
      code,
      name,
      isActive,
    });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const ctx = this.tenantContextService.getRequiredContext();
    return this.warehouseBinService.getById(ctx.tenantId, id);
  }

  @Post()
  @RequirePermissions('masterdata.warehouse-bin.write')
  async create(@Body() body: unknown) {
    const ctx = this.tenantContextService.getRequiredContext();
    const command = parseCreateWarehouseBinCommand(body);

    return this.warehouseBinService.create(
      ctx.tenantId,
      ctx.actorId ?? 'unknown',
      command,
    );
  }

  @Patch(':id')
  @RequirePermissions('masterdata.warehouse-bin.write')
  async update(@Param('id') id: string, @Body() body: unknown) {
    const ctx = this.tenantContextService.getRequiredContext();
    const command = parseUpdateWarehouseBinCommand(body);

    return this.warehouseBinService.update(
      ctx.tenantId,
      ctx.actorId ?? 'unknown',
      id,
      command,
    );
  }

  @Delete(':id')
  @RequirePermissions('masterdata.warehouse-bin.write')
  async remove(@Param('id') id: string) {
    const ctx = this.tenantContextService.getRequiredContext();

    return this.warehouseBinService.remove(
      ctx.tenantId,
      ctx.actorId ?? 'unknown',
      id,
    );
  }
}
