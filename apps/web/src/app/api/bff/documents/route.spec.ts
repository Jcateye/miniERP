import { NextRequest } from 'next/server';

import { GET } from './route';

describe('bff documents list route', () => {
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

  it('forwards query params to backend', async () => {
    process.env.NODE_ENV = 'test';
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://backend.test';
    const calls: Array<{ readonly input: string | URL }> = [];

    globalThis.fetch = (async (input) => {
      calls.push({ input: input as string | URL });
      return Response.json({ data: [{ id: '7001', docType: 'SO' }] }, { status: 200 });
    }) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/documents?docType=SO&page=1&pageSize=20');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(String(calls[0]?.input)).toBe('http://backend.test/api/documents?docType=SO&page=1&pageSize=20');
  });

  it('returns 400 when docType is invalid', async () => {
    process.env.NODE_ENV = 'test';

    const request = new NextRequest('http://localhost/api/bff/documents?docType=INVALID');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_DOC_TYPE');
  });

  it('returns 400 when page is invalid', async () => {
    process.env.NODE_ENV = 'test';

    const request = new NextRequest('http://localhost/api/bff/documents?page=0');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_PAGE');
  });

  it('returns 400 when pageSize is invalid', async () => {
    process.env.NODE_ENV = 'test';

    const request = new NextRequest('http://localhost/api/bff/documents?pageSize=-1');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_PAGE_SIZE');
  });

  it('normalizes docType to uppercase before forwarding', async () => {
    process.env.NODE_ENV = 'test';
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://backend.test';
    const calls: Array<{ readonly input: string | URL }> = [];

    globalThis.fetch = (async (input) => {
      calls.push({ input: input as string | URL });
      return Response.json({ data: [] }, { status: 200 });
    }) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/documents?docType=so&page=1');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(String(calls[0]?.input)).toBe('http://backend.test/api/documents?docType=SO&page=1');
  });

  it('passes through upstream error', async () => {
    process.env.NODE_ENV = 'test';
    globalThis.fetch = (async () =>
      Response.json(
        {
          error: { code: 'VALIDATION_INVALID_FILTER', message: 'invalid filter' },
        },
        { status: 400 },
      )) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/documents?docType=SO');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_FILTER');
  });
  it('returns generic upstream error message for 5xx json response', async () => {
    process.env.NODE_ENV = 'test';
    globalThis.fetch = (async () =>
      Response.json(
        {
          error: {
            code: 'INTERNAL_DEBUG_ONLY',
            message: 'stack trace leaked',
          },
        },
        { status: 500 },
      )) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/documents?docType=SO');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error.code).toBe('BFF_UPSTREAM_ERROR');
    expect(body.error.message).toBe('Upstream service temporarily unavailable');
  });

  it('returns 503 when upstream is unavailable', async () => {
    process.env.NODE_ENV = 'test';
    globalThis.fetch = (async () => {
      throw new Error('network down');
    }) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/documents?docType=SO');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error.code).toBe('BFF_UPSTREAM_UNAVAILABLE');
  });
});
