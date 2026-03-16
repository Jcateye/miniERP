# 通用中台能力抽离（路线 B：共享库 + 多应用）设计与实施计划

> 适用项目：miniERP（约 3 个应用共享中台能力）
>
> 目标关键词：**Monorepo / 共享 packages / 未来可服务化 / Postgres schema-per-tenant / Tenant 以 Token 为准 / Prisma / 可扩展权限（RBAC + obligations）**

---

## 0. 背景与现状（已落地的基础设施）

以下基础已在 2026-03-14 合入 main：

- **PR #49**：平台 packages 骨架 + TenantContext（AsyncLocalStorage）+ TenantResolver（JWT-ready，dev header fallback）
- **PR #50**：multi-schema tenant migrations runner + tenant init/migrate-all 脚本 + e2e
- **PR #51**：platform-db `withTenantTx` + `SET LOCAL search_path` + `public.tenants` registry + 隔离集成测试
- **PR #52**：platform-iam + platform-policy（RBAC 最小 authorize）+ server 侧 Guard/Decorator enforcement 示例

因此，本设计文档主要用于：
1) 固化这套架构的“为什么这样做、边界在哪、后续怎么演进”；
2) 为后续 **Task6（obligations 端到端落地）** 提供统一规范与落地约束。

---

## 1) 目标 / 非目标 / 边界（避免过度微服务化）

### 1.1 目标（Goals）
1. **中台能力可复用**：把租户隔离、上下文、DB 路由、迁移、鉴权与策略引擎下沉为 `packages/platform-*`，供多个 apps 复用。
2. **强隔离（schema-per-tenant）**：业务数据读写必须发生在正确 tenant schema 内；提供防串租户机制与可验证测试。
3. **统一入口与调用方式**：
   - Tenant 从 token claims 解析（权威）
   - 通过 request-scoped context + `withTenantTx` 强制约束 DB 访问路径
4. **权限体系可扩展**：RBAC 为基础，逐步叠加 data/field/button/workflow 权限（obligations），避免权限表爆炸。
5. **未来可服务化**：中台包边界清晰（domain 与 infra 分离、接口抽象），后续拆服务时应用改动最小。

### 1.2 非目标（Non-goals）
1. 本期不做微服务化改造（不引入服务发现/分布式事务/复杂事件总线）。
2. 不做跨租户分析报表（如需走 ETL/数仓）。
3. 不强制所有迁移具备 down 回滚；回滚以备份/PITR 为主，必要时补手工 down。

### 1.3 边界（Boundaries）
- Tenant 隔离层（TenantContext/DB Router/migrations）属于中台必选能力，所有 app 必须走。
- 权限引擎提供统一 `authorize()` 与 obligations 扩展点；应用只负责“资源与动作命名/注册”。

---

## 2) Monorepo 结构与包边界（apps/* 与 packages/platform-*）

### 2.1 建议目录结构

```text
miniERP/
  apps/
    server/                      # 后端服务（当前落地的入口）
    web/                         # 前端（如有）
    ...
  packages/
    platform-kernel/             # errors/types/logging/config utils（最底层）
    platform-tenant/             # TenantContext、TenantResolver、middleware
    platform-db/                 # withTenantTx、tenant registry、隔离工具
    platform-migrations/          #（可选包）迁移执行器（当前落地在 apps/server/scripts）
    platform-iam/                #（Task5）RBAC 数据访问/服务
    platform-policy/             #（Task5）authorize + obligations 框架
  docs/
    architecture/
      platform-design.md         # 本文档
      platform-db-tenant-tx.md   # 已落地文档
```

> 当前实现上，migrations runner 主要在 `apps/server/scripts/tenant-migrations.ts`；后续可按需要抽到 `packages/platform-migrations`。

### 2.2 依赖规则（必须）
- `apps/*` 可以依赖 `packages/platform-*`
- `packages/platform-*` **禁止**依赖 `apps/*`
- `platform-kernel` 不依赖其他 platform 包
- `platform-db` 不依赖 `platform-iam/policy`（避免循环）

