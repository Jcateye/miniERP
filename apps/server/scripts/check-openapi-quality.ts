/**
 * OpenAPI 质量检查脚本
 *
 * 运行方式：bun run --filter server openapi:check
 *
 * 检查项：
 * 1. 每个公开 endpoint 必须有非空的 summary
 * 2. 关键 schema 字段必须有 description
 */

interface OpenAPIDocument {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  paths: Record<string, Record<string, PathOperation>>;
  components?: {
    schemas?: Record<string, SchemaObject>;
  };
}

interface PathOperation {
  summary?: string;
  description?: string;
  tags?: string[];
  responses?: Record<string, { description?: string }>;
}

interface SchemaObject {
  type?: string;
  description?: string;
  properties?: Record<string, { description?: string }>;
  required?: string[];
}

interface QualityIssue {
  type: 'error' | 'warning';
  location: string;
  message: string;
}

const REQUIRED_DESCRIPTION_FIELDS = ['id', 'name', 'code', 'status', 'type', 'amount', 'quantity', 'createdAt', 'updatedAt'];

function checkOperationSummary(path: string, method: string, operation: PathOperation): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const location = `${method.toUpperCase()} ${path}`;

  if (!operation.summary || operation.summary.trim() === '') {
    issues.push({
      type: 'error',
      location,
      message: '缺少 operation summary',
    });
  }

  if (!operation.description || operation.description.trim() === '') {
    issues.push({
      type: 'warning',
      location,
      message: '缺少 operation description（建议补充业务上下文）',
    });
  }

  return issues;
}

function checkSchemaDescriptions(schemaName: string, schema: SchemaObject): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const location = `schema:${schemaName}`;

  if (!schema.properties) {
    return issues;
  }

  for (const [fieldName, fieldDef] of Object.entries(schema.properties)) {
    const isRequired = schema.required?.includes(fieldName);
    const isKeyField = REQUIRED_DESCRIPTION_FIELDS.some((key) => fieldName.toLowerCase().includes(key.toLowerCase()));

    if ((isRequired || isKeyField) && !fieldDef.description) {
      issues.push({
        type: 'warning',
        location: `${location}.${fieldName}`,
        message: `关键字段 "${fieldName}" 缺少 description`,
      });
    }
  }

  return issues;
}

function checkOpenApiQuality(document: OpenAPIDocument): QualityIssue[] {
  const issues: QualityIssue[] = [];

  // 检查 paths
  for (const [path, methods] of Object.entries(document.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
        issues.push(...checkOperationSummary(path, method, operation));
      }
    }
  }

  // 检查 schemas
  if (document.components?.schemas) {
    for (const [schemaName, schema] of Object.entries(document.components.schemas)) {
      issues.push(...checkSchemaDescriptions(schemaName, schema));
    }
  }

  return issues;
}

async function main() {
  const fs = await import('node:fs');
  const path = await import('node:path');

  const openapiPath = path.resolve(__dirname, '../openapi.json');

  if (!fs.existsSync(openapiPath)) {
    console.error('错误: openapi.json 不存在，请先运行 openapi:generate');
    process.exit(1);
  }

  const content = fs.readFileSync(openapiPath, 'utf-8');
  const document: OpenAPIDocument = JSON.parse(content);

  console.log('='.repeat(60));
  console.log('OpenAPI 质量检查报告');
  console.log('='.repeat(60));
  console.log(`文档标题: ${document.info.title}`);
  console.log(`文档版本: ${document.info.version}`);
  console.log('');

  const issues = checkOpenApiQuality(document);

  const errors = issues.filter((i) => i.type === 'error');
  const warnings = issues.filter((i) => i.type === 'warning');

  if (errors.length > 0) {
    console.log('❌ 错误 (必须修复):');
    for (const error of errors) {
      console.log(`   [${error.location}] ${error.message}`);
    }
    console.log('');
  }

  if (warnings.length > 0) {
    console.log('⚠️  警告 (建议修复):');
    for (const warning of warnings) {
      console.log(`   [${warning.location}] ${warning.message}`);
    }
    console.log('');
  }

  console.log('='.repeat(60));
  console.log(`检查结果: ${errors.length} 个错误, ${warnings.length} 个警告`);
  console.log('='.repeat(60));

  if (errors.length > 0) {
    console.log('\n❌ 质量检查未通过');
    process.exit(1);
  }

  console.log('\n✅ 质量检查通过');
  process.exit(0);
}

main().catch((error) => {
  console.error('检查过程出错:', error);
  process.exit(1);
});
