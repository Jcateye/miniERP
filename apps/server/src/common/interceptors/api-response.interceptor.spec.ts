import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import { ApiResponseInterceptor } from './api-response.interceptor';

describe('ApiResponseInterceptor', () => {
  const interceptor = new ApiResponseInterceptor();
  const executionContext = {} as ExecutionContext;

  async function runIntercept(value: unknown) {
    const callHandler: CallHandler = {
      handle: () => of(value),
    };

    return lastValueFrom(interceptor.intercept(executionContext, callHandler));
  }

  it('passes through standard response shape', async () => {
    const response = await runIntercept({
      message: 'ok',
      data: { id: 1 },
    });

    expect(response).toEqual({
      message: 'ok',
      data: { id: 1 },
    });
  });

  it('wraps plain object responses', async () => {
    const response = await runIntercept({
      service: 'miniERP-server',
      status: 'ok',
    });

    expect(response).toEqual({
      message: 'OK',
      data: {
        service: 'miniERP-server',
        status: 'ok',
      },
    });
  });

  it('normalizes data-only responses without double wrapping', async () => {
    const response = await runIntercept({
      data: { status: 'live' },
    });

    expect(response).toEqual({
      message: 'OK',
      data: { status: 'live' },
    });

    expect((response.data as { data?: unknown }).data).toBeUndefined();
  });
});
