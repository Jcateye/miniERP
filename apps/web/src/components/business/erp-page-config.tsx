import type {
  DetailTemplateContract,
  EvidenceCollectionContract,
  LineEvidenceContext,
  OverviewTemplateContract,
  TemplateAction,
  TemplateFieldGroup,
  TemplateMetric,
  TemplateTag,
  TemplateTone,
  WizardTemplateContract,
  WorkbenchTemplateContract,
} from '@/contracts';
import type { EvidenceEntityType } from '@/contracts/evidence-contracts';
import type { BigIntString, DocumentType } from '@minierp/shared';

export interface OverviewTodoItem {
  title: string;
  description: string;
  tag: string;
  tone?: TemplateTone;
  href?: string;
}

export interface TimelineEntry {
  action: string;
  time: string;
  tone?: TemplateTone;
}

export interface OverviewAssemblyConfig {
  contract: OverviewTemplateContract;
  searchPlaceholder?: string;
  todos: OverviewTodoItem[];
  quickActions: TemplateAction[];
  timeline: TimelineEntry[];
}

export interface WorkbenchColumn {
  key: string;
  label: string;
  type?: 'text' | 'badge' | 'link';
  toneMap?: Record<string, TemplateTone>;
}

export interface AssemblyRow {
  id: string;
  href?: string;
  [key: string]: string | undefined;
}

export interface WorkbenchAssemblyConfig {
  contract: WorkbenchTemplateContract;
  docType?: DocumentType;
  rows: AssemblyRow[];
  columns: WorkbenchColumn[];
  drawerFields: Array<{ label: string; key: string }>;
  bulkHint: string;
}

export interface DetailRecord {
  id: BigIntString;
  title: string;
  subtitle: string;
  primaryGroups: TemplateFieldGroup[];
  secondaryGroups: TemplateFieldGroup[];
  tertiaryNotes: string[];
  rows: AssemblyRow[];
  auditTrail: string[];
  documentEvidence: EvidenceCollectionContract;
  lineEvidenceContexts: LineEvidenceContext[];
  lineEvidence: Record<string, EvidenceCollectionContract>;
}

export interface DetailAssemblyConfig {
  contract: DetailTemplateContract;
  docType?: DocumentType;
  entityType: EvidenceEntityType;
  record: DetailRecord;
}

export interface WizardAssemblyConfig {
  contract: WizardTemplateContract;
  entityType: EvidenceEntityType;
  headerGroups: TemplateFieldGroup[];
  rows: AssemblyRow[];
  alerts: string[];
  summaryNotes: string[];
  documentEvidence: EvidenceCollectionContract;
  lineEvidenceContexts: LineEvidenceContext[];
  lineEvidence: Record<string, EvidenceCollectionContract>;
}

function createTag(label: string, tone: TemplateTone = 'neutral'): TemplateTag {
  return { key: label.toLowerCase(), label, tone };
}

function createOverviewContract(
  route: string,
  title: string,
  summary: string,
  metrics: TemplateMetric[],
  primaryAction: TemplateAction,
  secondaryActions: TemplateAction[] = [],
  statusTag?: TemplateTag,
): OverviewTemplateContract {
  return {
    family: 'T1',
    route,
    title,
    summary,
    readiness: ['DFP-READY', 'FE-E-READY', 'BE-READY', 'FE-F-READY'],
    header: {
      title,
      description: summary,
      statusTag,
      primaryAction,
      secondaryActions,
    },
    metrics,
    navigationLabel: title,
    slots: {
      search: { key: 'search', title: '搜索', description: '跨模块定位单据、SKU 与责任人' },
      todo: { key: 'todo', title: '待办', description: '按状态与异常优先排序' },
      quickActions: { key: 'quick-actions', title: '快捷操作', description: '常用入口与模板' },
      timeline: { key: 'timeline', title: '最近动作', description: '关键业务留痕' },
    },
  };
}

function createWorkbenchContract(
  route: string,
  title: string,
  summary: string,
  statusTag: TemplateTag,
  primaryAction: TemplateAction,
  secondaryActions: TemplateAction[] = [],
): WorkbenchTemplateContract {
  return {
    family: 'T2',
    route,
    title,
    summary,
    readiness: ['DFP-READY', 'FE-E-READY', 'BE-READY', 'FE-F-READY'],
    header: {
      title,
      description: summary,
      statusTag,
      primaryAction,
      secondaryActions,
    },
    filters: [
      { key: 'keyword', label: '关键词', kind: 'search', placeholder: '搜索单号、SKU、责任人或仓库' },
      {
        key: 'status',
        label: '状态',
        kind: 'multi-select',
        options: [
          { label: '草稿', value: 'draft' },
          { label: '处理中', value: 'pending' },
          { label: '已完成', value: 'completed' },
          { label: '已取消', value: 'cancelled' },
        ],
      },
      { key: 'dateRange', label: '单据日期', kind: 'date-range' },
    ],
    slots: {
      toolbar: { key: 'toolbar', title: '工具条', description: '搜索、过滤、批量动作' },
      results: { key: 'results', title: '结果', description: '列表与主表格' },
      detailDrawer: { key: 'detail', title: '详情抽屉', description: '选中行摘要与动作' },
      bulkBar: { key: 'bulk', title: '批量条', description: '多选后的批量处理入口' },
    },
  };
}

function createDetailContract(
  route: string,
  title: string,
  summary: string,
  statusTag: TemplateTag,
  primaryAction: TemplateAction,
  secondaryActions: TemplateAction[] = [],
): DetailTemplateContract {
  return {
    family: 'T3',
    route,
    title,
    summary,
    readiness: ['DFP-READY', 'FE-E-READY', 'BE-READY', 'FE-F-READY'],
    header: {
      title,
      description: summary,
      statusTag,
      primaryAction,
      secondaryActions,
    },
    sections: {
      primary: { key: 'primary', title: '基本信息' },
      secondary: { key: 'secondary', title: '明细与风险' },
      tertiary: { key: 'tertiary', title: '侧栏' },
    },
    tabs: [
      { key: 'lines', label: '明细' },
      { key: 'evidence', label: '凭证' },
      { key: 'audit', label: '操作日志' },
    ],
    slots: {
      tabContent: { key: 'content', title: 'Tab 内容', description: '明细、凭证、审计' },
      quickActions: { key: 'quick', title: '快捷操作', description: '复制、关联、作废' },
    },
  };
}

