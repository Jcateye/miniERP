import { DOCUMENT_STATUSES } from './document';

/**
 * 通用状态常量。
 * 用于主数据、页面提示或基础实体的轻量状态表达。
 */
export const STATUS_VALUES = ['normal', 'warning', 'disabled'] as const;

/**
 * 通用状态类型。
 */
export type Status = (typeof STATUS_VALUES)[number];

/**
 * 订单状态常量。
 * 复用现有单据状态，避免并行开发时出现第二套状态源。
 */
export const ORDER_STATUS_VALUES = DOCUMENT_STATUSES;

/**
 * 订单状态类型。
 */
export type OrderStatus = (typeof ORDER_STATUS_VALUES)[number];

/**
 * ERP 页面 family 常量。
 * family 仅表示骨架约束，不表示具体页面模板。
 */
export const FAMILY_VALUES = ['T1', 'T2', 'T3', 'T4'] as const;

/**
 * ERP 页面 family 类型。
 */
export type Family = (typeof FAMILY_VALUES)[number];
