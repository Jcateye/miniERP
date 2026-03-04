import {
  Injectable,
  NestInterceptor,
  type ExecutionContext,
  type CallHandler,
} from '@nestjs/common';
import type { ApiResponse } from '@minierp/shared';
import { map, type Observable } from 'rxjs';

interface DataCarrier {
  readonly data: unknown;
  readonly message?: unknown;
}

function isDataCarrier(value: unknown): value is DataCarrier {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return 'data' in value;
}

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<unknown>> {
    return next.handle().pipe(
      map((value: unknown) => {
        if (isDataCarrier(value)) {
          return {
            message: typeof value.message === 'string' ? value.message : 'OK',
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
