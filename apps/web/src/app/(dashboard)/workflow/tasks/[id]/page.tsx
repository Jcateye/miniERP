import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';

const props = buildRoutePlaceholderProps(
  'T3',
  '/workflow/tasks/:id',
  '流程任务详情',
  '承接审批意见、流转轨迹、证据与关联单据。',
  [{ label: '流程任务中心', href: '/workflow/tasks', description: '返回任务列表。' }],
);

export default function WorkflowTaskDetailPage() {
  return <RoutePlaceholderPage {...props} />;
}
