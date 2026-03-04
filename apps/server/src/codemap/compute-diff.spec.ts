import { buildDiffSummary, computeCodemapDiffPercent } from './compute-diff';

describe('computeCodemapDiffPercent', () => {
  it('returns baseline when previous content is missing', () => {
    const result = computeCodemapDiffPercent(null, '# title\n- Freshness: 2026-03-04T00:00:00.000Z\n- A');

    expect(result).toEqual({
      diffPercent: 0,
      baseline: true,
    });
  });

  it('ignores freshness line changes', () => {
    const previous = '# title\n- Freshness: 2026-03-03T00:00:00.000Z\n- A\n- B';
    const next = '# title\n- Freshness: 2026-03-04T00:00:00.000Z\n- A\n- B';

    const result = computeCodemapDiffPercent(previous, next);

    expect(result.baseline).toBe(false);
    expect(result.diffPercent).toBe(0);
  });

  it('computes jaccard-based diff', () => {
    const previous = '# title\n- A\n- B';
    const next = '# title\n- B\n- C';

    const result = computeCodemapDiffPercent(previous, next);

    expect(result.baseline).toBe(false);
    expect(result.diffPercent).toBeCloseTo(50, 2);
  });
});

describe('buildDiffSummary', () => {
  it('uses max diff as overall diff', () => {
    const summary = buildDiffSummary({
      architecture: { diffPercent: 10, baseline: false },
      backend: { diffPercent: 30, baseline: false },
      frontend: { diffPercent: 20, baseline: false },
      data: { diffPercent: 5, baseline: false },
    });

    expect(summary.overallDiffPercent).toBe(30);
  });
});
