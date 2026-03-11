export type PrimaryRouteKey =
  | "workspace"
  | "workflow"
  | "mdm"
  | "procure"
  | "sales"
  | "inventory"
  | "manufacturing"
  | "finance"
  | "reports"
  | "settings";

export type PrimaryRouteItem = {
  key: PrimaryRouteKey;
  label: string;
  href: string;
  matchPrefixes?: readonly string[];
  icon: PrimaryRouteKey;
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
  { key: "workspace", label: "工作空间", href: "/workspace", icon: "workspace", matchPrefixes: ["/workspace"] },
  { key: "workflow", label: "审批流程", href: "/workflow/approval", icon: "workflow", matchPrefixes: ["/workflow"] },
  { key: "mdm", label: "主数据", href: "/mdm/items", icon: "mdm", matchPrefixes: ["/mdm"] },
  { key: "procure", label: "采购", href: "/procure/purchase-orders", icon: "procure", matchPrefixes: ["/procure"] },
  { key: "sales", label: "销售", href: "/sales/orders", icon: "sales", matchPrefixes: ["/sales"] },
  { key: "inventory", label: "库存", href: "/inventory/overview", icon: "inventory", matchPrefixes: ["/inventory"] },
  {
    key: "manufacturing",
    label: "制造",
    href: "/manufacturing/overview",
    icon: "manufacturing",
    matchPrefixes: ["/manufacturing"],
  },
  { key: "finance", label: "财务", href: "/finance/overview", icon: "finance", matchPrefixes: ["/finance"] },
  { key: "reports", label: "报表", href: "/reports", icon: "reports", matchPrefixes: ["/reports"] },
  { key: "settings", label: "设置", href: "/settings/master", icon: "settings", matchPrefixes: ["/settings"] },
];

