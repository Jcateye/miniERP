import * as fs from 'node:fs';
import * as path from 'node:path';

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts']);
const EXCLUDED_SEGMENTS = new Set(['node_modules', 'dist', '.next', 'coverage']);
const TEST_FILE_PATTERN = /\.(spec|test)\.[cm]?[jt]sx?$/;

const IMPORT_PATTERN = /(?:import\s+(?:type\s+)?(?:[^'";]+\s+from\s+)?|export\s+[^'";]+\s+from\s+|import\s*\()(['"])([^'"\n]+)\1/g;
const EXPORT_DECL_PATTERN = /export\s+(?:const|let|var|function|class|interface|type|enum)\s+([A-Za-z0-9_]+)/g;

export interface SourceGraphNode {
  readonly filePath: string;
  readonly scope: 'backend' | 'frontend' | 'shared';
  readonly internalImports: readonly string[];
  readonly externalImports: readonly string[];
  readonly exportNames: readonly string[];
}

export interface PackageDependencySummary {
  readonly packageName: string;
  readonly dependencies: readonly string[];
  readonly devDependencies: readonly string[];
}

export interface SourceGraph {
  readonly generatedAt: string;
  readonly rootDir: string;
  readonly nodes: readonly SourceGraphNode[];
  readonly packageDependencies: readonly PackageDependencySummary[];
}

interface CollectOptions {
  readonly includeTestFiles?: boolean;
}

function toPosix(value: string): string {
  return value.split(path.sep).join('/');
}

function normalizeResolvedPath(filePath: string): string {
  return toPosix(path.normalize(filePath));
}

function shouldSkipDirectory(segment: string): boolean {
  return EXCLUDED_SEGMENTS.has(segment);
}

function isSourceFile(filePath: string, includeTestFiles: boolean): boolean {
  const extension = path.extname(filePath);
  if (!SOURCE_EXTENSIONS.has(extension)) {
    return false;
  }

  if (!includeTestFiles && TEST_FILE_PATTERN.test(filePath)) {
    return false;
  }

  if (filePath.endsWith('.d.ts')) {
    return false;
  }

  return true;
}

function detectScope(relativePath: string): SourceGraphNode['scope'] | null {
  if (relativePath.startsWith('apps/server/src/')) {
    return 'backend';
  }

  if (relativePath.startsWith('apps/web/src/')) {
    return 'frontend';
  }

  if (relativePath.startsWith('packages/shared/src/')) {
    return 'shared';
  }

  return null;
}

function gatherSourceFiles(rootDir: string, includeTestFiles: boolean): readonly string[] {
  const stack = [rootDir];
  const files: string[] = [];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      continue;
    }

    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const absolutePath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (shouldSkipDirectory(entry.name)) {
          continue;
        }
        stack.push(absolutePath);
        continue;
      }

      if (entry.isFile() && isSourceFile(absolutePath, includeTestFiles)) {
        files.push(absolutePath);
      }
    }
  }

  return [...files].sort((left, right) => left.localeCompare(right));
}

function tryResolveRelativeImport(
  importerAbsolutePath: string,
  importSpecifier: string,
): string | null {
  const importerDir = path.dirname(importerAbsolutePath);
  const candidateBase = path.resolve(importerDir, importSpecifier);
  const candidates = [
    candidateBase,
    `${candidateBase}.ts`,
    `${candidateBase}.tsx`,
    `${candidateBase}.js`,
    `${candidateBase}.jsx`,
    `${candidateBase}.mts`,
    `${candidateBase}.cts`,
    path.join(candidateBase, 'index.ts'),
    path.join(candidateBase, 'index.tsx'),
    path.join(candidateBase, 'index.js'),
    path.join(candidateBase, 'index.jsx'),
    path.join(candidateBase, 'index.mts'),
    path.join(candidateBase, 'index.cts'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return normalizeResolvedPath(candidate);
    }
  }

  return null;
}

function extractImports(source: string): readonly string[] {
  const imports: string[] = [];
  const matcher = new RegExp(IMPORT_PATTERN);

  for (let match = matcher.exec(source); match !== null; match = matcher.exec(source)) {
    const specifier = match[2]?.trim();
    if (specifier) {
      imports.push(specifier);
    }
  }

  return imports;
}

