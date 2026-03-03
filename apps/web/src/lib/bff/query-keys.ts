import type { BigIntString, DocumentType } from '@minierp/shared';

import type { EvidenceQuery, TemplateSeedRequest, WorkbenchQuery } from '@/lib/sdk/types';

export const bffQueryKeys = {
  templateSeed: (input: TemplateSeedRequest) =>
    ['template-seed', input.kind, input.route] as const,
  documentList: (docType: DocumentType, query: WorkbenchQuery) =>
    ['documents', 'list', docType, query] as const,
  documentDetail: (docType: DocumentType, id: BigIntString) =>
    ['documents', 'detail', docType, id] as const,
  evidenceCollection: (query: EvidenceQuery) =>
    ['evidence', query.entityType, query.entityId, query.scope, query.lineRef ?? null, query.tag ?? null] as const,
};
