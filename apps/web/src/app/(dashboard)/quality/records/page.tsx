import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';

const props = buildRoutePlaceholderProps(
  'T2',
  '/quality/records',
  '质检记录工作台',
  '承接来料、过程、出货质检与不合格处置。',
  [{ label: '制造总览', href: '/manufacturing/overview', description: '返回制造质检域入口。' }],
);

export default function QualityRecordsPage() {
  return <RoutePlaceholderPage {...props} />;
}