function createWizardContract(
  route: string,
  title: string,
  summary: string,
  statusTag: TemplateTag,
  primaryAction: TemplateAction,
  secondaryActions: TemplateAction[] = [],
): WizardTemplateContract {
  return {
    family: 'T4',
    route,
    title,
    summary,
    readiness: ['DFP-READY', 'FE-E-READY', 'BE-READY', 'FE-F-READY'],
    header: {
      title,
      description: summary,
      statusTag,
      primaryAction,
      secondaryActions,
    },
    steps: [
      { key: 'base', title: '基础信息', description: '仓库、来源单与责任人', status: 'completed' },
      { key: 'lines', title: '录入明细', description: 'SKU 行、数量与差异', status: 'current' },
      { key: 'validate', title: '校验差异', description: '异常与行级凭证', status: 'upcoming' },
      { key: 'post', title: '过账确认', description: '最终确认与审计锚点', status: 'upcoming' },
    ],
    summaryMetrics: [
      { key: 'lineCount', label: 'SKU 行数', value: '4', hint: '覆盖主链路与差异样本', tone: 'info' },
      { key: 'evidence', label: '凭证要求', value: '双层', hint: '单据级 + 行级', tone: 'warning' },
      { key: 'gate', label: '切换状态', value: 'HTTP', hint: '通过 BFF 直连真实接口', tone: 'success' },
    ],
    footerActions: [
      { key: 'save', label: '保存草稿', tone: 'secondary' },
      { key: 'post', label: '校验并过账', tone: 'primary' },
    ],
    slots: {
      editor: { key: 'editor', title: '编辑区', description: '表单、表格和差异处理' },
      summary: { key: 'summary', title: '汇总区', description: '数量、风险、凭证' },
    },
  };
}

function evidenceCollection(
  entityType: EvidenceEntityType,
  entityId: BigIntString,
  scope: 'document' | 'line',
  tagLabel: string,
  lineRef?: BigIntString,
): EvidenceCollectionContract {
  return {
    entityType,
    entityId,
    scope,
    lineRef,
    stats: [
      { key: 'total', label: '文件数', value: scope === 'document' ? '3' : '2', tone: 'info' },
      { key: 'required', label: '必传项', value: '1', tone: 'warning' },
      { key: 'ready', label: '就绪度', value: '100%', tone: 'success' },
    ],
    tags: [
      { key: 'label', label: '标签', count: 1, tone: 'info' },
      { key: 'packing_list', label: '清单', count: 1, tone: 'warning' },
      { key: 'damage', label: tagLabel, count: 1, tone: 'danger' },
    ],
    items: [
      {
        id: `${entityId}-${scope}-1`,
        assetId: `${entityId}01`,
        scope,
        lineRef,
        tag: 'label',
        tagLabel: '箱标',
        fileName: `${entityType}-${entityId}-label.jpg`,
        uploadedAt: '2026-03-03 09:20',
        uploadedBy: 'warehouse.operator',
        status: 'active',
      },
      {
        id: `${entityId}-${scope}-2`,
        assetId: `${entityId}02`,
        scope,
        lineRef,
        tag: 'packing_list',
        tagLabel: tagLabel,
        fileName: `${entityType}-${entityId}-${scope}-proof.pdf`,
        uploadedAt: '2026-03-03 09:42',
        uploadedBy: 'warehouse.operator',
        status: 'active',
        note: scope === 'document' ? '单据级凭证用于对账与签收追溯。' : '差异行要求补充现场照片与原因说明。',
      },
    ],
  };
}

const skuRows: AssemblyRow[] = [
  { id: '1001', href: '/skus/1001', code: 'CAB-HDMI-2M', name: 'HDMI 2m 高速线', category: '线材', stock: '562', minStock: '80', status: 'active' },
  { id: '1002', href: '/skus/1002', code: 'ADP-USB-C-DP', name: 'USB-C 转 DP 适配器', category: '适配器', stock: '34', minStock: '40', status: 'risk' },
  { id: '1003', href: '/skus/1003', code: 'LAN-CAT6-5M', name: 'CAT6 网线 5m', category: '线材', stock: '210', minStock: '120', status: 'active' },
];

const poRows: AssemblyRow[] = [
  { id: '2001', href: '/purchasing/po/2001', docNo: 'DOC-PO-20260303-001', vendor: 'Acme Supplies', warehouse: 'SZ-DC-01', qty: '280', amount: '128,800', status: 'pending' },
  { id: '2002', href: '/purchasing/po/2002', docNo: 'DOC-PO-20260303-002', vendor: 'Nord Hub', warehouse: 'HK-TRANSIT', qty: '96', amount: '41,200', status: 'approved' },
  { id: '2003', href: '/purchasing/po/2003', docNo: 'DOC-PO-20260302-009', vendor: 'Cable Source', warehouse: 'SZ-DC-02', qty: '420', amount: '186,600', status: 'draft' },
];

const grnRows: AssemblyRow[] = [
  { id: '3001', href: '/purchasing/grn/3001', docNo: 'DOC-GRN-20260303-003', sourceNo: 'DOC-PO-20260303-001', warehouse: 'SZ-DC-01', qty: '278', amount: '127,960', status: 'pending' },
  { id: '3002', href: '/purchasing/grn/3002', docNo: 'DOC-GRN-20260303-004', sourceNo: 'DOC-PO-20260303-002', warehouse: 'HK-TRANSIT', qty: '96', amount: '41,200', status: 'completed' },
  { id: '3003', href: '/purchasing/grn/3003', docNo: 'DOC-GRN-20260302-007', sourceNo: 'DOC-PO-20260302-009', warehouse: 'SZ-DC-02', qty: '416', amount: '184,830', status: 'draft' },
];

const soRows: AssemblyRow[] = [
  { id: '4001', href: '/sales/so/4001', docNo: 'DOC-SO-20260303-005', customer: 'Metro Retail', warehouse: 'SZ-DC-01', qty: '160', amount: '152,400', status: 'pending' },
  { id: '4002', href: '/sales/so/4002', docNo: 'DOC-SO-20260303-006', customer: 'Nord Retail', warehouse: 'HK-TRANSIT', qty: '54', amount: '68,900', status: 'approved' },
  { id: '4003', href: '/sales/so/4003', docNo: 'DOC-SO-20260302-011', customer: 'Harbor Tech', warehouse: 'SZ-DC-02', qty: '88', amount: '91,250', status: 'draft' },
];

const outRows: AssemblyRow[] = [
  { id: '5001', href: '/sales/out/5001', docNo: 'DOC-OUT-20260303-002', sourceNo: 'DOC-SO-20260303-005', warehouse: 'SZ-DC-01', qty: '160', amount: '152,400', status: 'picking' },
  { id: '5002', href: '/sales/out/5002', docNo: 'DOC-OUT-20260303-003', sourceNo: 'DOC-SO-20260303-006', warehouse: 'HK-TRANSIT', qty: '54', amount: '68,900', status: 'posted' },
  { id: '5003', href: '/sales/out/5003', docNo: 'DOC-OUT-20260302-006', sourceNo: 'DOC-SO-20260302-011', warehouse: 'SZ-DC-02', qty: '86', amount: '88,740', status: 'draft' },
];

const quotationRows: AssemblyRow[] = [
  { id: '7001', href: '/sales/quotations/7001', docNo: 'DOC-SO-20260303-101', customer: 'Metro Retail', warehouse: 'SZ-DC-01', qty: '100', amount: '49,900', status: 'draft' },
  { id: '7002', href: '/sales/quotations/7002', docNo: 'DOC-SO-20260303-102', customer: 'Northwind', warehouse: 'HK-TRANSIT', qty: '42', amount: '28,560', status: 'confirmed' },
  { id: '7003', href: '/sales/quotations/7003', docNo: 'DOC-SO-20260303-103', customer: 'Harbor Tech', warehouse: 'SZ-DC-02', qty: '88', amount: '91,250', status: 'cancelled' },
];

