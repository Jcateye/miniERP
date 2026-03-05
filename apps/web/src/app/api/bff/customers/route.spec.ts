import { NextRequest } from 'next/server';

import { GET, POST } from './route';

describe('bff customers route', () => {
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
      return Response.json({ data: [{ id: 'c1' }] }, { status: 200 });
    }) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/customers?code=C001&name=alice');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ data: [{ id: 'c1' }] });
    expect(String(calls[0]?.input)).toBe('http://backend.test/api/customers?code=C001&name=alice');
  });

  it('returns 400 when POST body is invalid JSON', async () => {
    process.env.NODE_ENV = 'test';
    const request = new NextRequest('http://localhost/api/bff/customers', {
      method: 'POST',
      body: '{',
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_JSON');
  });

  it('returns 400 when POST payload is invalid', async () => {
    process.env.NODE_ENV = 'test';
    const request = new NextRequest('http://localhost/api/bff/customers', {
      method: 'POST',
      body: JSON.stringify({ name: 'customer only' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_PAYLOAD');
  });

  it('passes through upstream error for POST', async () => {
    process.env.NODE_ENV = 'test';
    globalThis.fetch = (async () =>
      Response.json(
        {
          error: { code: 'MASTERDATA_DUPLICATE_CODE', message: 'duplicate code' },
        },
        { status: 409 },
      )) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/customers', {
      method: 'POST',
      body: JSON.stringify({ code: 'C001', name: 'Alice' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error.code).toBe('MASTERDATA_DUPLICATE_CODE');
  });

  it('returns 503 when upstream is unavailable for GET', async () => {
    process.env.NODE_ENV = 'test';
    globalThis.fetch = (async () => {
      throw new Error('network down');
    }) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/customers');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error.code).toBe('BFF_UPSTREAM_UNAVAILABLE');
  });
});
