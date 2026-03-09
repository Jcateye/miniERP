import { renderToStaticMarkup } from 'react-dom/server';

import WorkspaceHomePage from './page';
import {
  WORKSPACE_HOME_KPIS,
  WORKSPACE_HOME_PAGE_PRESENTATION,
  WORKSPACE_HOME_RIGHT_PANEL_SECTIONS,
  WORKSPACE_HOME_TODO_ITEMS,
} from './workspace-home-page';
import { WorkspaceHomePageScaffold } from './workspace-home-page-view';

describe('workspace home page contract', () => {
  it('uses workspace-home-specific T1 page presentation', () => {
    expect(WORKSPACE_HOME_PAGE_PRESENTATION).toMatchObject({
      family: 'T1',
      title: '工作台',
      summary: '2026年2月28日 · 周五 · 下午',
      searchPlaceholder: '全局搜索 SKU / 单号 / 供应商…',
    });
  });

  it('uses design-aligned KPI cards and side panels', () => {
    expect(WORKSPACE_HOME_KPIS.map((item) => item.label)).toEqual([
      '低库存 SKU',
      '待入库 GRN',
      '待出库 OUT',
      '延迟 PO',
    ]);

    expect(WORKSPACE_HOME_RIGHT_PANEL_SECTIONS.map((item) => item.title)).toEqual([
      '快捷入口',
      '最近动作',
    ]);
  });

  it('renders design scaffold regions for workspace home', () => {
    const markup = renderToStaticMarkup(
      <WorkspaceHomePageScaffold
        title={WORKSPACE_HOME_PAGE_PRESENTATION.title}
        summary={WORKSPACE_HOME_PAGE_PRESENTATION.summary}
        searchPlaceholder={WORKSPACE_HOME_PAGE_PRESENTATION.searchPlaceholder}
        kpis={WORKSPACE_HOME_KPIS}
        todoItems={WORKSPACE_HOME_TODO_ITEMS}
        rightPanelSections={WORKSPACE_HOME_RIGHT_PANEL_SECTIONS}
      />,
    );

    expect(markup).toContain('data-testid="workspace-home-topbar"');
    expect(markup).toContain('data-testid="workspace-home-kpis"');
    expect(markup).toContain('data-testid="workspace-home-main"');
    expect(markup).toContain('工作台');
    expect(markup).toContain('2026年2月28日 · 周五 · 下午');
    expect(markup).toContain('全局搜索 SKU / 单号 / 供应商…');
    expect(markup).toContain('低库存 SKU');
    expect(markup).toContain('待入库 GRN');
    expect(markup).toContain('待出库 OUT');
    expect(markup).toContain('延迟 PO');
    expect(markup).toContain('全局待办');
    expect(markup).toContain('新建 SKU');
    expect(markup).toContain('入库 GRN-2026-0142 过账');
  });

  it('renders the real page instead of old dashboard export', () => {
    const markup = renderToStaticMarkup(<WorkspaceHomePage />);

    expect(markup).toContain('工作台');
    expect(markup).toContain('低库存 SKU');
    expect(markup).toContain('待入库 GRN');
    expect(markup).toContain('待出库 OUT');
    expect(markup).toContain('延迟 PO');
    expect(markup).toContain('全局待办');
    expect(markup).toContain('新建 SKU');
    expect(markup).toContain('入库 GRN-2026-0142 过账');
    expect(markup).not.toContain('WorkbenchAssembly');
    expect(markup).not.toContain('dashboard 首页');
  });
});