const stocktakeRows: AssemblyRow[] = [
  { id: '6001', href: '/stocktake/6001', docNo: 'DOC-ADJ-20260303-001', warehouse: 'SZ-DC-01', counted: '62', variance: '-4', owner: 'Cycle Count Team', status: 'reviewed' },
  { id: '6002', href: '/stocktake/6002', docNo: 'DOC-ADJ-20260303-002', warehouse: 'HK-TRANSIT', counted: '31', variance: '+2', owner: 'Transit Team', status: 'counting' },
  { id: '6003', href: '/stocktake/6003', docNo: 'DOC-ADJ-20260302-004', warehouse: 'SZ-DC-02', counted: '54', variance: '0', owner: 'Warehouse B', status: 'posted' },
];

const lineEvidenceContexts: LineEvidenceContext[] = [
  { lineId: '1', lineNo: 1, skuCode: 'CAB-HDMI-2M', skuName: 'HDMI 2m 高速线', expectedQty: '120', actualQty: '118', diffQty: '-2', reason: '外箱破损，已拍照记录。' },
  { lineId: '2', lineNo: 2, skuCode: 'ADP-USB-C-DP', skuName: 'USB-C 转 DP 适配器', expectedQty: '80', actualQty: '80', diffQty: '0', reason: '数量一致，保留标签与清单。' },
];

function createDetailRecord(id: BigIntString, title: string, docNo: string, ownerLabel: string, entityType: EvidenceEntityType): DetailRecord {
  return {
    id,
    title,
    subtitle: docNo,
    primaryGroups: [
      {
        key: 'base',
        title: '基础信息',
        fields: [
          { key: 'docNo', label: '单据号', value: docNo },
          { key: 'warehouse', label: '仓库', value: 'SZ-DC-01' },
          { key: 'owner', label: ownerLabel, value: '王敏' },
          { key: 'updatedAt', label: '最近更新', value: '2026-03-03 10:08' },
        ],
      },
    ],
    secondaryGroups: [
      {
        key: 'risk',
        title: '异常摘要',
        description: '按差异、库存影响和证据完整度聚合。',
        fields: [
          { key: 'difference', label: '差异行', value: '1 行', tone: 'risk' },
          { key: 'evidence', label: '凭证完整度', value: '100%', tone: 'highlight' },
          { key: 'audit', label: '审计状态', value: '已记录', tone: 'highlight' },
        ],
      },
    ],
    tertiaryNotes: [
      '单据级凭证已绑定签收单与箱标。',
      '差异 SKU 行要求补充 damage / label 凭证。',
      '所有状态流转均保留审计锚点与责任人。'
    ],
    rows: [
      { id: '1', sku: 'CAB-HDMI-2M', expected: '120', actual: '118', diff: '-2', status: 'difference' },
      { id: '2', sku: 'ADP-USB-C-DP', expected: '80', actual: '80', diff: '0', status: 'ok' },
    ],
    auditTrail: [
      '2026-03-03 10:08 王敏 执行差异校验',
      '2026-03-03 09:42 李辰 上传单据级清单凭证',
      '2026-03-03 09:20 仓库系统创建草稿',
    ],
    documentEvidence: evidenceCollection(entityType, id, 'document', '差异凭证'),
    lineEvidenceContexts,
    lineEvidence: {
      '1': evidenceCollection(entityType, id, 'line', '破损照片', '1'),
      '2': evidenceCollection(entityType, id, 'line', '标签校验', '2'),
    },
  };
}

export const dashboardOverviewConfig: OverviewAssemblyConfig = {
  contract: createOverviewContract(
    '/',
    '运营工作台',
    '跨采购、销售、库存与盘点的统一指挥页，聚合待办、异常与快捷入口。',
    [
      { key: 'lowStock', label: '低库存 SKU', value: '14', hint: '需补货', tone: 'warning' },
      { key: 'grnPending', label: '待过账 GRN', value: '3', hint: '含 1 个差异单', tone: 'info' },
      { key: 'outPending', label: '待拣货 OUT', value: '2', hint: 'SO 已确认', tone: 'success' },
      { key: 'stocktake', label: '盘点异常', value: '1', hint: '待复核', tone: 'danger' },
    ],
    { key: 'new-grn', label: '新建 GRN', href: '/purchasing/grn/new', tone: 'primary' },
    [
      { key: 'new-out', label: '发起 OUT', href: '/sales/out/new', tone: 'secondary' },
      { key: 'new-stocktake', label: '发起盘点', href: '/stocktake/new', tone: 'ghost' },
    ],
    createTag('FE-F-READY', 'success'),
  ),
  searchPlaceholder: '搜索 SKU、单号、供应商、客户或责任人',
  todos: [
    { title: 'GRN-003 差异待确认', description: 'HDMI 2m 实收少 2 件，需补差异照片。', tag: 'GRN', tone: 'warning', href: '/purchasing/grn/3001' },
    { title: 'OUT-002 待出库', description: 'Metro Retail 订单已审批，等待拣货与交接签收。', tag: 'OUT', tone: 'info', href: '/sales/out/5001' },
    { title: 'Stocktake-001 待复核', description: '盘点出现 -4 差异，待仓库主管确认调整。', tag: '盘点', tone: 'danger', href: '/stocktake/6001' },
  ],
  quickActions: [
    { key: 'sku', label: 'SKU 工作台', href: '/skus', tone: 'secondary' },
    { key: 'po', label: '采购 PO', href: '/purchasing/po', tone: 'secondary' },
    { key: 'so', label: '销售 SO', href: '/sales/so', tone: 'secondary' },
    { key: 'settings', label: '系统设置', href: '/settings', tone: 'ghost' },
  ],
  timeline: [
    { action: 'GRN 差异校验完成，等待主管确认', time: '10:08', tone: 'warning' },
    { action: 'OUT 交接凭证已补传', time: '09:44', tone: 'info' },
    { action: '低库存 SKU 已生成补货建议', time: '09:15', tone: 'success' },
  ],
};

export const skuOverviewConfig: OverviewAssemblyConfig = {
  contract: createOverviewContract(
    '/skus/overview',
    'SKU 概览',
    '聚焦 SKU 生命周期、库存健康与映射完整度。',
    [
      { key: 'active', label: '活跃 SKU', value: '362', hint: '可销售 / 可采购', tone: 'success' },
      { key: 'mapping', label: '映射缺口', value: '9', hint: '外部料号待补齐', tone: 'warning' },
      { key: 'photo', label: '产品照完备率', value: '92%', hint: 'SKU 详情支持证据', tone: 'info' },
    ],
    { key: 'new-sku', label: '新建 SKU', href: '/skus/new', tone: 'primary' },
    [{ key: 'list', label: '打开工作台', href: '/skus', tone: 'secondary' }],
    createTag('主数据稳定', 'success'),
  ),
  searchPlaceholder: '搜索 SKU 编码、名称、规格或外部料号',
  todos: [
    { title: 'USB-C 转 DP 安全库存不足', description: '当前库存 34，低于最低库存 40。', tag: '库存', tone: 'warning', href: '/skus/1002' },
    { title: '新 SKU 待补产品照', description: '建议先上传产品图与规格书。', tag: '凭证', tone: 'info', href: '/skus/1001' },
  ],
  quickActions: [
    { key: 'workbench', label: 'SKU 工作台', href: '/skus', tone: 'secondary' },
    { key: 'mappings', label: '设置主数据', href: '/settings/master-data', tone: 'ghost' },
  ],
  timeline: [
    { action: 'CAB-HDMI-2M 更新最低库存为 80', time: '昨天 16:20', tone: 'success' },
    { action: 'ADP-USB-C-DP 补充规格书', time: '昨天 11:05', tone: 'info' },
  ],
};

