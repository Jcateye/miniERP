import { renderToStaticMarkup } from 'react-dom/server';

import ManufacturingOrdersPage from './page';
import {
  buildManufacturingOrderListRows,
  MANUFACTURING_ORDER_LIST_COLUMNS,
  MANUFACTURING_ORDER_PAGE_PRESENTATION,
  type ManufacturingOrderListItem,
} from './manufacturing-orders-page';
import { ManufacturingOrdersPageScaffold } from './manufacturing-orders-page-view';

describe('manufacturing orders page contract', () => {
  it('uses manufacturing-orders-specific T2 page presentation', () => {
    expect(MANUFACTURING_ORDER_PAGE_PRESENTATION).toMatchObject({
      family: 'T2',
      variant: 'simple-list',
      title: '生产订单',
      summary: 'Manufacturing Orders · 下达与齐套',
      primaryActionLabel: '新建生产订单',
      detailHrefBase: '/manufacturing/orders',
    });
  });

  it('uses design-aligned manufacturing order table columns', () => {
    expect(MANUFACTURING_ORDER_LIST_COLUMNS.map((column) => column.label)).toEqual([
      'MO编号',
      '成品',
      'BOM版本',
      '计划数量',
      '计划开工',
      '负责人',
      '状态',
    ]);
  });

  it('maps seeded items into design-shaped manufacturing order rows', () => {
    const rows = buildManufacturingOrderListRows([
      {
        id: 'mo_1',
        orderNumber: 'DOC-MO-20260308-001',
        itemName: 'Mac mini M4 装配批次 A',
        bomVersion: 'BOM v2026.03',
        plannedQuantityLabel: '120 台',
        plannedStartAtLabel: '03-10 08:30',
        ownerName: '李计划',
        statusLabel: '已下达',
      } satisfies ManufacturingOrderListItem,
    ]);

    expect(rows).toEqual([
      {
        id: 'mo_1',
        orderNumber: 'DOC-MO-20260308-001',
        itemName: 'Mac mini M4 装配批次 A',
        bomVersion: 'BOM v2026.03',
        plannedQuantity: '120 台',
        plannedStartAt: '03-10 08:30',
        ownerName: '李计划',
        status: '已下达',
        detailHref: undefined,
      },
    ]);
  });

  it('falls back missing display fields to design-safe placeholders', () => {
    const rows = buildManufacturingOrderListRows([
      {
        id: 'mo_2',
        orderNumber: 'DOC-MO-20260308-002',
        itemName: null,
        bomVersion: null,
        plannedQuantityLabel: null,
        plannedStartAtLabel: null,
        ownerName: null,
        statusLabel: null,
      } satisfies ManufacturingOrderListItem,
    ]);

    expect(rows[0]).toMatchObject({
      itemName: '—',
      bomVersion: '—',
      plannedQuantity: '—',
      plannedStartAt: '—',
      ownerName: '—',
      status: '—',
    });
  });

  it('does not expose detail href while manufacturing order detail page is not implemented', () => {
    const rows = buildManufacturingOrderListRows([
      {
        id: 'mo/slash',
        orderNumber: 'DOC-MO-20260308-003',
        itemName: '测试装配批次',
        bomVersion: 'BOM v2026.02',
        plannedQuantityLabel: '60 台',
        plannedStartAtLabel: '03-11 09:00',
        ownerName: '王排产',
        statusLabel: '待齐套',
      } satisfies ManufacturingOrderListItem,
    ]);

    expect(rows[0]?.detailHref).toBeUndefined();
  });

  it('renders design scaffold regions for the manufacturing orders page', () => {
    const markup = renderToStaticMarkup(
      <ManufacturingOrdersPageScaffold
        title={MANUFACTURING_ORDER_PAGE_PRESENTATION.title}
        summary={MANUFACTURING_ORDER_PAGE_PRESENTATION.summary}
        primaryActionLabel={MANUFACTURING_ORDER_PAGE_PRESENTATION.primaryActionLabel}
        table={<div>table-body</div>}
      />,
    );

    expect(markup).toContain('data-testid="manufacturing-orders-topbar"');
    expect(markup).toContain('data-testid="manufacturing-orders-table"');
    expect(markup).not.toContain('data-testid="manufacturing-orders-search"');
    expect(markup).toContain('生产订单');
    expect(markup).toContain('Manufacturing Orders · 下达与齐套');
    expect(markup).toContain('新建生产订单');
    expect(markup).toContain('disabled');
  });

  it('renders the real page without placeholder copy or pagination footer', () => {
    const markup = renderToStaticMarkup(<ManufacturingOrdersPage />);

    expect(markup).toContain('生产订单');
    expect(markup).toContain('Manufacturing Orders · 下达与齐套');
    expect(markup).toContain('MO编号');
    expect(markup).toContain('成品');
    expect(markup).toContain('BOM版本');
    expect(markup).toContain('计划数量');
    expect(markup).toContain('计划开工');
    expect(markup).toContain('负责人');
    expect(markup).toContain('状态');
    expect(markup).toContain('新建生产订单');
    expect(markup).toContain('disabled');
    expect(markup).toContain('DOC-MO-20260308-001');
    expect(markup).toContain('Mac mini M4 装配批次 A');
    expect(markup).toContain('BOM v2026.03');
    expect(markup).toContain('120 台');
    expect(markup).toContain('03-10 08:30');
    expect(markup).toContain('李计划');
    expect(markup).toContain('已下达');
    expect(markup).not.toContain('生产订单工作台');
    expect(markup).not.toContain('承接生产下达、BOM 版本选择与完工协同');
    expect(markup).not.toContain('1 / 1');
    expect(markup).not.toContain('‹');
    expect(markup).not.toContain('›');
  });
});
