import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';
const props = buildRoutePlaceholderProps('T4', '/finance/receipts/new', '新建收款', '承接客户收款、核销与附件上传。');
export default function FinanceReceiptNewPage() {
  return <RoutePlaceholderPage {...props} />;
}
