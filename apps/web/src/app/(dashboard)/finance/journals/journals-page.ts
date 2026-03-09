import type { JournalEntryStatus } from '@minierp/shared/types';

export type JournalListItem = {
  readonly id: string;
  readonly code: string;
  readonly journalDate: string;
  readonly summaryLabel: string | null;
  readonly ledgerName: string;
  readonly debitAmountLabel: string | null;
  readonly creditAmountLabel: string | null;
  readonly status: JournalEntryStatus;
};

export type JournalListColumnKey =
  | 'code'
  | 'journalDate'
  | 'summary'
  | 'ledgerName'
  | 'debitAmount'
  | 'creditAmount'
  | 'status';

export type JournalListColumn = {
  readonly key: JournalListColumnKey;
  readonly label: string;
};

export type JournalListRow = {
  readonly id: string;
  readonly code: string;
  readonly journalDate: string;
  readonly summary: string;
  readonly ledgerName: string;
  readonly debitAmount: string;
  readonly creditAmount: string;
  readonly status: string;
  readonly detailHref?: string;
};

export type JournalPagePresentation = {
  readonly family: 'T2';
  readonly variant: 'simple-list';
  readonly title: string;
  readonly summary: string;
  readonly primaryActionLabel: string;
  readonly seedNotice: string;
  readonly detailHrefBase: string;
};

export const JOURNAL_PAGE_SEED_NOTICE = '当前为演示数据列表，真实凭证数据与过账流程尚未接入。';

export const JOURNAL_PAGE_PRESENTATION: JournalPagePresentation = {
  family: 'T2',
  variant: 'simple-list',
  title: '凭证管理',
  summary: 'Journals · 总账凭证',
  primaryActionLabel: '新建凭证',
  seedNotice: JOURNAL_PAGE_SEED_NOTICE,
  detailHrefBase: '/finance/journals',
};

export const JOURNAL_LIST_COLUMNS: readonly JournalListColumn[] = [
  { key: 'code', label: '凭证编号' },
  { key: 'journalDate', label: '日期' },
  { key: 'summary', label: '摘要' },
  { key: 'ledgerName', label: '账簿' },
  { key: 'debitAmount', label: '借方金额' },
  { key: 'creditAmount', label: '贷方金额' },
  { key: 'status', label: '状态' },
];

function getDisplayValue(value: string | null | undefined): string {
  return value && value.trim() ? value : '—';
}

function getJournalStatusLabel(status: JournalEntryStatus): string {
  switch (status) {
    case 'draft':
      return '草稿';
    case 'posted':
      return '已过账';
    case 'reversed':
      return '已冲销';
    case 'cancelled':
      return '已取消';
    default:
      return '未知状态';
  }
}

export function buildJournalListRows(items: readonly JournalListItem[]): JournalListRow[] {
  return items.map((item) => ({
    id: item.id,
    code: item.code,
    journalDate: item.journalDate,
    summary: getDisplayValue(item.summaryLabel),
    ledgerName: item.ledgerName,
    debitAmount: getDisplayValue(item.debitAmountLabel),
    creditAmount: getDisplayValue(item.creditAmountLabel),
    status: getJournalStatusLabel(item.status),
  }));
}
