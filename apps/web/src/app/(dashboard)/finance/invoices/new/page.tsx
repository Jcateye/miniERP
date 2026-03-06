import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';
const props = buildRoutePlaceholderProps('T4', '/finance/invoices/new', '新建发票', '承接票面字段、税率校验与版式归档。');
export default function FinanceInvoiceNewPage() {
  return <RoutePlaceholderPage {...props} />;
}
