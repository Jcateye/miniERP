/**
 * miniERP 页面迁移脚本
 *
 * 用法：
 * 1. 默认从当前仓库同级目录的 ../miniERP_web 读取源项目
 *    bun scripts/integrate-minierp-pages.ts
 * 2. 自定义源项目根目录
 *    MINIERP_WEB_SOURCE_ROOT=/absolute/path/to/miniERP_web bun scripts/integrate-minierp-pages.ts
 * 3. 允许覆盖已生成文件
 *    OVERWRITE=1 bun scripts/integrate-minierp-pages.ts
 */

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

type RouteMapping = {
  source: string;
  target: string;
};

const repoRoot = process.cwd();
const viewRoot = path.join(repoRoot, "apps/web/src/components/views/erp/integrated");
const routeRoot = path.join(repoRoot, "apps/web/src/app/(dashboard)");
const overwriteExisting = process.env.OVERWRITE === "1";
const sourceProjectRootInput = process.env.MINIERP_WEB_SOURCE_ROOT ?? "../miniERP_web";
const sourceProjectRoot = path.resolve(repoRoot, sourceProjectRootInput);
const sourceRoot = path.join(sourceProjectRoot, "src/app");

const routeMappings: RouteMapping[] = [
  { source: "page.tsx", target: "workspace/source-home" },
  { source: "approval/page.tsx", target: "workflow/approval" },
  { source: "apv/page.tsx", target: "workflow/apv" },
  { source: "fin/page.tsx", target: "finance" },
  { source: "fin/overview/page.tsx", target: "finance/overview" },
  { source: "fin/invoice/page.tsx", target: "finance/invoice" },
  { source: "fin/voucher/page.tsx", target: "finance/voucher" },
  { source: "fin/collection/page.tsx", target: "finance/collection" },
  { source: "fin/payment/page.tsx", target: "finance/payment" },
  { source: "fin/accounts/page.tsx", target: "finance/accounts" },
  { source: "fin/cost-center/page.tsx", target: "finance/cost-center" },
  { source: "fin/budget/page.tsx", target: "finance/budget" },
  { source: "grn/page.tsx", target: "procure/receipts/new" },
  { source: "grn/step3/page.tsx", target: "procure/receipts/new/step3" },
  { source: "grn/step3/drawer/page.tsx", target: "procure/receipts/new/step3/drawer" },
  { source: "inv/adjustment/page.tsx", target: "inventory/adjustment" },
  { source: "inv/balance/page.tsx", target: "inventory/balance" },
  { source: "inv/grn/page.tsx", target: "inventory/grn" },
  { source: "inv/ledger/page.tsx", target: "inventory/ledger" },
  { source: "inv/new-stocktake/page.tsx", target: "inventory/stocktake/new" },
  { source: "inv/overview/page.tsx", target: "inventory/overview" },
  { source: "inv/restock/page.tsx", target: "inventory/restock" },
  { source: "inv/stocktake/page.tsx", target: "inventory/stocktake" },
  { source: "masterdata/bom/page.tsx", target: "mdm/bom" },
  { source: "masterdata/customers/page.tsx", target: "mdm/customers" },
  { source: "masterdata/org/page.tsx", target: "mdm/org" },
  { source: "masterdata/roles/page.tsx", target: "mdm/roles" },
  { source: "masterdata/suppliers/page.tsx", target: "mdm/suppliers" },
  { source: "masterdata/user/page.tsx", target: "mdm/users" },
  { source: "masterdata/warehouse/page.tsx", target: "mdm/warehouses" },
  { source: "mfg/orders/page.tsx", target: "manufacturing/orders" },
  { source: "mfg/overview/page.tsx", target: "manufacturing/overview" },
  { source: "mfg/page.tsx", target: "manufacturing" },
  { source: "mfg/qc/page.tsx", target: "manufacturing/qc" },
  { source: "out/page.tsx", target: "sales/outbound/new" },
  { source: "po/overview/page.tsx", target: "procure/purchase-orders/overview" },
  { source: "po/page.tsx", target: "procure/purchase-orders" },
  { source: "rpt/page.tsx", target: "reports/source-center" },
  { source: "settings/master/page.tsx", target: "settings/master" },
  { source: "settings/page.tsx", target: "settings" },
  { source: "sku/[id]/page.tsx", target: "mdm/skus/[id]" },
  { source: "sku/overview/page.tsx", target: "mdm/skus/overview" },
  { source: "sku/page.tsx", target: "mdm/skus" },
  { source: "so/overview/page.tsx", target: "sales/orders/overview" },
  { source: "so/page.tsx", target: "sales/orders" },
  { source: "so/quote/page.tsx", target: "sales/orders/quote" },
  { source: "so/ship/page.tsx", target: "sales/orders/ship" },
];

