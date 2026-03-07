import { renderToStaticMarkup } from 'react-dom/server';

import {
  buildPaymentListRows,
  PAYMENT_LIST_COLUMNS,
  PAYMENT_PAGE_PRESENTATION,
  PAYMENT_PAGE_SEED_NOTICE,
  type PaymentListItem,
} from './payments-page';
import { PaymentsPageScaffold } from './payments-page-view';

describe('payments page contract', () => {
  it('uses payment-specific T2 page presentation', () => {
    expect(PAYMENT_PAGE_PRESENTATION).toMatchObject({
      family: 'T2',
      variant: 'simple-list',
      title: '付款管理',
      summary: 'Payments · 供应商付款',
      primaryActionLabel: '新建付款',
      seedNotice: PAYMENT_PAGE_SEED_NOTICE,
      detailHrefBase: '/finance/payments',
    });
  });

  it('uses design-aligned payment table columns', () => {
    expect(PAYMENT_LIST_COLUMNS.map((column) => column.label)).toEqual([
      '付款编号',
      '供应商',
      '日期',
      '金额',
      '方式',
      '已核销',
      '状态',
    ]);
  });

  it('maps seeded items into design-shaped payment rows', () => {
    const rows = buildPaymentListRows([
      {
        id: 'pay_1',
        code: 'DOC-PAY-20260304-012',
        supplierName: '华为技术',
        paymentDate: '2026-03-04',
        amountLabel: '¥45,200',
        methodLabel: '电汇',
        reconciledAmountLabel: '¥45,200',
        status: 'confirmed',
      } satisfies PaymentListItem,
    ]);

    expect(rows).toEqual([
      {
        id: 'pay_1',
        code: 'DOC-PAY-20260304-012',
        supplierName: '华为技术',
        paymentDate: '2026-03-04',
        amount: '¥45,200',
        method: '电汇',
        reconciledAmount: '¥45,200',
        status: '待审批',
        detailHref: undefined,
      },
    ]);
  });

  it('falls back missing display fields to design-safe placeholders', () => {
    const rows = buildPaymentListRows([
      {
        id: 'pay_2',
        code: 'DOC-PAY-20260305-003',
        supplierName: '立讯精密',
        paymentDate: '2026-03-05',
        amountLabel: '¥12,800',
        methodLabel: null,
        reconciledAmountLabel: null,
        status: 'settled',
      } satisfies PaymentListItem,
    ]);

    expect(rows[0]).toMatchObject({
      method: '—',
      reconciledAmount: '—',
      status: '已核销',
    });
  });

  it('does not expose detail href while detail page is still placeholder', () => {
    const rows = buildPaymentListRows([
      {
        id: 'payment/with-slash',
        code: 'DOC-PAY-20260305-004',
        supplierName: '特殊供应商',
        paymentDate: '2026-03-05',
        amountLabel: '¥1,000',
        methodLabel: '电汇',
        reconciledAmountLabel: '¥0',
        status: 'draft',
      } satisfies PaymentListItem,
    ]);

    expect(rows[0]?.detailHref).toBeUndefined();
  });

  it('maps unknown status into explicit fallback label', () => {
    const rows = buildPaymentListRows([
      {
        id: 'pay_3',
        code: 'DOC-PAY-20260306-001',
        supplierName: '未知状态供应商',
        paymentDate: '2026-03-06',
        amountLabel: '¥5,000',
        methodLabel: '电汇',
        reconciledAmountLabel: '¥0',
        status: 'reversed' as PaymentListItem['status'],
      } satisfies PaymentListItem,
    ]);

    expect(rows[0]?.status).toBe('未知状态');
  });

  it('renders design scaffold regions for the payment page', () => {
    const markup = renderToStaticMarkup(
      <PaymentsPageScaffold
        title={PAYMENT_PAGE_PRESENTATION.title}
        summary={PAYMENT_PAGE_PRESENTATION.summary}
        primaryActionLabel={PAYMENT_PAGE_PRESENTATION.primaryActionLabel}
        seedNotice={PAYMENT_PAGE_PRESENTATION.seedNotice}
        table={<div>table-body</div>}
      />,
    );

    expect(markup).toContain('data-testid="payments-topbar"');
    expect(markup).toContain('data-testid="payments-seed-notice"');
    expect(markup).toContain('data-testid="payments-table"');
    expect(markup).not.toContain('data-testid="payments-search"');
    expect(markup).not.toContain('data-testid="payments-filter-chips"');
    expect(markup).toContain('付款管理');
    expect(markup).toContain('Payments · 供应商付款');
    expect(markup).toContain(PAYMENT_PAGE_SEED_NOTICE);
    expect(markup).toContain('新建付款');
    expect(markup).toContain('disabled');
    expect(markup).not.toContain('/finance/payments/new');
  });
});
