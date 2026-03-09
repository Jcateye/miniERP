export type ReportsKpiCard = {
  id: string;
  label: string;
  value: string;
  accent?: 'default' | 'warning' | 'success';
};

export type ReportsEntryItem = {
  id: string;
  label: string;
};

export type ReportsEntryGroup = {
  id: string;
  title: string;
  items: readonly ReportsEntryItem[];
  tone?: 'default' | 'inverse';
};

export const REPORTS_PAGE_PRESENTATION = {
  family: 'T1',
  title: '报表中心',
  summary: '数据洞察 · 多维分析 · 自定义报表',
} as const;

export const REPORTS_CENTER_KPIS: readonly ReportsKpiCard[] = [
  { id: 'sku-total', label: 'SKU 总数', value: '1,284' },
  { id: 'stock-total', label: '当前库存总量', value: '45,672' },
  { id: 'purchase-total', label: '本月采购额', value: '¥328,450', accent: 'warning' },
  { id: 'sales-total', label: '本月销售额', value: '¥512,890', accent: 'success' },
];

export const REPORTS_CENTER_ENTRY_GROUPS: readonly ReportsEntryGroup[] = [
  {
    id: 'purchase',
    title: '采购分析',
    items: [
      { id: 'purchase-trend', label: '采购金额趋势' },
      { id: 'supplier-share', label: '供应商份额分布' },
      { id: 'purchase-price', label: '采购价格波动' },
    ],
  },
  {
    id: 'sales',
    title: '销售分析',
    items: [
      { id: 'sales-trend', label: '销售收入趋势' },
      { id: 'customer-rank', label: '客户排行' },
    ],
  },
  {
    id: 'inventory',
    title: '库存分析',
    items: [
      { id: 'turnover', label: '库存周转率' },
      { id: 'slow-moving', label: '呆滞物料分析' },
    ],
  },
  {
    id: 'finance',
    title: '财务报表',
    tone: 'inverse',
    items: [
      { id: 'pnl', label: '利润表' },
      { id: 'balance-sheet', label: '资产负债表' },
    ],
  },
  {
    id: 'quick-links',
    title: '快捷入口',
    items: [
      { id: 'sku-report', label: 'SKU 报表' },
      { id: 'inventory-report', label: '库存报表' },
      { id: 'purchase-report', label: '采购报表' },
      { id: 'sales-report', label: '销售报表' },
      { id: 'quotation-report', label: '报价报表' },
    ],
  },
];
