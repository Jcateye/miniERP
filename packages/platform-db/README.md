# @minierp/platform-db

## 目的

提供 miniERP 的 tenant schema 事务入口，承接 Prisma transaction + `public.tenants` registry。

> 当前仓库的 Prisma client / NestJS DatabaseModule 仍在 `apps/server`，这里提供的是 platform 层的数据库能力实现。

## API

面向当前仓库冻结的最小接口：

- 租户来源于 `platform-tenant` 的 AsyncLocalStorage 上下文
- tenant registry 固定落在 `public.tenants`
- 所有 tenant 业务查询必须通过 `withTenantTx()` 提供的 `tx`

```ts
type TenantId = string;
type TenantSchema = string;

interface PlatformDbApi {
  withTenantTx<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T>;
  getTenantSchema(tenantId: TenantId): Promise<TenantSchema>;
  assertInTenantTx(): void;
}
```

## 使用

server 侧会由 `PrismaService` + `TenantContextService` 组装一个请求级 `PlatformDbApi` 实例：

```ts
createPlatformDb({
  prisma,
  getCurrentTenantId: () => tenantContext.getRequiredContext().tenantId,
});
```

## Why `SET LOCAL` Is Safe With Pooling

实现会在 Prisma 的 `$transaction()` 回调内先执行：

```sql
SET LOCAL search_path = "<tenant_schema>", public;
```

它是 transaction-local：

- 只对当前事务生效
- 事务提交或回滚后自动恢复连接原状态
- 即使 Prisma 复用连接池中的同一物理连接，也不会把上一个租户的 `search_path` 泄漏给下一个请求

因此真正的约束是：tenant 业务查询必须全部使用 `withTenantTx()` 回调里给出的 `tx`。

## Tenant Registry

tenant schema registry 固定在 `public.tenants`：

```sql
CREATE TABLE public.tenants (
  tenant_id text PRIMARY KEY,
  schema_name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

初始化一个租户：

```bash
bun run --filter server tenant:init TENANT-001 --schema tenant_001
```

## 验证

- 构建：`bun run --filter @minierp/platform-db build`
- Lint：`bun run --filter @minierp/platform-db lint`
