import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';

const props = buildRoutePlaceholderProps(
  'T3',
  '/mdm/suppliers/:id',
  '供应商详情',
  '承接供应商收款信息、账期、采购关联与合规记录。',
  [
    { label: '供应商主数据', href: '/mdm/suppliers', description: '返回供应商工作台。' },
    { label: '采购订单', href: '/procure/purchase-orders', description: '查看上游采购业务。' },
  ],
);

export default function SupplierDetailPage() {
  return <RoutePlaceholderPage {...props} />;
}
