import type { FilterTabItem } from '@/components/ui';

export type SkuListItem = {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  specification: string | null;
  baseUnit: string;
  categoryId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SkuListResponse = {
  data: SkuListItem[];
  total: number;
  message?: string;
};

export type SkuFilters = {
  code: string;
  name: string;
  isActive: '' | 'true' | 'false';
};

export type SkuRow = Record<string, string> & {
  id: string;
  searchHint: string;
};

const FALLBACK_EMPTY_STATE = {
  title: '暂无 SKU 数据',
  description: '当前还没有可展示的 SKU，待后端返回数据后会显示在这里。',
} as const;

const STATUS_LABELS: Record<SkuFilters['isActive'], string> = {
  '': '全部',
  'true': '启用',
  'false': '停用',
};

export const STATUS_TABS: FilterTabItem[] = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '启用' },
  { key: 'inactive', label: '停用' },
];

export function parseFilters(searchParams: URLSearchParams): SkuFilters {
  const isActive = searchParams.get('isActive');

  return {
    code: searchParams.get('code')?.trim() ?? '',
    name: searchParams.get('name')?.trim() ?? '',
    isActive: isActive === 'true' || isActive === 'false' ? isActive : '',
  };
}

export function buildQueryString(filters: SkuFilters): string {
  const params = new URLSearchParams();

  if (filters.code.trim()) {
    params.set('code', filters.code.trim());
  }

  if (filters.name.trim()) {
    params.set('name', filters.name.trim());
  }

  if (filters.isActive) {
    params.set('isActive', filters.isActive);
  }

  return params.toString();
}

export function buildApiPath(filters: SkuFilters): string {
  const query = buildQueryString(filters);
  return query ? `/api/bff/skus?${query}` : '/api/bff/skus';
}

export function hasActiveFilters(filters: SkuFilters): boolean {
  return (
    filters.code.trim().length > 0 ||
    filters.name.trim().length > 0 ||
    filters.isActive.length > 0
  );
}

export function getStatusTabKey(isActive: SkuFilters['isActive']): string {
  if (isActive === 'true') {
    return 'active';
  }

  if (isActive === 'false') {
    return 'inactive';
  }

  return 'all';
}

export function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatRelativeTime(value: string, nowValue: string = new Date().toISOString()): string {
  const date = new Date(value);
  const now = new Date(nowValue);

  if (Number.isNaN(date.getTime()) || Number.isNaN(now.getTime())) {
    return '时间未知';
  }

  const diffMs = now.getTime() - date.getTime();

  if (diffMs <= 90_000) {
    return '刚刚更新';
  }

  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 60) {
    return `约 ${diffMinutes} 分钟前更新`;
  }

  const diffHours = Math.max(1, Math.round(diffMinutes / 60));
  if (diffHours < 24) {
    return `约 ${diffHours} 小时前更新`;
  }

  const diffDays = Math.max(1, Math.round(diffHours / 24));
  return `约 ${diffDays} 天前更新`;
}

export function mapStatusLabel(isActive: boolean): string {
  return isActive ? '启用' : '停用';
}

export function buildStatusTabs(items: SkuListItem[]): FilterTabItem[] {
  const counts = items.reduce(
    (summary, item) => ({
      ...summary,
      all: summary.all + 1,
      active: summary.active + (item.isActive ? 1 : 0),
      inactive: summary.inactive + (item.isActive ? 0 : 1),
    }),
    { all: 0, active: 0, inactive: 0 },
  );

  return STATUS_TABS.map((tab) => ({
    ...tab,
    count: counts[tab.key as keyof typeof counts],
  }));
}

function buildSingleFilterSummary(label: string, value: string): string {
  return `${label}包含“${value.trim()}”`;
}

export function buildFilterSummary(filters: SkuFilters): string {
  const summaryParts = [
    filters.name.trim() ? buildSingleFilterSummary('名称', filters.name) : '',
    filters.code.trim() ? buildSingleFilterSummary('编码', filters.code) : '',
    filters.isActive ? `仅看${STATUS_LABELS[filters.isActive]}` : '',
  ].filter((value) => value.length > 0);

  return summaryParts.length > 0 ? summaryParts.join(' · ') : '全部 SKU';
}

export function buildResultSummary(total: number, filters: SkuFilters): string {
  return `共 ${total} 条 · ${buildFilterSummary(filters)}`;
}

export function mapRows(items: SkuListItem[], nowValue: string = new Date().toISOString()): SkuRow[] {
  return items.map((item) => ({
    id: item.id,
    code: item.code,
    name: item.name,
    specification: item.specification ?? '—',
    baseUnit: item.baseUnit,
    categoryId: item.categoryId ?? '未分类',
    status: mapStatusLabel(item.isActive),
    updatedAt: formatDateTime(item.updatedAt),
    searchHint: formatRelativeTime(item.updatedAt, nowValue),
  }));
}

export function getQuickPreviewFields(item: SkuListItem, nowValue: string = new Date().toISOString()) {
  return [
    { label: '状态', value: mapStatusLabel(item.isActive) },
    { label: '最近更新', value: formatRelativeTime(item.updatedAt, nowValue) },
    { label: '规格', value: item.specification ?? '—' },
    { label: '基础单位', value: item.baseUnit },
    { label: '分类', value: item.categoryId ?? '未分类' },
    { label: '租户', value: item.tenantId },
    { label: '创建时间', value: formatDateTime(item.createdAt) },
    { label: '更新时间', value: formatDateTime(item.updatedAt) },
  ];
}

export function getEmptyStateCopy({
  filters,
  total,
}: {
  filters: SkuFilters;
  total: number;
}): {
  title: string;
  description: string;
} {
  if (total > 0 || !hasActiveFilters(filters)) {
    return FALLBACK_EMPTY_STATE;
  }

  const activeSummary = buildFilterSummary(filters)
    .replace(' · 仅看', '，状态为')
    .replace(' · ', '，');

  return {
    title: '没有匹配的 SKU',
    description: `请调整名称、编码或状态筛选条件后重试。当前筛选：${activeSummary}。`,
  };
}