export const purchasingOverviewConfig: OverviewAssemblyConfig = {
  contract: createOverviewContract(
    '/purchasing/overview',
    '采购概览',
    '关注 PO -> GRN 主链路、差异与供应商履约。',
    [
      { key: 'po', label: '待确认 PO', value: '2', hint: '含 1 个高金额单', tone: 'info' },
      { key: 'grn', label: '差异 GRN', value: '1', hint: '需补行级证据', tone: 'warning' },
      { key: 'vendor', label: '准时率', value: '96%', hint: '最近 7 天', tone: 'success' },
    ],
    { key: 'new-po', label: '新建 PO', href: '/purchasing/po/new', tone: 'primary' },
    [{ key: 'grn', label: '录入 GRN', href: '/purchasing/grn/new', tone: 'secondary' }],
    createTag('PO → GRN', 'success'),
  ),
  searchPlaceholder: '搜索 PO / GRN、供应商或仓库',
  todos: [
    { title: 'PO-001 待审批', description: 'Acme Supplies 采购单待采购经理确认。', tag: 'PO', tone: 'info', href: '/purchasing/po/2001' },
    { title: 'GRN-003 差异待补证据', description: '实收少 2 件，需上传现场照片。', tag: 'GRN', tone: 'warning', href: '/purchasing/grn/3001' },
  ],
  quickActions: [
    { key: 'po', label: 'PO 工作台', href: '/purchasing/po', tone: 'secondary' },
    { key: 'grn', label: 'GRN 工作台', href: '/purchasing/grn', tone: 'secondary' },
  ],
  timeline: [
    { action: '供应商 Acme Supplies 确认送货窗口', time: '今天 09:20', tone: 'success' },
    { action: 'GRN-003 上传清单凭证', time: '今天 09:42', tone: 'info' },
  ],
};

export const salesOverviewConfig: OverviewAssemblyConfig = {
  contract: createOverviewContract(
    '/sales/overview',
    '销售与出库概览',
    '关注 SO -> OUT 主链路、库存占用与交接凭证。',
    [
      { key: 'so', label: '待确认 SO', value: '2', hint: '高优客户订单', tone: 'info' },
      { key: 'quo', label: '待确认报价', value: '2', hint: '可一键转 SO', tone: 'warning' },
      { key: 'out', label: '待拣货 OUT', value: '1', hint: '需补交接签收', tone: 'warning' },
      { key: 'fillRate', label: '满足率', value: '98%', hint: '最近 7 天', tone: 'success' },
    ],
    { key: 'new-so', label: '新建 SO', href: '/sales/so/new', tone: 'primary' },
    [{ key: 'new-out', label: '发起 OUT', href: '/sales/out/new', tone: 'secondary' }],
    createTag('SO → OUT', 'success'),
  ),
  searchPlaceholder: '搜索 SO / OUT、客户或仓库',
  todos: [
    { title: 'OUT-002 待交接签收', description: 'Metro Retail 出库待上传 handover 凭证。', tag: 'OUT', tone: 'warning', href: '/sales/out/5001' },
    { title: 'SO-005 待销售确认', description: '客户请求提前发货，需检查库存占用。', tag: 'SO', tone: 'info', href: '/sales/so/4001' },
  ],
  quickActions: [
    { key: 'quote', label: '报价工作台', href: '/sales/quotations', tone: 'secondary' },
    { key: 'so', label: 'SO 工作台', href: '/sales/so', tone: 'secondary' },
    { key: 'out', label: 'OUT 工作台', href: '/sales/out', tone: 'secondary' },
  ],
  timeline: [
    { action: 'OUT-002 已完成拣货', time: '今天 10:12', tone: 'success' },
    { action: 'SO-006 审批通过，自动生成 OUT 草稿', time: '今天 08:58', tone: 'info' },
  ],
};

export const settingsOverviewConfig: OverviewAssemblyConfig = {
  contract: createOverviewContract(
    '/settings',
    '设置中心',
    '维护主数据、角色权限、系统参数与集成开关。',
    [
      { key: 'master', label: '主数据变更', value: '6', hint: '今日待发布', tone: 'info' },
      { key: 'role', label: '权限变更', value: '2', hint: '需审计确认', tone: 'warning' },
      { key: 'health', label: '接口健康', value: '正常', hint: 'BFF -> API', tone: 'success' },
    ],
    { key: 'master-data', label: '主数据配置', href: '/settings/master-data', tone: 'primary' },
    [{ key: 'system', label: '系统配置', href: '/settings/system', tone: 'secondary' }],
    createTag('FE-READY Gate', 'success'),
  ),
  searchPlaceholder: '搜索配置项、角色、租户或系统参数',
  todos: [
    { title: '权限策略待复核', description: 'evidence 相关权限新增 read/create 范围。', tag: 'IAM', tone: 'warning', href: '/settings/system' },
    { title: '仓库主数据待发布', description: '新增 HK-TRANSIT 仓库可用出库范围。', tag: '主数据', tone: 'info', href: '/settings/master-data' },
  ],
  quickActions: [
    { key: 'master', label: '主数据配置', href: '/settings/master-data', tone: 'secondary' },
    { key: 'system', label: '系统参数', href: '/settings/system', tone: 'secondary' },
  ],
  timeline: [
    { action: 'BFF 传输层切换到 HTTP 优先模式', time: '今天 10:30', tone: 'success' },
    { action: 'ESLint Next flat config 通过根目录执行', time: '今天 10:42', tone: 'info' },
  ],
};

export const skuWorkbenchConfig: WorkbenchAssemblyConfig = {
  contract: createWorkbenchContract('/skus', 'SKU 工作台', 'SKU 主数据、库存阈值与主图凭证统一工作台。', createTag('SKU Master', 'info'), { key: 'new-sku', label: '新建 SKU', href: '/skus/new', tone: 'primary' }),
  rows: skuRows,
  columns: [
    { key: 'code', label: 'SKU 编码', type: 'link' },
    { key: 'name', label: '名称' },
    { key: 'category', label: '分类' },
    { key: 'stock', label: '库存' },
    { key: 'minStock', label: '最低库存' },
    { key: 'status', label: '状态', type: 'badge', toneMap: { active: 'success', risk: 'warning' } },
  ],
  drawerFields: [
    { label: '主图与规格书', key: 'name' },
    { label: '当前库存', key: 'stock' },
    { label: '安全库存', key: 'minStock' },
  ],
  bulkHint: '支持批量启停、批量补证据和导出库存阈值。'
};

