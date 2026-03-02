import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import type { ApiError, ApiErrorCode, ApiErrorPayload } from '@minierp/shared';

const CATEGORY_TO_STATUS: Record<ApiErrorPayload['category'], number> = {
  validation: HttpStatus.BAD_REQUEST,
  auth: HttpStatus.UNAUTHORIZED,
  permission: HttpStatus.FORBIDDEN,
  not_found: HttpStatus.NOT_FOUND,
  conflict: HttpStatus.CONFLICT,
  state_transition: HttpStatus.CONFLICT,
  rate_limit: HttpStatus.TOO_MANY_REQUESTS,
  external: HttpStatus.BAD_GATEWAY,
  internal: HttpStatus.INTERNAL_SERVER_ERROR,
};

const STATUS_TO_CATEGORY: Record<number, ApiErrorPayload['category']> = {
  [HttpStatus.BAD_REQUEST]: 'validation',
  [HttpStatus.UNAUTHORIZED]: 'auth',
  [HttpStatus.FORBIDDEN]: 'permission',
  [HttpStatus.NOT_FOUND]: 'not_found',
  [HttpStatus.CONFLICT]: 'conflict',
  [HttpStatus.TOO_MANY_REQUESTS]: 'rate_limit',
};

function defaultCode(category: ApiErrorPayload['category']): ApiErrorCode {
  return `${category.toUpperCase()}_UNEXPECTED` as ApiErrorCode;
}

function fallbackMessage(status: number): string {
  if (status >= 500) {
    return 'Internal server error';
  }

  return 'Request failed';
}

function toApiErrorPayload(exception: unknown): ApiErrorPayload {
  if (exception instanceof HttpException) {
    const status = exception.getStatus();
    const category = STATUS_TO_CATEGORY[status] ?? 'internal';
    const response = exception.getResponse();

    if (typeof response === 'object' && response !== null) {
      const maybeError = response as Partial<ApiErrorPayload> & { message?: string | string[] };
      const message = Array.isArray(maybeError.message)
        ? maybeError.message.join(', ')
        : maybeError.message ?? exception.message;

      return {
        category,
        code: maybeError.code ?? defaultCode(category),
        message,
        details: maybeError.details,
        transition: maybeError.transition,
      };
    }

    return {
      category,
      code: defaultCode(category),
      message: typeof response === 'string' ? response : exception.message,
    };
  }

  if (exception instanceof Error) {
    return {
      category: 'internal',
      code: defaultCode('internal'),
      message: exception.message,
    };
  }

  return {
    category: 'internal',
    code: defaultCode('internal'),
    message: 'Unknown error',
  };
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const payload = toApiErrorPayload(exception);
    const status = CATEGORY_TO_STATUS[payload.category] ?? HttpStatus.INTERNAL_SERVER_ERROR;

    const body: ApiError = {
      error: {
        ...payload,
        message: payload.message || fallbackMessage(status),
      },
    };

    response.status(status).json(body);
  }
}
