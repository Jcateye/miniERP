import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { IamGuard, REQUIRED_PERMISSIONS_METADATA_KEY } from './iam.guard';

export function RequirePermissions(...permissions: string[]) {
  return applyDecorators(
    SetMetadata(REQUIRED_PERMISSIONS_METADATA_KEY, permissions),
    UseGuards(IamGuard),
  );
}
