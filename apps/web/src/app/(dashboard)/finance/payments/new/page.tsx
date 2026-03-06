import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';
const props = buildRoutePlaceholderProps('T4', '/finance/payments/new', '新建付款', '承接付款、核销与银行回单。');
export default function FinancePaymentNewPage() {
  return <RoutePlaceholderPage {...props} />;
}
