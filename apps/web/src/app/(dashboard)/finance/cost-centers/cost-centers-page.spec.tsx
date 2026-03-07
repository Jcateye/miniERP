import { renderToStaticMarkup } from 'react-dom/server';

import FinanceCostCentersPage from './page';
import {
  buildCostCenterListRows,
  COST_CENTER_LIST_COLUMNS,
  COST_CENTER_PAGE_PRESENTATION,
  COST_CENTER_PAGE_SEED_NOTICE,
  type CostCenterListItem,
} from './cost-centers-page';
import { CostCentersPageScaffold } from './cost-centers-page-view';

describe('cost centers page contract', () => {
  it('uses cost-center-specific T2 page presentation', () => {
    expect(COST_CENTER_PAGE_PRESENTATION).toMatchObject({
      family: 'T2',
      variant: 'simple-list',
      title: '成本中心',
      summary: 'Cost Centers · 成本归集',
      primaryActionLabel: '新建成本中心',
      seedNotice: COST_CENTER_PAGE_SEED_NOTICE,
      detailHrefBase: '/finance/cost-centers',
    });
  });

  it('uses design-aligned cost center table columns', () => {
    expect(COST_CENTER_LIST_COLUMNS.map((column) => column.label)).toEqual([
      '编码',
      '名称',
      '负责人',
      '状态',
    ]);
  });

  it('maps seeded items into design-shaped cost center rows', () => {
    const rows = buildCostCenterListRows([
      {
        id: 'cc_1',
        code: 'CC-PROD-SZ',
        name: '深圳生产中心',
        ownerName: '王生产经理',
        statusLabel: '启用',
      } satisfies CostCenterListItem,
    ]);

    expect(rows).toEqual([
      {
        id: 'cc_1',
        code: 'CC-PROD-SZ',
        name: '深圳生产中心',
        ownerName: '王生产经理',
        status: '启用',
        detailHref: undefined,
      },
    ]);
  });

  it('falls back missing display fields to design-safe placeholders', () => {
    const rows = buildCostCenterListRows([
      {
        id: 'cc_2',
        code: 'CC-SHARED',
        name: '共享服务中心',
        ownerName: null,
        statusLabel: null,
      } satisfies CostCenterListItem,
    ]);

    expect(rows[0]).toMatchObject({
      ownerName: '—',
      status: '—',
    });
  });

  it('does not expose detail href while detail page is not implemented', () => {
    const rows = buildCostCenterListRows([
      {
        id: 'cc/slash',
        code: 'CC-SLASH',
        name: '测试中心',
        ownerName: '测试负责人',
        statusLabel: '启用',
      } satisfies CostCenterListItem,
    ]);

    expect(rows[0]?.detailHref).toBeUndefined();
  });

  it('renders the real page without pagination footer', () => {
    const markup = renderToStaticMarkup(<FinanceCostCentersPage />);

    expect(markup).toContain('成本中心');
    expect(markup).toContain('Cost Centers · 成本归集');
    expect(markup).toContain(COST_CENTER_PAGE_SEED_NOTICE);
    expect(markup).toContain('编码');
    expect(markup).toContain('名称');
    expect(markup).toContain('负责人');
    expect(markup).toContain('状态');
    expect(markup).toContain('新建成本中心');
    expect(markup).toContain('disabled');
    expect(markup).toContain('CC-PROD-SZ');
    expect(markup).toContain('深圳生产中心');
    expect(markup).toContain('王生产经理');
    expect(markup).toContain('启用');
    expect(markup).not.toContain('1 / 1');
    expect(markup).not.toContain('‹');
    expect(markup).not.toContain('›');
  });
});
