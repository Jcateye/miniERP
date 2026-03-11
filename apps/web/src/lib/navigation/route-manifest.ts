export type PrimaryRouteKey =
  | 'workspace'
  | 'mdm'
  | 'procure'
  | 'sales'
  | 'inventory'
  | 'finance'
  | 'manufacturing'
  | 'workflow'
  | 'platform';

export type PrimaryRouteItem = {
  key: PrimaryRouteKey;
  label: string;
  href: string;
  matchPrefixes?: readonly string[];
  icon:
    | 'workspace'
    | 'mdm'
    | 'procure'
    | 'sales'
    | 'inventory'
    | 'finance'
    | 'manufacturing'
    | 'workflow'
    | 'platform';
};

export type SecondaryRouteChildItem = {
  label: string;
  href: string;
  description: string;
  matchPrefixes?: readonly string[];
};

export type SecondaryRouteItem = {
  label: string;
  href: string;
  description: string;
  matchPrefixes?: readonly string[];
  children?: readonly SecondaryRouteChildItem[];
};

export type RouteGroup = {
  key: string;
  label: string;
  items: SecondaryRouteItem[];
};

export const primaryNav: PrimaryRouteItem[] = [
  { key: 'workspace', label: '工作空间', href: '/workspace', icon: 'workspace', matchPrefixes: ['/workspace'] },
  { key: 'mdm', label: '主数据', href: '/mdm/items', icon: 'mdm', matchPrefixes: ['/mdm'] },
  { key: 'procure', label: '采购', href: '/procure/purchase-orders', icon: 'procure', matchPrefixes: ['/procure'] },
  { key: 'sales', label: '销售', href: '/sales/orders', icon: 'sales', matchPrefixes: ['/sales'] },
  { key: 'inventory', label: '库存', href: '/inventory/balances', icon: 'inventory', matchPrefixes: ['/inventory'] },
  { key: 'finance', label: '财务', href: '/finance/invoices', icon: 'finance', matchPrefixes: ['/finance'] },
  {
    key: 'manufacturing',
    label: '制造',
    href: '/manufacturing/overview',
    icon: 'manufacturing',
    matchPrefixes: ['/manufacturing', '/quality'],
  },
  { key: 'workflow', label: '流程', href: '/workflow/tasks', icon: 'workflow', matchPrefixes: ['/workflow'] },
  {
    key: 'platform',
    label: '平台',
    href: '/reports',
    icon: 'platform',
    matchPrefixes: ['/reports', '/integration', '/evidence'],
  },
];