export const poWorkbenchConfig: WorkbenchAssemblyConfig = {
  contract: createWorkbenchContract('/purchasing/po', 'PO 工作台', '采购订单查询、审批与后续 GRN 关联入口。', createTag('PO Ready', 'info'), { key: 'new-po', label: '新建 PO', href: '/purchasing/po/new', tone: 'primary' }, [{ key: 'overview', label: '采购概览', href: '/purchasing/overview', tone: 'secondary' }]),
  docType: 'PO',
  rows: poRows,
  columns: [
    { key: 'docNo', label: 'PO 单号', type: 'link' },
    { key: 'vendor', label: '供应商' },
    { key: 'warehouse', label: '仓库' },
    { key: 'qty', label: '数量' },
    { key: 'amount', label: '金额' },
    { key: 'status', label: '状态', type: 'badge', toneMap: { pending: 'info', approved: 'success', draft: 'warning' } },
  ],
  drawerFields: [
    { label: '供应商', key: 'vendor' },
    { label: '目的仓', key: 'warehouse' },
    { label: '总金额', key: 'amount' },
  ],
  bulkHint: '支持批量催单、导出供应商对账单和生成到货计划。'
};

export const grnWorkbenchConfig: WorkbenchAssemblyConfig = {
  contract: createWorkbenchContract('/purchasing/grn', 'GRN 工作台', '入库录入、差异处理与双层凭证追溯入口。', createTag('Evidence Enabled', 'warning'), { key: 'new-grn', label: '新建 GRN', href: '/purchasing/grn/new', tone: 'primary' }, [{ key: 'overview', label: '采购概览', href: '/purchasing/overview', tone: 'secondary' }]),
  docType: 'GRN',
  rows: grnRows,
  columns: [
    { key: 'docNo', label: 'GRN 单号', type: 'link' },
    { key: 'sourceNo', label: '来源 PO' },
    { key: 'warehouse', label: '仓库' },
    { key: 'qty', label: '实收数' },
    { key: 'amount', label: '金额' },
    { key: 'status', label: '状态', type: 'badge', toneMap: { pending: 'warning', completed: 'success', draft: 'info' } },
  ],
  drawerFields: [
    { label: '来源 PO', key: 'sourceNo' },
    { label: '仓库', key: 'warehouse' },
    { label: '凭证要求', key: 'status' },
  ],
  bulkHint: '支持批量校验差异、导出收货凭证和发起过账。'
};

export const soWorkbenchConfig: WorkbenchAssemblyConfig = {
  contract: createWorkbenchContract('/sales/so', 'SO 工作台', '销售订单确认、库存占用与 OUT 联动入口。', createTag('SO Queue', 'info'), { key: 'new-so', label: '新建 SO', href: '/sales/so/new', tone: 'primary' }, [{ key: 'overview', label: '销售概览', href: '/sales/overview', tone: 'secondary' }]),
  docType: 'SO',
  rows: soRows,
  columns: [
    { key: 'docNo', label: 'SO 单号', type: 'link' },
    { key: 'customer', label: '客户' },
    { key: 'warehouse', label: '仓库' },
    { key: 'qty', label: '数量' },
    { key: 'amount', label: '金额' },
    { key: 'status', label: '状态', type: 'badge', toneMap: { pending: 'info', approved: 'success', draft: 'warning' } },
  ],
  drawerFields: [
    { label: '客户', key: 'customer' },
    { label: '出库仓', key: 'warehouse' },
    { label: '金额', key: 'amount' },
  ],
  bulkHint: '支持批量确认、批量释放库存和生成出库单。'
};

export const quotationWorkbenchConfig: WorkbenchAssemblyConfig = {
  contract: createWorkbenchContract('/sales/quotations', '报价工作台', '报价确认、客户沟通与转 SO 入口。', createTag('Quotation Queue', 'warning'), { key: 'new-quotation', label: '新建报价', href: '/sales/quotations/new', tone: 'primary' }, [{ key: 'overview', label: '销售概览', href: '/sales/overview', tone: 'secondary' }]),
  docType: 'SO',
  rows: quotationRows,
  columns: [
    { key: 'docNo', label: '报价单号', type: 'link' },
    { key: 'customer', label: '客户' },
    { key: 'warehouse', label: '仓库' },
    { key: 'qty', label: '数量' },
    { key: 'amount', label: '金额' },
    { key: 'status', label: '状态', type: 'badge', toneMap: { draft: 'warning', confirmed: 'success', cancelled: 'danger' } },
  ],
  drawerFields: [
    { label: '客户', key: 'customer' },
    { label: '发货仓', key: 'warehouse' },
    { label: '报价金额', key: 'amount' },
  ],
  bulkHint: '支持批量确认报价、导出 PDF 和一键转 SO。'
};

export const outWorkbenchConfig: WorkbenchAssemblyConfig = {
  contract: createWorkbenchContract('/sales/out', 'OUT 工作台', '出库拣货、交接签收与发运证据追溯入口。', createTag('Handover Required', 'warning'), { key: 'new-out', label: '新建 OUT', href: '/sales/out/new', tone: 'primary' }, [{ key: 'overview', label: '销售概览', href: '/sales/overview', tone: 'secondary' }]),
  docType: 'OUT',
  rows: outRows,
  columns: [
    { key: 'docNo', label: 'OUT 单号', type: 'link' },
    { key: 'sourceNo', label: '来源 SO' },
    { key: 'warehouse', label: '仓库' },
    { key: 'qty', label: '数量' },
    { key: 'amount', label: '金额' },
    { key: 'status', label: '状态', type: 'badge', toneMap: { picking: 'warning', posted: 'success', draft: 'info' } },
  ],
  drawerFields: [
    { label: '来源 SO', key: 'sourceNo' },
    { label: '仓库', key: 'warehouse' },
    { label: '交接状态', key: 'status' },
  ],
  bulkHint: '支持批量拣货、打印标签和补传交接凭证。'
};

export const inventoryWorkbenchConfig: WorkbenchAssemblyConfig = {
  contract: createWorkbenchContract('/inventory', '库存查询', '库存余额、可用量与调拨优先级工作台。', createTag('Inventory View', 'success'), { key: 'reorder', label: '补货建议', href: '/inventory/reorder', tone: 'primary' }, [{ key: 'ledger', label: '库存流水', href: '/inventory/ledger', tone: 'secondary' }]),
  rows: [
    { id: 'i1', sku: 'CAB-HDMI-2M', warehouse: 'SZ-DC-01', onHand: '562', available: '540', reserved: '22', status: 'healthy' },
    { id: 'i2', sku: 'ADP-USB-C-DP', warehouse: 'SZ-DC-01', onHand: '34', available: '10', reserved: '24', status: 'risk' },
    { id: 'i3', sku: 'LAN-CAT6-5M', warehouse: 'HK-TRANSIT', onHand: '210', available: '198', reserved: '12', status: 'healthy' },
  ],
  columns: [
    { key: 'sku', label: 'SKU' },
    { key: 'warehouse', label: '仓库' },
    { key: 'onHand', label: '现存' },
    { key: 'available', label: '可用' },
    { key: 'reserved', label: '占用' },
    { key: 'status', label: '状态', type: 'badge', toneMap: { healthy: 'success', risk: 'warning' } },
  ],
  drawerFields: [
    { label: 'SKU', key: 'sku' },
    { label: '仓库', key: 'warehouse' },
    { label: '可用量', key: 'available' },
  ],
  bulkHint: '支持导出库存快照、批量生成调拨建议与补货任务。'
};

