import { RoutePlaceholderPage, buildRoutePlaceholderProps } from '@/components/business/route-placeholder-page';

const props = buildRoutePlaceholderProps(
  'T3',
  '/workspace/notifications/:id',
  '通知详情',
  '查看通知来源、关联单据、处理结果与审计轨迹。',
  [
    { label: '通知中心', href: '/workspace/notifications', description: '返回通知列表。' },
    { label: '流程任务', href: '/workflow/tasks', description: '查看后续处理任务。' },
  ],
);

export default function WorkspaceNotificationDetailPage() {
  return <RoutePlaceholderPage {...props} />;
}
