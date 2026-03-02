import type { ArgumentsHost } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiExceptionFilter } from './api-exception.filter';

describe('ApiExceptionFilter', () => {
  const filter = new ApiExceptionFilter();
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  function createHost() {
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

    filter.catch(new HttpException('upstream unavailable', HttpStatus.SERVICE_UNAVAILABLE), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
    expect(json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: 'upstream unavailable',
      }),
    });
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
    expect(json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: 'Internal server error',
        details: undefined,
        transition: undefined,
      }),
    });
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
    expect(json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        message: 'field a is required, field b must be positive',
      }),
    });
  });
});
