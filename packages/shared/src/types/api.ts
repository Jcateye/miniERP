import type { DocumentStatus, DocumentType } from './document';

// 数值语义类型（传输层使用字符串承载高精度数值）
export type DecimalString = string;
export type BigIntString = string;

/**
 * 通用分页参数。
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/**
 * 单个筛选值的基础类型。
 */
export type FilterValue = string | number | boolean | null;

/**
 * 通用筛选参数。
 */
export interface FilterParams {
  search?: string;
  filters?: Record<string, FilterValue | readonly FilterValue[]>;
}

/**
 * 排序方向。
 */
export type SortDirection = 'asc' | 'desc';

/**
 * 通用排序参数。
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: SortDirection;
}

// 错误码分类基线
export type ApiErrorCategory =
  | 'validation'
  | 'auth'
  | 'permission'
  | 'not_found'
  | 'conflict'
  | 'state_transition'
  | 'rate_limit'
  | 'external'
  | 'internal';

export type ApiErrorCode = `${Uppercase<ApiErrorCategory>}_${string}`;

export interface StatusTransitionErrorDetails {
  entity: 'document';
  documentType: DocumentType;
  fromStatus: DocumentStatus;
  toStatus: DocumentStatus;
  allowedFromStatuses: DocumentStatus[];
}

export interface ApiErrorPayload {
  code: ApiErrorCode;
  category: ApiErrorCategory;
  message: string;
  details?: Record<string, unknown>;
  transition?: StatusTransitionErrorDetails;
}

/**
 * 通用 API 成功响应。
 */
export interface ApiResponse<T> {
  data: T;
  message: string;
}

export type ApiEnvelope<T> = ApiResponse<T>;

export interface ApiError {
  error: ApiErrorPayload;
}

// 分页
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type PageResult<T> = PaginatedResponse<T>;

export interface EntityAuditFields {
  tenantId: string;
  companyId?: string | null;
  orgId?: string | null;
  status?: string;
  ext?: Record<string, unknown> | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  deletedAt?: string | null;
  deletedBy?: string | null;
}
