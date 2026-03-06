import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';
const props = buildRoutePlaceholderProps('T3', '/finance/journals/:id', '凭证详情', '承接分录、附件、证据与过账轨迹。');
export default function FinanceJournalDetailPage() {
  return <RoutePlaceholderPage {...props} />;
}
