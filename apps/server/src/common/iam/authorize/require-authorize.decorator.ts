import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthorizeGuard, AUTHZ_METADATA_KEY } from './authorize.guard';

export interface RequireAuthorizeInput {
  readonly resource: string;
  readonly action: string;
  readonly context?: Record<string, unknown>;
}

export function RequireAuthorize(input: RequireAuthorizeInput) {
  return applyDecorators(
    SetMetadata(AUTHZ_METADATA_KEY, input),
    UseGuards(AuthorizeGuard),
  );
}
