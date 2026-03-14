# platform-iam-policy (Task5)

## 目标
在 `platform-tenant`（请求级 tenant context）与 `platform-db.withTenantTx()`（事务级 `SET LOCAL search_path`）基础设施之上，实现最小可用、可扩展的授权闭环：

- `packages/platform-policy`：命名规范 + permission matching + obligations 结构与合并规则
- `packages/platform-iam`：RBAC 授权编排（authorize），返回 `{ decision, obligations }`
- `apps/server`：提供后端 enforcement 示例（Guard/Decorator）

## 命名规范（冻结）
### Resource
格式：`<app>:<domain>[:<entity>]`

示例：
- `erp:order`
- `erp:inventory-ledger`
- `erp:order:line`

### Action
允许集合：
- `read | create | update | delete | approve | post | export | *`

### Permission code
统一格式：`${resource}:${action}`，例如：
- `erp:order:read`
- `erp:*`（当前阶段仅支持 app 级 wildcard）

## authorize() 契约
`packages/platform-policy` 冻结以下结构（供 server/web/脚本复用）：

```ts
export type Decision = 'allow' | 'deny';

export type Obligations = {
  data?: unknown;
  fields?: { allow?: string[]; deny?: string[] };
  buttons?: { allow?: string[]; deny?: string[] };
  workflow?: { allowTransitions?: string[]; denyTransitions?: string[] };
};

export type AuthzResult = { decision: Decision; obligations: Obligations; reason?: string };
```

`packages/platform-iam` 提供：

```ts
authorize({
  tenantId: string;
  userId: string;
  action: string;
  resource: string;
  context?: Record<string, unknown>;
}): Promise<AuthzResult>
```

## obligations 合并语义（冻结）
当前 RBAC 最小闭环返回空 obligations（`{}`），但为未来扩展，`platform-policy.mergeObligations(a,b)` 已冻结合并方向：

- `fields.allow` / `buttons.allow`：交集（更约束者优先）
- `fields.deny` / `buttons.deny`：并集
- `workflow.*`：并集
- `data`：当前为占位；未来若定义为可组合 filter，默认采用 AND 组合（更约束者优先）

## RBAC 数据模型（复用现有 Prisma 表）
本任务不新增 Iam* 新表，而是复用 server Prisma schema 内的：
- `Role`（tenant-scoped）
- `Permission`（全局 `code` 唯一）
- `UserRole`（tenant-scoped 绑定）
- `RolePermission`（tenant-scoped 绑定）

最小验收用例：
- Admin role 拥有 `erp:*`
- 普通用户没有该权限时 `authorize()` 返回 deny

## Server enforcement（示例）
新增：
- `@RequireAuthorize({ resource, action })`
- `AuthorizeGuard`（内部调用 `@minierp/platform-iam`，并记录审计）

注意：
- 该路径与现有 `IamGuard/@RequirePermissions` 并行存在，避免破坏历史权限字符串（例如 `masterdata.sku.read` / `evidence:*`）。

## 开发/测试注意事项
- `AuthorizeGuard` 当前使用 `authContext.actorId` 作为 `userId` 输入，并要求其可 `BigInt()` 解析（与 Prisma `UserRole.userId BigInt` 对齐）。
- 如使用 dev-token bypass：现有 `actorId=dev-user` 不满足该约束；请使用 `x-auth-context` 注入数值字符串 actorId，或后续调整 dev bypass 策略。

## 验证命令
- 构建：`bun run --filter @minierp/platform-policy build`，`bun run --filter @minierp/platform-iam build`
- Server 单测（示例）：
  - `bun run --filter server test -- src/common/iam-policy/platform-policy.spec.ts`
  - `bun run --filter server test -- src/common/iam/authorize/authorize.guard.spec.ts`
- Server lint：`bun run --filter server lint`
