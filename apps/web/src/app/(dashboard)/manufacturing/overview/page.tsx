import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';

const props = buildRoutePlaceholderProps(
  'T1',
  '/manufacturing/overview',
  '制造总览',
  '承接生产订单、工单、BOM 与质检链路的统一入口。',
  [
    { label: 'BOM 工作台', href: '/mdm/boms', description: '先从产品结构入口进入。' },
    { label: '质量记录', href: '/quality/records', description: '查看质检域骨架。' },
  ],
);

export default function ManufacturingOverviewPage() {
  return <RoutePlaceholderPage {...props} />;
}
