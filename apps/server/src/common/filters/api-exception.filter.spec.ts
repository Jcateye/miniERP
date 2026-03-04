import type { ArgumentsHost } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { InvalidStatusTransitionError } from '../../modules/core-document/domain/status-transition';
import { ApiExceptionFilter } from './api-exception.filter';
import type { ApiErrorPayload } from '@minierp/shared';

describe('ApiExceptionFilter', () => {
  const filter = new ApiExceptionFilter();
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  function createHost(): {
    host: ArgumentsHost;
    status: jest.Mock;
    json: jest.Mock;
  } {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });

    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
      }),
    } as unknown as ArgumentsHost;

    return { host, status, json };
  }

  it('keeps HttpException status code for upstream errors', () => {
    process.env.NODE_ENV = 'test';
    const { host, status, json } = createHost();

    filter.catch(
      new HttpException('upstream unavailable', HttpStatus.SERVICE_UNAVAILABLE),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
    const calls = json.mock.calls as unknown as [[{ error: ApiErrorPayload }]];
    expect(calls[0][0].error.message).toBe('upstream unavailable');
  });

  it('sanitizes 5xx message/details in production', () => {
    process.env.NODE_ENV = 'production';
    const { host, status, json } = createHost();

    filter.catch(
      new HttpException(
        {
          code: 'INTERNAL_DB_ERROR',
          message: 'database secret leaked',
          details: {
            dsn: 'postgres://user:pass@db:5432/minierp',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      ),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    const calls = json.mock.calls as unknown as [[{ error: ApiErrorPayload }]];
    expect(calls[0][0].error.message).toBe('Internal server error');
    expect(calls[0][0].error.details).toBeUndefined();
    expect(calls[0][0].error.transition).toBeUndefined();
  });

  it('does not sanitize 4xx in production', () => {
    process.env.NODE_ENV = 'production';
    const { host, status, json } = createHost();

    filter.catch(
      new HttpException(
        {
          code: 'VALIDATION_INVALID_INPUT',
          message: ['field a is required', 'field b must be positive'],
        },
        HttpStatus.BAD_REQUEST,
      ),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    const calls = json.mock.calls as unknown as [[{ error: ApiErrorPayload }]];
    expect(calls[0][0].error.message).toBe(
      'field a is required, field b must be positive',
    );
  });

  it('preserves explicit state transition category on conflict exceptions', () => {
    process.env.NODE_ENV = 'test';
    const { host, status, json } = createHost();

    filter.catch(
      new InvalidStatusTransitionError(
        {
          entityType: 'PO',
          entityId: 'PO-001',
          fromStatus: 'draft',
          toStatus: 'closed',
        },
        ['confirmed', 'cancelled'],
      ),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    const calls = json.mock.calls as unknown as [[{ error: ApiErrorPayload }]];
    const error = calls[0][0].error as ApiErrorPayload & {
      details: Record<string, unknown>;
    };
    expect(error.code).toBe('VALIDATION_STATUS_TRANSITION_INVALID');
    expect(error.category).toBe('state_transition');
    expect(error.message).toBe(
      'Illegal status transition for PO(PO-001): draft -> closed',
    );
    expect(error.details).toEqual({
      entity_type: 'PO',
      entity_id: 'PO-001',
      from_status: 'draft',
      to_status: 'closed',
      allowed_to_statuses: ['confirmed', 'cancelled'],
    });
  });
});
