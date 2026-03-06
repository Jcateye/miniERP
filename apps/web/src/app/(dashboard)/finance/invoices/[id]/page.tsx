import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';
const props = buildRoutePlaceholderProps('T3', '/finance/invoices/:id', '发票详情', '承接票面明细、归档文件、证据与审计。');
export default function FinanceInvoiceDetailPage() {
  return <RoutePlaceholderPage {...props} />;
}
