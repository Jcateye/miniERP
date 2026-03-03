'use client';

import type { DocumentType } from '@minierp/shared';

import { bffQueryKeys, listDocuments } from '@/lib/bff';
import type { WorkbenchQuery } from '@/lib/sdk';

import { useBffQuery } from './use-bff-query';

export function useWorkbenchList(docType: DocumentType, query: WorkbenchQuery = {}) {
  return useBffQuery(
    bffQueryKeys.documentList(docType, query),
    () => listDocuments(docType, query),
    { enabled: true },
  );
}
