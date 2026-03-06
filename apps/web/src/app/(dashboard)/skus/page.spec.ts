import {
  buildApiPath,
  buildFilterSummary,
  buildQueryString,
  formatDateTime,
  formatRelativeTime,
  getEmptyStateCopy,
  getStatusTabKey,
  hasActiveFilters,
  mapStatusLabel,
  parseFilters,
} from './sku-page-utils';

describe('sku page helpers', () => {
  it('parses filters from search params', () => {
    const params = new URLSearchParams('code=SKU-001&name=HDMI&isActive=true');

    expect(parseFilters(params)).toEqual({
      code: 'SKU-001',
      name: 'HDMI',
      isActive: 'true',
    });
  });

  it('builds query string with active filters only', () => {
    expect(
      buildQueryString({
        code: ' SKU-001 ',
        name: ' HDMI ',
        isActive: 'false',
      }),
    ).toBe('code=SKU-001&name=HDMI&isActive=false');
  });

  it('builds api path', () => {
    expect(
      buildApiPath({
        code: 'SKU-001',
        name: '',
        isActive: '',
      }),
    ).toBe('/api/bff/skus?code=SKU-001');
  });

  it('detects active filters', () => {
    expect(hasActiveFilters({ code: '', name: '', isActive: '' })).toBe(false);
    expect(hasActiveFilters({ code: 'A', name: '', isActive: '' })).toBe(true);
  });

  it('builds readable filter summary', () => {
    expect(
      buildFilterSummary({
        code: 'SKU-001',
        name: 'HDMI',
        isActive: 'true',
      }),
    ).toBe('名称包含“HDMI” · 编码包含“SKU-001” · 仅看启用');

    expect(buildFilterSummary({ code: '', name: '', isActive: '' })).toBe('全部 SKU');
  });

  it('builds empty state copy for filter and default states', () => {
    expect(
      getEmptyStateCopy({
        filters: { code: 'SKU-001', name: '', isActive: '' },
        total: 0,
      }),
    ).toEqual({
      title: '没有匹配的 SKU',
      description: '请调整名称、编码或状态筛选条件后重试。当前筛选：编码包含“SKU-001”。',
    });

    expect(
      getEmptyStateCopy({
        filters: { code: '', name: '', isActive: '' },
        total: 0,
      }),
    ).toEqual({
      title: '暂无 SKU 数据',
      description: '当前还没有可展示的 SKU，待后端返回数据后会显示在这里。',
    });
  });

  it('formats relative time safely', () => {
    expect(formatRelativeTime('invalid-date', '2026-03-06T10:00:00.000Z')).toBe('时间未知');
    expect(formatRelativeTime('2026-03-06T08:30:00.000Z', '2026-03-06T10:00:00.000Z')).toBe(
      '约 2 小时前更新',
    );
    expect(formatRelativeTime('2026-03-06T09:58:30.000Z', '2026-03-06T10:00:00.000Z')).toBe(
      '刚刚更新',
    );
  });

  it('maps status label', () => {
    expect(mapStatusLabel(true)).toBe('启用');
    expect(mapStatusLabel(false)).toBe('停用');
  });

  it('formats datetime safely', () => {
    expect(formatDateTime('invalid-date')).toBe('invalid-date');
    expect(formatDateTime('2026-03-06T10:00:00.000Z')).toContain('2026');
  });
});
