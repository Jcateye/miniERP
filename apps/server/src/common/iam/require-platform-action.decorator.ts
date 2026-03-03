import { SetMetadata } from '@nestjs/common';
import { PLATFORM_ACTION_METADATA_KEY } from './iam.guard';

export function RequirePlatformAction(action: string) {
  return SetMetadata(PLATFORM_ACTION_METADATA_KEY, action);
}
