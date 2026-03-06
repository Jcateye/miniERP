import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';
const props = buildRoutePlaceholderProps('T3', '/finance/receipts/:id', '收款详情', '承接收款明细、核销分配与审计。');
export default function FinanceReceiptDetailPage() {
  return <RoutePlaceholderPage {...props} />;
}
