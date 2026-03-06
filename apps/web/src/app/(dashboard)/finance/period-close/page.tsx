import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';
const props = buildRoutePlaceholderProps('T4', '/finance/period-close', '期间结账', '承接期间校验、过账检查与关账动作。');
export default function FinancePeriodClosePage() {
  return <RoutePlaceholderPage {...props} />;
}
