import { NextRequest } from 'next/server';

import { GET, POST } from './route';

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

describe('bff documents create route', () => {
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

  it('normalizes create payload before forwarding', async () => {
    process.env.NODE_ENV = 'test';
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://backend.test';
    const calls: Array<{ readonly input: string | URL; readonly init?: RequestInit }> = [];

    globalThis.fetch = (async (input, init) => {
      calls.push({ input: input as string | URL, init });
      return Response.json(
        {
          data: {
            id: '3001',
            docNo: 'DOC-GRN-20260313-001',
            docType: 'GRN',
            status: 'draft',
            docDate: '2026-03-13',
            lineCount: 1,
          },
        },
        { status: 200 },
      );
    }) as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/documents', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'idempotency-key': 'idem-bff-doc-create-001',
      },
      body: JSON.stringify({
        docType: 'grn',
        warehouseId: ' WH-001 ',
        lines: [
          {
            sku: ' SKU-001 ',
            quantity: '8',
            price: '12.5',
            bin: ' BIN-A-01-01 ',
          },
        ],
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(String(calls[0]?.input)).toBe('http://backend.test/api/documents');
    expect(calls[0]?.init?.headers).toMatchObject({
      'Idempotency-Key': 'idem-bff-doc-create-001',
    });
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({
      docType: 'GRN',
      warehouseId: 'WH-001',
      docDate: undefined,
      remarks: undefined,
      supplierId: undefined,
      customerId: undefined,
      sourceDocId: undefined,
      lines: [
        {
          skuId: 'SKU-001',
          qty: '8',
          unitPrice: '12.5',
          binId: 'BIN-A-01-01',
        },
      ],
    });
    expect(body.data.id).toBe('3001');
  });

  it('rejects invalid create payload before upstream call', async () => {
    process.env.NODE_ENV = 'test';
    globalThis.fetch = jest.fn() as typeof fetch;

    const request = new NextRequest('http://localhost/api/bff/documents', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'idempotency-key': 'idem-bff-doc-create-002',
      },
      body: JSON.stringify({
        docType: 'OUT',
        lines: [{ skuId: 'SKU-001', qty: '2', binId: '   ' }],
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_PAYLOAD');
    expect(body.error.message).toBe(
      'lines[0].binId must be a non-empty string when provided',
    );
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
