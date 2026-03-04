import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { IamGuard, PLATFORM_ACTION_METADATA_KEY } from './iam.guard';

export function RequirePlatformAction(action: string) {
  return applyDecorators(
    SetMetadata(PLATFORM_ACTION_METADATA_KEY, action),
    UseGuards(IamGuard),
  );
}
