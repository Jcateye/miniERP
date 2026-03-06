import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';

const props = buildRoutePlaceholderProps(
  'T1',
  '/finance/overview',
  '财务总览',
  '承接发票、收付款、凭证、总账与预算的统一入口。',
  [
    { label: '报表中心', href: '/reports', description: '当前可复用的经营分析入口。' },
    { label: '集成日志', href: '/integration/logs', description: '查看外部票税和财务接口骨架。' },
  ],
);

export default function FinanceOverviewPage() {
  return <RoutePlaceholderPage {...props} />;
}
