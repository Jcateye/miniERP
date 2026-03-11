import { renderToStaticMarkup } from 'react-dom/server';

import ReportDetailPage from './page';

describe('report detail page guard', () => {
  it('renders supported report detail routes instead of 404', async () => {
    const page = await ReportDetailPage({ params: Promise.resolve({ slug: 'sales' }) });
    const markup = renderToStaticMarkup(page);

    expect(markup).toContain('销售报表详情');
    expect(markup).toContain('本月销售额');
    expect(markup).toContain('准时发货率');
  });

  it('throws notFound for arbitrary slugs instead of rendering a fake detail page', async () => {
    await expect(ReportDetailPage({ params: Promise.resolve({ slug: 'unknown' }) })).rejects.toThrow(
      'NEXT_HTTP_ERROR_FALLBACK;404',
    );
  });
});
