import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';
const props = buildRoutePlaceholderProps('T2', '/finance/payments', '付款工作台', '承接供应商付款、核销与回单管理。');
export default function FinancePaymentsPage() {
  return <RoutePlaceholderPage {...props} />;
}
