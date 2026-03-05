import type { SourceGraph, SourceGraphNode } from './scan-source-graph';

const MAX_MODULE_ITEMS = 20;
const MAX_EDGE_ITEMS = 25;
const MAX_DEP_ITEMS = 20;

export interface RenderedCodemaps {
  readonly architecture: string;
  readonly backend: string;
  readonly frontend: string;
  readonly data: string;
}

function heading(title: string): string {
  return `# ${title}`;
}

function freshnessLine(timestampIso: string): string {
  return `- Freshness: ${timestampIso}`;
}

function takeLimited(
  values: readonly string[],
  limit: number,
): readonly string[] {
  if (values.length <= limit) {
    return values;
  }
  return values.slice(0, limit);
}

function createLines(values: readonly string[]): string {
  if (values.length === 0) {
    return '- (none)';
  }
  return values.map((value) => `- ${value}`).join('\n');
}

function buildModuleSummary(
  nodes: readonly SourceGraphNode[],
): readonly string[] {
  const grouped = nodes.reduce<Record<string, number>>((acc, node) => {
    const directory = node.filePath.split('/').slice(0, 3).join('/');
    const current = acc[directory] ?? 0;
    return {
      ...acc,
      [directory]: current + 1,
    };
  }, {});

  return Object.entries(grouped)
    .map(([modulePath, count]) => `${modulePath} (${count} files)`)
    .sort((left, right) => {
      const leftCount = Number(left.match(/\((\d+) files\)$/)?.[1] ?? '0');
      const rightCount = Number(right.match(/\((\d+) files\)$/)?.[1] ?? '0');
      if (leftCount !== rightCount) {
        return rightCount - leftCount;
      }
      return left.localeCompare(right);
    });
}

function buildImportEdges(
  nodes: readonly SourceGraphNode[],
): readonly string[] {
  const edges = nodes.flatMap((node) =>
    node.internalImports.map(
      (importPath) => `${node.filePath} -> ${importPath}`,
    ),
  );

  return [...new Set(edges)].sort((left, right) => left.localeCompare(right));
}

function buildExternalDeps(
  nodes: readonly SourceGraphNode[],
): readonly string[] {
  const deps = nodes.flatMap((node) => node.externalImports);
  return [...new Set(deps)].sort((left, right) => left.localeCompare(right));
}

function buildPackageDeps(graph: SourceGraph): readonly string[] {
  return graph.packageDependencies
    .map((pkg) => {
      const dependencyCount = pkg.dependencies.length;
      const devDependencyCount = pkg.devDependencies.length;
      return `${pkg.packageName}: deps=${dependencyCount}, devDeps=${devDependencyCount}`;
    })
    .sort((left, right) => left.localeCompare(right));
}

function buildScopedMap(
  title: string,
  timestampIso: string,
  nodes: readonly SourceGraphNode[],
): string {
  const moduleSummary = buildModuleSummary(nodes);
  const importEdges = buildImportEdges(nodes);
  const externalDeps = buildExternalDeps(nodes);

  const sections = [
    heading(title),
    '',
    freshnessLine(timestampIso),
    `- Files: ${nodes.length}`,
    '',
    '## Key modules',
    createLines(takeLimited(moduleSummary, MAX_MODULE_ITEMS)),
    moduleSummary.length > MAX_MODULE_ITEMS
      ? `- ...truncated (${moduleSummary.length - MAX_MODULE_ITEMS} more)`
      : '',
    '',
    '## Internal import edges',
    createLines(takeLimited(importEdges, MAX_EDGE_ITEMS)),
    importEdges.length > MAX_EDGE_ITEMS
      ? `- ...truncated (${importEdges.length - MAX_EDGE_ITEMS} more)`
      : '',
    '',
    '## External dependencies',
    createLines(takeLimited(externalDeps, MAX_DEP_ITEMS)),
    externalDeps.length > MAX_DEP_ITEMS
      ? `- ...truncated (${externalDeps.length - MAX_DEP_ITEMS} more)`
      : '',
  ].filter((line) => line.length > 0);

  return `${sections.join('\n')}\n`;
}

function isDataRelatedNode(node: SourceGraphNode): boolean {
  if (node.scope === 'backend') {
    return (
      node.filePath.includes('/database/') ||
      node.filePath.includes('/domain/') ||
      node.filePath.includes('/evidence/')
    );
  }

  if (node.scope === 'shared') {
    return (
      node.filePath.includes('/contracts/') || node.filePath.includes('/types/')
    );
  }

  return false;
}

function buildDataMap(graph: SourceGraph): string {
  const dataRelatedNodes = graph.nodes.filter((node) =>
    isDataRelatedNode(node),
  );

  const exportedSymbols = dataRelatedNodes
    .flatMap((node) =>
      node.exportNames.map((symbol) => `${node.filePath}#${symbol}`),
    )
    .sort((left, right) => left.localeCompare(right));

  const packageDeps = buildPackageDeps(graph);

  const sections = [
    heading('Data codemap'),
    '',
    freshnessLine(graph.generatedAt),
    `- Data-related files: ${dataRelatedNodes.length}`,
    '',
    '## Data modules',
    createLines(
      takeLimited(
        dataRelatedNodes.map((node) => node.filePath),
        MAX_MODULE_ITEMS,
      ),
    ),
    dataRelatedNodes.length > MAX_MODULE_ITEMS
      ? `- ...truncated (${dataRelatedNodes.length - MAX_MODULE_ITEMS} more)`
      : '',
    '',
    '## Exported domain/data symbols',
    createLines(takeLimited(exportedSymbols, MAX_EDGE_ITEMS)),
    exportedSymbols.length > MAX_EDGE_ITEMS
      ? `- ...truncated (${exportedSymbols.length - MAX_EDGE_ITEMS} more)`
      : '',
    '',
    '## Workspace package dependency summary',
    createLines(packageDeps),
  ].filter((line) => line.length > 0);

  return `${sections.join('\n')}\n`;
}

export function renderCodemaps(graph: SourceGraph): RenderedCodemaps {
  const backendNodes = graph.nodes.filter((node) => node.scope === 'backend');
  const frontendNodes = graph.nodes.filter((node) => node.scope === 'frontend');

  return {
    architecture: buildScopedMap(
      'Architecture codemap',
      graph.generatedAt,
      graph.nodes,
    ),
    backend: buildScopedMap('Backend codemap', graph.generatedAt, backendNodes),
    frontend: buildScopedMap(
      'Frontend codemap',
      graph.generatedAt,
      frontendNodes,
    ),
    data: buildDataMap(graph),
  };
}
