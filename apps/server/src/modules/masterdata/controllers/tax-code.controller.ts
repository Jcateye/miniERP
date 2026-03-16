import { Controller, Get, Param, Query } from '@nestjs/common';
import { RequirePermissions } from '../../../common/iam/require-permissions.decorator';
import { TenantContextService } from '../../../common/tenant/tenant-context.service';
import { TaxCodeService } from '../application/tax-code.service';

@RequirePermissions('masterdata.tax-code.read')
@Controller('tax-codes')
export class TaxCodeController {
  constructor(
    private readonly taxCodeService: TaxCodeService,
    private readonly tenantContextService: TenantContextService,
  ) {}

  @Get()
  async list(
    @Query('code') code?: string,
    @Query('name') name?: string,
    @Query('isActive') isActive?: string,
  ) {
    const ctx = this.tenantContextService.getRequiredContext();

    return this.taxCodeService.list(ctx.tenantId, {
      code,
      name,
      isActive,
    });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const ctx = this.tenantContextService.getRequiredContext();
    return this.taxCodeService.getById(ctx.tenantId, id);
  }
}
