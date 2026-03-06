import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';

const props = buildRoutePlaceholderProps(
  'T2',
  '/mdm/organizations',
  '组织单元工作台',
  '按公司、业务单元、部门与库存组织重组主数据根模型。',
  [
    { label: '租户设置', href: '/settings/tenant', description: '当前已有的租户配置入口。' },
    { label: '用户管理', href: '/mdm/users', description: '查看新 IA 下的用户授权页面。' },
  ],
);

export default function OrganizationWorkbenchPage() {
  return <RoutePlaceholderPage {...props} />;
}
