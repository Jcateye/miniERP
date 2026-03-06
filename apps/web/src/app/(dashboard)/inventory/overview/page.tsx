import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';

const props = buildRoutePlaceholderProps(
  'T1',
  '/inventory/overview',
  '库存总览',
  '围绕库存余额、台账、盘点、补货与移动作业重构新的库存 P0 入口。',
  [
    { label: '库存余额', href: '/inventory/balances', description: '进入当前真实的库存查询工作台。' },
    { label: '库存流水', href: '/inventory/ledger', description: '查看 append-only 台账与审计。' },
  ],
);

export default function InventoryOverviewPage() {
  return <RoutePlaceholderPage {...props} />;
}
