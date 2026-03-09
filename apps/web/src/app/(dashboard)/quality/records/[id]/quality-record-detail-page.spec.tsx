import { describe, expect, it } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import QualityRecordDetailPage from './page';

describe('quality record detail page contract', () => {
  it('renders a real T3 detail page instead of the placeholder shell', async () => {
    const page = await QualityRecordDetailPage({
      params: Promise.resolve({ id: 'qc-test-001' }),
    });
    const markup = renderToStaticMarkup(page);

    expect(markup).toContain('质检记录详情');
    expect(markup).toContain('data-testid="quality-record-detail-header"');
    expect(markup).toContain('data-testid="quality-record-detail-summary"');
    expect(markup).toContain('data-testid="quality-record-detail-sections"');
    expect(markup).toContain('检验结论');
    expect(markup).toContain('缺陷项');
    expect(markup).toContain('附件');
    expect(markup).toContain('处置轨迹');
    expect(markup).toContain('返回质检记录');
    expect(markup).toContain('href="/quality/records"');
    expect(markup).toContain('qc-test-001');
    expect(markup).not.toContain('QC-20260308-001');
    expect(markup).not.toContain('迁移中');
    expect(markup).not.toContain('Tab 内容');
    expect(markup).not.toContain('概览、证据、审计三类内容都将统一到这个详情模板');
  });
});