export const inventoryLedgerConfig: WorkbenchAssemblyConfig = {
  contract: createWorkbenchContract('/inventory/ledger', '库存流水审计', '聚合 GRN / OUT / Stocktake 对库存的影响。', createTag('Audit Trail', 'success'), { key: 'stocktake', label: '发起盘点', href: '/stocktake/new', tone: 'primary' }),
  rows: [
    { id: 'l1', docNo: 'DOC-GRN-20260303-003', sku: 'CAB-HDMI-2M', delta: '+118', balance: '562', postedAt: '10:16', status: 'posted' },
    { id: 'l2', docNo: 'DOC-OUT-20260303-002', sku: 'ADP-USB-C-DP', delta: '-24', balance: '34', postedAt: '09:48', status: 'posted' },
    { id: 'l3', docNo: 'DOC-ADJ-20260303-001', sku: 'CAB-HDMI-2M', delta: '-4', balance: '558', postedAt: '08:32', status: 'reviewed' },
  ],
  columns: [
    { key: 'docNo', label: '来源单号' },
    { key: 'sku', label: 'SKU' },
    { key: 'delta', label: '变更量' },
    { key: 'balance', label: '结余' },
    { key: 'postedAt', label: '过账时间' },
    { key: 'status', label: '状态', type: 'badge', toneMap: { posted: 'success', reviewed: 'warning' } },
  ],
  drawerFields: [
    { label: '来源单号', key: 'docNo' },
    { label: 'SKU', key: 'sku' },
    { label: '变更量', key: 'delta' },
  ],
  bulkHint: '支持按来源单据导出审计流水。'
};

export const inventoryReorderConfig: WorkbenchAssemblyConfig = {
  contract: createWorkbenchContract('/inventory/reorder', '补货建议', '根据安全库存与在途量自动生成建议单。', createTag('Auto Suggestion', 'warning'), { key: 'go-po', label: '生成 PO 草稿', href: '/purchasing/po/new', tone: 'primary' }),
  rows: [
    { id: 'r1', sku: 'ADP-USB-C-DP', warehouse: 'SZ-DC-01', shortage: '30', eta: '5 天', action: '建议补货', status: 'urgent' },
    { id: 'r2', sku: 'CAB-HDMI-2M', warehouse: 'HK-TRANSIT', shortage: '18', eta: '7 天', action: '观察', status: 'watch' },
  ],
  columns: [
    { key: 'sku', label: 'SKU' },
    { key: 'warehouse', label: '仓库' },
    { key: 'shortage', label: '缺口' },
    { key: 'eta', label: '预计到货' },
    { key: 'action', label: '动作' },
    { key: 'status', label: '优先级', type: 'badge', toneMap: { urgent: 'danger', watch: 'warning' } },
  ],
  drawerFields: [
    { label: 'SKU', key: 'sku' },
    { label: '缺口', key: 'shortage' },
    { label: '建议', key: 'action' },
  ],
  bulkHint: '支持批量转采购建议或标记忽略。'
};

export const stocktakeWorkbenchConfig: WorkbenchAssemblyConfig = {
  contract: createWorkbenchContract('/stocktake', '盘点工作台', '盘点任务、差异复核与调整发布入口。', createTag('Stocktake', 'warning'), { key: 'new-stocktake', label: '新建盘点', href: '/stocktake/new', tone: 'primary' }),
  docType: 'ADJ',
  rows: stocktakeRows,
  columns: [
    { key: 'docNo', label: '盘点单号', type: 'link' },
    { key: 'warehouse', label: '仓库' },
    { key: 'counted', label: '盘点行数' },
    { key: 'variance', label: '差异' },
    { key: 'owner', label: '负责人' },
    { key: 'status', label: '状态', type: 'badge', toneMap: { reviewed: 'warning', counting: 'info', posted: 'success' } },
  ],
  drawerFields: [
    { label: '仓库', key: 'warehouse' },
    { label: '负责人', key: 'owner' },
    { label: '差异', key: 'variance' },
  ],
  bulkHint: '支持批量复核、导出盘点差异和生成调整建议。'
};

export const masterDataConfig: WorkbenchAssemblyConfig = {
  contract: createWorkbenchContract('/settings/master-data', '主数据配置', '管理仓库、供应商、客户与分类字典。', createTag('Master Data', 'info'), { key: 'settings', label: '返回设置中心', href: '/settings', tone: 'primary' }),
  rows: [
    { id: 'm1', module: '仓库', owner: '运营平台组', updatedAt: '今天 09:30', status: 'published' },
    { id: 'm2', module: '供应商', owner: '采购团队', updatedAt: '今天 08:40', status: 'reviewing' },
    { id: 'm3', module: '客户', owner: '销售运营', updatedAt: '昨天 18:10', status: 'published' },
  ],
  columns: [
    { key: 'module', label: '模块' },
    { key: 'owner', label: 'Owner' },
    { key: 'updatedAt', label: '最近更新' },
    { key: 'status', label: '状态', type: 'badge', toneMap: { published: 'success', reviewing: 'warning' } },
  ],
  drawerFields: [
    { label: '模块', key: 'module' },
    { label: 'Owner', key: 'owner' },
    { label: '状态', key: 'status' },
  ],
  bulkHint: '支持批量发布字典项和导出配置快照。'
};

export const systemSettingsConfig: WorkbenchAssemblyConfig = {
  contract: createWorkbenchContract('/settings/system', '系统配置', '管理 API、权限、审计与证据相关开关。', createTag('System Config', 'warning'), { key: 'settings', label: '返回设置中心', href: '/settings', tone: 'primary' }),
  rows: [
    { id: 's1', module: 'BFF Transport', value: 'HTTP 优先', updatedAt: '今天 10:30', status: 'enabled' },
    { id: 's2', module: 'Evidence 权限', value: 'read/create scoped', updatedAt: '今天 10:12', status: 'reviewing' },
    { id: 's3', module: '审计保留', value: '180 天', updatedAt: '昨天 17:50', status: 'enabled' },
  ],
  columns: [
    { key: 'module', label: '配置项' },
    { key: 'value', label: '当前值' },
    { key: 'updatedAt', label: '最近更新' },
    { key: 'status', label: '状态', type: 'badge', toneMap: { enabled: 'success', reviewing: 'warning' } },
  ],
  drawerFields: [
    { label: '配置项', key: 'module' },
    { label: '当前值', key: 'value' },
    { label: '状态', key: 'status' },
  ],
  bulkHint: '支持导出配置清单和审计报告。'
};

