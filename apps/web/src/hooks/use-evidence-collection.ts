'use client';

import type { BigIntString } from '@minierp/shared';

import { bffQueryKeys, getEvidenceCollection } from '@/lib/bff';

import { useBffQuery } from './use-bff-query';

export function useDocumentEvidence(entityType: string, entityId?: BigIntString, tag?: string) {
  return useBffQuery(
    bffQueryKeys.evidenceCollection({
      entityType,
      entityId: entityId ?? 'pending',
      scope: 'document',
      tag,
    }),
    () =>
      getEvidenceCollection({
        entityType,
        entityId: entityId ?? 'pending',
        scope: 'document',
        tag,
      }),
    { enabled: Boolean(entityId) },
  );
}

export function useLineEvidence(
  entityType: string,
  entityId?: BigIntString,
  lineRef?: BigIntString,
  tag?: string,
) {
  return useBffQuery(
    bffQueryKeys.evidenceCollection({
      entityType,
      entityId: entityId ?? 'pending',
      scope: 'line',
      lineRef,
      tag,
    }),
    () =>
      getEvidenceCollection({
        entityType,
        entityId: entityId ?? 'pending',
        scope: 'line',
        lineRef,
        tag,
      }),
    { enabled: Boolean(entityId && lineRef) },
  );
}
