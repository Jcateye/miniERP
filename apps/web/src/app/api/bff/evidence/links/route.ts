import { NextRequest, NextResponse } from 'next/server';

import {
  buildBackendUrl,
  createServerHeaders,
  toUpstreamErrorResponse,
  toUpstreamUnavailableResponse,
} from '@/lib/bff/server-fixtures';

type EvidenceScope = 'document' | 'line';

type CreateEvidenceLinkPayload = {
  evidenceId: string;
  entityType: string;
  entityId: string;
  scope: EvidenceScope;
  lineRef?: string;
  tag: string;
};

function isEvidenceScope(value: string): value is EvidenceScope {
  return value === 'document' || value === 'line';
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateQueryParams(searchParams: URLSearchParams): string | null {
  const entityType = searchParams.get('entityType');
  const entityId = searchParams.get('entityId');
  const scope = searchParams.get('scope');
  const lineRef = searchParams.get('lineRef') ?? searchParams.get('lineId');

  if (!entityType || !isNonEmptyString(entityType)) {
    return 'entityType is required';
  }

  if (!entityId || !isNonEmptyString(entityId)) {
    return 'entityId is required';
  }

  if (scope && !isEvidenceScope(scope)) {
    return 'scope must be document or line';
  }

  if (lineRef !== null && !isNonEmptyString(lineRef)) {
    return 'lineRef must be a non-empty string';
  }

  if (scope === 'line' && lineRef === null) {
    return 'lineRef is required when scope is line';
  }

  if (scope === 'document' && lineRef !== null) {
    return 'lineRef must be empty when scope is document';
  }

  return null;
}

function parseCreateEvidenceLinkPayload(
  payload: unknown,
):
  | { readonly ok: true; readonly data: CreateEvidenceLinkPayload }
  | { readonly ok: false; readonly message: string } {
  if (typeof payload !== 'object' || payload === null) {
    return { ok: false, message: 'Request body must be an object' };
  }

  const candidate = payload as Record<string, unknown>;

  const evidenceId = candidate.evidenceId ?? candidate.assetId;
  if (!isNonEmptyString(evidenceId)) {
    return { ok: false, message: 'evidenceId is required' };
  }

  if (!isNonEmptyString(candidate.entityType)) {
    return { ok: false, message: 'entityType is required' };
  }

  if (!isNonEmptyString(candidate.entityId)) {
    return { ok: false, message: 'entityId is required' };
  }

  const scope = candidate.scope ?? candidate.bindingLevel;
  if (!isNonEmptyString(scope) || !isEvidenceScope(scope)) {
    return { ok: false, message: 'scope must be document or line' };
  }

  const lineRef = candidate.lineRef ?? candidate.lineId;
  if (lineRef !== undefined) {
    if (!isNonEmptyString(lineRef)) {
      return { ok: false, message: 'lineRef must be a non-empty string' };
    }
  }

  if (scope === 'line' && lineRef === undefined) {
    return { ok: false, message: 'lineRef is required when scope is line' };
  }

  if (scope === 'document' && lineRef !== undefined) {
    return { ok: false, message: 'lineRef must be empty when scope is document' };
  }

  if (!isNonEmptyString(candidate.tag)) {
    return { ok: false, message: 'tag is required' };
  }

  const normalizedPayload: CreateEvidenceLinkPayload = {
    evidenceId: evidenceId.trim(),
    entityType: candidate.entityType.trim(),
    entityId: candidate.entityId.trim(),
    scope,
    tag: candidate.tag.trim(),
  };

  if (lineRef !== undefined) {
    normalizedPayload.lineRef = lineRef.trim();
  }

  return { ok: true, data: normalizedPayload };
}

export async function GET(request: NextRequest) {
  const queryError = validateQueryParams(request.nextUrl.searchParams);
  if (queryError) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_INVALID_QUERY',
          category: 'validation',
          message: queryError,
        },
      },
      { status: 400 },
    );
  }

  const upstreamParams = new URLSearchParams(request.nextUrl.searchParams);
  const lineRef = upstreamParams.get('lineRef') ?? upstreamParams.get('lineId');
  if (lineRef) {
    upstreamParams.set('lineRef', lineRef);
  }
  upstreamParams.delete('lineId');

  try {
    const response = await fetch(buildBackendUrl(`/evidence/links?${upstreamParams.toString()}`), {
      headers: createServerHeaders(),
      cache: 'no-store',
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    return toUpstreamErrorResponse(response);
  } catch {
    return toUpstreamUnavailableResponse('Backend evidence links are unavailable');
  }
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_INVALID_JSON',
          category: 'validation',
          message: 'Request body must be valid JSON',
        },
      },
      { status: 400 },
    );
  }

  const parsed = parseCreateEvidenceLinkPayload(payload);
  if (!parsed.ok) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_INVALID_PAYLOAD',
          category: 'validation',
          message: parsed.message,
        },
      },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(buildBackendUrl('/evidence/links'), {
      method: 'POST',
      headers: createServerHeaders(),
      body: JSON.stringify(parsed.data),
      cache: 'no-store',
    });

    if (response.ok) {
      return NextResponse.json(await response.json());
    }

    return toUpstreamErrorResponse(response);
  } catch {
    return toUpstreamUnavailableResponse('Backend evidence attach is unavailable');
  }
}
