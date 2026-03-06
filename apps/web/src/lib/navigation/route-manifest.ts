export type PrimaryRouteItem = {
  label: string;
  href: string;
  icon:
    | 'workspace'
    | 'mdm'
    | 'procure'
    | 'sales'
    | 'inventory'
    | 'finance'
    | 'manufacturing'
    | 'workflow';
};

export type SecondaryRouteItem = {
  label: string;
  href: string;
  description: string;
};

export type RouteGroup = {
  key: 'mdm-admin' | 'operations-tools';
  label: string;
  items: SecondaryRouteItem[];
};

export const primaryNav: PrimaryRouteItem[] = [
  { label: '工作空间', href: '/workspace', icon: 'workspace' },
  { label: '主数据', href: '/mdm/items', icon: 'mdm' },
  { label: '采购', href: '/procure/overview', icon: 'procure' },
  { label: '销售', href: '/sales/overview', icon: 'sales' },
  { label: '库存', href: '/inventory/balances', icon: 'inventory' },
  { label: '财务', href: '/finance/overview', icon: 'finance' },
  { label: '制造', href: '/manufacturing/overview', icon: 'manufacturing' },
  { label: '流程', href: '/workflow/tasks', icon: 'workflow' },
];

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
