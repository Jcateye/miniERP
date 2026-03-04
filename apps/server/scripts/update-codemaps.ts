import * as fs from 'node:fs';
import * as path from 'node:path';
import { evaluateApprovalGate } from '../src/codemap/approval-gate';
import { buildDiffSummary, computeCodemapDiffPercent } from '../src/codemap/compute-diff';
import { renderCodemaps } from '../src/codemap/render-codemaps';
import { buildSourceGraph } from '../src/codemap/scan-source-graph';

interface CliOptions {
  readonly threshold: number;
  readonly dryRun: boolean;
  readonly yes: boolean;
}

function parseNumber(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    throw new Error(`Invalid number value: ${value}`);
  }

  return parsed;
}

function parseCliOptions(args: readonly string[]): CliOptions {
  const thresholdFlagIndex = args.findIndex((arg) => arg === '--threshold');
  const threshold =
    thresholdFlagIndex >= 0
      ? (() => {
          const thresholdValue = args[thresholdFlagIndex + 1];
          if (typeof thresholdValue === 'undefined') {
            throw new Error('Missing value for --threshold');
          }
          return parseNumber(thresholdValue);
        })()
      : 30;

  return {
    threshold,
    dryRun: args.includes('--dry-run'),
    yes: args.includes('--yes'),
  };
}

function ensureDirectory(targetDir: string): void {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
}

function readIfExists(filePath: string): string | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return fs.readFileSync(filePath, 'utf8');
}

function formatDiffLine(name: string, diffPercent: number, baseline: boolean): string {
  if (baseline) {
    return `- ${name}: baseline`;
  }
  return `- ${name}: ${diffPercent}%`;
}

async function updateCodemaps(): Promise<void> {
  const options = parseCliOptions(process.argv.slice(2));
  const repoRoot = path.resolve(__dirname, '../../..');
  const codemapDir = path.join(repoRoot, 'codemaps');
  const reportsDir = path.join(repoRoot, '.reports');

  const architecturePath = path.join(codemapDir, 'architecture.md');
  const backendPath = path.join(codemapDir, 'backend.md');
  const frontendPath = path.join(codemapDir, 'frontend.md');
  const dataPath = path.join(codemapDir, 'data.md');
  const reportPath = path.join(reportsDir, 'codemap-diff.txt');

  const graph = buildSourceGraph(repoRoot);
  const nextMaps = renderCodemaps(graph);

  const diffSummary = buildDiffSummary({
    architecture: computeCodemapDiffPercent(readIfExists(architecturePath), nextMaps.architecture),
    backend: computeCodemapDiffPercent(readIfExists(backendPath), nextMaps.backend),
    frontend: computeCodemapDiffPercent(readIfExists(frontendPath), nextMaps.frontend),
    data: computeCodemapDiffPercent(readIfExists(dataPath), nextMaps.data),
  });

  const approval = await evaluateApprovalGate({
    overallDiffPercent: diffSummary.overallDiffPercent,
    threshold: options.threshold,
    assumeYes: options.yes,
  });

  const reportLines = [
    `timestamp=${new Date().toISOString()}`,
    `threshold=${options.threshold}`,
    `overallDiffPercent=${diffSummary.overallDiffPercent}`,
    formatDiffLine('architecture', diffSummary.architecture.diffPercent, diffSummary.architecture.baseline),
    formatDiffLine('backend', diffSummary.backend.diffPercent, diffSummary.backend.baseline),
    formatDiffLine('frontend', diffSummary.frontend.diffPercent, diffSummary.frontend.baseline),
    formatDiffLine('data', diffSummary.data.diffPercent, diffSummary.data.baseline),
    `approvalRequired=${approval.required}`,
    `approved=${approval.approved}`,
    `approvalReason=${approval.reason}`,
    `dryRun=${options.dryRun}`,
  ];

  ensureDirectory(reportsDir);
  fs.writeFileSync(reportPath, `${reportLines.join('\n')}\n`, 'utf8');

  if (!approval.approved) {
    console.error('Codemap update aborted: approval is required.');
    process.exit(2);
  }

  if (options.dryRun) {
    console.log('Codemap dry-run finished. Diff report updated at .reports/codemap-diff.txt');
    return;
  }

  ensureDirectory(codemapDir);
  fs.writeFileSync(architecturePath, nextMaps.architecture, 'utf8');
  fs.writeFileSync(backendPath, nextMaps.backend, 'utf8');
  fs.writeFileSync(frontendPath, nextMaps.frontend, 'utf8');
  fs.writeFileSync(dataPath, nextMaps.data, 'utf8');

  console.log('Codemap update finished.');
  console.log(`- ${path.relative(repoRoot, architecturePath)}`);
  console.log(`- ${path.relative(repoRoot, backendPath)}`);
  console.log(`- ${path.relative(repoRoot, frontendPath)}`);
  console.log(`- ${path.relative(repoRoot, dataPath)}`);
  console.log(`- ${path.relative(repoRoot, reportPath)}`);
}

updateCodemaps().catch((error) => {
  console.error('Failed to update codemaps:', error);
  process.exit(1);
});
