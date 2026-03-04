const FRESHNESS_LINE_PATTERN = /^- Freshness:\s.*$/gm;

export interface CodemapDiffResult {
  readonly diffPercent: number;
  readonly baseline: boolean;
}

function normalizeContent(content: string): readonly string[] {
  const withoutFreshness = content.replace(FRESHNESS_LINE_PATTERN, '');
  return withoutFreshness
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function toUniqueSet(lines: readonly string[]): ReadonlySet<string> {
  return new Set(lines);
}

function countIntersection(
  left: ReadonlySet<string>,
  right: ReadonlySet<string>,
): number {
  let count = 0;
  for (const value of left) {
    if (right.has(value)) {
      count += 1;
    }
  }
  return count;
}

export function computeCodemapDiffPercent(
  previousContent: string | null,
  nextContent: string,
): CodemapDiffResult {
  if (previousContent === null) {
    return {
      diffPercent: 0,
      baseline: true,
    };
  }

  const previousLines = toUniqueSet(normalizeContent(previousContent));
  const nextLines = toUniqueSet(normalizeContent(nextContent));

  if (previousLines.size === 0 && nextLines.size === 0) {
    return {
      diffPercent: 0,
      baseline: false,
    };
  }

  const intersection = countIntersection(previousLines, nextLines);
  const union = new Set([...previousLines, ...nextLines]).size;
  const similarity = union === 0 ? 1 : intersection / union;

  return {
    diffPercent: Number(((1 - similarity) * 100).toFixed(2)),
    baseline: false,
  };
}

export interface DiffSummary {
  readonly architecture: CodemapDiffResult;
  readonly backend: CodemapDiffResult;
  readonly frontend: CodemapDiffResult;
  readonly data: CodemapDiffResult;
  readonly overallDiffPercent: number;
}

export function buildDiffSummary(input: {
  readonly architecture: CodemapDiffResult;
  readonly backend: CodemapDiffResult;
  readonly frontend: CodemapDiffResult;
  readonly data: CodemapDiffResult;
}): DiffSummary {
  const overallDiffPercent = Math.max(
    input.architecture.diffPercent,
    input.backend.diffPercent,
    input.frontend.diffPercent,
    input.data.diffPercent,
  );

  return {
    architecture: input.architecture,
    backend: input.backend,
    frontend: input.frontend,
    data: input.data,
    overallDiffPercent,
  };
}
