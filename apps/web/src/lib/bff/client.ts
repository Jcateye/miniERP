import type { BigIntString, DocumentType } from '@minierp/shared';

import type {
  DocumentCommandAck,
  DocumentDetailDto,
  DocumentListItemDto,
  EvidenceAttachInput,
  EvidenceCollectionContract,
  EvidenceQuery,
  EvidenceUploadIntent,
  EvidenceUploadIntentInput,
  PaginationEnvelope,
  TemplateSeedDto,
  TemplateSeedRequest,
  WorkbenchQuery,
} from '@/lib/sdk/types';
import { sdkClient } from '@/lib/sdk/client';
import { sdkEndpoints } from '@/lib/sdk/endpoints';

export async function bffGet<T>(path: string): Promise<T> {
  const response = await sdkClient.request<T>(path, { method: 'GET' });
  return response.data;
}

export async function getTemplateSeed(input: TemplateSeedRequest): Promise<TemplateSeedDto> {
  const response = await sdkClient.request<TemplateSeedDto>(sdkEndpoints.templates.seed(input));
  return response.data;
}

export async function listDocuments(
  docType: DocumentType,
  query: WorkbenchQuery = {},
): Promise<PaginationEnvelope<DocumentListItemDto>> {
  return sdkClient.requestPage<DocumentListItemDto>(sdkEndpoints.documents.list(docType, query));
}

export async function getDocumentDetail(
  docType: DocumentType,
  id: BigIntString,
): Promise<DocumentDetailDto> {
  const response = await sdkClient.request<DocumentDetailDto>(sdkEndpoints.documents.detail(docType, id));
  return response.data;
}

export async function submitDocumentCommand(
  docType: DocumentType,
  id: BigIntString,
  action: 'confirm' | 'post' | 'cancel',
  idempotencyKey: string,
): Promise<DocumentCommandAck> {
  const response = await sdkClient.request<DocumentCommandAck>(sdkEndpoints.documents.command(docType, id, action), {
    idempotencyKey,
  });

  return response.data;
}

export async function getEvidenceCollection(
  query: EvidenceQuery,
): Promise<EvidenceCollectionContract> {
  const response = await sdkClient.request<EvidenceCollectionContract>(sdkEndpoints.evidence.collection(query));
  return response.data;
}

export async function createEvidenceUploadIntent(
  payload: EvidenceUploadIntentInput,
): Promise<EvidenceUploadIntent> {
  const response = await sdkClient.request<EvidenceUploadIntent>(sdkEndpoints.evidence.uploadIntent(payload));
  return response.data;
}

export async function attachEvidence(payload: EvidenceAttachInput): Promise<BigIntString> {
  const response = await sdkClient.request<{ linkId: BigIntString }>(sdkEndpoints.evidence.attach(payload));

  return response.data.linkId;
}