export const secondaryNavByPrimary: Record<PrimaryRouteKey, RouteGroup[]> = {
  workspace: [
    {
      key: 'workspace-hub',
      label: '工作空间',
      items: [
        { label: '工作台首页', href: '/workspace', description: '全局待办、KPI 和快捷动作汇总' },
        { label: '待办任务', href: '/workspace/todos', description: '角色任务池与处理队列' },
        { label: '通知中心', href: '/workspace/notifications', description: '系统通知与业务提醒' },
      ],
    },
  ],
  mdm: [
    {
      key: 'mdm-core',
      label: '主数据',
      items: [
        {
          label: '物料管理',
          href: '/mdm/items',
          description: '物料台账、规格和状态维护',
          children: [{ label: '新建物料', href: '/mdm/items/new', description: '进入 T4 新建物料流程' }],
        },
        { label: '客户主数据', href: '/mdm/customers', description: '客户台账与开票信息维护' },
        { label: '供应商主数据', href: '/mdm/suppliers', description: '供应商台账与采购基础数据' },
        { label: '仓库主数据', href: '/mdm/warehouses', description: '仓库、库区与联系人维护' },
      ],
    },
    {
      key: 'mdm-admin',
      label: '组织与权限',
      items: [
        { label: '组织单元', href: '/mdm/organizations', description: '组织、公司与数据范围模型' },
        { label: '用户管理', href: '/mdm/users', description: '用户账号与角色授权' },
        { label: '角色权限', href: '/mdm/roles', description: '权限模型与流程授权策略' },
      ],
    },
  ],
  procure: [
    {
      key: 'procure-docs',
      label: '采购执行',
      items: [
        { label: '采购概览', href: '/procure/overview', description: '采购域总览与异常入口' },
        {
          label: '采购订单',
          href: '/procure/purchase-orders',
          description: '采购单列表、状态与跟单入口',
          children: [{ label: '新建采购单', href: '/procure/purchase-orders/new', description: '进入采购单新建流程' }],
        },
        {
          label: '收货单',
          href: '/procure/receipts',
          description: 'GRN 列表、收货状态与过账入口',
          children: [{ label: '新建收货单', href: '/procure/receipts/new', description: '进入收货单新建流程' }],
        },
      ],
    },
  ],
  sales: [
    {
      key: 'sales-docs',
      label: '销售履约',
      items: [
        { label: '销售概览', href: '/sales/overview', description: '报价、订单与发运的统一入口' },
        {
          label: '报价单',
          href: '/sales/quotations',
          description: '报价列表、状态与客户上下文',
          children: [{ label: '新建报价', href: '/sales/quotations/new', description: '进入报价单新建流程' }],
        },
        {
          label: '销售订单',
          href: '/sales/orders',
          description: '订单列表、履约状态与详情入口',
          children: [{ label: '新建销售单', href: '/sales/orders/new', description: '进入销售订单新建流程' }],
        },
        {
          label: '发运单',
          href: '/sales/shipments',
          description: '发运列表、波次履约与出库入口',
          children: [{ label: '新建发运单', href: '/sales/shipments/new', description: '进入发运单新建流程' }],
        },
      ],
    },
  ],
  inventory: [
    {
      key: 'inventory-ops',
      label: '库存运营',
      items: [
        { label: '库存概览', href: '/inventory/overview', description: '库存域总览与关键风险入口' },
        { label: '库存余额', href: '/inventory/balances', description: '按仓库、物料查看当前余额' },
        { label: '库存流水', href: '/inventory/ledger', description: '基于台账查看库存移动' },
        { label: '库存调整', href: '/inventory/adjustments', description: '查看库存调整记录与状态' },
        { label: '补货建议', href: '/inventory/replenishment', description: '按阈值查看补货建议列表' },
        {
          label: '盘点单',
          href: '/inventory/counts',
          description: '盘点任务列表、差异与结果跟踪',
          children: [{ label: '新建盘点', href: '/inventory/counts/new', description: '进入盘点新建流程' }],
        },
      ],
    },
  ],
  finance: [
    {
      key: 'finance-docs',
      label: '财务作业',
      items: [
        { label: '财务概览', href: '/finance/overview', description: '财务域总览与异常入口' },
        {
          label: '发票管理',
          href: '/finance/invoices',
          description: '发票列表、状态与详情入口',
          children: [{ label: '新建发票', href: '/finance/invoices/new', description: '进入发票新建流程' }],
        },
        {
          label: '收款管理',
          href: '/finance/receipts',
          description: '收款列表、核销状态与客户上下文',
          children: [{ label: '新建收款', href: '/finance/receipts/new', description: '进入收款新建流程' }],
        },
        {
          label: '付款管理',
          href: '/finance/payments',
          description: '付款列表、审批状态与供应商上下文',
          children: [{ label: '新建付款', href: '/finance/payments/new', description: '进入付款新建流程' }],
        },
        {
          label: '凭证管理',
          href: '/finance/journals',
          description: '会计凭证列表与审计入口',
          children: [{ label: '新建凭证', href: '/finance/journals/new', description: '进入凭证新建流程' }],
        },
      ],
    },
    {
      key: 'finance-master',
      label: '财务基础',
      items: [
        { label: '科目表', href: '/finance/gl-accounts', description: '总账科目与层级结构' },
        { label: '成本中心', href: '/finance/cost-centers', description: '成本中心台账与归属' },
        { label: '预算管理', href: '/finance/budgets', description: '预算版本、期间与状态' },
        { label: '期间结账', href: '/finance/period-close', description: '结账向导与关闭控制' },
      ],
    },
  ],
  manufacturing: [
    {
      key: 'manufacturing-core',
      label: '制造与质量',
      items: [
        { label: '制造概览', href: '/manufacturing/overview', description: '生产计划、执行与瓶颈总览' },
        {
          label: '生产订单',
          href: '/manufacturing/orders',
          description: '生产订单列表、状态和详情入口',
          children: [{ label: '新建生产单', href: '/manufacturing/orders/new', description: '进入生产订单新建流程' }],
        },
        { label: '质检记录', href: '/quality/records', description: '质量检查记录与结果跟踪' },
      ],
    },
  ],
  workflow: [
    {
      key: 'workflow-ops',
      label: '流程协同',
      items: [
        { label: '审批任务', href: '/workflow/tasks', description: '审批任务、待处理范围与流转状态' },
      ],
    },
  ],
  platform: [
    {
      key: 'platform-analytics',
      label: '平台能力',
      items: [
        {
          label: '报表中心',
          href: '/reports',
          description: '经营分析、多维报表与导出入口',
          children: [
            { label: 'SKU 报表', href: '/reports/sku', description: 'SKU 分类、分布与新增趋势' },
            { label: '库存报表', href: '/reports/inventory', description: '库存周转、呆滞与余额分析' },
            { label: '采购报表', href: '/reports/purchase', description: '采购金额、供应商与价格波动' },
            { label: '销售报表', href: '/reports/sales', description: '销售收入、客户排行与趋势分析' },
            { label: '财务报表', href: '/reports/finance', description: '利润、费用与财务结构分析' },
            { label: '报价报表', href: '/reports/quotation', description: '报价转化与报价效率分析' },
          ],
        },
        { label: '集成端点', href: '/integration/endpoints', description: '外部系统连接与端点配置' },
        { label: '集成任务', href: '/integration/jobs', description: '定时任务、调度与最近执行' },
        { label: '集成日志', href: '/integration/logs', description: '接口调用日志与失败重试追踪' },
        { label: '证据资产', href: '/evidence/assets', description: '统一管理单据级与行级凭证文件' },
      ],
    },
  ],
};