export const secondaryNavByPrimary: Record<PrimaryRouteKey, RouteGroup[]> = {
  workspace: [
    {
      key: "workspace-hub",
      label: "工作空间",
      items: [
        { label: "工作台首页", href: "/workspace", description: "当前 miniERP 的主工作台入口" },
        {
          label: "源项目首页",
          href: "/workspace/source-home",
          description: "从 miniERP_web 迁入的首页复刻页",
          matchPrefixes: ["/workspace/source-home"],
        },
      ],
    },
  ],
  workflow: [
    {
      key: "workflow-approvals",
      label: "审批中心",
      items: [
        {
          label: "审批任务",
          href: "/workflow/approval",
          description: "待我审批、我已审批与我发起的任务列表",
        },
        {
          label: "APV 占位",
          href: "/workflow/apv",
          description: "源项目中的 APV 占位页",
        },
      ],
    },
  ],
  mdm: [
    {
      key: "mdm-core",
      label: "主数据核心",
      items: [
        { label: "物料管理", href: "/mdm/items", description: "当前仓库已有的物料管理列表页" },
        {
          label: "SKU 工作台",
          href: "/mdm/skus",
          description: "源项目 SKU 工作台与详情集合",
          matchPrefixes: ["/mdm/skus"],
          children: [
            {
              label: "SKU 概览",
              href: "/mdm/skus/overview",
              description: "KPI 与最近动作的概览页",
            },
          ],
        },
        { label: "客户管理", href: "/mdm/customers", description: "客户档案列表页" },
        { label: "供应商管理", href: "/mdm/suppliers", description: "供应商档案列表页" },
        { label: "仓库管理", href: "/mdm/warehouses", description: "仓库信息与状态页" },
        { label: "BOM 管理", href: "/mdm/bom", description: "BOM 列表与查询页" },
        { label: "组织架构", href: "/mdm/org", description: "组织结构与成员信息页" },
        { label: "角色权限", href: "/mdm/roles", description: "角色与权限矩阵页" },
        { label: "用户管理", href: "/mdm/users", description: "用户列表与状态页" },
      ],
    },
  ],
  procure: [
    {
      key: "procure-orders",
      label: "采购业务",
      items: [
        {
          label: "采购订单",
          href: "/procure/purchase-orders",
          description: "采购订单列表页",
          matchPrefixes: ["/procure/purchase-orders"],
          children: [
            {
              label: "采购概览",
              href: "/procure/purchase-orders/overview",
              description: "采购 KPI 与待办概览",
            },
          ],
        },
        {
          label: "收货流程",
          href: "/procure/receipts/new",
          description: "GRN 新建流程 Step 1",
          matchPrefixes: ["/procure/receipts/new"],
          children: [
            {
              label: "差异与证据",
              href: "/procure/receipts/new/step3",
              description: "GRN Step 3 差异核验与凭证上传",
              matchPrefixes: ["/procure/receipts/new/step3"],
            },
          ],
        },
      ],
    },
  ],
  sales: [
    {
      key: "sales-core",
      label: "销售业务",
      items: [
        {
          label: "销售订单",
          href: "/sales/orders",
          description: "销售订单列表页",
          matchPrefixes: ["/sales/orders"],
          children: [
            {
              label: "销售概览",
              href: "/sales/orders/overview",
              description: "销售 KPI 与履约概览",
            },
            {
              label: "报价管理",
              href: "/sales/orders/quote",
              description: "报价单列表与状态页",
            },
            {
              label: "发运记录",
              href: "/sales/orders/ship",
              description: "发运与交付记录页",
            },
          ],
        },
        {
          label: "出库流程",
          href: "/sales/outbound/new",
          description: "源项目 OUT 工作流 Step 2 页面",
          matchPrefixes: ["/sales/outbound/new"],
        },
      ],
    },
  ],
  inventory: [
    {
      key: "inventory-core",
      label: "库存中心",
      items: [
        { label: "库存概览", href: "/inventory/overview", description: "库存概览与待办告警" },
        { label: "库存余额", href: "/inventory/balance", description: "库存余额查询列表页" },
        { label: "收货记录", href: "/inventory/grn", description: "入库与收货记录列表页" },
        { label: "库存流水", href: "/inventory/ledger", description: "Inventory Ledger 全量审计页" },
        { label: "库存调整", href: "/inventory/adjustment", description: "库存调整单与异常记录页" },
        { label: "补货建议", href: "/inventory/restock", description: "补货建议与优先级页面" },
        {
          label: "盘点管理",
          href: "/inventory/stocktake",
          description: "盘点列表与任务管理页",
          matchPrefixes: ["/inventory/stocktake"],
          children: [
            {
              label: "新建盘点",
              href: "/inventory/stocktake/new",
              description: "新建盘点流程页",
            },
          ],
        },
      ],
    },
  ],
  manufacturing: [
    {
      key: "manufacturing-core",
      label: "制造管理",
      items: [
        { label: "制造概览", href: "/manufacturing/overview", description: "制造 KPI 与待办概览" },
        { label: "生产订单", href: "/manufacturing/orders", description: "生产订单列表页" },
        { label: "质检记录", href: "/manufacturing/qc", description: "质检记录与状态页" },
        { label: "制造占位", href: "/manufacturing", description: "源项目中的制造占位页" },
      ],
    },
  ],
  finance: [
    {
      key: "finance-core",
      label: "财务中心",
      items: [
        { label: "财务概览", href: "/finance/overview", description: "财务 KPI 与经营概览页" },
        { label: "发票管理", href: "/finance/invoice", description: "发票列表页" },
        { label: "记账凭证", href: "/finance/voucher", description: "记账凭证列表页" },
        { label: "收款记录", href: "/finance/collection", description: "收款记录与状态页" },
        { label: "付款记录", href: "/finance/payment", description: "付款记录与状态页" },
        { label: "会计科目", href: "/finance/accounts", description: "科目表与结构页" },
        { label: "成本中心", href: "/finance/cost-center", description: "成本中心管理页" },
        { label: "预算管理", href: "/finance/budget", description: "预算管理与执行页" },
        { label: "财务占位", href: "/finance", description: "源项目中的财务占位页" },
      ],
    },
  ],
  reports: [
    {
      key: "reports-center",
      label: "报表中心",
      items: [
        {
          label: "报表中心",
          href: "/reports",
          description: "经营分析与报表详情入口",
          children: [
            { label: "SKU 报表", href: "/reports/sku", description: "SKU 分类、活跃度与新增趋势分析" },
            { label: "库存报表", href: "/reports/inventory", description: "库存余额、周转率与呆滞物料分析" },
            { label: "采购报表", href: "/reports/purchase", description: "采购趋势、供应商份额与价格波动分析" },
            { label: "销售报表", href: "/reports/sales", description: "销售趋势、客户排行与履约表现分析" },
            { label: "财务报表", href: "/reports/finance", description: "利润、费用结构与现金流表现分析" },
            { label: "报价报表", href: "/reports/quotation", description: "报价转化率、时效与客户阶段分析" },
          ],
        },
        {
          label: "源项目报表页",
          href: "/reports/source-center",
          description: "从 miniERP_web 迁入的报表占位页",
        },
      ],
    },
  ],
  settings: [
    {
      key: "settings-core",
      label: "系统设置",
      items: [
        { label: "系统设置", href: "/settings", description: "源项目中的设置占位页" },
        { label: "主数据配置", href: "/settings/master", description: "源项目 settings/master 页面" },
      ],
    },
  ],
};

export function isRouteActive(pathname: string, href: string, matchPrefixes: readonly string[] = []): boolean {
  if (pathname === href) {
    return true;
  }

  if (href !== "/" && pathname.startsWith(`${href}/`)) {
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
