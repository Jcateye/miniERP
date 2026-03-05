import { GET } from './route';

describe('bff document detail route', () => {
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

  it('fetches detail from backend with normalized docType', async () => {
    process.env.NODE_ENV = 'test';
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://backend.test';
    const calls: Array<{ readonly input: string | URL }> = [];

    globalThis.fetch = (async (input) => {
      calls.push({ input: input as string | URL });
      return Response.json({ data: { id: '7001', docType: 'SO' } }, { status: 200 });
    }) as typeof fetch;

    const response = await GET(new Request('http://localhost'), {
      params: Promise.resolve({ docType: 'so', id: '7001' }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.id).toBe('7001');
    expect(String(calls[0]?.input)).toBe('http://backend.test/api/documents/SO/7001');
  });

  it('returns 400 when docType is invalid', async () => {
    process.env.NODE_ENV = 'test';

    const response = await GET(new Request('http://localhost'), {
      params: Promise.resolve({ docType: 'invalid', id: '7001' }),
    });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_DOC_TYPE');
  });

  it('returns 400 when id is invalid', async () => {
    process.env.NODE_ENV = 'test';

    const response = await GET(new Request('http://localhost'), {
      params: Promise.resolve({ docType: 'SO', id: 'abc' }),
    });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.code).toBe('VALIDATION_INVALID_ID');
  });

  it('passes through upstream error', async () => {
    process.env.NODE_ENV = 'test';
    globalThis.fetch = (async () =>
      Response.json(
        {
          error: { code: 'DOCUMENT_NOT_FOUND', message: 'missing' },
        },
        { status: 404 },
      )) as typeof fetch;

    const response = await GET(new Request('http://localhost'), {
      params: Promise.resolve({ docType: 'SO', id: '9999' }),
    });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error.code).toBe('DOCUMENT_NOT_FOUND');
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

    const response = await GET(new Request('http://localhost'), {
      params: Promise.resolve({ docType: 'SO', id: '7001' }),
    });
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

    const response = await GET(new Request('http://localhost'), {
      params: Promise.resolve({ docType: 'SO', id: '7001' }),
    });
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error.code).toBe('BFF_UPSTREAM_UNAVAILABLE');
  });
});
