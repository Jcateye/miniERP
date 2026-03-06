import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';

const props = buildRoutePlaceholderProps(
  'T4',
  '/inventory/transfers/new',
  '新建调拨',
  '承接仓间调拨、库位移动与后续扫描作业。',
  [
    { label: '库存余额', href: '/inventory/balances', description: '先从现有库存工作台确认可用量。' },
    { label: '库存流水', href: '/inventory/ledger', description: '查看调拨后的台账落点。' },
  ],
);

export default function InventoryTransferNewPage() {
  return <RoutePlaceholderPage {...props} />;
}
