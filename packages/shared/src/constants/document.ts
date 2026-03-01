// 单据类型名称
export const DOCUMENT_TYPE_NAMES: Record<string, string> = {
  PO: '采购订单',
  SO: '销售订单',
  GRN: '入库单',
  OUT: '出库单',
  ADJ: '调整单',
  PAY: '付款单',
  REC: '收款单',
};

// 单据状态名称
export const DOCUMENT_STATUS_NAMES: Record<string, string> = {
  draft: '草稿',
  pending: '待审批',
  approved: '已审批',
  rejected: '已拒绝',
  completed: '已完成',
  cancelled: '已取消',
};
