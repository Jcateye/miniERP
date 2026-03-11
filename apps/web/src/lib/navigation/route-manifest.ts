export type PrimaryRouteKey = 'workspace' | 'mdm' | 'reports';

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
  { key: 'workspace', label: '工作空间', href: '/workspace', icon: 'workspace', matchPrefixes: ['/workspace'] },
  { key: 'mdm', label: '主数据', href: '/mdm/items', icon: 'mdm', matchPrefixes: ['/mdm/items'] },
  { key: 'reports', label: '报表', href: '/reports', icon: 'reports', matchPrefixes: ['/reports'] },
];

export const secondaryNavByPrimary: Record<PrimaryRouteKey, RouteGroup[]> = {
  workspace: [
    {
      key: 'workspace-hub',
      label: '工作空间',
      items: [{ label: '工作台首页', href: '/workspace', description: '保留的工作台首页入口' }],
    },
  ],
  mdm: [
    {
      key: 'mdm-core',
      label: '主数据',
      items: [{ label: '物料管理', href: '/mdm/items', description: '保留的 SKU 列表页' }],
    },
  ],
  reports: [
    {
      key: 'reports-center',
      label: '报表中心',
      items: [
        {
          label: '报表中心',
          href: '/reports',
          description: '经营分析与报表详情入口',
          children: [
            { label: 'SKU 报表', href: '/reports/sku', description: 'SKU 分类、活跃度与新增趋势分析' },
            { label: '库存报表', href: '/reports/inventory', description: '库存余额、周转率与呆滞物料分析' },
            { label: '采购报表', href: '/reports/purchase', description: '采购趋势、供应商份额与价格波动分析' },
            { label: '销售报表', href: '/reports/sales', description: '销售趋势、客户排行与履约表现分析' },
            { label: '财务报表', href: '/reports/finance', description: '利润、费用结构与现金流表现分析' },
            { label: '报价报表', href: '/reports/quotation', description: '报价转化率、时效与客户阶段分析' },
          ],
        },
      ],
    },
  ],
};

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
