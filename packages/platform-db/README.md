# @minierp/platform-db

## Draft API

该包提供 miniERP 的 tenant schema 事务入口，面向当前仓库的约束：

- 租户来源于 `platform-tenant` 的 AsyncLocalStorage 上下文
- tenant registry 固定落在 `public.tenants`
- 所有 tenant 业务查询必须通过 `withTenantTx()` 提供的 `tx`

当前冻结的最小接口：

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

## Planned Server Wiring

server 侧会由 `PrismaService` + `TenantContextService` 组装一个请求级 `PlatformDbApi` 实例：

```ts
createPlatformDb({
  prisma,
  getCurrentTenantId: () => tenantContext.getRequiredContext().tenantId,
});
```

## Why `SET LOCAL` / `set_config(..., true)` Is Safe With Pooling

实现会在 Prisma 的 `$transaction()` 回调内先执行：

```sql
SELECT set_config('search_path', quote_ident($schema) || ', public', true);
```

这里第三个参数 `true` 等价于 transaction-local 的 `SET LOCAL`：

- 只对当前事务生效
- 事务提交或回滚后自动恢复连接原状态
- 即使 Prisma 复用连接池中的同一物理连接，也不会把上一个租户的 `search_path` 泄漏给下一个请求

因此真正的约束是：tenant 业务查询必须全部使用 `withTenantTx()` 回调里给出的 `tx`。
