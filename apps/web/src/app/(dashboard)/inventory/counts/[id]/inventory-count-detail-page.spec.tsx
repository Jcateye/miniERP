import { describe, expect, it } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import InventoryCountDetailPage from './page';

describe('inventory count detail page contract', () => {
  it('renders a real T3 detail page instead of the stocktake detail assembly', async () => {
    const page = await InventoryCountDetailPage({
      params: Promise.resolve({ id: 'count-test-001' }),
    });
    const markup = renderToStaticMarkup(page);

    expect(markup).toContain('盘点详情');
    expect(markup).toContain('data-testid="inventory-count-detail-header"');
    expect(markup).toContain('data-testid="inventory-count-detail-summary"');
    expect(markup).toContain('data-testid="inventory-count-detail-sections"');
    expect(markup).toContain('返回盘点列表');
    expect(markup).toContain('href="/inventory/counts"');
    expect(markup).toContain('count-test-001');
    expect(markup).not.toContain('DOC-ADJ-20260303-001');
    expect(markup).not.toContain('复核并调整');
    expect(markup).not.toContain('盘点差异、复核与调整凭证。');
  });
});
