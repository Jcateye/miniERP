import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';
const props = buildRoutePlaceholderProps('T2', '/finance/budgets', '预算工作台', '承接预算定义、分解、发布与跟踪。');
export default function FinanceBudgetsPage() {
  return <RoutePlaceholderPage {...props} />;
}
