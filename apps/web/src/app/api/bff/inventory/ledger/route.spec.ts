import { NextRequest } from 'next/server';

import { GET } from './route';

describe('bff inventory ledger route', () => {
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
            data: [{ id: 'l1' }],
            total: 1,
            page: 2,
            pageSize: 50,
            totalPages: 1,
          },
        },
        { status: 200 },
      );
    }) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/inventory/ledger?skuId=SKU-1&page=2&pageSize=50');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.total).toBe(1);
    expect(body.data.page).toBe(2);
    expect(body.data.pageSize).toBe(50);
    expect(String(calls[0]?.input)).toBe('http://backend.test/api/inventory/ledger?skuId=SKU-1&page=2&pageSize=50');
  });

  it('passes through upstream error for GET', async () => {
    process.env.NODE_ENV = 'test';
    globalThis.fetch = (async () =>
      Response.json(
        {
          error: { code: 'VALIDATION_INVALID_PAGE', message: 'page invalid' },
        },
        { status: 400 },
      )) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/inventory/ledger?page=0');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_PAGE');
  });

  it('returns 400 when docType is invalid', async () => {
    process.env.NODE_ENV = 'test';

    const request = new NextRequest(
      'http://localhost/api/bff/inventory/ledger?docType=INVALID',
    );
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_DOC_TYPE');
  });

  it('returns 503 when upstream is unavailable', async () => {
    process.env.NODE_ENV = 'test';
    globalThis.fetch = (async () => {
      throw new Error('network down');
    }) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/inventory/ledger');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error.code).toBe('BFF_UPSTREAM_UNAVAILABLE');
  });
});
