import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';

const props = buildRoutePlaceholderProps(
  'T3',
  '/quality/records/:id',
  '质检记录详情',
  '承接检验结论、缺陷项、附件与处置轨迹。',
  [{ label: '质检记录工作台', href: '/quality/records', description: '返回质检工作台。' }],
);

export default function QualityRecordDetailPage() {
  return <RoutePlaceholderPage {...props} />;
}
