import { renderToStaticMarkup } from 'react-dom/server';

import {
  buildReceiptListRows,
  RECEIPT_LIST_COLUMNS,
  RECEIPT_PAGE_PRESENTATION,
  RECEIPT_PAGE_SEED_NOTICE,
  type ReceiptListItem,
} from './receipts-page';
import { ReceiptsPageScaffold } from './receipts-page-view';

describe('receipts page contract', () => {
  it('uses receipt-specific T2 page presentation', () => {
    expect(RECEIPT_PAGE_PRESENTATION).toMatchObject({
      family: 'T2',
      variant: 'simple-list',
      title: '收款管理',
      summary: 'Receipts · 客户收款',
      primaryActionLabel: '新建收款',
      seedNotice: RECEIPT_PAGE_SEED_NOTICE,
      detailHrefBase: '/finance/receipts',
    });
  });

  it('uses design-aligned receipt table columns', () => {
    expect(RECEIPT_LIST_COLUMNS.map((column) => column.label)).toEqual([
      '收款编号',
      '客户',
      '日期',
      '金额',
      '方式',
      '已核销',
      '状态',
    ]);
  });

  it('maps seeded items into design-shaped receipt rows', () => {
    const rows = buildReceiptListRows([
      {
        id: 'rec_1',
        code: 'DOC-REC-20260306-008',
        customerName: '中兴通讯',
        receiptDate: '2026-03-06',
        amountLabel: '¥128,000',
        methodLabel: '银行转账',
        reconciledAmountLabel: '¥128,000',
        status: 'settled',
      } satisfies ReceiptListItem,
    ]);

    expect(rows).toEqual([
      {
        id: 'rec_1',
        code: 'DOC-REC-20260306-008',
        customerName: '中兴通讯',
        receiptDate: '2026-03-06',
        amount: '¥128,000',
        method: '银行转账',
        reconciledAmount: '¥128,000',
        status: '已核销',
        detailHref: undefined,
      },
    ]);
  });

  it('falls back missing display fields to design-safe placeholders', () => {
    const rows = buildReceiptListRows([
      {
        id: 'rec_2',
        code: 'DOC-REC-20260307-002',
        customerName: '华南电子',
        receiptDate: '2026-03-07',
        amountLabel: '¥86,400',
        methodLabel: null,
        reconciledAmountLabel: null,
        status: 'confirmed',
      } satisfies ReceiptListItem,
    ]);

    expect(rows[0]).toMatchObject({
      method: '—',
      reconciledAmount: '—',
      status: '待核销',
    });
  });

  it('does not expose detail href while detail page is still placeholder', () => {
    const rows = buildReceiptListRows([
      {
        id: 'receipt/with-slash',
        code: 'DOC-REC-20260307-003',
        customerName: '特殊客户',
        receiptDate: '2026-03-07',
        amountLabel: '¥1,000',
        methodLabel: '银行转账',
        reconciledAmountLabel: '¥0',
        status: 'draft',
      } satisfies ReceiptListItem,
    ]);

    expect(rows[0]?.detailHref).toBeUndefined();
  });

  it('maps unknown status into explicit fallback label', () => {
    const rows = buildReceiptListRows([
      {
        id: 'rec_3',
        code: 'DOC-REC-20260308-001',
        customerName: '未知状态客户',
        receiptDate: '2026-03-08',
        amountLabel: '¥5,000',
        methodLabel: '银行转账',
        reconciledAmountLabel: '¥0',
        status: 'reversed' as ReceiptListItem['status'],
      } satisfies ReceiptListItem,
    ]);

    expect(rows[0]?.status).toBe('未知状态');
  });

  it('renders design scaffold regions for the receipt page', () => {
    const markup = renderToStaticMarkup(
      <ReceiptsPageScaffold
        title={RECEIPT_PAGE_PRESENTATION.title}
        summary={RECEIPT_PAGE_PRESENTATION.summary}
        primaryActionLabel={RECEIPT_PAGE_PRESENTATION.primaryActionLabel}
        seedNotice={RECEIPT_PAGE_PRESENTATION.seedNotice}
        table={<div>table-body</div>}
      />,
    );

    expect(markup).toContain('data-testid="receipts-topbar"');
    expect(markup).toContain('data-testid="receipts-seed-notice"');
    expect(markup).toContain('data-testid="receipts-table"');
    expect(markup).not.toContain('data-testid="receipts-search"');
    expect(markup).not.toContain('data-testid="receipts-filter-chips"');
    expect(markup).toContain('收款管理');
    expect(markup).toContain('Receipts · 客户收款');
    expect(markup).toContain(RECEIPT_PAGE_SEED_NOTICE);
    expect(markup).toContain('新建收款');
    expect(markup).toContain('disabled');
    expect(markup).not.toContain('/finance/receipts/new');
  });
});
