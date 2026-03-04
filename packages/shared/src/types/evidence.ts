/**
 * ADR-006 P1 Contract: Evidence 类型定义
 * 统一 Server/Web/BFF 三端的证据类型
 */

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
  'other',
] as const;
export type EvidenceTag = (typeof EVIDENCE_TAGS)[number];

// 证据链接 DTO
export interface EvidenceLinkDto {
  id: string;
  evidenceId: string;
  entityType: string;
  entityId: string;
  bindingLevel: EvidenceBindingLevel;
  lineId?: string | null;
  tag: string;
  createdAt: string;
}

// 证据链接查询参数
export interface EvidenceLinksQuery {
  entityType: string;
  entityId: string;
  scope?: EvidenceBindingLevel;
  lineId?: string;
}

// 证据链接创建请求
export interface CreateEvidenceLinkRequest {
  evidenceId: string;
  entityType: string;
  entityId: string;
  bindingLevel: EvidenceBindingLevel;
  lineId?: string;
  tag: string;
}

// 证据链接响应
export interface EvidenceLinksResponse {
  data: EvidenceLinkDto[];
  total: number;
}

// 上传意图 DTO
export interface UploadIntentResponse {
  uploadIntentId: string;
  uploadUrl: string;
  expiresAt: string;
  fields: Record<string, string>;
}

// 上传意图请求
export interface CreateUploadIntentRequest {
  fileName: string;
  contentType: string;
  entityType?: string;
}

// 证据集合项（BFF 返回格式）
export interface EvidenceCollectionItem {
  id: string;
  assetId: string;
  scope: EvidenceBindingLevel;
  lineRef?: string;
  tag: string;
  tagLabel: string;
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
  status: string;
  note?: string;
}

// 证据集合响应（BFF 返回格式）
export interface EvidenceCollectionResponse {
  entityType: string;
  entityId: string;
  scope: EvidenceBindingLevel;
  lineRef?: string;
  stats: Array<{ key: string; label: string; value: string; tone: string }>;
  tags: Array<{ key: string; label: string; count: number; tone: string }>;
  items: EvidenceCollectionItem[];
}
