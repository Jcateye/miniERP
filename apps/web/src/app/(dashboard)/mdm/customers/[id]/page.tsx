import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';

const props = buildRoutePlaceholderProps(
  'T3',
  '/mdm/customers/:id',
  '客户详情',
  '承接客户基础信息、开票抬头、信用与关联单据。',
  [
    { label: '客户主数据', href: '/mdm/customers', description: '返回客户工作台。' },
    { label: '销售订单', href: '/sales/orders', description: '查看客户下游业务链。' },
  ],
);

export default function CustomerDetailPage() {
  return <RoutePlaceholderPage {...props} />;
}
