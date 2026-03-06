import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';
const props = buildRoutePlaceholderProps('T2', '/finance/cost-centers', '成本中心工作台', '承接成本归集与辅助核算维度。');
export default function FinanceCostCentersPage() {
  return <RoutePlaceholderPage {...props} />;
}
