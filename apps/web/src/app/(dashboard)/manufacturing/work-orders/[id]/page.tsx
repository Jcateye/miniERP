import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';

const props = buildRoutePlaceholderProps(
  'T3',
  '/manufacturing/work-orders/:id',
  '工单详情',
  '承接工序、工作中心、报工结果与质量记录。',
  [{ label: '生产订单工作台', href: '/manufacturing/orders', description: '返回生产视图。' }],
);

export default function WorkOrderDetailPage() {
  return <RoutePlaceholderPage {...props} />;
}
