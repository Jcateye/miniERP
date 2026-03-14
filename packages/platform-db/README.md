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