const mdmAdminItems: SecondaryRouteItem[] = [
  { label: '组织单元', href: '/mdm/organizations', description: '组织、公司与数据范围模型' },
  { label: '用户管理', href: '/mdm/users', description: '用户账号与角色授权' },
  { label: '角色权限', href: '/mdm/roles', description: '权限模型与流程授权策略' },
  { label: '客户主数据', href: '/mdm/customers', description: '客户台账与开票信息' },
  { label: '供应商主数据', href: '/mdm/suppliers', description: '供应商台账与收款信息' },
  { label: '仓库主数据', href: '/mdm/warehouses', description: '仓库、库区与联系人维护' },
];

const operationsToolsItems: SecondaryRouteItem[] = [
  { label: '报表中心', href: '/reports', description: '按域查看经营分析与业务趋势' },
  { label: '集成端点', href: '/integration/endpoints', description: '外部系统、任务与失败重试' },
  { label: '证据资产', href: '/evidence/assets', description: '统一管理单据级与行级凭证文件' },
  { label: '扫码工具', href: '/scan', description: '移动端扫码入库、出库与盘点快捷入口' },
];

export const settingsSecondaryNav: RouteGroup[] = [
  { key: 'mdm-admin', label: '主数据与权限', items: mdmAdminItems },
  { key: 'operations-tools', label: '运营工具', items: operationsToolsItems },
];

export function isRouteActive(pathname: string, href: string, matchPrefixes: readonly string[] = []): boolean {
  if (pathname === href) {
    return true;
  }

  if (href !== '/' && pathname.startsWith(`${href}/`)) {
    return true;
  }

  return matchPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function getPrimaryNavItem(pathname: string): PrimaryRouteItem | undefined {
  return primaryNav.find((item) => isRouteActive(pathname, item.href, item.matchPrefixes));
}

export function getPrimarySecondaryNav(pathname: string): RouteGroup[] {
  const activePrimary = getPrimaryNavItem(pathname);
  return activePrimary ? secondaryNavByPrimary[activePrimary.key] : [];
}
