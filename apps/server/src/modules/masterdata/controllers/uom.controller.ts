import { Controller, Get, Param, Query } from '@nestjs/common';
import { RequirePermissions } from '../../../common/iam/require-permissions.decorator';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';
import { UomService } from '../application/uom.service';

@RequirePermissions('masterdata.uom.read')
@Controller('uoms')
export class UomController {
  constructor(
    private readonly uomService: UomService,
    private readonly tenantContextService: TenantContextService,
  ) {}

  @Get()
  async list(
    @Query('code') code?: string,
    @Query('name') name?: string,
    @Query('isActive') isActive?: string,
  ) {
    const ctx = this.tenantContextService.getRequiredContext();

    return this.uomService.list(ctx.tenantId, {
      code,
      name,
      isActive,
    });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const ctx = this.tenantContextService.getRequiredContext();
    return this.uomService.getById(ctx.tenantId, id);
  }
}