---

## 3) 数据隔离实现（schema-per-tenant）

### 3.1 TenantContext：以 token 为准

✅ **现状（已落地）**
- server 侧已落地 `authContext` 与 `tenantContext` 两段 middleware 串联：
  - authenticated context：见 [apps/server/src/common/iam/auth-context.middleware.ts](apps/server/src/common/iam/auth-context.middleware.ts)
  - tenant resolver + ALS：见 [packages/platform-tenant/src/tenant-resolver.ts](packages/platform-tenant/src/tenant-resolver.ts) 与 [packages/platform-tenant/src/tenant-context.middleware.ts](packages/platform-tenant/src/tenant-context.middleware.ts)

⚠️ **未完全对齐（需完善到 production）**
- 文档目标是“Tenant 以 token claims 为准（JWT-ready）”，但当前实现是 `x-auth-context`（HMAC 签名的 base64url JSON）+ dev `Bearer dev-token` bypass，并非真正的 JWT 校验/claims 解析。
- `TenantContext` 当前未包含 `tenantSchema` 字段（schema 映射在 DB 层完成）。如需在业务层读取 schema（例如日志/审计），需要明确是否把 `tenantSchema` 放入上下文（建议谨慎，避免把 schema 当成外部输入）。

建议 claims 结构：

```ts
type AuthClaims = {
  sub: string;      // userId
  tenantId: string; // 权威 tenant
  iat: number;
  exp: number;
  jti?: string;
};
```

TenantContext 建议：

```ts
type TenantContext = {
  tenantId: string;
  tenantSchema: string; // 由 tenantId 映射，绝不信任客户端传 schema
};
```

### 3.2 request-scoped context：AsyncLocalStorage
目标：在 service/repo 层无需层层传参即可读取 tenant/user。

✅ **现状（已落地）**
- TenantContext 使用 ALS：见 [packages/platform-tenant/src/tenant-context.ts](packages/platform-tenant/src/tenant-context.ts)
- server 注入封装：见 [apps/server/src/common/tenant/tenant-context.service.ts](apps/server/src/common/tenant/tenant-context.service.ts)

⚠️ **未完全对齐（需完善到 production）**
- 当前大量业务代码仍显式传 `tenantId`，并直接使用 `PrismaService` 查询（未统一强制进入 `withTenantTx()`）。这会导致 schema-per-tenant 的“强隔离”在业务模块尚未成立（见 3.3 的落地差距）。

### 3.3 DB Router：withTenantTx + SET LOCAL search_path
关键铁律：**tenant 业务查询必须在事务内执行，并在事务内 SET LOCAL search_path**。

✅ **现状（已落地：平台层能力）**
- `withTenantTx()` / `SET LOCAL search_path` 已实现：见 [packages/platform-db/src/index.ts](packages/platform-db/src/index.ts)
- server 侧接线（DI）：见 [apps/server/src/database/platform-db.service.ts](apps/server/src/database/platform-db.service.ts)
- 并发隔离集成测试：见 [apps/server/src/database/platform-db.integration.spec.ts](apps/server/src/database/platform-db.integration.spec.ts)

⚠️ **未完全对齐（需完善到 production：业务侧强制使用）**
- 目前 `apps/server/src/modules/**` 内大量读写仍直接使用 `PrismaService`（示例：masterdata/trading/inventory 等），并未统一包进 `PlatformDbService.withTenantTx()`。
- 结果：即使平台层 search_path 隔离已证明成立，**业务模块仍可能在 public schema 执行查询/写入**（取决于 DATABASE_URL 默认 schema），与“强隔离（schema-per-tenant）”目标不一致。

示例：
```sql
SET LOCAL search_path TO "tenant_abc123", "public";
```

为什么必须 `SET LOCAL`：
- `SET search_path` 会污染连接池复用后的下一个请求
- `SET LOCAL` 仅在事务内有效，事务结束自动恢复 → 并发下不串租户

