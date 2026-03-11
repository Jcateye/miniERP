import { renderToStaticMarkup } from 'react-dom/server';

import ReportsPage from './page';
import {
  REPORTS_CENTER_ENTRY_GROUPS,
  REPORTS_CENTER_KPIS,
  REPORTS_PAGE_PRESENTATION,
} from './reports-page';
import { ReportsPageScaffold } from './reports-page-view';

describe('reports page contract', () => {
  it('uses reports-specific T1 page presentation', () => {
    expect(REPORTS_PAGE_PRESENTATION).toMatchObject({
      family: 'T1',
      title: '报表中心',
      summary: '数据洞察 · 多维分析 · 自定义报表',
    });
  });

  it('uses design-aligned report center groups and KPI cards', () => {
    expect(REPORTS_CENTER_ENTRY_GROUPS.map((group) => group.title)).toEqual([
      '采购分析',
      '销售分析',
      '库存分析',
      '财务报表',
      '快捷入口',
    ]);

    expect(REPORTS_CENTER_KPIS.map((card) => card.label)).toEqual([
      'SKU 总数',
      '当前库存总量',
      '本月采购额',
      '本月销售额',
    ]);
  });

  it('renders design scaffold regions for the reports center page', () => {
    const markup = renderToStaticMarkup(
      <ReportsPageScaffold
        title={REPORTS_PAGE_PRESENTATION.title}
        summary={REPORTS_PAGE_PRESENTATION.summary}
        kpis={REPORTS_CENTER_KPIS}
        groups={REPORTS_CENTER_ENTRY_GROUPS}
      />,
    );

    expect(markup).toContain('data-testid="reports-topbar"');
    expect(markup).toContain('data-testid="reports-kpis"');
    expect(markup).toContain('data-testid="reports-groups"');
    expect(markup).toContain('报表中心');
    expect(markup).toContain('数据洞察 · 多维分析 · 自定义报表');
    expect(markup).toContain('采购分析');
    expect(markup).toContain('销售分析');
    expect(markup).toContain('库存分析');
    expect(markup).toContain('财务报表');
    expect(markup).toContain('SKU 报表');
    expect(markup).toContain('库存报表');
    expect(markup).toContain('采购报表');
    expect(markup).toContain('销售报表');
    expect(markup).toContain('报价报表');
    expect(markup).toContain('href="/reports/sku"');
    expect(markup).toContain('href="/reports/inventory"');
    expect(markup).toContain('href="/reports/purchase"');
    expect(markup).toContain('href="/reports/sales"');
    expect(markup).toContain('href="/reports/quotation"');
  });

  it('renders the real page instead of legacy overview assembly output', () => {
    const markup = renderToStaticMarkup(<ReportsPage />);

    expect(markup).toContain('报表中心');
    expect(markup).toContain('SKU 总数');
    expect(markup).toContain('当前库存总量');
    expect(markup).toContain('本月采购额');
    expect(markup).toContain('本月销售额');
    expect(markup).toContain('SKU 报表');
    expect(markup).toContain('库存报表');
    expect(markup).toContain('采购报表');
    expect(markup).toContain('销售报表');
    expect(markup).toContain('报价报表');
    expect(markup).not.toContain('OverviewAssembly');
    expect(markup).not.toContain('报表总览工作台');
  });
});
