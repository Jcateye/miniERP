import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';
const props = buildRoutePlaceholderProps('T4', '/finance/journals/new', '新建凭证', '承接分录、借贷平衡与辅助核算维度。');
export default function FinanceJournalNewPage() {
  return <RoutePlaceholderPage {...props} />;
}
