import { describe, expect, it } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import NewInventoryCountPage from './page';

describe('new inventory count page contract', () => {
  it('renders a real T4 new page instead of the stocktake wizard assembly', () => {
    const markup = renderToStaticMarkup(<NewInventoryCountPage />);

    expect(markup).toContain('新建盘点');
    expect(markup).toContain('data-testid="new-inventory-count-header"');
    expect(markup).toContain('data-testid="new-inventory-count-steps"');
    expect(markup).toContain('data-testid="new-inventory-count-sections"');
    expect(markup).toContain('返回盘点列表');
    expect(markup).toContain('href="/inventory/counts"');
    expect(markup).toContain('基础信息');
    expect(markup).toContain('盘点范围');
    expect(markup).toContain('复核提交');
    expect(markup).not.toContain('提交盘点');
    expect(markup).not.toContain('执行盘点、差异复核与调整建议生成。');
  });
});
