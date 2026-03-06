import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';

const props = buildRoutePlaceholderProps(
  'T4',
  '/manufacturing/orders/new',
  '新建生产订单',
  '承接成品、数量、BOM 版本与工单拆解。',
  [{ label: '生产订单工作台', href: '/manufacturing/orders', description: '查看生产订单列表骨架。' }],
);

export default function ManufacturingOrderNewPage() {
  return <RoutePlaceholderPage {...props} />;
}
