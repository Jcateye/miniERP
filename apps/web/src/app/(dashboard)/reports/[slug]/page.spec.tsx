import { renderToStaticMarkup } from 'react-dom/server';

import ReportDetailPage from './page';

describe('report detail page guard', () => {
  it('throws notFound for arbitrary slugs instead of rendering a fake detail page', () => {
    expect(() => renderToStaticMarkup(<ReportDetailPage />)).toThrow('NEXT_HTTP_ERROR_FALLBACK;404');
  });
});
