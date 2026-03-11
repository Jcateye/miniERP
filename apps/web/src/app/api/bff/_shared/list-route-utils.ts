import { NextResponse } from 'next/server';

import { createServerHeaders, toFixtureFallbackResponse } from '@/lib/bff/server-fixtures';

const DEFAULT_BACKEND_URL = 'http://localhost:3001';
const MAX_RETRY_ATTEMPTS = 1;

function buildRouteBackendUrl(path: string) {
  const baseUrl =
    process.env.BACKEND_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    DEFAULT_BACKEND_URL;

  return `${baseUrl}/api${path}`;
}

function unwrapApiPayload<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in (payload as Record<string, unknown>)
  ) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

type BackendArraySuccess<T> = {
  ok: true;
  data: T[];
};

type BackendArrayFailure = {
  ok: false;
  response?: Response;
};

export async function fetchBackendArray<T>(
  path: string,
): Promise<BackendArraySuccess<T> | BackendArrayFailure> {
  for (let attempt = 0; attempt <= MAX_RETRY_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(buildRouteBackendUrl(path), {
        headers: createServerHeaders(),
        cache: 'no-store',
      });

      if (response.ok) {
        const payload = unwrapApiPayload<unknown>(await response.json());
        return {
          ok: true,
          data: Array.isArray(payload) ? (payload as T[]) : [],
        };
      }

      if (response.status < 500 || attempt === MAX_RETRY_ATTEMPTS) {
        return {
          ok: false,
          response,
        };
      }
    } catch {
      if (attempt === MAX_RETRY_ATTEMPTS) {
        return {
          ok: false,
        };
      }
    }
  }

  return {
    ok: false,
  };
}

export function toListRouteResponse<T>(payload: T, fallbackReason?: string) {
  return fallbackReason
    ? toFixtureFallbackResponse(payload, fallbackReason)
    : NextResponse.json(payload);
}
