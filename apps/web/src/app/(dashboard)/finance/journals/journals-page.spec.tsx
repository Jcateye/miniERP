import { renderToStaticMarkup } from 'react-dom/server';

import FinanceJournalsPage from './page';
import {
  buildJournalListRows,
  JOURNAL_LIST_COLUMNS,
  JOURNAL_PAGE_PRESENTATION,
  JOURNAL_PAGE_SEED_NOTICE,
  type JournalListItem,
} from './journals-page';
import { JournalsPageScaffold } from './journals-page-view';

describe('journals page contract', () => {
  it('uses journal-specific T2 page presentation', () => {
    expect(JOURNAL_PAGE_PRESENTATION).toMatchObject({
      family: 'T2',
      variant: 'simple-list',
      title: '凭证管理',
      summary: 'Journals · 总账凭证',
      primaryActionLabel: '新建凭证',
      seedNotice: JOURNAL_PAGE_SEED_NOTICE,
      detailHrefBase: '/finance/journals',
    });
  });

  it('uses design-aligned journal table columns', () => {
    expect(JOURNAL_LIST_COLUMNS.map((column) => column.label)).toEqual([
      '凭证编号',
      '日期',
      '摘要',
      '账簿',
      '借方金额',
      '贷方金额',
      '状态',
    ]);
  });

  it('maps seeded items into design-shaped journal rows', () => {
    const rows = buildJournalListRows([
      {
        id: 'je_1',
        code: 'DOC-JE-20260307-004',
        journalDate: '2026-03-07',
        summaryLabel: '采购收货暂估入账',
        ledgerName: '总账账簿',
        debitAmountLabel: '¥45,200',
        creditAmountLabel: '¥45,200',
        status: 'posted',
      } satisfies JournalListItem,
    ]);

    expect(rows).toEqual([
      {
        id: 'je_1',
        code: 'DOC-JE-20260307-004',
        journalDate: '2026-03-07',
        summary: '采购收货暂估入账',
        ledgerName: '总账账簿',
        debitAmount: '¥45,200',
        creditAmount: '¥45,200',
        status: '已过账',
        detailHref: undefined,
      },
    ]);
  });

  it('falls back missing display fields to design-safe placeholders', () => {
    const rows = buildJournalListRows([
      {
        id: 'je_2',
        code: 'DOC-JE-20260308-001',
        journalDate: '2026-03-08',
        summaryLabel: null,
        ledgerName: '辅助账簿',
        debitAmountLabel: null,
        creditAmountLabel: null,
        status: 'draft',
      } satisfies JournalListItem,
    ]);

    expect(rows[0]).toMatchObject({
      summary: '—',
      debitAmount: '—',
      creditAmount: '—',
      status: '草稿',
    });
  });

  it('does not expose detail href while detail page is still placeholder', () => {
    const rows = buildJournalListRows([
      {
        id: 'journal/with-slash',
        code: 'DOC-JE-20260308-002',
        journalDate: '2026-03-08',
        summaryLabel: '特殊凭证',
        ledgerName: '总账账簿',
        debitAmountLabel: '¥1,000',
        creditAmountLabel: '¥1,000',
        status: 'reversed',
      } satisfies JournalListItem,
    ]);

    expect(rows[0]?.detailHref).toBeUndefined();
  });

  it('maps unknown status into explicit fallback label', () => {
    const rows = buildJournalListRows([
      {
        id: 'je_3',
        code: 'DOC-JE-20260309-001',
        journalDate: '2026-03-09',
        summaryLabel: '未知状态凭证',
        ledgerName: '总账账簿',
        debitAmountLabel: '¥5,000',
        creditAmountLabel: '¥5,000',
        status: 'archived' as JournalListItem['status'],
      } satisfies JournalListItem,
    ]);

    expect(rows[0]?.status).toBe('未知状态');
  });

  it('renders design scaffold regions for the journal page', () => {
    const markup = renderToStaticMarkup(
      <JournalsPageScaffold
        title={JOURNAL_PAGE_PRESENTATION.title}
        summary={JOURNAL_PAGE_PRESENTATION.summary}
        primaryActionLabel={JOURNAL_PAGE_PRESENTATION.primaryActionLabel}
        seedNotice={JOURNAL_PAGE_PRESENTATION.seedNotice}
        table={<div>table-body</div>}
      />,
    );

    expect(markup).toContain('data-testid="journals-topbar"');
    expect(markup).toContain('data-testid="journals-seed-notice"');
    expect(markup).toContain('data-testid="journals-table"');
    expect(markup).not.toContain('data-testid="journals-search"');
    expect(markup).not.toContain('data-testid="journals-filter-chips"');
    expect(markup).toContain('凭证管理');
    expect(markup).toContain('Journals · 总账凭证');
    expect(markup).toContain(JOURNAL_PAGE_SEED_NOTICE);
    expect(markup).toContain('新建凭证');
    expect(markup).toContain('disabled');
    expect(markup).not.toContain('/finance/journals/new');
  });

  it('renders the real page instead of the finance placeholder', () => {
    const markup = renderToStaticMarkup(<FinanceJournalsPage />);

    expect(markup).toContain('凭证管理');
    expect(markup).toContain('Journals · 总账凭证');
    expect(markup).toContain(JOURNAL_PAGE_SEED_NOTICE);
    expect(markup).toContain('凭证编号');
    expect(markup).toContain('日期');
    expect(markup).toContain('摘要');
    expect(markup).toContain('账簿');
    expect(markup).toContain('借方金额');
    expect(markup).toContain('贷方金额');
    expect(markup).toContain('状态');
    expect(markup).toContain('DOC-JE-20260307-004');
    expect(markup).toContain('采购收货暂估入账');
    expect(markup).toContain('总账账簿');
    expect(markup).toContain('已过账');
    expect(markup).not.toContain('承接凭证列表、过账、冲销与期间控制');
    expect(markup).not.toContain('即将开放');
  });
});