function extractExports(source: string): readonly string[] {
  const exports: string[] = [];
  const matcher = new RegExp(EXPORT_DECL_PATTERN);

  for (let match = matcher.exec(source); match !== null; match = matcher.exec(source)) {
    const exportedName = match[1]?.trim();
    if (exportedName) {
      exports.push(exportedName);
    }
  }

  return [...new Set(exports)].sort((left, right) => left.localeCompare(right));
}

function normalizeExternalImportSpecifier(importSpecifier: string): string {
  if (importSpecifier.startsWith('@/') || importSpecifier.startsWith('~/')) {
    return importSpecifier.slice(0, 2);
  }

  if (importSpecifier.startsWith('@')) {
    const [scope, name] = importSpecifier.split('/');
    if (scope && name) {
      return `${scope}/${name}`;
    }
    return importSpecifier;
  }

  const [packageName] = importSpecifier.split('/');
  return packageName ?? importSpecifier;
}

function collectPackageDependencies(rootDir: string): readonly PackageDependencySummary[] {
  const packageFiles = [
    path.join(rootDir, 'package.json'),
    path.join(rootDir, 'apps/server/package.json'),
    path.join(rootDir, 'apps/web/package.json'),
    path.join(rootDir, 'packages/shared/package.json'),
  ].filter((candidatePath) => fs.existsSync(candidatePath));

  const summaries = packageFiles.map((packageFilePath) => {
    let parsed: {
      name?: string;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    try {
      const content = fs.readFileSync(packageFilePath, 'utf8');
      parsed = JSON.parse(content) as {
        name?: string;
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
    } catch (error) {
      throw new Error(
        `Failed to parse package file: ${toPosix(path.relative(rootDir, packageFilePath))}. ${(error as Error).message}`,
      );
    }

    const packageName = parsed.name ?? toPosix(path.relative(rootDir, packageFilePath));
    const dependencies = Object.keys(parsed.dependencies ?? {}).sort((left, right) =>
      left.localeCompare(right),
    );
    const devDependencies = Object.keys(parsed.devDependencies ?? {}).sort((left, right) =>
      left.localeCompare(right),
    );

    return {
      packageName,
      dependencies,
      devDependencies,
    } satisfies PackageDependencySummary;
  });

  return [...summaries].sort((left, right) => left.packageName.localeCompare(right.packageName));
}

export function buildSourceGraph(
  rootDir: string,
  options: CollectOptions = {},
): SourceGraph {
  const includeTestFiles = options.includeTestFiles ?? false;
  const resolvedRoot = normalizeResolvedPath(path.resolve(rootDir));
  const sourceFiles = gatherSourceFiles(resolvedRoot, includeTestFiles);
  const normalizedFileSet = new Set(sourceFiles.map((filePath) => normalizeResolvedPath(filePath)));

  const nodes = sourceFiles
    .map((absoluteFilePath) => {
      const normalizedAbsolutePath = normalizeResolvedPath(absoluteFilePath);
      const relativePath = toPosix(path.relative(resolvedRoot, normalizedAbsolutePath));
      const scope = detectScope(relativePath);
      if (!scope) {
        return null;
      }

      const source = fs.readFileSync(normalizedAbsolutePath, 'utf8');
      const imports = extractImports(source);
      const exportNames = extractExports(source);

      const internalImports = imports
        .filter((importSpecifier) => importSpecifier.startsWith('.'))
        .map((importSpecifier) => tryResolveRelativeImport(normalizedAbsolutePath, importSpecifier))
        .filter((resolvedImport): resolvedImport is string =>
          Boolean(resolvedImport && normalizedFileSet.has(resolvedImport)),
        )
        .map((resolvedImportPath) => toPosix(path.relative(resolvedRoot, resolvedImportPath)));

      const externalImports = imports
        .filter((importSpecifier) => !importSpecifier.startsWith('.'))
        .map((importSpecifier) => normalizeExternalImportSpecifier(importSpecifier))
        .filter((importSpecifier) => importSpecifier.length > 0);

      return {
        filePath: relativePath,
        scope,
        internalImports: [...new Set(internalImports)].sort((left, right) =>
          left.localeCompare(right),
        ),
        externalImports: [...new Set(externalImports)].sort((left, right) =>
          left.localeCompare(right),
        ),
        exportNames,
      } satisfies SourceGraphNode;
    })
    .filter((node): node is SourceGraphNode => Boolean(node))
    .sort((left, right) => left.filePath.localeCompare(right.filePath));

  return {
    generatedAt: new Date().toISOString(),
    rootDir: resolvedRoot,
    nodes,
    packageDependencies: collectPackageDependencies(resolvedRoot),
  };
}
