import type { TemplateFamily, TemplateFamilyVariant } from '@/contracts/template-contracts';

export type EndpointListItem = {
  readonly id: string;
  readonly name: string;
  readonly typeLabel: string | null;
  readonly url: string | null;
  readonly statusLabel: string | null;
  readonly lastSyncedLabel: string | null;
};

export type EndpointListColumnKey = 'name' | 'type' | 'url' | 'status' | 'lastSynced';

export type EndpointListColumn = {
  readonly key: EndpointListColumnKey;
  readonly label: string;
};

export type EndpointListRow = {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly url: string;
  readonly status: string;
  readonly lastSynced: string;
  readonly detailHref?: string;
};

export type EndpointPagePresentation = {
  readonly family: TemplateFamily;
  readonly variant: TemplateFamilyVariant;
  readonly title: string;
  readonly summary: string;
  readonly primaryActionLabel: string;
  readonly detailHrefBase: string;
};

export const ENDPOINT_PAGE_PRESENTATION: EndpointPagePresentation = {
  family: 'T2',
  variant: 'simple-list',
  title: '集成端点',
  summary: 'Integration Endpoints · 外部系统连接',
  primaryActionLabel: '新建端点',
  detailHrefBase: '/integration/endpoints',
};

export const ENDPOINT_LIST_COLUMNS: readonly EndpointListColumn[] = [
  { key: 'name', label: '名称' },
  { key: 'type', label: '类型' },
  { key: 'url', label: 'URL' },
  { key: 'status', label: '状态' },
  { key: 'lastSynced', label: '最近同步' },
];

function getDisplayValue(value: string | null | undefined): string {
  return value && value.trim() ? value : '—';
}

export function buildEndpointListRows(items: readonly EndpointListItem[]): EndpointListRow[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    type: getDisplayValue(item.typeLabel),
    url: getDisplayValue(item.url),
    status: getDisplayValue(item.statusLabel),
    lastSynced: getDisplayValue(item.lastSyncedLabel),
  }));
}
