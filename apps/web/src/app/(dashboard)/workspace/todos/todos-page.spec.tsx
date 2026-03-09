import { describe, expect, it, mock } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

mock.module('next/navigation', () => ({
  usePathname: () => '/workspace/todos',
  useRouter: () => ({
    replace: () => undefined,
  }),
  useSearchParams: () => new URLSearchParams(''),
}));

import WorkspaceTodosPage from './page';
import {
  buildWorkspaceTodoListRows,
  buildWorkspaceTodoSearchQuery,
  filterWorkspaceTodoListItems,
  parseWorkspaceTodoSearchParams,
  WORKSPACE_TODO_LIST_COLUMNS,
  WORKSPACE_TODO_PAGE_PRESENTATION,
  type WorkspaceTodoListItem,
} from './todos-page';
import { getNextWorkspaceTodoScope, WorkspaceTodosPageScaffold } from './todos-page-view';

describe('workspace todos page contract', () => {
  it('uses workspace-todo-specific T2 page presentation', () => {
    expect(WORKSPACE_TODO_PAGE_PRESENTATION).toMatchObject({
      family: 'T2',
      variant: 'search-list',
      title: '工作空间待办',
      summary: '待审批 · 待处理 · 异常任务',
      searchPlaceholder: '搜索单据编号, 申请人, 摘要...',
      apiBasePath: '/api/bff/workspace/todos',
    });
  });

  it('uses design-aligned workspace todo table columns', () => {
    expect(WORKSPACE_TODO_LIST_COLUMNS.map((column) => column.label)).toEqual([
      '单据编号',
      '类型',
      '申请人',
      '摘要',
      '金额',
      '操作',
    ]);
  });

  it('maps workspace todo items into design-shaped list rows', () => {
    const rows = buildWorkspaceTodoListRows([
      {
        id: 'todo_001',
        documentNumber: 'PO-20260305-008',
        documentTypeLabel: '采购单',
        applicantName: '张三',
        summary: '华为技术 · 紧急采购网络设备',
        amountLabel: '¥45,200',
        status: 'pending',
      } satisfies WorkspaceTodoListItem,
    ]);

    expect(rows).toEqual([
      {
        id: 'todo_001',
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
    const rows = buildWorkspaceTodoListRows([
      {
        id: 'todo_002',
        documentNumber: 'PAY-20260304-012',
        documentTypeLabel: null,
        applicantName: null,
        summary: null,
        amountLabel: null,
        status: 'delegated',
      } satisfies WorkspaceTodoListItem,
    ]);

    expect(rows[0]).toMatchObject({
      documentType: '—',
      applicantName: '—',
      summary: '—',
      amount: '—',
      actions: 'view-only',
    });
  });

  it('parses and rebuilds workspace todo search params with trimmed values', () => {
    const filters = parseWorkspaceTodoSearchParams(
      new URLSearchParams('keyword=%20张三%20&scope=mine-approved'),
    );

    expect(filters).toEqual({
      keyword: '张三',
      scope: 'mine-approved',
    });

    expect(buildWorkspaceTodoSearchQuery(filters)).toBe(
      'keyword=%E5%BC%A0%E4%B8%89&scope=mine-approved',
    );
  });

  it('filters workspace todo list items by keyword and scope', () => {
    const items: WorkspaceTodoListItem[] = [
      {
        id: 'todo_001',
        documentNumber: 'PO-20260305-008',
        documentTypeLabel: '采购单',
        applicantName: '张三',
        summary: '华为技术 · 紧急采购网络设备',
        amountLabel: '¥45,200',
        status: 'pending',
      },
      {
        id: 'todo_002',
        documentNumber: 'PAY-20260304-012',
        documentTypeLabel: '付款单',
        applicantName: '李四',
        summary: '深圳创新材料 · 货款支付',
        amountLabel: '¥18,960',
        status: 'approved',
      },
    ];

    expect(filterWorkspaceTodoListItems(items, { keyword: '张三', scope: 'mine-pending' })).toHaveLength(1);
    expect(filterWorkspaceTodoListItems(items, { keyword: 'PAY-20260304', scope: 'mine-approved' })).toHaveLength(1);
    expect(filterWorkspaceTodoListItems(items, { keyword: '深圳', scope: 'mine-pending' })).toHaveLength(0);
  });

  it('renders design scaffold regions for the workspace todos page', () => {
    const markup = renderToStaticMarkup(
      <WorkspaceTodosPageScaffold
        title={WORKSPACE_TODO_PAGE_PRESENTATION.title}
        summary={WORKSPACE_TODO_PAGE_PRESENTATION.summary}
        searchPlaceholder={WORKSPACE_TODO_PAGE_PRESENTATION.searchPlaceholder}
        activeScope="mine-pending"
        onScopeChange={() => undefined}
        table={<div>table-body</div>}
      />,
    );

    expect(markup).toContain('data-testid="workspace-todos-topbar"');
    expect(markup).toContain('data-testid="workspace-todos-search"');
    expect(markup).toContain('data-testid="workspace-todos-filter-chips"');
    expect(markup).toContain('data-testid="workspace-todos-table"');
    expect(markup).toContain('工作空间待办');
    expect(markup).toContain('待审批 · 待处理 · 异常任务');
    expect(markup).toContain('搜索单据编号, 申请人, 摘要...');
    expect(markup).toContain('待我审批');
    expect(markup).toContain('我已审批');
    expect(markup).toContain('我发起的');
  });

  it('lets users clear an active scope filter back to all todos', () => {
    expect(getNextWorkspaceTodoScope('mine-pending', 'mine-pending')).toBe('');
    expect(getNextWorkspaceTodoScope('mine-approved', 'mine-pending')).toBe('mine-approved');
  });

  it('renders workspace todo action buttons as disabled placeholders before BFF wiring', () => {
    const markup = renderToStaticMarkup(<WorkspaceTodosPage />);

    expect(markup).toContain('>通过</button>');
    expect(markup).toContain('>驳回</button>');
    expect(markup).toContain('>查看</button>');
    expect(markup).toContain('disabled=""');
  });

  it('renders the real page instead of the workspace placeholder', () => {
    const markup = renderToStaticMarkup(<WorkspaceTodosPage />);

    expect(markup).toContain('工作空间待办');
    expect(markup).toContain('待审批 · 待处理 · 异常任务');
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
    expect(markup).not.toContain('统一承接待审批、待处理与异常任务');
    expect(markup).not.toContain('流程任务');
    expect(markup).not.toContain('工作空间首页');
  });
});
