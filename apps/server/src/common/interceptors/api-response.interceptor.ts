import { Injectable, NestInterceptor, type ExecutionContext, type CallHandler } from '@nestjs/common';
import type { ApiResponse } from '@minierp/shared';
import { map, type Observable } from 'rxjs';

interface ResponseData {
  readonly message?: string;
  readonly data: unknown;
}

function isResponseData(value: unknown): value is ResponseData {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (!('data' in value)) {
    return false;
  }

  return true;
}

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<ApiResponse<unknown>> {
    return next.handle().pipe(
      map((value: unknown) => {
        if (isResponseData(value)) {
          return {
            message: value.message ?? 'OK',
            data: value.data,
          };
        }

        return {
          message: 'OK',
          data: value,
        };
      }),
    );
  }
}
