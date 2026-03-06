import { NextRequest } from 'next/server';

import { GET } from './route';

describe('bff inventory balances route', () => {
  const originalFetch = globalThis.fetch;
  const originalNodeEnv = process.env.NODE_ENV;
  const originalApiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  afterEach(() => {
    globalThis.fetch = originalFetch;

    if (typeof originalNodeEnv === 'undefined') {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }

    if (typeof originalApiBase === 'undefined') {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
    } else {
      process.env.NEXT_PUBLIC_API_BASE_URL = originalApiBase;
    }
  });

  it('forwards query params for GET', async () => {
    process.env.NODE_ENV = 'test';
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://backend.test';
    const calls: Array<{ readonly input: string | URL }> = [];

    globalThis.fetch = (async (input) => {
      calls.push({ input: input as string | URL });
      return Response.json(
        {
          message: 'OK',
          data: {
            data: [{ skuId: 'SKU-1', warehouseId: 'WH-1', onHand: 10 }],
            total: 1,
          },
        },
        { status: 200 },
      );
    }) as typeof fetch;

    const request = new NextRequest(
      'http://localhost/api/bff/inventory/balances?skuId=SKU-1&warehouseId=WH-1&page=1&pageSize=20',
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.data).toHaveLength(1);
    expect(body.data.page).toBe(1);
    expect(body.data.pageSize).toBe(20);
    expect(body.data.totalPages).toBe(1);
    expect(String(calls[0]?.input)).toBe(
      'http://backend.test/api/inventory/balances?skuId=SKU-1&warehouseId=WH-1',
    );
  });

  it('returns paginated result for balances', async () => {
    process.env.NODE_ENV = 'test';

    globalThis.fetch = (async () =>
      Response.json(
        {
          data: Array.from({ length: 21 }).map((_, index) => ({
            skuId: `SKU-${index + 1}`,
            warehouseId: 'WH-1',
            onHand: index + 1,
          })),
          total: 21,
        },
        { status: 200 },
      )) as typeof fetch;

    const request = new NextRequest(
      'http://localhost/api/bff/inventory/balances?page=2&pageSize=20',
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.data).toHaveLength(1);
    expect(body.data.page).toBe(2);
    expect(body.data.total).toBe(21);
    expect(body.data.totalPages).toBe(2);
  });

  it('passes through upstream error for GET', async () => {
    process.env.NODE_ENV = 'test';
    globalThis.fetch = (async () =>
      Response.json(
        {
          error: { code: 'VALIDATION_INVALID_FILTER', message: 'bad filter' },
        },
        { status: 400 },
      )) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/inventory/balances?warehouseId=WH-1');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_FILTER');
  });

  it('returns 400 for invalid page', async () => {
    process.env.NODE_ENV = 'test';

    const request = new NextRequest(
      'http://localhost/api/bff/inventory/balances?page=0',
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_PAGE');
  });

  it('returns 503 when upstream is unavailable', async () => {
    process.env.NODE_ENV = 'test';
    globalThis.fetch = (async () => {
      throw new Error('network down');
    }) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/inventory/balances');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error.code).toBe('BFF_UPSTREAM_UNAVAILABLE');
  });
});
