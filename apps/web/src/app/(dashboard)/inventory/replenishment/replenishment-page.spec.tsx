import { renderToStaticMarkup } from 'react-dom/server';

import InventoryReplenishmentPage from './page';
import {
  buildReplenishmentListRows,
  REPLENISHMENT_LIST_COLUMNS,
  REPLENISHMENT_PAGE_PRESENTATION,
  type ReplenishmentListItem,
} from './replenishment-page';
import { InventoryReplenishmentPageScaffold } from './replenishment-page-view';

describe('inventory replenishment page contract', () => {
  it('uses inventory-replenishment-specific T2 page presentation', () => {
    expect(REPLENISHMENT_PAGE_PRESENTATION).toMatchObject({
      family: 'T2',
      variant: 'simple-list',
      title: '补货建议',
      summary: 'Replenishment · 自动补货建议',
      primaryActionLabel: '批量生成PO',
      detailHrefBase: '/inventory/replenishment',
    });
  });

  it('uses design-aligned replenishment table columns', () => {
    expect(REPLENISHMENT_LIST_COLUMNS.map((column) => column.label)).toEqual([
      '物料编号',
      '物料名称',
      '当前库存',
      '安全库存',
      '缺口',
      '建议采购量',
      '交期',
    ]);
  });

  it('maps seeded items into design-shaped replenishment rows', () => {
    const rows = buildReplenishmentListRows([
      {
        id: 'rep_1',
        itemCode: 'ADP-USBC-VGA',
        itemName: 'USB-C转VGA转换器',
        currentStockLabel: '15',
        safetyStockLabel: '50',
        gapLabel: '-35',
        suggestedPurchaseQuantityLabel: '100',
        leadTimeLabel: '7 天',
      } satisfies ReplenishmentListItem,
    ]);

    expect(rows).toEqual([
      {
        id: 'rep_1',
        itemCode: 'ADP-USBC-VGA',
        itemName: 'USB-C转VGA转换器',
        currentStock: '15',
        safetyStock: '50',
        gap: '-35',
        suggestedPurchaseQuantity: '100',
        leadTime: '7 天',
        detailHref: undefined,
      },
    ]);
  });

  it('falls back missing display fields to design-safe placeholders', () => {
    const rows = buildReplenishmentListRows([
      {
        id: 'rep_2',
        itemCode: 'CAB-HDMI-2M',
        itemName: null,
        currentStockLabel: null,
        safetyStockLabel: null,
        gapLabel: null,
        suggestedPurchaseQuantityLabel: null,
        leadTimeLabel: null,
      } satisfies ReplenishmentListItem,
    ]);

    expect(rows[0]).toMatchObject({
      itemName: '—',
      currentStock: '—',
      safetyStock: '—',
      gap: '—',
      suggestedPurchaseQuantity: '—',
      leadTime: '—',
    });
  });

  it('does not expose detail href while replenishment detail page is not implemented', () => {
    const rows = buildReplenishmentListRows([
      {
        id: 'rep/slash',
        itemCode: 'KIT-MULTI-01',
        itemName: '多口转换器套件',
        currentStockLabel: '8',
        safetyStockLabel: '30',
        gapLabel: '-22',
        suggestedPurchaseQuantityLabel: '60',
        leadTimeLabel: '10 天',
      } satisfies ReplenishmentListItem,
    ]);

    expect(rows[0]?.detailHref).toBeUndefined();
  });

  it('renders design scaffold regions for the inventory replenishment page', () => {
    const markup = renderToStaticMarkup(
      <InventoryReplenishmentPageScaffold
        title={REPLENISHMENT_PAGE_PRESENTATION.title}
        summary={REPLENISHMENT_PAGE_PRESENTATION.summary}
        primaryActionLabel={REPLENISHMENT_PAGE_PRESENTATION.primaryActionLabel}
        table={<div>table-body</div>}
      />,
    );

    expect(markup).toContain('data-testid="inventory-replenishment-topbar"');
    expect(markup).toContain('data-testid="inventory-replenishment-table"');
    expect(markup).not.toContain('data-testid="inventory-replenishment-search"');
    expect(markup).toContain('补货建议');
    expect(markup).toContain('Replenishment · 自动补货建议');
    expect(markup).toContain('批量生成PO');
    expect(markup).toContain('disabled');
  });

  it('renders the real page without pagination footer', () => {
    const markup = renderToStaticMarkup(<InventoryReplenishmentPage />);

    expect(markup).toContain('补货建议');
    expect(markup).toContain('Replenishment · 自动补货建议');
    expect(markup).toContain('物料编号');
    expect(markup).toContain('物料名称');
    expect(markup).toContain('当前库存');
    expect(markup).toContain('安全库存');
    expect(markup).toContain('缺口');
    expect(markup).toContain('建议采购量');
    expect(markup).toContain('交期');
    expect(markup).toContain('批量生成PO');
    expect(markup).toContain('disabled');
    expect(markup).toContain('ADP-USBC-VGA');
    expect(markup).toContain('USB-C转VGA转换器');
    expect(markup).toContain('-35');
    expect(markup).toContain('100');
    expect(markup).not.toContain('根据安全库存与在途量自动生成建议单');
    expect(markup).not.toContain('SKU');
    expect(markup).not.toContain('仓库');
    expect(markup).not.toContain('动作');
    expect(markup).not.toContain('优先级');
    expect(markup).not.toContain('1 / 1');
    expect(markup).not.toContain('‹');
    expect(markup).not.toContain('›');
  });
});
