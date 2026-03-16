import * as fs from 'node:fs';
import * as path from 'node:path';

const SOURCE_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mts',
  '.cts',
]);
const EXCLUDED_SEGMENTS = new Set([
  'node_modules',
  'dist',
  '.next',
  'coverage',
]);
const TEST_FILE_PATTERN = /\.(spec|test)\.[cm]?[jt]sx?$/;

const IMPORT_PATTERN =
  /(?:import\s+(?:type\s+)?(?:[^'";]+\s+from\s+)?|export\s+[^'";]+\s+from\s+|import\s*\(|(?:^|[^\w$.])require\s*\()(['"])([^'"\n]+)\1/g;
const EXPORT_DECL_PATTERN =
  /export\s+(?:const|let|var|function|class|interface|type|enum)\s+([A-Za-z0-9_]+)/g;

const REEXPORT_ALL_FROM_PATTERN = /export\s*\*\s*from\s*(['"])([^'"\n]+)\1/g;
const REEXPORT_NAMED_FROM_PATTERN =
  /export\s*\{([^}]+)\}\s*from\s*(['"])([^'"\n]+)\2/g;

const PRISMA_SERVICE_TOKEN_NAME = 'PRISMA_SERVICE_TOKEN';

export interface SourceGraphNode {
  readonly filePath: string;
  readonly scope: 'backend' | 'frontend' | 'shared';
  readonly internalImports: readonly string[];
  readonly externalImports: readonly string[];
  readonly exportNames: readonly string[];
  readonly reexportAllInternalImports: readonly string[];
  readonly reexportPrismaServiceTokenInternalImports: readonly string[];
  readonly hasPrismaClientUsage: boolean;
  readonly hasPrismaServiceTokenUsage: boolean;
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

type CollectedNode = Omit<SourceGraphNode, 'hasPrismaServiceTokenUsage'> & {
  readonly potentialPrismaServiceTokenUsage: boolean;
  readonly hasPrismaServiceTokenUsage: boolean;
};

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

function gatherSourceFiles(
  rootDir: string,
  includeTestFiles: boolean,
): readonly string[] {
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

function stripBlockAndFullLineComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/(^|\s)\/\/.*$/gm, '$1');
}

function extractImports(source: string): readonly string[] {
  const cleaned = stripBlockAndFullLineComments(source);
  const imports: string[] = [];
  const matcher = new RegExp(IMPORT_PATTERN);

  for (
    let match = matcher.exec(cleaned);
    match !== null;
    match = matcher.exec(cleaned)
  ) {
    const specifier = match[2]?.trim();
    if (specifier) {
      imports.push(specifier);
    }
  }

  return imports;
}

function extractReexportAllTargets(source: string): readonly string[] {
  const cleaned = stripBlockAndFullLineComments(source);
  const targets: string[] = [];
  const matcher = new RegExp(REEXPORT_ALL_FROM_PATTERN);

  for (
    let match = matcher.exec(cleaned);
    match !== null;
    match = matcher.exec(cleaned)
  ) {
    const specifier = match[2]?.trim();
    if (specifier) {
      targets.push(specifier);
    }
  }

  return targets;
}

function extractReexportNamedSpecifiers(
  source: string,
): readonly { name: string; from: string }[] {
  const cleaned = stripBlockAndFullLineComments(source);
  const specifiers: { name: string; from: string }[] = [];
  const matcher = new RegExp(REEXPORT_NAMED_FROM_PATTERN);

  for (
    let match = matcher.exec(cleaned);
    match !== null;
    match = matcher.exec(cleaned)
  ) {
    const namesRaw = match[1];
    const from = match[3]?.trim();

    if (!namesRaw || !from) {
      continue;
    }

    const names = namesRaw
      .split(',')
      .map((item) => item.trim())
      .map((item) => {
        const [left] = item.split(/\s+as\s+/i);
        return left?.trim();
      })
      .filter((value): value is string => Boolean(value && value.length > 0));

    for (const name of names) {
      specifiers.push({ name, from });
    }
  }

  return specifiers;
}

function extractExports(source: string): readonly string[] {
  const exports: string[] = [];
  const matcher = new RegExp(EXPORT_DECL_PATTERN);

  for (
    let match = matcher.exec(source);
    match !== null;
    match = matcher.exec(source)
  ) {
    const exportedName = match[1]?.trim();
    if (exportedName) {
      exports.push(exportedName);
    }
  }

  return [...new Set(exports)].sort((left, right) => left.localeCompare(right));
}

function normalizeExternalImportSpecifierForScope(
  importSpecifier: string,
  scope: SourceGraphNode['scope'],
): string {
  const isPrismaServiceImport =
    importSpecifier === 'apps/server/src/database/prisma.service' ||
    importSpecifier === 'apps/server/src/database/prisma.service.ts' ||
    importSpecifier === '@/database/prisma.service' ||
    importSpecifier === '@/database/prisma.service.ts' ||
    importSpecifier === '~/database/prisma.service' ||
    importSpecifier === '~/database/prisma.service.ts';

  if (isPrismaServiceImport) {
    return 'apps/server/src/database/prisma.service.ts';
  }

  const isDatabaseConstantsImport =
    importSpecifier === 'apps/server/src/database/database.constants' ||
    importSpecifier === 'apps/server/src/database/database.constants.ts' ||
    importSpecifier === '@/database/database.constants' ||
    importSpecifier === '@/database/database.constants.ts' ||
    importSpecifier === '~/database/database.constants' ||
    importSpecifier === '~/database/database.constants.ts';

  if (isDatabaseConstantsImport) {
    return 'apps/server/src/database/database.constants.ts';
  }

  const isDatabaseBarrelImport =
    importSpecifier === 'apps/server/src/database' ||
    importSpecifier === '@/database' ||
    importSpecifier === '~/database';

  if (isDatabaseBarrelImport) {
    return 'apps/server/src/database/index.ts';
  }

  if (importSpecifier.startsWith('@/') || importSpecifier.startsWith('~/')) {
    const trimmed = importSpecifier.slice(2);
    if (scope === 'backend') {
      return `apps/server/src/${trimmed}`;
    }
    if (scope === 'frontend') {
      return `apps/web/src/${trimmed}`;
    }
    return importSpecifier.slice(0, 2);
  }

  if (importSpecifier.startsWith('@')) {
    const [scopeName, name] = importSpecifier.split('/');
    if (scopeName && name) {
      return `${scopeName}/${name}`;
    }
    return importSpecifier;
  }

  const [packageName] = importSpecifier.split('/');
  return packageName ?? importSpecifier;
}

function resolvePrismaServiceTokenUsage(
  nodes: readonly CollectedNode[],
): readonly SourceGraphNode[] {
  const nodeByFilePath = new Map(nodes.map((node) => [node.filePath, node]));

  const tokenProviderSet = new Set(
    nodes
      .filter((node) => node.exportNames.includes(PRISMA_SERVICE_TOKEN_NAME))
      .map((node) => node.filePath),
  );

  function isTokenProvider(filePath: string): boolean {
    return tokenProviderSet.has(filePath);
  }

  function canReachTokenProvider(
    startFilePath: string,
    visited: ReadonlySet<string>,
  ): boolean {
    if (isTokenProvider(startFilePath)) {
      return true;
    }

    const node = nodeByFilePath.get(startFilePath);
    if (!node) {
      return false;
    }

    const nextVisited = new Set([...visited, startFilePath]);

    function resolveHopToNodeFilePath(rawHop: string): string | null {
      if (nodeByFilePath.has(rawHop)) {
        return rawHop;
      }

      const candidates = [
        `${rawHop}.ts`,
        `${rawHop}.tsx`,
        `${rawHop}.js`,
        `${rawHop}.jsx`,
        `${rawHop}.mts`,
        `${rawHop}.cts`,
        `${rawHop}/index.ts`,
        `${rawHop}/index.tsx`,
        `${rawHop}/index.js`,
        `${rawHop}/index.jsx`,
        `${rawHop}/index.mts`,
        `${rawHop}/index.cts`,
      ];

      for (const candidate of candidates) {
        if (nodeByFilePath.has(candidate)) {
          return candidate;
        }
      }

      return null;
    }

    const nextHops = [
      ...node.internalImports,
      ...node.reexportAllInternalImports,
      ...node.reexportPrismaServiceTokenInternalImports,
      ...node.externalImports.filter((value) =>
        value.startsWith('apps/server/src/'),
      ),
    ];

    for (const rawHop of nextHops) {
      const hop = resolveHopToNodeFilePath(rawHop);
      if (!hop) {
        continue;
      }
      if (nextVisited.has(hop)) {
        continue;
      }
      if (canReachTokenProvider(hop, nextVisited)) {
        return true;
      }
    }

    return false;
  }

  return nodes.map((node) => {
    if (!node.potentialPrismaServiceTokenUsage) {
      return {
        ...node,
        hasPrismaServiceTokenUsage: false,
      } satisfies SourceGraphNode;
    }

    // 注意：这里不把“自身包含 token 字面量”当成 usage，需要能追溯到 provider 才算。
    const hasUsage = canReachTokenProvider(node.filePath, new Set());
    return {
      ...node,
      hasPrismaServiceTokenUsage: hasUsage,
    } satisfies SourceGraphNode;
  });
}

function collectPackageDependencies(
  rootDir: string,
): readonly PackageDependencySummary[] {
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

    const packageName =
      parsed.name ?? toPosix(path.relative(rootDir, packageFilePath));
    const dependencies = Object.keys(parsed.dependencies ?? {}).sort(
      (left, right) => left.localeCompare(right),
    );
    const devDependencies = Object.keys(parsed.devDependencies ?? {}).sort(
      (left, right) => left.localeCompare(right),
    );

    return {
      packageName,
      dependencies,
      devDependencies,
    } satisfies PackageDependencySummary;
  });

  return [...summaries].sort((left, right) =>
    left.packageName.localeCompare(right.packageName),
  );
}

export function buildSourceGraph(
  rootDir: string,
  options: CollectOptions = {},
): SourceGraph {
  const includeTestFiles = options.includeTestFiles ?? false;
  const resolvedRoot = normalizeResolvedPath(path.resolve(rootDir));
  const sourceFiles = gatherSourceFiles(resolvedRoot, includeTestFiles);
  const normalizedFileSet = new Set(
    sourceFiles.map((filePath) => normalizeResolvedPath(filePath)),
  );

  const collectedNodes: readonly CollectedNode[] = sourceFiles
    .map((absoluteFilePath) => {
      const normalizedAbsolutePath = normalizeResolvedPath(absoluteFilePath);
      const relativePath = toPosix(
        path.relative(resolvedRoot, normalizedAbsolutePath),
      );
      const scope = detectScope(relativePath);
      if (!scope) {
        return null;
      }

      const source = fs.readFileSync(normalizedAbsolutePath, 'utf8');
      const scannableSource = stripBlockAndFullLineComments(source);
      const imports = extractImports(source);
      const exportNames = extractExports(source);
      const reexportAllTargets = extractReexportAllTargets(source);
      const reexportNamedSpecifiers = extractReexportNamedSpecifiers(source);

      const internalImports = imports
        .filter((importSpecifier) => importSpecifier.startsWith('.'))
        .map((importSpecifier) =>
          tryResolveRelativeImport(normalizedAbsolutePath, importSpecifier),
        )
        .filter((resolvedImport): resolvedImport is string =>
          Boolean(resolvedImport && normalizedFileSet.has(resolvedImport)),
        )
        .map((resolvedImportPath) =>
          toPosix(path.relative(resolvedRoot, resolvedImportPath)),
        );

      const reexportAllInternalImports = reexportAllTargets
        .filter((importSpecifier) => importSpecifier.startsWith('.'))
        .map((importSpecifier) =>
          tryResolveRelativeImport(normalizedAbsolutePath, importSpecifier),
        )
        .filter((resolvedImport): resolvedImport is string =>
          Boolean(resolvedImport && normalizedFileSet.has(resolvedImport)),
        )
        .map((resolvedImportPath) =>
          toPosix(path.relative(resolvedRoot, resolvedImportPath)),
        );

      const reexportPrismaServiceTokenInternalImports = reexportNamedSpecifiers
        .filter((item) => item.name === PRISMA_SERVICE_TOKEN_NAME)
        .map((item) => item.from)
        .filter((importSpecifier) => importSpecifier.startsWith('.'))
        .map((importSpecifier) =>
          tryResolveRelativeImport(normalizedAbsolutePath, importSpecifier),
        )
        .filter((resolvedImport): resolvedImport is string =>
          Boolean(resolvedImport && normalizedFileSet.has(resolvedImport)),
        )
        .map((resolvedImportPath) =>
          toPosix(path.relative(resolvedRoot, resolvedImportPath)),
        );

      const externalImports = imports
        .filter((importSpecifier) => !importSpecifier.startsWith('.'))
        .map((importSpecifier) =>
          normalizeExternalImportSpecifierForScope(importSpecifier, scope),
        )
        .filter((importSpecifier) => importSpecifier.length > 0);

      const hasPrismaClientImport = imports.some(
        (specifier) =>
          specifier === '@prisma/client' ||
          specifier.startsWith('@prisma/client/'),
      );

      const hasPrismaClientUsage =
        hasPrismaClientImport &&
        /\bPrismaClient\b/.test(scannableSource) &&
        (/\bnew\s+PrismaClient\b/.test(scannableSource) ||
          /\bextends\s+PrismaClient\b/.test(scannableSource));

      const potentialPrismaServiceTokenUsage = /\bPRISMA_SERVICE_TOKEN\b/.test(
        scannableSource,
      );

      const hasPrismaServiceTokenUsage =
        potentialPrismaServiceTokenUsage &&
        (internalImports.includes(
          'apps/server/src/database/database.constants.ts',
        ) ||
          externalImports.includes(
            'apps/server/src/database/database.constants.ts',
          ) ||
          reexportAllInternalImports.includes(
            'apps/server/src/database/database.constants.ts',
          ) ||
          reexportPrismaServiceTokenInternalImports.includes(
            'apps/server/src/database/database.constants.ts',
          ));

      return {
        filePath: relativePath,
        scope,
        internalImports: [...new Set(internalImports)].sort((left, right) =>
          left.localeCompare(right),
        ) as readonly string[],
        externalImports: [...new Set(externalImports)].sort((left, right) =>
          left.localeCompare(right),
        ) as readonly string[],
        exportNames,
        reexportAllInternalImports: [
          ...new Set(reexportAllInternalImports),
        ].sort((left, right) => left.localeCompare(right)) as readonly string[],
        reexportPrismaServiceTokenInternalImports: [
          ...new Set(reexportPrismaServiceTokenInternalImports),
        ].sort((left, right) => left.localeCompare(right)) as readonly string[],
        hasPrismaClientUsage,
        potentialPrismaServiceTokenUsage,
        hasPrismaServiceTokenUsage,
      } satisfies CollectedNode;
    })
    .filter((node): node is NonNullable<typeof node> => node !== null)
    .sort((left, right) => left.filePath.localeCompare(right.filePath));

  const nodes = resolvePrismaServiceTokenUsage(collectedNodes);

  return {
    generatedAt: new Date().toISOString(),
    rootDir: resolvedRoot,
    nodes,
    packageDependencies: collectPackageDependencies(resolvedRoot),
  };
}
