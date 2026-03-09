import { renderToStaticMarkup } from 'react-dom/server';

import FinanceInvoicesPage from './page';
import {
  buildInvoiceListRows,
  INVOICE_LIST_COLUMNS,
  INVOICE_PAGE_PRESENTATION,
  INVOICE_PAGE_SEED_NOTICE,
  type InvoiceListItem,
} from './invoices-page';
import { InvoicesPageScaffold } from './invoices-page-view';

describe('invoices page contract', () => {
  it('uses invoice-specific T2 page presentation', () => {
    expect(INVOICE_PAGE_PRESENTATION).toMatchObject({
      family: 'T2',
      variant: 'simple-list',
      title: '发票管理',
      summary: 'Invoices · 开票与红冲',
      primaryActionLabel: '新建发票',
      seedNotice: INVOICE_PAGE_SEED_NOTICE,
      detailHrefBase: '/finance/invoices',
    });
  });

  it('uses design-aligned invoice table columns', () => {
    expect(INVOICE_LIST_COLUMNS.map((column) => column.label)).toEqual([
      '发票编号',
      '往来方',
      '开票日期',
      '金额',
      '未结清',
      '票种',
      '状态',
    ]);
  });

  it('maps seeded items into design-shaped invoice rows', () => {
    const rows = buildInvoiceListRows([
      {
        id: 'inv_1',
        code: 'DOC-INV-20260306-003',
        counterpartyName: '华为技术',
        issuedDate: '2026-03-06',
        amountLabel: '¥45,200',
        outstandingAmountLabel: '¥12,000',
        categoryLabel: '增值税专票',
        status: 'issued',
      } satisfies InvoiceListItem,
    ]);

    expect(rows).toEqual([
      {
        id: 'inv_1',
        code: 'DOC-INV-20260306-003',
        counterpartyName: '华为技术',
        issuedDate: '2026-03-06',
        amount: '¥45,200',
        outstandingAmount: '¥12,000',
        category: '增值税专票',
        status: '已开票',
        detailHref: undefined,
      },
    ]);
  });

  it('falls back missing display fields to design-safe placeholders', () => {
    const rows = buildInvoiceListRows([
      {
        id: 'inv_2',
        code: 'DOC-INV-20260307-001',
        counterpartyName: '立讯精密',
        issuedDate: '2026-03-07',
        amountLabel: null,
        outstandingAmountLabel: null,
        categoryLabel: null,
        status: 'settled',
      } satisfies InvoiceListItem,
    ]);

    expect(rows[0]).toMatchObject({
      amount: '—',
      outstandingAmount: '—',
      category: '—',
      status: '已结清',
    });
  });

  it('does not expose detail href while detail page is still placeholder', () => {
    const rows = buildInvoiceListRows([
      {
        id: 'invoice/with-slash',
        code: 'DOC-INV-20260308-002',
        counterpartyName: '特殊往来方',
        issuedDate: '2026-03-08',
        amountLabel: '¥1,000',
        outstandingAmountLabel: '¥0',
        categoryLabel: '电子发票',
        status: 'draft',
      } satisfies InvoiceListItem,
    ]);

    expect(rows[0]?.detailHref).toBeUndefined();
  });

  it('maps unknown status into explicit fallback label', () => {
    const rows = buildInvoiceListRows([
      {
        id: 'inv_3',
        code: 'DOC-INV-20260309-001',
        counterpartyName: '未知状态往来方',
        issuedDate: '2026-03-09',
        amountLabel: '¥5,000',
        outstandingAmountLabel: '¥5,000',
        categoryLabel: '电子发票',
        status: 'archived' as InvoiceListItem['status'],
      } satisfies InvoiceListItem,
    ]);

    expect(rows[0]?.status).toBe('未知状态');
  });

  it('renders design scaffold regions for the invoice page', () => {
    const markup = renderToStaticMarkup(
      <InvoicesPageScaffold
        title={INVOICE_PAGE_PRESENTATION.title}
        summary={INVOICE_PAGE_PRESENTATION.summary}
        primaryActionLabel={INVOICE_PAGE_PRESENTATION.primaryActionLabel}
        seedNotice={INVOICE_PAGE_PRESENTATION.seedNotice}
        table={<div>table-body</div>}
      />,
    );

    expect(markup).toContain('data-testid="invoices-topbar"');
    expect(markup).toContain('data-testid="invoices-seed-notice"');
    expect(markup).toContain('data-testid="invoices-table"');
    expect(markup).not.toContain('data-testid="invoices-search"');
    expect(markup).not.toContain('data-testid="invoices-filter-chips"');
    expect(markup).toContain('发票管理');
    expect(markup).toContain('Invoices · 开票与红冲');
    expect(markup).toContain(INVOICE_PAGE_SEED_NOTICE);
    expect(markup).toContain('新建发票');
    expect(markup).toContain('disabled');
    expect(markup).not.toContain('/finance/invoices/new');
  });

  it('renders the real page instead of the finance placeholder', () => {
    const markup = renderToStaticMarkup(<FinanceInvoicesPage />);

    expect(markup).toContain('发票管理');
    expect(markup).toContain('Invoices · 开票与红冲');
    expect(markup).toContain(INVOICE_PAGE_SEED_NOTICE);
    expect(markup).toContain('发票编号');
    expect(markup).toContain('往来方');
    expect(markup).toContain('开票日期');
    expect(markup).toContain('金额');
    expect(markup).toContain('未结清');
    expect(markup).toContain('票种');
    expect(markup).toContain('状态');
    expect(markup).toContain('DOC-INV-20260306-003');
    expect(markup).toContain('华为技术');
    expect(markup).toContain('增值税专票');
    expect(markup).toContain('已开票');
    expect(markup).not.toContain('承接开票、红冲、归档与单据回写');
    expect(markup).not.toContain('即将开放');
  });
});
