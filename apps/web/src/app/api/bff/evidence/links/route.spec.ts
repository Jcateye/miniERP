import { NextRequest } from 'next/server';

import { GET, POST } from './route';

describe('bff evidence links route', () => {
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
      return Response.json({ data: [] }, { status: 200 });
    }) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/evidence/links?entityType=stocktake&entityId=6001&scope=document');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(String(calls[0]?.input)).toBe('http://backend.test/api/evidence/links?entityType=stocktake&entityId=6001&scope=document');
  });

  it('returns 400 when required query params are missing', async () => {
    process.env.NODE_ENV = 'test';

    const request = new NextRequest('http://localhost/api/bff/evidence/links?entityType=stocktake');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_QUERY');
  });

  it('returns 400 when scope is line but lineRef is missing', async () => {
    process.env.NODE_ENV = 'test';

    const request = new NextRequest('http://localhost/api/bff/evidence/links?entityType=stocktake&entityId=6001&scope=line');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_QUERY');
  });

  it('returns 400 when scope is document but lineRef is provided', async () => {
    process.env.NODE_ENV = 'test';

    const request = new NextRequest('http://localhost/api/bff/evidence/links?entityType=stocktake&entityId=6001&scope=document&lineRef=3001-L1');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_QUERY');
  });

  it('returns 400 when scope is invalid', async () => {
    process.env.NODE_ENV = 'test';

    const request = new NextRequest('http://localhost/api/bff/evidence/links?entityType=stocktake&entityId=6001&scope=invalid');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_QUERY');
  });

  it('accepts lineRef query param', async () => {
    process.env.NODE_ENV = 'test';
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://backend.test';
    const calls: Array<{ readonly input: string | URL }> = [];

    globalThis.fetch = (async (input) => {
      calls.push({ input: input as string | URL });
      return Response.json({ data: [] }, { status: 200 });
    }) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/evidence/links?entityType=stocktake&entityId=6001&scope=line&lineRef=3001-L1');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(String(calls[0]?.input)).toBe(
      'http://backend.test/api/evidence/links?entityType=stocktake&entityId=6001&scope=line&lineRef=3001-L1',
    );
  });

  it('normalizes legacy lineId to lineRef before forwarding', async () => {
    process.env.NODE_ENV = 'test';
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://backend.test';
    const calls: Array<{ readonly input: string | URL }> = [];

    globalThis.fetch = (async (input) => {
      calls.push({ input: input as string | URL });
      return Response.json({ data: [] }, { status: 200 });
    }) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/evidence/links?entityType=stocktake&entityId=6001&scope=line&lineId=3001-L1');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(String(calls[0]?.input)).toBe(
      'http://backend.test/api/evidence/links?entityType=stocktake&entityId=6001&scope=line&lineRef=3001-L1',
    );
  });

  it('returns 400 when lineRef is empty', async () => {
    process.env.NODE_ENV = 'test';

    const request = new NextRequest('http://localhost/api/bff/evidence/links?entityType=stocktake&entityId=6001&scope=line&lineRef=');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_QUERY');
  });

  it('passes through upstream error', async () => {
    process.env.NODE_ENV = 'test';
    globalThis.fetch = (async () =>
      Response.json(
        {
          error: { code: 'VALIDATION_INVALID_SCOPE', message: 'invalid scope' },
        },
        { status: 400 },
      )) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/evidence/links?entityType=stocktake&entityId=6001');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_SCOPE');
  });

  it('returns 400 when POST body is invalid JSON', async () => {
    process.env.NODE_ENV = 'test';

    const request = new NextRequest('http://localhost/api/bff/evidence/links', {
      method: 'POST',
      body: '{',
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_JSON');
  });

  it('forwards POST payload using scope/lineRef contract', async () => {
    process.env.NODE_ENV = 'test';
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://backend.test';
    const calls: Array<{ readonly input: string | URL; readonly init: RequestInit | undefined }> = [];

    globalThis.fetch = (async (input, init) => {
      calls.push({ input: input as string | URL, init: init as RequestInit | undefined });
      return Response.json({ success: true }, { status: 201 });
    }) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/evidence/links', {
      method: 'POST',
      body: JSON.stringify({
        evidenceId: 'e-1',
        entityType: 'stocktake',
        entityId: '6001',
        scope: 'line',
        lineRef: '3001-L1',
        tag: 'label',
      }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(String(calls[0]?.input)).toBe('http://backend.test/api/evidence/links');
    expect(calls[0]?.init?.method).toBe('POST');
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({
      evidenceId: 'e-1',
      entityType: 'stocktake',
      entityId: '6001',
      scope: 'line',
      lineRef: '3001-L1',
      tag: 'label',
    });
  });

  it('accepts legacy POST payload keys', async () => {
    process.env.NODE_ENV = 'test';
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://backend.test';
    const calls: Array<{ readonly init: RequestInit | undefined }> = [];

    globalThis.fetch = (async (_input, init) => {
      calls.push({ init: init as RequestInit | undefined });
      return Response.json({ success: true }, { status: 201 });
    }) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/evidence/links', {
      method: 'POST',
      body: JSON.stringify({
        assetId: 'e-legacy-1',
        entityType: 'stocktake',
        entityId: '6001',
        bindingLevel: 'document',
        tag: 'damage',
      }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({
      evidenceId: 'e-legacy-1',
      entityType: 'stocktake',
      entityId: '6001',
      scope: 'document',
      tag: 'damage',
    });
  });

  it('returns 400 when POST payload is invalid', async () => {
    process.env.NODE_ENV = 'test';

    const request = new NextRequest('http://localhost/api/bff/evidence/links', {
      method: 'POST',
      body: JSON.stringify({ entityType: 'stocktake' }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_PAYLOAD');
  });

  it('returns 400 when POST scope is line but lineRef is missing', async () => {
    process.env.NODE_ENV = 'test';

    const request = new NextRequest('http://localhost/api/bff/evidence/links', {
      method: 'POST',
      body: JSON.stringify({
        evidenceId: 'e-1',
        entityType: 'stocktake',
        entityId: '6001',
        scope: 'line',
        tag: 'label',
      }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_PAYLOAD');
  });

  it('returns 400 when POST scope is document but lineRef is provided', async () => {
    process.env.NODE_ENV = 'test';

    const request = new NextRequest('http://localhost/api/bff/evidence/links', {
      method: 'POST',
      body: JSON.stringify({
        evidenceId: 'e-1',
        entityType: 'stocktake',
        entityId: '6001',
        scope: 'document',
        lineRef: '3001-L1',
        tag: 'label',
      }),
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
          error: { code: 'EVIDENCE_NOT_FOUND', message: 'missing evidence' },
        },
        { status: 404 },
      )) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/evidence/links', {
      method: 'POST',
      body: JSON.stringify({
        evidenceId: 'e-1',
        entityType: 'stocktake',
        entityId: '6001',
        bindingLevel: 'document',
        tag: 'label',
      }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error.code).toBe('EVIDENCE_NOT_FOUND');
  });

  it('returns 503 when upstream is unavailable', async () => {
    process.env.NODE_ENV = 'test';
    globalThis.fetch = (async () => {
      throw new Error('network down');
    }) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/evidence/links?entityType=stocktake&entityId=6001');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error.code).toBe('BFF_UPSTREAM_UNAVAILABLE');
  });

  it('returns 503 when upstream is unavailable for POST', async () => {
    process.env.NODE_ENV = 'test';
    globalThis.fetch = (async () => {
      throw new Error('network down');
    }) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/evidence/links', {
      method: 'POST',
      body: JSON.stringify({
        evidenceId: 'e-1',
        entityType: 'stocktake',
        entityId: '6001',
        bindingLevel: 'document',
        tag: 'label',
      }),
      headers: { 'content-type': 'application/json' },
    });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error.code).toBe('BFF_UPSTREAM_UNAVAILABLE');
  });
});
