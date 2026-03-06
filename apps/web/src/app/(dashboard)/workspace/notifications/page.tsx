import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';

const props = buildRoutePlaceholderProps(
  'T2',
  '/workspace/notifications',
  '通知中心',
  '统一承接审批通知、系统告警与集成回执，并保留后续消息聚合位。',
  [
    { label: '工作空间首页', href: '/workspace', description: '查看新的工作空间入口。' },
    { label: '流程任务', href: '/workflow/tasks', description: '与通知联动的任务中心。' },
  ],
);

export default function WorkspaceNotificationsPage() {
  return <RoutePlaceholderPage {...props} />;
}
