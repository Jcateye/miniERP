import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';
const props = buildRoutePlaceholderProps('T2', '/finance/gl-accounts', '总账科目工作台', '承接科目树、属性与启停控制。');
export default function FinanceGlAccountsPage() {
  return <RoutePlaceholderPage {...props} />;
}
