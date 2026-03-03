import type { BigIntString, DocumentType } from '@minierp/shared';

import type {
  EvidenceAttachInput,
  EvidenceQuery,
  EvidenceUploadIntentInput,
  SdkRequestDescriptor,
  TemplateSeedRequest,
  WorkbenchQuery,
} from './types';

function withQuery(path: string, query?: Record<string, string | undefined>): string {
  if (!query) {
    return path;
  }

  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export const sdkEndpoints = {
  templates: {
    seed(input: TemplateSeedRequest): SdkRequestDescriptor {
      return {
        path: withQuery('/templates/seed', {
          route: input.route,
          kind: input.kind,
        }),
        method: 'GET',
        mockKey: `templates:seed:${input.kind}:${input.route}`,
      };
    },
  },
  documents: {
    list(
      docType: DocumentType,
      query: WorkbenchQuery = {},
    ): SdkRequestDescriptor {
      return {
        path: '/documents',
        method: 'GET',
        query: {
          docType,
          page: query.page,
          pageSize: query.pageSize,
          keyword: query.keyword,
          status: query.status,
          docDateFrom: query.docDateFrom,
          docDateTo: query.docDateTo,
        },
        mockKey: `documents:list:${docType}`,
      };
    },
    detail(docType: DocumentType, id: BigIntString): SdkRequestDescriptor {
      return {
        path: `/documents/${docType}/${id}`,
        method: 'GET',
        mockKey: `documents:detail:${docType}:${id}`,
      };
    },
    command(
      docType: DocumentType,
      id: BigIntString,
      action: 'confirm' | 'post' | 'cancel',
    ): SdkRequestDescriptor {
      return {
        path: `/documents/${docType}/${id}/${action}`,
        method: 'POST',
        mockKey: `documents:command:${docType}:${action}:${id}`,
      };
    },
  },
  evidence: {
    collection(query: EvidenceQuery): SdkRequestDescriptor {
      return {
        path: '/evidence/links',
        method: 'GET',
        query,
        mockKey: `evidence:collection:${query.scope}:${query.entityType}:${query.entityId}:${query.lineRef ?? 'all'}`,
      };
    },
    uploadIntent(
      body: EvidenceUploadIntentInput,
    ): SdkRequestDescriptor {
      return {
        path: '/evidence/upload-intents',
        method: 'POST',
        body,
        mockKey: `evidence:upload-intent:${body.scope}:${body.entityType}`,
      };
    },
    attach(
      body: EvidenceAttachInput,
    ): SdkRequestDescriptor {
      return {
        path: '/evidence/links',
        method: 'POST',
        body,
        mockKey: `evidence:attach:${body.scope}:${body.entityType}:${body.entityId}`,
      };
    },
  },
};
