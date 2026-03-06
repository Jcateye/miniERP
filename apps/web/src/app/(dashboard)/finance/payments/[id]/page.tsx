import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';
const props = buildRoutePlaceholderProps('T3', '/finance/payments/:id', '付款详情', '承接付款明细、核销分配与审计。');
export default function FinancePaymentDetailPage() {
  return <RoutePlaceholderPage {...props} />;
}