const routeRewrites = [
  { from: /href=(["'])\/sku\1/g, to: 'href=$1/mdm/skus$1' },
  { from: /Link href=(["'])\/sku\1/g, to: 'Link href=$1/mdm/skus$1' },
  { from: /function FileText\(props: any\)/g, to: "function FileText(props: React.SVGProps<SVGSVGElement>)" },
];

function ensureDir(dirPath: string) {
  mkdirSync(dirPath, { recursive: true });
}

function failWithSourceRootError(message: string): never {
  console.error(message);
  console.error("");
  console.error("使用方式：");
  console.error("- 默认同级仓库：bun scripts/integrate-minierp-pages.ts");
  console.error(
    "- 自定义源路径：MINIERP_WEB_SOURCE_ROOT=/absolute/path/to/miniERP_web bun scripts/integrate-minierp-pages.ts",
  );
  process.exit(1);
}

function validateSourceProjectRoot() {
  if (!existsSync(sourceProjectRoot)) {
    failWithSourceRootError(
      [
        `未找到源项目根目录：${sourceProjectRoot}`,
        `当前 MINIERP_WEB_SOURCE_ROOT=${process.env.MINIERP_WEB_SOURCE_ROOT ?? "(未设置，使用默认 ../miniERP_web)"}`,
      ].join("\n"),
    );
  }

  if (!statSync(sourceProjectRoot).isDirectory()) {
    failWithSourceRootError(`源项目路径不是目录：${sourceProjectRoot}`);
  }

  if (!existsSync(sourceRoot)) {
    failWithSourceRootError(
      [
        `源项目缺少 src/app 目录：${sourceRoot}`,
        "请确认 MINIERP_WEB_SOURCE_ROOT 指向 miniERP_web 仓库根目录，而不是其他子目录。",
      ].join("\n"),
    );
  }

  if (!statSync(sourceRoot).isDirectory()) {
    failWithSourceRootError(`源页面目录不是目录：${sourceRoot}`);
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeLucideImport(content: string) {
  const lucideImportPattern = /import\s*\{([\s\S]*?)\}\s*from\s*["']lucide-react["'];?/m;
  const match = content.match(lucideImportPattern);

  if (!match) {
    return content;
  }

  const rawSpecifiers = match[1]
    .split(",")
    .map((specifier) => specifier.trim())
    .filter(Boolean);
  const contentWithoutImport = content.replace(match[0], "");

  const specifiers = [...rawSpecifiers];
  const plusUsed = /\bPlus\b/.test(content);
  const hasPlusImport = specifiers.some((specifier) => specifier === "Plus" || /\sas\sPlus$/.test(specifier));

  if (plusUsed && !hasPlusImport) {
    specifiers.push("Plus");
  }

  const keptSpecifiers = specifiers.filter((specifier) => {
    const aliasMatch = specifier.match(/\s+as\s+(\w+)$/);
    const localName = aliasMatch ? aliasMatch[1] : specifier;
    const usagePattern = new RegExp(`\\b${escapeRegExp(localName)}\\b`, "g");
    const usageCount = (contentWithoutImport.match(usagePattern) ?? []).length;

    return usageCount > 0;
  });

  if (keptSpecifiers.length === 0) {
    return content.replace(`${match[0]}\n`, "");
  }

  const replacement = `import { ${keptSpecifiers.join(", ")} } from 'lucide-react';`;
  return content.replace(lucideImportPattern, replacement);
}

function transformContent(content: string) {
  const rewrittenContent = routeRewrites.reduce(
    (nextContent, rewrite) => nextContent.replace(rewrite.from, rewrite.to),
    content,
  );

  return normalizeLucideImport(rewrittenContent);
}

function writeFileSafely(filePath: string, content: string) {
  ensureDir(path.dirname(filePath));
  writeFileSync(filePath, `${content.trimEnd()}\n`);
}

function createRouteWrapper(importPath: string) {
  return `export { default } from "${importPath}";\n`;
}

validateSourceProjectRoot();

const generatedFiles: string[] = [];
const collisions: string[] = [];

for (const mapping of routeMappings) {
  const sourcePath = path.join(sourceRoot, mapping.source);
  const sourceContent = readFileSync(sourcePath, "utf8");
  const transformedContent = transformContent(sourceContent);
  const normalizedTarget = mapping.target.replace(/^\/+/, "");
  const viewPath = path.join(viewRoot, normalizedTarget, "view.tsx");
  const routePath = path.join(routeRoot, normalizedTarget, "page.tsx");

  if (!overwriteExisting && (existsSync(routePath) || existsSync(viewPath))) {
    collisions.push(path.relative(repoRoot, routePath));
    continue;
  }

  writeFileSafely(viewPath, transformedContent);
  writeFileSafely(
    routePath,
    createRouteWrapper(`@/components/views/erp/integrated/${normalizedTarget}/view`),
  );

  generatedFiles.push(path.relative(repoRoot, viewPath));
  generatedFiles.push(path.relative(repoRoot, routePath));
}

if (collisions.length > 0) {
  console.error("Route collisions detected:");
  for (const collision of collisions) {
    console.error(`- ${collision}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Generated ${generatedFiles.length} files from ${routeMappings.length} source pages.`);
  for (const filePath of generatedFiles) {
    console.log(filePath);
  }
}
