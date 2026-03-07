import { renderToStaticMarkup } from 'react-dom/server';

import {
  buildGlAccountListRows,
  GL_ACCOUNT_LIST_COLUMNS,
  GL_ACCOUNT_PAGE_PRESENTATION,
  GL_ACCOUNT_PAGE_SEED_NOTICE,
  type GlAccountListItem,
} from './gl-accounts-page';
import { GlAccountsPageScaffold } from './gl-accounts-page-view';

describe('gl accounts page contract', () => {
  it('uses gl-account-specific T2 page presentation', () => {
    expect(GL_ACCOUNT_PAGE_PRESENTATION).toMatchObject({
      family: 'T2',
      variant: 'tree-list',
      title: '科目表',
      summary: 'Chart of Accounts · 会计科目',
      primaryActionLabel: '新建科目',
      seedNotice: GL_ACCOUNT_PAGE_SEED_NOTICE,
      detailHrefBase: '/finance/gl-accounts',
    });
  });

  it('uses design-aligned gl account table columns', () => {
    expect(GL_ACCOUNT_LIST_COLUMNS.map((column) => column.label)).toEqual([
      '科目编码',
      '科目名称',
      '类型',
      '币种控制',
      '上级科目',
      '状态',
    ]);
  });

  it('maps seeded items into design-shaped gl account rows', () => {
    const rows = buildGlAccountListRows([
      {
        id: 'gl_1001',
        code: '1001',
        name: '银行存款',
        categoryLabel: '资产',
        currencyControlledLabel: '否',
        parentAccountLabel: null,
        statusLabel: '启用',
        level: 0,
      } satisfies GlAccountListItem,
    ]);

    expect(rows).toEqual([
      {
        id: 'gl_1001',
        code: '1001',
        name: '银行存款',
        category: '资产',
        currencyControlled: '否',
        parentAccount: '—',
        status: '启用',
        detailHref: undefined,
      },
    ]);
  });

  it('adds visual indentation to child account names', () => {
    const rows = buildGlAccountListRows([
      {
        id: 'gl_100101',
        code: '100101',
        name: '工行基本户',
        categoryLabel: '资产',
        currencyControlledLabel: '否',
        parentAccountLabel: '银行存款',
        statusLabel: '启用',
        level: 1,
      } satisfies GlAccountListItem,
    ]);

    expect(rows[0]?.name).toBe('　工行基本户');
  });

  it('falls back missing display fields to design-safe placeholders', () => {
    const rows = buildGlAccountListRows([
      {
        id: 'gl_2202',
        code: '2202',
        name: '应付账款',
        categoryLabel: null,
        currencyControlledLabel: null,
        parentAccountLabel: null,
        statusLabel: '停用',
        level: 0,
      } satisfies GlAccountListItem,
    ]);

    expect(rows[0]).toMatchObject({
      category: '—',
      currencyControlled: '—',
      parentAccount: '—',
      status: '停用',
    });
  });

  it('does not expose detail href while detail page is not implemented', () => {
    const rows = buildGlAccountListRows([
      {
        id: 'gl/slash',
        code: '9999',
        name: '测试科目',
        categoryLabel: '资产',
        currencyControlledLabel: '否',
        parentAccountLabel: null,
        statusLabel: '启用',
        level: 0,
      } satisfies GlAccountListItem,
    ]);

    expect(rows[0]?.detailHref).toBeUndefined();
  });

  it('renders design scaffold regions for the gl accounts page', () => {
    const markup = renderToStaticMarkup(
      <GlAccountsPageScaffold
        title={GL_ACCOUNT_PAGE_PRESENTATION.title}
        summary={GL_ACCOUNT_PAGE_PRESENTATION.summary}
        primaryActionLabel={GL_ACCOUNT_PAGE_PRESENTATION.primaryActionLabel}
        seedNotice={GL_ACCOUNT_PAGE_PRESENTATION.seedNotice}
        table={<div>table-body</div>}
      />,
    );

    expect(markup).toContain('data-testid="gl-accounts-topbar"');
    expect(markup).toContain('data-testid="gl-accounts-seed-notice"');
    expect(markup).toContain('data-testid="gl-accounts-table"');
    expect(markup).not.toContain('data-testid="gl-accounts-search"');
    expect(markup).not.toContain('data-testid="gl-accounts-filter-chips"');
    expect(markup).toContain('科目表');
    expect(markup).toContain('Chart of Accounts · 会计科目');
    expect(markup).toContain(GL_ACCOUNT_PAGE_SEED_NOTICE);
    expect(markup).toContain('新建科目');
    expect(markup).toContain('disabled');
  });
});
