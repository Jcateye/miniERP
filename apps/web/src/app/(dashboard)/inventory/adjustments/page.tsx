import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';

const props = buildRoutePlaceholderProps(
  'T2',
  '/inventory/adjustments',
  '库存调整工作台',
  '承接调整单、差异核对、冲销与幂等回放。',
  [
    { label: '盘点工作台', href: '/inventory/counts', description: '当前已落地盘点相关页面。' },
    { label: '库存流水', href: '/inventory/ledger', description: '查看调整后的台账效果。' },
  ],
);

export default function InventoryAdjustmentsPage() {
  return <RoutePlaceholderPage {...props} />;
}
