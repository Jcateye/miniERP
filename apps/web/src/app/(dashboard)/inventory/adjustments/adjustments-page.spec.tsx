import { renderToStaticMarkup } from 'react-dom/server';

import InventoryAdjustmentsPage from './page';
import {
  ADJUSTMENT_LIST_COLUMNS,
  ADJUSTMENT_PAGE_PRESENTATION,
  buildAdjustmentListRows,
  type AdjustmentListItem,
} from './adjustments-page';
import { InventoryAdjustmentsPageScaffold } from './adjustments-page-view';

describe('inventory adjustments page contract', () => {
  it('uses inventory-adjustment-specific T2 page presentation', () => {
    expect(ADJUSTMENT_PAGE_PRESENTATION).toMatchObject({
      family: 'T2',
      variant: 'simple-list',
      title: '库存调整',
      summary: 'Adjustments · 调整事务',
      primaryActionLabel: '新建调整',
      detailHrefBase: '/inventory/adjustments',
    });
  });

  it('uses design-aligned inventory adjustment table columns', () => {
    expect(ADJUSTMENT_LIST_COLUMNS.map((column) => column.label)).toEqual([
      '调整单号',
      '仓库',
      '日期',
      '行数',
      '调整数量',
      '原因',
      '状态',
    ]);
  });

  it('maps seeded items into design-shaped adjustment rows', () => {
    const rows = buildAdjustmentListRows([
      {
        id: 'adj_1',
        documentNumber: 'DOC-ADJ-20260306-002',
        warehouseName: '深圳总仓',
        dateLabel: '2026-03-06',
        lineCountLabel: '3',
        quantityLabel: '-4',
        reasonLabel: '盘点差异调整',
        statusLabel: '已过账',
      } satisfies AdjustmentListItem,
    ]);

    expect(rows).toEqual([
      {
        id: 'adj_1',
        documentNumber: 'DOC-ADJ-20260306-002',
        warehouseName: '深圳总仓',
        date: '2026-03-06',
        lineCount: '3',
        quantity: '-4',
        reason: '盘点差异调整',
        status: '已过账',
        detailHref: undefined,
      },
    ]);
  });

  it('falls back missing display fields to design-safe placeholders', () => {
    const rows = buildAdjustmentListRows([
      {
        id: 'adj_2',
        documentNumber: 'DOC-ADJ-20260307-001',
        warehouseName: null,
        dateLabel: null,
        lineCountLabel: null,
        quantityLabel: null,
        reasonLabel: null,
        statusLabel: null,
      } satisfies AdjustmentListItem,
    ]);

    expect(rows[0]).toMatchObject({
      warehouseName: '—',
      date: '—',
      lineCount: '—',
      quantity: '—',
      reason: '—',
      status: '—',
    });
  });

  it('does not expose detail href while adjustment detail page is not implemented', () => {
    const rows = buildAdjustmentListRows([
      {
        id: 'adj/slash',
        documentNumber: 'DOC-ADJ-20260307-003',
        warehouseName: '上海分仓',
        dateLabel: '2026-03-07',
        lineCountLabel: '1',
        quantityLabel: '+2',
        reasonLabel: '手工修正',
        statusLabel: '草稿',
      } satisfies AdjustmentListItem,
    ]);

    expect(rows[0]?.detailHref).toBeUndefined();
  });

  it('renders design scaffold regions for the inventory adjustments page', () => {
    const markup = renderToStaticMarkup(
      <InventoryAdjustmentsPageScaffold
        title={ADJUSTMENT_PAGE_PRESENTATION.title}
        summary={ADJUSTMENT_PAGE_PRESENTATION.summary}
        primaryActionLabel={ADJUSTMENT_PAGE_PRESENTATION.primaryActionLabel}
        table={<div>table-body</div>}
      />,
    );

    expect(markup).toContain('data-testid="inventory-adjustments-topbar"');
    expect(markup).toContain('data-testid="inventory-adjustments-table"');
    expect(markup).not.toContain('data-testid="inventory-adjustments-search"');
    expect(markup).toContain('库存调整');
    expect(markup).toContain('Adjustments · 调整事务');
    expect(markup).toContain('新建调整');
    expect(markup).toContain('disabled');
  });

  it('renders the real page without pagination footer', () => {
    const markup = renderToStaticMarkup(<InventoryAdjustmentsPage />);

    expect(markup).toContain('库存调整');
    expect(markup).toContain('Adjustments · 调整事务');
    expect(markup).toContain('调整单号');
    expect(markup).toContain('仓库');
    expect(markup).toContain('日期');
    expect(markup).toContain('行数');
    expect(markup).toContain('调整数量');
    expect(markup).toContain('原因');
    expect(markup).toContain('状态');
    expect(markup).toContain('新建调整');
    expect(markup).toContain('disabled');
    expect(markup).toContain('DOC-ADJ-20260306-002');
    expect(markup).toContain('深圳总仓');
    expect(markup).toContain('盘点差异调整');
    expect(markup).toContain('已过账');
    expect(markup).not.toContain('库存调整工作台');
    expect(markup).not.toContain('盘点工作台');
    expect(markup).not.toContain('库存流水');
    expect(markup).not.toContain('1 / 1');
    expect(markup).not.toContain('‹');
    expect(markup).not.toContain('›');
  });
});
