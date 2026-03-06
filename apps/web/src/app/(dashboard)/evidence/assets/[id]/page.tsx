import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';
const props = buildRoutePlaceholderProps('T3', '/evidence/assets/:id', '证据资产详情', '承接文档级、行级证据资产的元数据、绑定与审计。');
export default function EvidenceAssetDetailPage() {
  return <RoutePlaceholderPage {...props} />;
}
