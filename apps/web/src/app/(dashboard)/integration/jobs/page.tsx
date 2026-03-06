import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';
const props = buildRoutePlaceholderProps('T2', '/integration/jobs', '集成任务工作台', '承接同步任务、重试计划与补偿执行。');
export default function IntegrationJobsPage() {
  return <RoutePlaceholderPage {...props} />;
}
