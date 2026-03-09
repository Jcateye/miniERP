import { describe, expect, it, mock } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

mock.module('next/navigation', () => ({
  usePathname: () => '/workflow/tasks',
  useRouter: () => ({
    replace: () => undefined,
  }),
  useSearchParams: () => new URLSearchParams(''),
}));

import WorkflowTasksPage from './page';
import {
  buildWorkflowTaskListRows,
  buildWorkflowTaskSearchQuery,
  filterWorkflowTaskListItems,
  parseWorkflowTaskSearchParams,
  WORKFLOW_TASK_LIST_COLUMNS,
  WORKFLOW_TASK_PAGE_PRESENTATION,
  type WorkflowTaskListItem,
} from './tasks-page';
import { getNextWorkflowTaskScope, WorkflowTasksPageScaffold } from './tasks-page-view';

describe('workflow tasks page contract', () => {
  it('uses workflow task-specific T2 page presentation', () => {
    expect(WORKFLOW_TASK_PAGE_PRESENTATION).toMatchObject({
      family: 'T2',
      variant: 'search-list',
      title: '审批任务',
      summary: '待我审批 · 我已审批 · 审批管理',
      searchPlaceholder: '搜索审批单号, 申请人...',
      apiBasePath: '/api/bff/workflow/tasks',
    });
  });

  it('uses design-aligned workflow task table columns', () => {
    expect(WORKFLOW_TASK_LIST_COLUMNS.map((column) => column.label)).toEqual([
      '单据编号',
      '类型',
      '申请人',
      '摘要',
      '金额',
      '操作',
    ]);
  });

  it('maps workflow task items into design-shaped list rows', () => {
    const rows = buildWorkflowTaskListRows([
      {
        id: 'task_001',
        documentNumber: 'PO-20260305-008',
        documentTypeLabel: '采购单',
        applicantName: '张三',
        summary: '华为技术 · 紧急采购网络设备',
        amountLabel: '¥45,200',
        status: 'pending',
      } satisfies WorkflowTaskListItem,
    ]);

    expect(rows).toEqual([
      {
        id: 'task_001',
        documentNumber: 'PO-20260305-008',
        documentType: '采购单',
        applicantName: '张三',
        summary: '华为技术 · 紧急采购网络设备',
        amount: '¥45,200',
        actions: 'approve-reject',
      },
    ]);
  });

  it('falls back missing display fields to design-safe placeholders', () => {
    const rows = buildWorkflowTaskListRows([
      {
        id: 'task_002',
        documentNumber: 'PAY-20260304-012',
        documentTypeLabel: null,
        applicantName: null,
        summary: null,
        amountLabel: null,
        status: 'delegated',
      } satisfies WorkflowTaskListItem,
    ]);

    expect(rows[0]).toMatchObject({
      documentType: '—',
      applicantName: '—',
      summary: '—',
      amount: '—',
      actions: 'view-only',
    });
  });

  it('parses and rebuilds workflow task search params with trimmed values', () => {
    const filters = parseWorkflowTaskSearchParams(
      new URLSearchParams('keyword=%20张三%20&scope=mine-approved'),
    );

    expect(filters).toEqual({
      keyword: '张三',
      scope: 'mine-approved',
    });

    expect(buildWorkflowTaskSearchQuery(filters)).toBe(
      'keyword=%E5%BC%A0%E4%B8%89&scope=mine-approved',
    );
  });

  it('filters workflow task list items by keyword and scope', () => {
    const items: WorkflowTaskListItem[] = [
      {
        id: 'task_001',
        documentNumber: 'PO-20260305-008',
        documentTypeLabel: '采购单',
        applicantName: '张三',
        summary: '华为技术 · 紧急采购网络设备',
        amountLabel: '¥45,200',
        status: 'pending',
      },
      {
        id: 'task_002',
        documentNumber: 'PAY-20260304-012',
        documentTypeLabel: '付款单',
        applicantName: '李四',
        summary: '深圳创新材料 · 货款支付',
        amountLabel: '¥18,960',
        status: 'approved',
      },
    ];

    expect(filterWorkflowTaskListItems(items, { keyword: '张三', scope: 'mine-pending' })).toHaveLength(1);
    expect(filterWorkflowTaskListItems(items, { keyword: 'PAY-20260304', scope: 'mine-approved' })).toHaveLength(1);
    expect(filterWorkflowTaskListItems(items, { keyword: '深圳', scope: 'mine-pending' })).toHaveLength(0);
  });

  it('renders design scaffold regions for the workflow tasks page', () => {
    const markup = renderToStaticMarkup(
      <WorkflowTasksPageScaffold
        title={WORKFLOW_TASK_PAGE_PRESENTATION.title}
        summary={WORKFLOW_TASK_PAGE_PRESENTATION.summary}
        searchPlaceholder={WORKFLOW_TASK_PAGE_PRESENTATION.searchPlaceholder}
        activeScope="mine-pending"
        onScopeChange={() => undefined}
        table={<div>table-body</div>}
      />,
    );

    expect(markup).toContain('data-testid="workflow-tasks-topbar"');
    expect(markup).toContain('data-testid="workflow-tasks-search"');
    expect(markup).toContain('data-testid="workflow-tasks-filter-chips"');
    expect(markup).toContain('data-testid="workflow-tasks-table"');
    expect(markup).toContain('审批任务');
    expect(markup).toContain('待我审批 · 我已审批 · 审批管理');
    expect(markup).toContain('搜索审批单号, 申请人...');
    expect(markup).toContain('待我审批');
    expect(markup).toContain('我已审批');
    expect(markup).toContain('我发起的');
  });

  it('lets users clear an active scope filter back to all tasks', () => {
    expect(getNextWorkflowTaskScope('mine-pending', 'mine-pending')).toBe('');
    expect(getNextWorkflowTaskScope('mine-approved', 'mine-pending')).toBe('mine-approved');
  });

  it('renders workflow task action buttons as disabled placeholders before BFF wiring', () => {
    const markup = renderToStaticMarkup(<WorkflowTasksPage />);

    expect(markup).toContain('>通过</button>');
    expect(markup).toContain('>驳回</button>');
    expect(markup).toContain('>查看</button>');
    expect(markup).toContain('disabled=""');
  });

  it('renders the real page instead of the workflow placeholder', () => {
    const markup = renderToStaticMarkup(<WorkflowTasksPage />);

    expect(markup).toContain('审批任务');
    expect(markup).toContain('待我审批 · 我已审批 · 审批管理');
    expect(markup).toContain('单据编号');
    expect(markup).toContain('类型');
    expect(markup).toContain('申请人');
    expect(markup).toContain('摘要');
    expect(markup).toContain('金额');
    expect(markup).toContain('操作');
    expect(markup).toContain('待我审批');
    expect(markup).toContain('我已审批');
    expect(markup).toContain('我发起的');
    expect(markup).toContain('PO-20260305-008');
    expect(markup).toContain('PAY-20260304-012');
    expect(markup).toContain('通过');
    expect(markup).toContain('驳回');
    expect(markup).not.toContain('流程任务中心');
    expect(markup).not.toContain('工作空间待办');
    expect(markup).not.toContain('通知中心');
  });
});
