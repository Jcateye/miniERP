'use client';

import type { BigIntString, DocumentType } from '@minierp/shared';

import { bffQueryKeys, getDocumentDetail } from '@/lib/bff';

import { useBffQuery } from './use-bff-query';

export function useDocumentDetail(docType: DocumentType, id?: BigIntString) {
  return useBffQuery(
    bffQueryKeys.documentDetail(docType, id ?? 'pending'),
    () => getDocumentDetail(docType, id ?? 'pending'),
    { enabled: Boolean(id) },
  );
}
