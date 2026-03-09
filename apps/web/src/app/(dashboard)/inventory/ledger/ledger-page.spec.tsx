import { renderToStaticMarkup } from 'react-dom/server';

import InventoryLedgerPage from './page';
import {
  buildInventoryLedgerRows,
  INVENTORY_LEDGER_COLUMNS,
  INVENTORY_LEDGER_PAGE_PRESENTATION,
  type InventoryLedgerItem,
} from './ledger-page';
import { InventoryLedgerPageScaffold } from './ledger-page-view';

describe('inventory ledger page contract', () => {
  it('uses inventory-ledger-specific T2 page presentation', () => {
    expect(INVENTORY_LEDGER_PAGE_PRESENTATION).toMatchObject({
      family: 'T2',
      variant: 'search-list',
      title: '库存流水',
      summary: 'Inventory Ledger · 全量流水审计',
      searchPlaceholder: '搜索物料, 仓库, 单据号...',
      apiBasePath: '/api/bff/inventory/ledger',
    });
  });

  it('uses design-aligned inventory ledger table columns', () => {
    expect(INVENTORY_LEDGER_COLUMNS.map((column) => column.label)).toEqual([
      '日期',
      '物料编号',
      '仓库',
      '事务类型',
      '方向',
      '数量',
      '来源单据',
      '操作人',
    ]);
  });

  it('maps seeded items into design-shaped inventory ledger rows', () => {
    const rows = buildInventoryLedgerRows([
      {
        id: 'ledger_001',
        dateLabel: '03-01 14:20',
        itemCode: 'CAB-ETH-CAT6',
        warehouseName: '深圳总仓',
        businessTypeLabel: '采购入库',
        directionLabel: '入库',
        quantityLabel: '+120',
        documentNumber: 'DOC-PO-20260301-005',
        operatorName: '张三',
      } satisfies InventoryLedgerItem,
    ]);

    expect(rows).toEqual([
      {
        id: 'ledger_001',
        date: '03-01 14:20',
        itemCode: 'CAB-ETH-CAT6',
        warehouseName: '深圳总仓',
        businessType: '采购入库',
        direction: '入库',
        quantity: '+120',
        documentNumber: 'DOC-PO-20260301-005',
        operatorName: '张三',
        detailHref: undefined,
      },
    ]);
  });

  it('renders design scaffold regions for the inventory ledger page', () => {
    const markup = renderToStaticMarkup(
      <InventoryLedgerPageScaffold
        title={INVENTORY_LEDGER_PAGE_PRESENTATION.title}
        summary={INVENTORY_LEDGER_PAGE_PRESENTATION.summary}
        searchPlaceholder={INVENTORY_LEDGER_PAGE_PRESENTATION.searchPlaceholder}
        table={<div>table-body</div>}
      />,
    );

    expect(markup).toContain('data-testid="inventory-ledger-topbar"');
    expect(markup).toContain('data-testid="inventory-ledger-search"');
    expect(markup).toContain('data-testid="inventory-ledger-table"');
    expect(markup).toContain('库存流水');
    expect(markup).toContain('Inventory Ledger · 全量流水审计');
    expect(markup).toContain('搜索物料, 仓库, 单据号...');
    expect(markup).toContain('导出');
    expect(markup).toContain('disabled');
  });

  it('renders the real page instead of legacy assembly output', () => {
    const markup = renderToStaticMarkup(<InventoryLedgerPage />);

    expect(markup).toContain('库存流水');
    expect(markup).toContain('日期');
    expect(markup).toContain('物料编号');
    expect(markup).toContain('仓库');
    expect(markup).toContain('事务类型');
    expect(markup).toContain('方向');
    expect(markup).toContain('数量');
    expect(markup).toContain('来源单据');
    expect(markup).toContain('操作人');
    expect(markup).toContain('DOC-PO-20260301-005');
    expect(markup).toContain('导出');
    expect(markup).not.toContain('WorkbenchAssembly');
    expect(markup).not.toContain('库存流水工作台');
  });
});
