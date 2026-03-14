import { Controller, Get } from '@nestjs/common';
import { RequireAuthorize } from '../../common/iam/authorize/require-authorize.decorator';

@Controller('policy')
export class PolicyController {
  @Get('probe')
  @RequireAuthorize({ resource: 'erp:policy', action: 'read' })
  probe(): { ok: true } {
    return { ok: true };
  }
}
