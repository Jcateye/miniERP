import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';

const props = buildRoutePlaceholderProps(
  'T2',
  '/manufacturing/orders',
  '生产订单工作台',
  '承接生产下达、BOM 版本选择与完工协同。',
  [{ label: '制造总览', href: '/manufacturing/overview', description: '返回制造域入口。' }],
);

export default function ManufacturingOrdersPage() {
  return <RoutePlaceholderPage {...props} />;
}
