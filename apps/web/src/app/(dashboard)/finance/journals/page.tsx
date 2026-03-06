import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';
const props = buildRoutePlaceholderProps('T2', '/finance/journals', '凭证工作台', '承接凭证列表、过账、冲销与期间控制。');
export default function FinanceJournalsPage() {
  return <RoutePlaceholderPage {...props} />;
}
