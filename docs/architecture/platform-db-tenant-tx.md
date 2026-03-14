# platform-db tenant tx

## Overview

本实现把 tenant 隔离放到 Prisma transaction 内：

1. 从 `TenantContextService` 读取请求级 `tenantId`
2. 从 `public.tenants` 解析出 `schema_name`
3. 在 `$transaction()` 回调内执行 `SET LOCAL search_path = "<schema>", public`
4. 所有 tenant SQL 必须使用 `withTenantTx()` 传入的 `tx`

核心原因：

- `SET LOCAL` 只在当前事务内生效
- 事务结束后连接状态自动恢复
- 即使 Prisma 复用连接池中的物理连接，也不会把前一个租户的 `search_path` 带到后一个请求

## Init Tenant

```bash
bun run --filter server tenant:init TENANT-001 --schema tenant_001
```

这条命令会：

- 创建 `public.tenants`
- 创建 tenant schema
- 注册 `tenantId -> schemaName`

## Run Integration Test

```bash
PLATFORM_DB_TEST_DATABASE_URL=postgresql://admin:admin123@127.0.0.1:5432/postgres \
  bun run --filter server test:tenant-tx
```

也可以复用现有 `DATABASE_URL`：

```bash
DATABASE_URL=postgresql://admin:admin123@127.0.0.1:5432/postgres \
  bun run --filter server test -- src/database/platform-db.integration.spec.ts --runInBand
```

## Debug

查看 registry：

```sql
SELECT tenant_id, schema_name, is_active, created_at, updated_at
FROM public.tenants
ORDER BY tenant_id;
```

确认当前事务 search path：

```sql
SHOW search_path;
SELECT current_schema();
```

确认 tenant schema 中的数据：

```sql
SELECT * FROM tenant_probe;
```
