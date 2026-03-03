import type { ReactNode } from 'react';

import type { BigIntString, DecimalString, DocumentType } from '@minierp/shared';

import type { TemplateTone } from './template-contracts';

export type EvidenceScope = 'document' | 'line';
export type EvidenceEntityType = Lowercase<DocumentType> | 'sku' | 'inventory_ledger' | 'stocktake';
export type EvidenceAssetStatus =
  | 'pending_upload'
  | 'uploaded'
  | 'validating'
  | 'active'
  | 'rejected'
  | 'quarantined';
export type EvidenceTag =
  | 'packing_list'
  | 'label'
  | 'damage'
  | 'serial'
  | 'handover'
  | 'shelf'
  | 'product_photo'
  | 'datasheet'
  | 'other';

export interface EvidenceTagOption {
  key: EvidenceTag | string;
  label: string;
  count?: number;
  tone?: TemplateTone;
  required?: boolean;
}

export interface EvidenceStat {
  key: string;
  label: string;
  value: string;
  tone?: TemplateTone;
}

export interface EvidenceAssetContract {
  id: BigIntString;
  tenantId: BigIntString;
  objectKey: string;
  contentType: string;
  sizeBytes: BigIntString;
  sha256: string;
  status: EvidenceAssetStatus;
  uploadedBy: BigIntString;
  uploadedAt: string;
  thumbnailUrl?: string;
  downloadUrl?: string;
}

export interface EvidenceLinkContract {
  id: BigIntString;
  tenantId: BigIntString;
  assetId: BigIntString;
  entityType: EvidenceEntityType;
  entityId: BigIntString;
  scope: EvidenceScope;
  lineRef?: BigIntString | null;
  tag: EvidenceTag | string;
  createdAt: string;
}

export interface EvidenceItemContract {
  id: BigIntString;
  assetId: BigIntString;
  scope: EvidenceScope;
  lineRef?: BigIntString | null;
  tag: EvidenceTag | string;
  tagLabel: string;
  fileName: string;
  note?: string;
  uploadedAt: string;
  uploadedBy: string;
  status: EvidenceAssetStatus;
  thumbnailUrl?: string;
}

export interface EvidenceCollectionContract {
  entityType: EvidenceEntityType;
  entityId: BigIntString;
  scope: EvidenceScope;
  lineRef?: BigIntString | null;
  stats: EvidenceStat[];
  tags: EvidenceTagOption[];
  items: EvidenceItemContract[];
}

export interface EvidenceUploadIntentInput {
  entityType: EvidenceEntityType;
  entityId: BigIntString;
  scope: EvidenceScope;
  lineRef?: BigIntString | null;
  tag: EvidenceTag | string;
  fileName: string;
  contentType: string;
  sizeBytes: BigIntString;
}

export interface EvidenceUploadIntent {
  assetId: BigIntString;
  uploadUrl: string;
  objectKey: string;
  expiresAt: string;
}

export interface EvidenceAttachInput {
  assetId: BigIntString;
  entityType: EvidenceEntityType;
  entityId: BigIntString;
  scope: EvidenceScope;
  lineRef?: BigIntString | null;
  tag: EvidenceTag | string;
  note?: string;
}

export interface LineEvidenceContext {
  lineId: BigIntString;
  lineNo: number;
  skuCode: string;
  skuName: string;
  expectedQty?: DecimalString;
  actualQty?: DecimalString;
  diffQty?: DecimalString;
  reason?: string;
}

export interface EvidencePanelProps {
  title: string;
  description?: string;
  stats: EvidenceStat[];
  tags: EvidenceTagOption[];
  activeTag?: string;
  items: EvidenceItemContract[];
  uploadSlot?: ReactNode;
  emptySlot?: ReactNode;
  footerSlot?: ReactNode;
}

export interface LineEvidenceDrawerProps {
  open: boolean;
  title: string;
  line: LineEvidenceContext;
  tags: EvidenceTagOption[];
  activeTag?: string;
  items: EvidenceItemContract[];
  uploadSlot?: ReactNode;
  emptySlot?: ReactNode;
  onClose?: () => void;
}
