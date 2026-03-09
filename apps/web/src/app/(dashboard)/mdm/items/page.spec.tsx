import { describe, expect, it } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import ItemsPage from './page';

describe('items list page contract', () => {
  it('renders a real T2 items page instead of the SKU route alias', () => {
    const markup = renderToStaticMarkup(<ItemsPage />);

    expect(markup).toContain('SKU 管理');
    expect(markup).toContain('data-testid="items-list-header"');
    expect(markup).toContain('data-testid="items-list-search"');
    expect(markup).toContain('data-testid="items-list-filters"');
    expect(markup).toContain('data-testid="items-list-table"');
    expect(markup).toContain('data-testid="items-list-preview"');
    expect(markup).toContain('导入');
    expect(markup).toContain('导出');
    expect(markup).toContain('新建 SKU');
    expect(markup).toContain('CAB-HDMI-2M');
    expect(markup).toContain('线材');
    expect(markup).not.toContain('物料主数据');
    expect(markup).not.toContain('筛选与分享');
  });
});
