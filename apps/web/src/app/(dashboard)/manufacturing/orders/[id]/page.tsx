import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';

const props = buildRoutePlaceholderProps(
  'T3',
  '/manufacturing/orders/:id',
  '生产订单详情',
  '承接工单、领退料、报工与完工入库明细。',
  [{ label: '生产订单工作台', href: '/manufacturing/orders', description: '返回生产订单列表。' }],
);

export default function ManufacturingOrderDetailPage() {
  return <RoutePlaceholderPage {...props} />;
}
