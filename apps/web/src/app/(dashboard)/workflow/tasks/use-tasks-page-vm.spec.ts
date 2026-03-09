import {
  buildWorkflowTasksActiveFilters,
  buildWorkflowTasksNavigationTarget,
  getSeedWorkflowTaskListItems,
  getWorkflowTasksNavigationReplaceTarget,
} from './use-tasks-page-vm';

describe('workflow tasks page vm', () => {
  it('returns seeded workflow task items while upstream source is pending', () => {
    expect(getSeedWorkflowTaskListItems()).toEqual([
      {
        id: 'task_001',
        documentNumber: 'PO-20260305-008',
        documentTypeLabel: '采购单',
        applicantName: '张三',
        summary: '华为技术 · 紧急采购网络设备',
        amountLabel: '¥45,200',
        status: 'pending',
        initiatedByMe: false,
      },
      {
        id: 'task_002',
        documentNumber: 'PAY-20260304-012',
        documentTypeLabel: '付款单',
        applicantName: '李四',
        summary: '深圳创新材料 · 货款支付',
        amountLabel: '¥18,960',
        status: 'approved',
        initiatedByMe: true,
      },
    ]);
  });

  it('returns fresh array and item objects on every call', () => {
    const first = getSeedWorkflowTaskListItems();
    const second = getSeedWorkflowTaskListItems();

    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    expect(second[0]?.documentNumber).toBe('PO-20260305-008');
  });

  it('builds active filters from current input state for immediate list updates', () => {
    expect(
      buildWorkflowTasksActiveFilters({
        keywordInput: ' 张三 ',
        scopeInput: 'mine-pending',
      }),
    ).toEqual({
      keyword: '张三',
      scope: 'mine-pending',
    });
  });

  it('builds navigation target from pathname, keyword, and scope', () => {
    expect(
      buildWorkflowTasksNavigationTarget('/workflow/tasks', {
        keyword: ' 张三 ',
        scope: 'mine-pending',
      }),
    ).toBe('/workflow/tasks?keyword=%E5%BC%A0%E4%B8%89&scope=mine-pending');

    expect(
      buildWorkflowTasksNavigationTarget('/workflow/tasks', {
        keyword: ' ',
        scope: 'mine-pending',
      }),
    ).toBe('/workflow/tasks?scope=mine-pending');
  });

  it('returns null when current URL already matches workflow task filter state', () => {
    expect(
      getWorkflowTasksNavigationReplaceTarget(
        '/workflow/tasks',
        new URLSearchParams('keyword=%E5%BC%A0%E4%B8%89&scope=mine-pending'),
        {
          keyword: ' 张三 ',
          scope: 'mine-pending',
        },
      ),
    ).toBeNull();
  });

  it('returns next URL when workflow task filter state changes', () => {
    expect(
      getWorkflowTasksNavigationReplaceTarget(
        '/workflow/tasks',
        new URLSearchParams('keyword=%E5%BC%A0%E4%B8%89&scope=mine-pending'),
        {
          keyword: ' 李四 ',
          scope: 'mine-approved',
        },
      ),
    ).toBe('/workflow/tasks?keyword=%E6%9D%8E%E5%9B%9B&scope=mine-approved');
  });
});
