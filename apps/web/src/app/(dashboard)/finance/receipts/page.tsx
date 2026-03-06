import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';
const props = buildRoutePlaceholderProps('T2', '/finance/receipts', '收款工作台', '承接收款登记、核销与回单管理。');
export default function FinanceReceiptsPage() {
  return <RoutePlaceholderPage {...props} />;
}
