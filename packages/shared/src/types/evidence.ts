/**
 * ADR-006 P1 Contract: Evidence 类型定义
 * 统一 Server/Web/BFF 三端的证据类型
 */

import type { BigIntString } from './api';
import type { EvidenceEntityType } from './domain';

// 绑定层级
export type EvidenceBindingLevel = 'document' | 'line';

// 证据标签
export const EVIDENCE_TAGS = [
  'label',
  'packing_list',
  'damage',
  'contract',
  'invoice',
  'receipt',
  'serial',
  'handover',
  'shelf',
  'product_photo',
  'datasheet',
  'other',
] as const;
export type EvidenceTag = (typeof EVIDENCE_TAGS)[number];

export const EVIDENCE_ASSET_STATUSES = [
  'pending_upload',
  'uploaded',
  'validating',
  'active',
  'rejected',
  'quarantined',
] as const;
export type EvidenceAssetStatus = (typeof EVIDENCE_ASSET_STATUSES)[number];

// 证据链接 DTO
export interface EvidenceLinkDto {
  id: BigIntString;
  evidenceId: BigIntString;
  entityType: EvidenceEntityType;
  entityId: BigIntString;
  bindingLevel: EvidenceBindingLevel;
  lineId?: BigIntString | null;
  tag: string;
  createdAt: string;
}

// 证据链接查询参数
export interface EvidenceLinksQuery {
  entityType: EvidenceEntityType;
  entityId: BigIntString;
  scope?: EvidenceBindingLevel;
  lineId?: BigIntString;
}

// 证据链接创建请求
export interface CreateEvidenceLinkRequest {
  evidenceId: BigIntString;
  entityType: EvidenceEntityType;
  entityId: BigIntString;
  bindingLevel: EvidenceBindingLevel;
  lineId?: BigIntString;
  tag: string;
}

// 证据链接响应
export interface EvidenceLinksResponse {
  data: EvidenceLinkDto[];
  total: number;
}

// 上传意图 DTO
export interface UploadIntentResponse {
  uploadIntentId: BigIntString;
  uploadUrl: string;
  expiresAt: string;
  fields: Record<string, string>;
}

// 上传意图请求
export interface CreateUploadIntentRequest {
  fileName: string;
  contentType: string;
  entityType?: EvidenceEntityType;
}

// 证据集合项（BFF 返回格式）
export interface EvidenceCollectionItem {
  id: BigIntString;
  assetId: BigIntString;
  scope: EvidenceBindingLevel;
  lineRef?: BigIntString;
  tag: string;
  tagLabel: string;
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
  status: EvidenceAssetStatus;
  note?: string;
}

// 证据集合响应（BFF 返回格式）
export interface EvidenceCollectionResponse {
  entityType: EvidenceEntityType;
  entityId: BigIntString;
  scope: EvidenceBindingLevel;
  lineRef?: BigIntString;
  stats: Array<{ key: string; label: string; value: string; tone: string }>;
  tags: Array<{ key: string; label: string; count: number; tone: string }>;
  items: EvidenceCollectionItem[];
}