### 3.4 public schema 约束
- `public` 只放平台级元数据表（如 `public.tenants`、全局用户等）
- tenant 业务表只在 tenant schema

---

## 4) 多 schema migrations 与新租户初始化

### 4.1 迁移策略
- 迁移源维护一份（Prisma migrations）
- 执行时对每个 tenant schema apply

### 4.2 新租户初始化（tenant-init）
流程：
1. system 侧写入 `public.tenants(tenant_id, schema_name, ...)`
2. 创建 schema
3. apply baseline/migrations
4. 初始化默认 Admin 角色与绑定

✅ **现状（已落地）**
- `tenant:init` 已实现并会：创建 schema、执行 `prisma migrate deploy`、并初始化 RBAC 默认 Admin（`erp:*` + role/admin + 若存在 username=admin 则绑定到该用户）：见 [apps/server/scripts/tenant-migrations.ts](apps/server/scripts/tenant-migrations.ts)

⚠️ **未完全对齐（需完善到 production）**
- 旧脚本 [apps/server/scripts/tenant-init.ts](apps/server/scripts/tenant-init.ts) 仍存在，且包含 `console.log` / `console.error`，并且不会执行 migrations / RBAC 初始化，容易被误用（与当前标准脚本重复且行为不一致）。建议移除或至少改为明确失败提示。
### 4.3 checksum / 防篡改
- 记录每个迁移的 checksum
- 已发布迁移不允许修改；需要修复用新增迁移补丁

---

## 5) 权限系统：Auth vs IAM vs Policy（Task5）

### 5.1 分层
- **Auth**：你是谁（token 校验）
- **Tenant**：你在哪个租户（tenantId→schema）
- **IAM**：你有哪些角色/绑定（RBAC 数据）
- **Policy**：你能对某资源执行某动作吗（authorize + obligations）

### 5.2 authorize() 接口（稳定契约）

```ts
export type Decision = 'allow' | 'deny';

export type Obligations = {
  data?: unknown; // filter AST / Prisma where
  fields?: { allow?: string[]; deny?: string[] };
  buttons?: { allow?: string[]; deny?: string[] };
  workflow?: { allowTransitions?: string[]; denyTransitions?: string[] };
};

export type AuthzResult = { decision: Decision; obligations: Obligations; reason?: string };

export async function authorize(input: {
  tenantId: string;
  userId: string;
  action: string;
  resource: string;
  context?: Record<string, unknown>;
}): Promise<AuthzResult>;
```

### 5.3 RBAC 最小闭环
- tenant scope 的 Role/Permission/Binding（当前决定：可复用现有 Role* 表结构）
- 权限字符串：`erp:*`、`erp:order:*`、`erp:order:read`

### 5.4 obligations 扩展（Task6）
- data obligation：自动为列表/查询加过滤条件
- field/button/workflow obligations：字段裁剪、按钮显示、状态流转约束

---

## 6) 里程碑拆分（WBS）

- **Task1+2（已完成，PR #49）**：platform 包骨架 + TenantContext/Resolver
- **Task3（已完成，PR #51）**：platform-db withTenantTx + registry + 隔离集成测试
- **Task4（已完成，PR #50）**：multi-schema tenant migrations runner + e2e
- **Task5（已完成，PR #52）**：platform-iam + platform-policy（RBAC + authorize 契约 + server enforcement 示例）
- **Task6（待启动）**：选一个参考资源（如 `erp:order`）端到端落地 obligations（data/field/button/workflow）

---

## 7) 附：可直接用于 task-create 的描述（简版）

> 在 miniERP monorepo 路线 B 下抽离中台能力：schema-per-tenant 隔离（TenantContext + withTenantTx/SET LOCAL search_path）、多 schema migrations + tenant-init、一套可扩展权限体系（Auth/IAM/Policy 分层，RBAC + obligations）。验收：并发不串租户；迁移幂等；新租户一键初始化；authorize 后端强制生效。
