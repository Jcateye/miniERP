import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';

const props = buildRoutePlaceholderProps(
  'T2',
  '/workspace/todos',
  '工作空间待办',
  '统一承接待审批、待处理与异常任务，并逐步替换为真实流程任务流。',
  [
    { label: '流程任务', href: '/workflow/tasks', description: '查看统一任务中心骨架。' },
    { label: '工作空间首页', href: '/workspace', description: '回到新 IA 首页。' },
  ],
);

export default function WorkspaceTodosPage() {
  return <RoutePlaceholderPage {...props} />;
}
