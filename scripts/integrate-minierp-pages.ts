import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

type RouteMapping = {
  source: string;
  target: string;
};

const repoRoot = process.cwd();
const sourceRoot = "/Users/haoqi/OnePersonCompany/miniERP_web/src/app";
const viewRoot = path.join(repoRoot, "apps/web/src/components/views/erp/integrated");
const routeRoot = path.join(repoRoot, "apps/web/src/app/(dashboard)");
const overwriteExisting = process.env.OVERWRITE === "1";

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
