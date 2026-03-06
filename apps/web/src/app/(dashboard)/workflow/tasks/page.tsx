import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';

const props = buildRoutePlaceholderProps(
  'T2',
  '/workflow/tasks',
  '流程任务中心',
  '统一处理审批、转交、催办与回执通知。',
  [
    { label: '工作空间待办', href: '/workspace/todos', description: '查看工作空间级别的任务入口。' },
    { label: '通知中心', href: '/workspace/notifications', description: '查看任务相关通知。' },
  ],
);

export default function WorkflowTasksPage() {
  return <RoutePlaceholderPage {...props} />;
}
