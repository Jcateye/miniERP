import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';

const props = buildRoutePlaceholderProps(
  'T3',
  '/mdm/boms/:id',
  'BOM 详情',
  '承接结构树、版本记录、替代料与引用关系。',
  [
    { label: 'BOM 工作台', href: '/mdm/boms', description: '返回 BOM 列表。' },
    { label: '物料详情', href: '/mdm/items', description: '查看父件与子件主数据。' },
  ],
);

export default function BomDetailPage() {
  return <RoutePlaceholderPage {...props} />;
}
