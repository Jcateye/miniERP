import { describe, expect, it, mock } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

mock.module('next/navigation', () => ({
  usePathname: () => '/procure/receipts',
  useRouter: () => ({
    replace: () => undefined,
  }),
  useSearchParams: () => new URLSearchParams(''),
}));

import ProcureReceiptsPage from './page';
import {
  buildGoodsReceiptListRows,
  GOODS_RECEIPT_LIST_COLUMNS,
  GOODS_RECEIPT_PAGE_PRESENTATION,
  buildGoodsReceiptSearchQuery,
  filterGoodsReceiptListItems,
  parseGoodsReceiptSearchParams,
  type GoodsReceiptListItem,
} from './receipts-page';
import { ProcureReceiptsPageScaffold } from './receipts-page-view';

describe('procure receipts page contract', () => {
  it('uses procure-receipts-specific T2 page presentation', () => {
    expect(GOODS_RECEIPT_PAGE_PRESENTATION).toMatchObject({
      family: 'T2',
      variant: 'search-list',
      title: '收货单管理',
      summary: 'GRN 收货单 · 采购入库',
      primaryActionLabel: '新建收货',
      searchPlaceholder: '搜索GRN编号, PO编号, 供应商...',
      detailHrefBase: '/procure/receipts',
    });
  });

  it('uses design-aligned goods receipt table columns', () => {
    expect(GOODS_RECEIPT_LIST_COLUMNS.map((column) => column.label)).toEqual([
      'GRN编号',
      '关联PO',
      '供应商',
      '仓库',
      '数量',
      '过账时间',
      '状态',
    ]);
  });

  it('parses and builds keyword search params for the search-list page', () => {
    const searchParams = new URLSearchParams('keyword=GRN-20260306');

    expect(parseGoodsReceiptSearchParams(searchParams)).toEqual({ keyword: 'GRN-20260306' });
    expect(buildGoodsReceiptSearchQuery({ keyword: '  华为技术  ' })).toBe('keyword=%E5%8D%8E%E4%B8%BA%E6%8A%80%E6%9C%AF');
    expect(buildGoodsReceiptSearchQuery({ keyword: '   ' })).toBe('');
  });

  it('filters items by GRN number, PO number, and supplier keyword', () => {
    const items = [
      {
        id: 'grn_1',
        grnNumber: 'DOC-GRN-20260306-005',
        purchaseOrderNumber: 'DOC-PO-20260305-008',
        supplierName: '华为技术',
        warehouseName: '深圳总仓',
        quantityLabel: '150',
        postedAtLabel: '03-06 14:30',
        statusLabel: '已过账',
      },
      {
        id: 'grn_2',
        grnNumber: 'DOC-GRN-20260307-002',
        purchaseOrderNumber: 'DOC-PO-20260306-013',
        supplierName: '立讯精密',
        warehouseName: '苏州成品仓',
        quantityLabel: '80',
        postedAtLabel: '03-07 09:10',
        statusLabel: '草稿',
      },
    ] satisfies GoodsReceiptListItem[];

    expect(filterGoodsReceiptListItems(items, { keyword: 'GRN-20260306' })).toHaveLength(1);
    expect(filterGoodsReceiptListItems(items, { keyword: 'PO-20260306-013' })).toHaveLength(1);
    expect(filterGoodsReceiptListItems(items, { keyword: '华为' })).toHaveLength(1);
    expect(filterGoodsReceiptListItems(items, { keyword: '' })).toHaveLength(2);
  });

  it('maps seeded items into design-shaped goods receipt rows', () => {
    const rows = buildGoodsReceiptListRows([
      {
        id: 'grn_1',
        grnNumber: 'DOC-GRN-20260306-005',
        purchaseOrderNumber: 'DOC-PO-20260305-008',
        supplierName: '华为技术',
        warehouseName: '深圳总仓',
        quantityLabel: '150',
        postedAtLabel: '03-06 14:30',
        statusLabel: '已过账',
      } satisfies GoodsReceiptListItem,
    ]);

    expect(rows).toEqual([
      {
        id: 'grn_1',
        grnNumber: 'DOC-GRN-20260306-005',
        purchaseOrderNumber: 'DOC-PO-20260305-008',
        supplierName: '华为技术',
        warehouseName: '深圳总仓',
        quantity: '150',
        postedAt: '03-06 14:30',
        status: '已过账',
      },
    ]);
  });

  it('falls back missing display fields to design-safe placeholders', () => {
    const rows = buildGoodsReceiptListRows([
      {
        id: 'grn_2',
        grnNumber: 'DOC-GRN-20260307-002',
        purchaseOrderNumber: null,
        supplierName: null,
        warehouseName: null,
        quantityLabel: null,
        postedAtLabel: null,
        statusLabel: null,
      } satisfies GoodsReceiptListItem,
    ]);

    expect(rows[0]).toMatchObject({
      purchaseOrderNumber: '—',
      supplierName: '—',
      warehouseName: '—',
      quantity: '—',
      postedAt: '—',
      status: '—',
    });
  });

  it('renders design scaffold regions for the procure receipts page', () => {
    const markup = renderToStaticMarkup(
      <ProcureReceiptsPageScaffold
        title={GOODS_RECEIPT_PAGE_PRESENTATION.title}
        summary={GOODS_RECEIPT_PAGE_PRESENTATION.summary}
        primaryActionLabel={GOODS_RECEIPT_PAGE_PRESENTATION.primaryActionLabel}
        primaryActionHref="/procure/receipts/new"
        searchPlaceholder={GOODS_RECEIPT_PAGE_PRESENTATION.searchPlaceholder}
        table={<div>table-body</div>}
      />,
    );

    expect(markup).toContain('data-testid="procure-receipts-topbar"');
    expect(markup).toContain('data-testid="procure-receipts-search"');
    expect(markup).toContain('data-testid="procure-receipts-table"');
    expect(markup).toContain('收货单管理');
    expect(markup).toContain('GRN 收货单 · 采购入库');
    expect(markup).toContain('新建收货');
    expect(markup).toContain('搜索GRN编号, PO编号, 供应商...');
    expect(markup).toContain('href="/procure/receipts/new"');
  });

  it('renders the real page without legacy workbench copy', () => {
    const markup = renderToStaticMarkup(<ProcureReceiptsPage />);

    expect(markup).toContain('收货单管理');
    expect(markup).toContain('GRN 收货单 · 采购入库');
    expect(markup).toContain('搜索GRN编号, PO编号, 供应商...');
    expect(markup).toContain('GRN编号');
    expect(markup).toContain('关联PO');
    expect(markup).toContain('供应商');
    expect(markup).toContain('仓库');
    expect(markup).toContain('数量');
    expect(markup).toContain('过账时间');
    expect(markup).toContain('状态');
    expect(markup).toContain('DOC-GRN-20260306-005');
    expect(markup).toContain('DOC-PO-20260305-008');
    expect(markup).toContain('华为技术');
    expect(markup).toContain('深圳总仓');
    expect(markup).toContain('已过账');
    expect(markup).not.toContain('根据安全库存与在途量自动生成建议单');
    expect(markup).not.toContain('SKU');
    expect(markup).not.toContain('动作');
    expect(markup).not.toContain('优先级');
  });
});
