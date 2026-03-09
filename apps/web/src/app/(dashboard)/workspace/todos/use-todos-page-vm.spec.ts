import {
  buildWorkspaceTodosActiveFilters,
  buildWorkspaceTodosNavigationTarget,
  getSeedWorkspaceTodoListItems,
  getWorkspaceTodosNavigationReplaceTarget,
} from './use-todos-page-vm';

describe('workspace todos page vm', () => {
  it('returns seeded workspace todo items while upstream source is pending', () => {
    expect(getSeedWorkspaceTodoListItems()).toEqual([
      {
        id: 'todo_001',
        documentNumber: 'PO-20260305-008',
        documentTypeLabel: '采购单',
        applicantName: '张三',
        summary: '华为技术 · 紧急采购网络设备',
        amountLabel: '¥45,200',
        status: 'pending',
        initiatedByMe: false,
      },
      {
        id: 'todo_002',
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
    const first = getSeedWorkspaceTodoListItems();
    const second = getSeedWorkspaceTodoListItems();

    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    expect(second[0]?.documentNumber).toBe('PO-20260305-008');
  });

  it('builds active filters from current input state for immediate list updates', () => {
    expect(
      buildWorkspaceTodosActiveFilters({
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
      buildWorkspaceTodosNavigationTarget('/workspace/todos', {
        keyword: ' 张三 ',
        scope: 'mine-pending',
      }),
    ).toBe('/workspace/todos?keyword=%E5%BC%A0%E4%B8%89&scope=mine-pending');

    expect(
      buildWorkspaceTodosNavigationTarget('/workspace/todos', {
        keyword: ' ',
        scope: 'mine-pending',
      }),
    ).toBe('/workspace/todos?scope=mine-pending');
  });

  it('returns null when current URL already matches todo filter state', () => {
    expect(
      getWorkspaceTodosNavigationReplaceTarget(
        '/workspace/todos',
        new URLSearchParams('keyword=%E5%BC%A0%E4%B8%89&scope=mine-pending'),
        {
          keyword: ' 张三 ',
          scope: 'mine-pending',
        },
      ),
    ).toBeNull();
  });

  it('returns next URL when todo filter state changes', () => {
    expect(
      getWorkspaceTodosNavigationReplaceTarget(
        '/workspace/todos',
        new URLSearchParams('keyword=%E5%BC%A0%E4%B8%89&scope=mine-pending'),
        {
          keyword: ' 李四 ',
          scope: 'mine-approved',
        },
      ),
    ).toBe('/workspace/todos?keyword=%E6%9D%8E%E5%9B%9B&scope=mine-approved');
  });
});
