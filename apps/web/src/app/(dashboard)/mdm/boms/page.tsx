import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';

const props = buildRoutePlaceholderProps(
  'T2',
  '/mdm/boms',
  'BOM 工作台',
  '承接产品结构、版本、生效区间与替代料策略。',
  [
    { label: '物料主数据', href: '/mdm/items', description: '从物料页进入父子件上下文。' },
    { label: '制造总览', href: '/manufacturing/overview', description: '连接制造域的后续流程。' },
  ],
);

export default function BomWorkbenchPage() {
  return <RoutePlaceholderPage {...props} />;
}
