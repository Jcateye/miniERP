export type PrimaryRouteItem = {
  label: string;
  href: string;
  icon: 'dashboard' | 'sku' | 'settings';
};

export type SecondaryRouteItem = {
  label: string;
  href: string;
  description: string;
};

export type RouteGroup = {
  key: 'system-settings' | 'operations-tools';
  label: string;
  items: SecondaryRouteItem[];
};

export const primaryNav: PrimaryRouteItem[] = [
  { label: '工作台', href: '/', icon: 'dashboard' },
  { label: 'SKU 管理', href: '/skus', icon: 'sku' },
  { label: '设置', href: '/settings', icon: 'settings' },
];

const systemSettingsItems: SecondaryRouteItem[] = [
  { label: '主数据配置', href: '/settings/master-data', description: '维护类目、仓库与基础字典' },
  { label: '租户设置', href: '/settings/tenant', description: '租户信息、默认规则与品牌配置' },
  { label: '用户管理', href: '/settings/users', description: '用户账号与角色分配' },
  { label: '角色权限', href: '/settings/roles', description: '权限模型与授权策略' },
  { label: '个人中心', href: '/settings/profile', description: '个人信息与安全配置' },
  { label: 'API 客户端', href: '/settings/api-clients', description: '开放平台客户端凭据管理' },
  { label: 'API 日志', href: '/settings/api-logs', description: '外部调用审计与排障' },
  { label: '开发者中心', href: '/settings/developer', description: '接口说明与开发调试入口' },
];

const operationsToolsItems: SecondaryRouteItem[] = [
  { label: '报表中心', href: '/reports', description: '查看经营分析与业务趋势' },
  { label: '附件管理', href: '/attachments', description: '统一管理业务附件与凭证文件' },
  { label: '扫码工具', href: '/scan', description: '移动端扫码入库/出库快捷入口' },
];

export const settingsSecondaryNav: RouteGroup[] = [
  { key: 'system-settings', label: '系统设置', items: systemSettingsItems },
  { key: 'operations-tools', label: '运营工具', items: operationsToolsItems },
];