export const skuDetailConfig: DetailAssemblyConfig = {
  contract: createDetailContract('/skus/[id]', 'SKU 详情', 'SKU 主档、库存、外部映射与产品凭证。', createTag('SKU Active', 'success'), { key: 'edit', label: '编辑 SKU', tone: 'primary' }),
  entityType: 'sku',
  record: createDetailRecord('1001', 'CAB-HDMI-2M', 'SKU Master Record', '主数据 Owner', 'sku'),
};

export const poDetailConfig: DetailAssemblyConfig = {
  contract: createDetailContract('/purchasing/po/[id]', 'PO 详情', '采购订单详情、审批与关联 GRN 入口。', createTag('审批中', 'info'), { key: 'create-grn', label: '生成 GRN', href: '/purchasing/grn/new', tone: 'primary' }),
  docType: 'PO',
  entityType: 'po',
  record: createDetailRecord('2001', 'PO 详情', 'DOC-PO-20260303-001', '采购负责人', 'po'),
};

export const grnDetailConfig: DetailAssemblyConfig = {
  contract: createDetailContract('/purchasing/grn/[id]', 'GRN 详情', '入库差异、过账校验与双层凭证追溯。', createTag('待过账', 'warning'), { key: 'post', label: '校验并过账', tone: 'primary' }),
  docType: 'GRN',
  entityType: 'grn',
  record: createDetailRecord('3001', 'GRN 详情', 'DOC-GRN-20260303-003', '收货负责人', 'grn'),
};

export const soDetailConfig: DetailAssemblyConfig = {
  contract: createDetailContract('/sales/so/[id]', 'SO 详情', '销售订单详情、客户要求与 OUT 生成状态。', createTag('待确认', 'info'), { key: 'create-out', label: '生成 OUT', href: '/sales/out/new', tone: 'primary' }),
  docType: 'SO',
  entityType: 'so',
  record: createDetailRecord('4001', 'SO 详情', 'DOC-SO-20260303-005', '销售负责人', 'so'),
};

export const quotationDetailConfig: DetailAssemblyConfig = {
  contract: createDetailContract('/sales/quotations/[id]', '报价详情', '报价条款、客户确认与转 SO 准备。', createTag('待确认', 'warning'), { key: 'convert', label: '转 SO 草稿', href: '/sales/so/new', tone: 'primary' }),
  docType: 'SO',
  entityType: 'so',
  record: createDetailRecord('7001', '报价详情', 'DOC-SO-20260303-101', '销售负责人', 'so'),
};

export const outDetailConfig: DetailAssemblyConfig = {
  contract: createDetailContract('/sales/out/[id]', 'OUT 详情', '出库拣货、交接签收与物流追溯。', createTag('拣货中', 'warning'), { key: 'handover', label: '补交接凭证', tone: 'primary' }),
  docType: 'OUT',
  entityType: 'out',
  record: createDetailRecord('5001', 'OUT 详情', 'DOC-OUT-20260303-002', '出库负责人', 'out'),
};

export const stocktakeDetailConfig: DetailAssemblyConfig = {
  contract: createDetailContract('/stocktake/[id]', '盘点详情', '盘点差异、复核与调整凭证。', createTag('待复核', 'warning'), { key: 'review', label: '复核并调整', tone: 'primary' }),
  docType: 'ADJ',
  entityType: 'stocktake',
  record: createDetailRecord('6001', '盘点详情', 'DOC-ADJ-20260303-001', '盘点负责人', 'stocktake'),
};

export const skuWizardConfig: WizardAssemblyConfig = {
  contract: createWizardContract('/skus/new', '新建 SKU', '按模板创建 SKU，补充主图、规格书与最小库存。', createTag('主数据创建', 'info'), { key: 'submit', label: '提交 SKU', tone: 'primary' }),
  entityType: 'sku',
  headerGroups: [
    {
      key: 'base',
      title: '基础信息',
      fields: [
        { key: 'code', label: 'SKU 编码', value: 'CAB-HDMI-2M' },
        { key: 'category', label: '分类', value: '线材' },
        { key: 'uom', label: '单位', value: 'PCS' },
        { key: 'minStock', label: '安全库存', value: '80' },
      ],
    },
  ],
  rows: [
    { id: '1', sku: 'CAB-HDMI-2M', spec: 'HDMI 2m / 4K', quantity: '标准包装 20', status: 'ready' },
    { id: '2', sku: 'ADP-USB-C-DP', spec: 'DP 1.4', quantity: '标准包装 10', status: 'reference' },
  ],
  alerts: ['新 SKU 必须至少上传 1 张产品照与 1 份规格书。'],
  summaryNotes: ['提交后自动创建主数据审计记录。', '建议同步维护外部料号映射与标签模板。'],
  documentEvidence: evidenceCollection('sku', '1001', 'document', '产品照'),
  lineEvidenceContexts,
  lineEvidence: {
    '1': evidenceCollection('sku', '1001', 'line', '标签模板', '1'),
    '2': evidenceCollection('sku', '1001', 'line', '规格书', '2'),
  },
};

export const poWizardConfig: WizardAssemblyConfig = {
  contract: createWizardContract('/purchasing/po/new', '新建 PO', '以 T4 模板录入采购单并准备后续到货。', createTag('采购创建', 'info'), { key: 'submit', label: '提交 PO', tone: 'primary' }),
  entityType: 'po',
  headerGroups: [
    {
      key: 'base',
      title: '基础信息',
      fields: [
        { key: 'vendor', label: '供应商', value: 'Acme Supplies' },
        { key: 'warehouse', label: '入库仓', value: 'SZ-DC-01' },
        { key: 'payment', label: '结算方式', value: 'Net 30' },
        { key: 'owner', label: '采购负责人', value: '王敏' },
      ],
    },
  ],
  rows: [
    { id: '1', sku: 'CAB-HDMI-2M', expected: '120', price: '320', amount: '38,400', status: 'ready' },
    { id: '2', sku: 'ADP-USB-C-DP', expected: '80', price: '420', amount: '33,600', status: 'ready' },
  ],
  alerts: ['提交 PO 后建议同步锁定供应商交期与到货窗口。'],
  summaryNotes: ['PO 审批通过后可直接生成 GRN 草稿。'],
  documentEvidence: evidenceCollection('po', '2001', 'document', '采购附件'),
  lineEvidenceContexts,
  lineEvidence: {
    '1': evidenceCollection('po', '2001', 'line', '规格确认', '1'),
    '2': evidenceCollection('po', '2001', 'line', '报价截图', '2'),
  },
};

