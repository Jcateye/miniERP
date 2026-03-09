import type { TemplateFamily, TemplateFamilyVariant } from '@/contracts/template-contracts';

export type IntegrationJobListItem = {
  readonly id: string;
  readonly name: string;
  readonly endpointName: string | null;
  readonly scheduleLabel: string | null;
  readonly lastRunLabel: string | null;
  readonly nextRunLabel: string | null;
  readonly statusLabel: string | null;
};

export type IntegrationJobListColumnKey =
  | 'name'
  | 'endpoint'
  | 'schedule'
  | 'lastRun'
  | 'nextRun'
  | 'status';

export type IntegrationJobListColumn = {
  readonly key: IntegrationJobListColumnKey;
  readonly label: string;
};

export type IntegrationJobListRow = {
  readonly id: string;
  readonly name: string;
  readonly endpoint: string;
  readonly schedule: string;
  readonly lastRun: string;
  readonly nextRun: string;
  readonly status: string;
  readonly detailHref?: string;
};

export type IntegrationJobPagePresentation = {
  readonly family: TemplateFamily;
  readonly variant: TemplateFamilyVariant;
  readonly title: string;
  readonly summary: string;
  readonly primaryActionLabel: string;
  readonly detailHrefBase: string;
};

export const INTEGRATION_JOB_PAGE_PRESENTATION: IntegrationJobPagePresentation = {
  family: 'T2',
  variant: 'simple-list',
  title: '集成任务',
  summary: 'Integration Jobs · 同步任务调度',
  primaryActionLabel: '新建任务',
  detailHrefBase: '/integration/jobs',
};

export const INTEGRATION_JOB_LIST_COLUMNS: readonly IntegrationJobListColumn[] = [
  { key: 'name', label: '任务名' },
  { key: 'endpoint', label: '端点' },
  { key: 'schedule', label: '频率' },
  { key: 'lastRun', label: '最近执行' },
  { key: 'nextRun', label: '下次执行' },
  { key: 'status', label: '状态' },
];

function getDisplayValue(value: string | null | undefined): string {
  return value && value.trim() ? value : '—';
}

export function buildIntegrationJobListRows(
  items: readonly IntegrationJobListItem[],
): IntegrationJobListRow[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    endpoint: getDisplayValue(item.endpointName),
    schedule: getDisplayValue(item.scheduleLabel),
    lastRun: getDisplayValue(item.lastRunLabel),
    nextRun: getDisplayValue(item.nextRunLabel),
    status: getDisplayValue(item.statusLabel),
  }));
}
