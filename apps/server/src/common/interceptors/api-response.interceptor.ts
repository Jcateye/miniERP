import { Injectable, NestInterceptor, type ExecutionContext, type CallHandler } from '@nestjs/common';
import type { ApiResponse } from '@minierp/shared';
import { map, type Observable } from 'rxjs';

interface ApiResponseShape {
  readonly message: string;
  readonly data: unknown;
}

function isApiResponseShape(value: unknown): value is ApiResponseShape {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (!('data' in value) || !('message' in value)) {
    return false;
  }

  return typeof (value as { message: unknown }).message === 'string';
}

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<ApiResponse<unknown>> {
    return next.handle().pipe(
      map((value: unknown) => {
        if (isApiResponseShape(value)) {
          return value;
        }

        return {
          message: 'OK',
          data: value,
        };
      }),
    );
  }
}