export const grnWizardConfig: WizardAssemblyConfig = {
  contract: createWizardContract('/purchasing/grn/new', '新建 GRN', '录入实收、对比 PO 差异并补充双层凭证。', createTag('差异校验', 'warning'), { key: 'post', label: '校验并过账', tone: 'primary' }),
  entityType: 'grn',
  headerGroups: [
    {
      key: 'base',
      title: '基础信息',
      fields: [
        { key: 'po', label: '来源 PO', value: 'DOC-PO-20260303-001' },
        { key: 'warehouse', label: '仓库', value: 'SZ-DC-01' },
        { key: 'receivedAt', label: '收货时间', value: '2026-03-03 09:10' },
        { key: 'owner', label: '收货负责人', value: '王敏' },
      ],
    },
  ],
  rows: [
    { id: '1', sku: 'CAB-HDMI-2M', expected: '120', actual: '118', diff: '-2', status: 'difference' },
    { id: '2', sku: 'ADP-USB-C-DP', expected: '80', actual: '80', diff: '0', status: 'ok' },
  ],
  alerts: ['差异行必须补充 line evidence，且过账前需完成 document evidence。'],
  summaryNotes: ['GRN 过账后将自动写入 inventory ledger。'],
  documentEvidence: evidenceCollection('grn', '3001', 'document', '送货清单'),
  lineEvidenceContexts,
  lineEvidence: {
    '1': evidenceCollection('grn', '3001', 'line', '破损照片', '1'),
    '2': evidenceCollection('grn', '3001', 'line', '标签校验', '2'),
  },
};

export const soWizardConfig: WizardAssemblyConfig = {
  contract: createWizardContract('/sales/so/new', '新建 SO', '创建销售订单并准备后续出库。', createTag('销售创建', 'info'), { key: 'submit', label: '提交 SO', tone: 'primary' }),
  entityType: 'so',
  headerGroups: [
    {
      key: 'base',
      title: '基础信息',
      fields: [
        { key: 'customer', label: '客户', value: 'Metro Retail' },
        { key: 'warehouse', label: '出库仓', value: 'SZ-DC-01' },
        { key: 'channel', label: '渠道', value: 'B2B' },
        { key: 'owner', label: '销售负责人', value: '赵宁' },
      ],
    },
  ],
  rows: [
    { id: '1', sku: 'CAB-HDMI-2M', expected: '100', price: '499', amount: '49,900', status: 'ready' },
    { id: '2', sku: 'ADP-USB-C-DP', expected: '24', price: '1,299', amount: '31,176', status: 'ready' },
  ],
  alerts: ['提交前确认库存占用与客户交期。'],
  summaryNotes: ['SO 审批后可直接生成 OUT 草稿。'],
  documentEvidence: evidenceCollection('so', '4001', 'document', '客户附件'),
  lineEvidenceContexts,
  lineEvidence: {
    '1': evidenceCollection('so', '4001', 'line', '样品确认', '1'),
    '2': evidenceCollection('so', '4001', 'line', '规格确认', '2'),
  },
};

export const quotationWizardConfig: WizardAssemblyConfig = {
  contract: createWizardContract('/sales/quotations/new', '新建报价', '创建报价单、录入条款并准备转 SO。', createTag('报价创建', 'warning'), { key: 'submit', label: '提交报价', tone: 'primary' }),
  entityType: 'so',
  headerGroups: [
    {
      key: 'base',
      title: '基础信息',
      fields: [
        { key: 'customer', label: '客户', value: 'Metro Retail' },
        { key: 'warehouse', label: '发货仓', value: 'SZ-DC-01' },
        { key: 'currency', label: '币种', value: 'CNY' },
        { key: 'owner', label: '销售负责人', value: '赵宁' },
      ],
    },
  ],
  rows: [
    { id: '1', sku: 'CAB-HDMI-2M', expected: '100', price: '499', amount: '49,900', status: 'draft' },
    { id: '2', sku: 'ADP-USB-C-DP', expected: '24', price: '1,299', amount: '31,176', status: 'draft' },
  ],
  alerts: ['报价提交前需确认税率、交期与有效期。'],
  summaryNotes: ['确认后可一键转 SO 草稿。'],
  documentEvidence: evidenceCollection('so', '7001', 'document', '报价附件'),
  lineEvidenceContexts,
  lineEvidence: {
    '1': evidenceCollection('so', '7001', 'line', '报价条款附件', '1'),
    '2': evidenceCollection('so', '7001', 'line', '规格确认', '2'),
  },
};

export const outWizardConfig: WizardAssemblyConfig = {
  contract: createWizardContract('/sales/out/new', '新建 OUT', '执行拣货、校验与交接签收凭证收集。', createTag('交接必填', 'warning'), { key: 'submit', label: '确认出库', tone: 'primary' }),
  entityType: 'out',
  headerGroups: [
    {
      key: 'base',
      title: '基础信息',
      fields: [
        { key: 'so', label: '来源 SO', value: 'DOC-SO-20260303-005' },
        { key: 'warehouse', label: '仓库', value: 'SZ-DC-01' },
        { key: 'picker', label: '拣货人', value: '李辰' },
        { key: 'carrier', label: '承运方式', value: '客户自提' },
      ],
    },
  ],
  rows: [
    { id: '1', sku: 'CAB-HDMI-2M', expected: '100', actual: '100', diff: '0', status: 'ok' },
    { id: '2', sku: 'ADP-USB-C-DP', expected: '24', actual: '24', diff: '0', status: 'ok' },
  ],
  alerts: ['交接签收与箱标必须在放行前上传。'],
  summaryNotes: ['OUT 完成后将写入库存流水并同步交接责任人。'],
  documentEvidence: evidenceCollection('out', '5001', 'document', '交接签收'),
  lineEvidenceContexts,
  lineEvidence: {
    '1': evidenceCollection('out', '5001', 'line', '箱标', '1'),
    '2': evidenceCollection('out', '5001', 'line', '序列号', '2'),
  },
};

export const stocktakeWizardConfig: WizardAssemblyConfig = {
  contract: createWizardContract('/stocktake/new', '新建盘点', '执行盘点、差异复核与调整建议生成。', createTag('差异复核', 'warning'), { key: 'submit', label: '提交盘点', tone: 'primary' }),
  entityType: 'stocktake',
  headerGroups: [
    {
      key: 'base',
      title: '基础信息',
      fields: [
        { key: 'warehouse', label: '仓库', value: 'SZ-DC-01' },
        { key: 'scope', label: '盘点范围', value: 'A/B 区线材与适配器' },
        { key: 'owner', label: '盘点负责人', value: '周珊' },
        { key: 'method', label: '方式', value: 'Cycle Count' },
      ],
    },
  ],
  rows: [
    { id: '1', sku: 'CAB-HDMI-2M', expected: '562', actual: '558', diff: '-4', status: 'difference' },
    { id: '2', sku: 'LAN-CAT6-5M', expected: '210', actual: '210', diff: '0', status: 'ok' },
  ],
  alerts: ['差异大于 0 的行必须上传现场照片与货位信息。'],
  summaryNotes: ['复核后可自动生成调整建议与审计记录。'],
  documentEvidence: evidenceCollection('stocktake', '6001', 'document', '盘点照片'),
  lineEvidenceContexts,
  lineEvidence: {
    '1': evidenceCollection('stocktake', '6001', 'line', '货位照片', '1'),
    '2': evidenceCollection('stocktake', '6001', 'line', '标签校验', '2'),
  },
};
