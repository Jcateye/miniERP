import { renderToStaticMarkup } from 'react-dom/server';

import IntegrationJobsPage from './page';
import {
  buildIntegrationJobListRows,
  INTEGRATION_JOB_LIST_COLUMNS,
  INTEGRATION_JOB_PAGE_PRESENTATION,
  type IntegrationJobListItem,
} from './jobs-page';
import { IntegrationJobsPageScaffold } from './jobs-page-view';

describe('integration jobs page contract', () => {
  it('uses integration job-specific T2 page presentation', () => {
    expect(INTEGRATION_JOB_PAGE_PRESENTATION).toMatchObject({
      family: 'T2',
      variant: 'simple-list',
      title: '集成任务',
      summary: 'Integration Jobs · 同步任务调度',
      primaryActionLabel: '新建任务',
      detailHrefBase: '/integration/jobs',
    });
  });

  it('uses design-aligned integration job table columns', () => {
    expect(INTEGRATION_JOB_LIST_COLUMNS.map((column) => column.label)).toEqual([
      '任务名',
      '端点',
      '频率',
      '最近执行',
      '下次执行',
      '状态',
    ]);
  });

  it('maps seeded items into design-shaped integration job rows', () => {
    const rows = buildIntegrationJobListRows([
      {
        id: 'job_customer_sync',
        name: '客户主数据同步',
        endpointName: 'ERP-CRM 同步',
        scheduleLabel: '每 30 分钟',
        lastRunLabel: '10 分钟前',
        nextRunLabel: '20 分钟后',
        statusLabel: '运行中',
      } satisfies IntegrationJobListItem,
    ]);

    expect(rows).toEqual([
      {
        id: 'job_customer_sync',
        name: '客户主数据同步',
        endpoint: 'ERP-CRM 同步',
        schedule: '每 30 分钟',
        lastRun: '10 分钟前',
        nextRun: '20 分钟后',
        status: '运行中',
        detailHref: undefined,
      },
    ]);
  });

  it('falls back missing display fields to design-safe placeholders', () => {
    const rows = buildIntegrationJobListRows([
      {
        id: 'job_missing',
        name: '销售订单补偿',
        endpointName: null,
        scheduleLabel: '',
        lastRunLabel: null,
        nextRunLabel: null,
        statusLabel: null,
      } satisfies IntegrationJobListItem,
    ]);

    expect(rows[0]).toMatchObject({
      endpoint: '—',
      schedule: '—',
      lastRun: '—',
      nextRun: '—',
      status: '—',
    });
  });

  it('does not expose detail href while detail page is not implemented', () => {
    const rows = buildIntegrationJobListRows([
      {
        id: 'job/with-slash',
        name: '测试任务',
        endpointName: 'ERP-WMS 同步',
        scheduleLabel: '每小时',
        lastRunLabel: '刚刚',
        nextRunLabel: '1 小时后',
        statusLabel: '暂停',
      } satisfies IntegrationJobListItem,
    ]);

    expect(rows[0]?.detailHref).toBeUndefined();
  });

  it('renders design scaffold regions for the integration jobs page', () => {
    const markup = renderToStaticMarkup(
      <IntegrationJobsPageScaffold
        title={INTEGRATION_JOB_PAGE_PRESENTATION.title}
        summary={INTEGRATION_JOB_PAGE_PRESENTATION.summary}
        primaryActionLabel={INTEGRATION_JOB_PAGE_PRESENTATION.primaryActionLabel}
        table={<div>table-body</div>}
      />,
    );

    expect(markup).toContain('data-testid="integration-jobs-topbar"');
    expect(markup).toContain('data-testid="integration-jobs-table"');
    expect(markup).not.toContain('data-testid="integration-jobs-search"');
    expect(markup).not.toContain('data-testid="integration-jobs-filter-chips"');
    expect(markup).not.toContain('data-testid="integration-jobs-seed-notice"');
    expect(markup).toContain('集成任务');
    expect(markup).toContain('Integration Jobs · 同步任务调度');
    expect(markup).toContain('新建任务');
    expect(markup).toContain('disabled');
  });

  it('renders the real page without pagination footer', () => {
    const markup = renderToStaticMarkup(<IntegrationJobsPage />);

    expect(markup).toContain('集成任务');
    expect(markup).toContain('Integration Jobs · 同步任务调度');
    expect(markup).toContain('任务名');
    expect(markup).toContain('端点');
    expect(markup).toContain('频率');
    expect(markup).toContain('最近执行');
    expect(markup).toContain('下次执行');
    expect(markup).toContain('状态');
    expect(markup).toContain('新建任务');
    expect(markup).toContain('disabled');
    expect(markup).toContain('客户主数据同步');
    expect(markup).toContain('ERP-CRM 同步');
    expect(markup).toContain('每 30 分钟');
    expect(markup).toContain('10 分钟前');
    expect(markup).toContain('20 分钟后');
    expect(markup).toContain('运行中');
    expect(markup).not.toContain('1 / 1');
    expect(markup).not.toContain('‹');
    expect(markup).not.toContain('›');
    expect(markup).not.toContain('集成任务工作台');
    expect(markup).not.toContain('承接同步任务、重试计划与补偿执行。');
  });
});
