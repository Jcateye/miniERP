import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';
const props = buildRoutePlaceholderProps('T2', '/finance/invoices', '发票工作台', '承接开票、红冲、归档与单据回写。');
export default function FinanceInvoicesPage() {
  return <RoutePlaceholderPage {...props} />;
}
