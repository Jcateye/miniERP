下面是一份以“最高推理强度 / ultrathink”方式输出、可直接落地的 **miniERP 通用中台能力抽离（路线 B：共享库 + 多应用、monorepo）**详细设计与实施计划。重点满足：
- **3 个左右应用**共享统一中台能力（不独立部署，但**未来可服务化**） - **Postgres：schema-per-tenant** 数据隔离（必须） - **Tenant 主入口：token（auth 后拿 tenantId，以 token 为准）** - **权限：RBAC + 数据权限 + 字段权限 + 按钮权限 + 工作流权限**，且扩展空间充足- 技术栈：Node.js / TypeScript；ORM以 **…
isma**作为默认实现，但抽象出接口以便未来替换或服务化---
##1)目标 / 非目标 / 边界（避免过度微服务化）
###1.1目标（Goals） 1. **中台能力“可复用”**：把租户隔离、上下文、DB 路由、迁移、鉴权与策略引擎等能力下沉到 `packages/platform-*`，供3 个 apps共享。 2. **强隔离（schema-per-tenant）**：任何业务数据读写都必须在正确的 tenant schema 内发生；提供系统级防串租户机制与审计点。 3. **统一入口与调用方式**： - Tenant由 token解析（权
威来源） -通过 `TenantContext + request-scoped context + withTenantTx/DbRouter` 强制约束 DB访问路径4. **权限体系可扩展**：RBAC 为基础，策略层可逐步叠加 data/field/button/workflow 权限，不把复杂性塞进单一“角色-权限表”。 5. **未来可服务化**：中台包边界清晰（domain 与 infra 分离、接口抽象），未来把 `p…
-*` 拆为独立服务时，上层 apps 改动最小。
###1.2 非目标（Non-goals） 1. **不做微服务化改造**：当前阶段不引入服务发现、分布式事务、复杂的事件总线；最多提供“可服务化接口层”的抽象与适配点。 2. **不追求跨租户查询/报表**：schema-per-tenant 与跨租户分析天然矛盾；如需分析，后续走 ETL/数仓，不在本期范围。 3. **不实现完备“可逆迁移（down）”**：Prisma 原生迁移多为 up-only；回
滚以“版本基线 + 数据库备份/point-in-time restore +重新 apply”作为主策略（后文会给可选增强）。
###1.3 边界（Boundaries） - **租户隔离层**（TenantContext/DB Router/migrations）属于中台必选能力，所有应用必须通过它访问数据。 - **权限引擎**提供统一 `authorize()` 与策略扩展点；每个应用可“注册资源与动作”，但不得各自发明一套不兼容的鉴权模型。
---
##2) 建议的 monorepo目录结构与包边界（apps/* 与 packages/platform-*），依赖规则（禁止反向依赖）
###2.1 Monorepo结构（建议） >以 pnpm workspace / Turborepo / Nx 均可，这里只给目录与依赖边界。
```textmini-erp/ apps/ admin-console/ # 平台/租户管理后台（可选） erp-core/ # 主业务应用（订单/库存/财务等） crm/ # 第二业务应用（客户/线索等） packages/ platform-foundation/ #纯基础：types、errors、logging、config、utils（无业务） platform-auth/ # token 校验、claims 标
准化、AuthContext platform-tenant/ # TenantContext、tenant解析、租户注册/元数据（public schema） platform-request-context/ # AsyncLocalStorage request-scope context（通用） platform-db/ # DbRouter、withTenantTx、search_path 管控、连接池安全 platform
-migrations/ # 多 schema迁移执行器、tenant init、baseline 管理 platform-iam/ # RBAC 实体与服务（User/Role/Binding） platform-policy/ # Policy Engine：data/field/button/workflow 扩展点与 authorize API platform-api-kit/ # Web 框架适配层（Express/Fast
ify/Nest 任一），中间件组合 ui-permissions-kit/ # 前端按钮/字段可见性计算（如有前端 monorepo） prisma/ migrations/ #仅存一份“逻辑迁移源”（后文解释如何 per-tenant apply） schema.prisma #逻辑模型（但运行时每 tenant schema） scripts/ tenant-init.ts # CLI：创建租户schema、apply迁
移、创建默认角色等 migrate-all-tenants.ts # CLI：对全部租户执行迁移 docs/ (可选) tooling/ ```
###2.2 包边界定义（关键） - `platform-*`：**中台层**（跨应用复用） - `apps/*`：**应用层**（业务与交互）
建议把中台拆为两层： - **domain/contract 层**：纯 TS 接口、策略定义、资源定义、错误码（不依赖 Prisma/HTTP） - **infra/adapters 层**：Prisma、HTTP middleware、数据库执行器等（可替换）
###2.3依赖规则（必须执行，禁止反向依赖） 用文字 +约束工具（eslint rules / tsconfig references / nx graph / depcruise）双重保证：
1. **apps → packages允许** 2. **packages → apps 禁止** 3. `platform-foundation` 不依赖任何其他 `platform-*`（最底层） 4. `platform-policy` 可以依赖 `platform-iam` 的 *接口*，但尽量不要依赖其 Prisma 实现5. `platform-db` 不依赖 `platform-iam`/`platform-policy
`（避免循环） 6. `platform-api-kit`依赖 `platform-auth`、`platform-tenant`、`platform-request-context`、`platform-db`，作为“组装层”
依赖层级可视化（建议）：
```textplatform-foundation ↑platform-request-contextplatform-authplatform-tenant ↑ ↑platform-db | ↑ | platform-migrations ↑platform-iam ↑platform-policy ↑platform-api-kit ↑apps/* ```
---
##3) 数据隔离实现细节：TenantContext、request-scoped context、DbRouter/withTenantTx、SET LOCAL search_path、连接池并发安全、防串租户清单、public schema约束###3.1 TenantContext：以 token 为准（权威来源） **原则**：tenantId只能从“已验证的 token claims”中取；子域名/headers未来可作为“
候选”，但最终必须与 token tenantId 一致（或仅用于选择登录入口，不参与最终隔离判定）。
#### 标准 Claims（建议） ```tstype AuthClaims = { sub: string // userId tenantId: string // 当前租户 roles?: string[] // 可选：token 内的角色快照（不作最终依据，便于快速 UI） iat: number exp: number jti?: string} ```
#### TenantContext（建议结构） ```tstype TenantContext = { tenantId: string tenantSchema: string // schema 名称（由 tenantId 映射，不直接等于 tenantId） } ```
> **关键点**：`tenantSchema` 必须由后端根据 tenantId 查询映射（例如 public.tenants 表），绝不能信任客户端传来的 schema 名称。
###3.2 request-scoped context：AsyncLocalStorage（ALS） 目的：在一次 request 生命周期内，任何地方（service/repo）都能拿到当前 tenant/auth 信息，且避免显式层层传参。
- `platform-request-context` 提供： - `runWithRequestContext(ctx, fn)` - `getRequestContext()` - 类型安全的 context store建议 store 内容： ```tstype RequestContextStore = {
requestId: string auth?: { userId: string; tenantId: string; claims: AuthClaims } tenant?: TenantContext} ```
**注意**：ALS只负责“上下文存取”，不负责 DB 隔离；真正隔离必须落在 DB Router + search_path。
###3.3 DbRouter / withTenantTx：强制所有业务查询在 tenant tx 中执行#### 为什么必须 transaction？ 因为你要使用 **`SET LOCAL search_path`**，它只在事务范围内生效（并且会在事务结束时自动恢复），这是防止连接池串租户的最佳手段之一。
#### 核心 API（建议） - `withTenantTx(fn, options?)`：在事务中设置 search_path 并执行回调- `getTenantDb()`：返回当前 tx 上下文中的 db client（仅在 tx 内可用） - `withSystemTx()`：对 public schema（系统表）操作时使用，避免混用伪代码（Prisma interactive transaction 风格）：
```tsawait withTenantTx(async (db) => { // db 是 tx-scoped prisma client（或抽象接口） return db.order.create(...) }) ```
###3.4 `SET LOCAL search_path`细节与 schema 顺序**推荐 search_path 顺序**：
1. tenant schema（业务数据） 2. `shared`（可选：放通用函数/扩展视图） 3. `public`（尽量只放平台级元数据表；业务表不放 public）
示例： ```sqlSET LOCAL search_path TO "tenant_abc123", "shared", "public"; ```
**强约束**：tenant schema 必须加双引号并进行 identifier 安全处理，防止注入（比如 tenantId = `foo"; drop schema public; --`）。
###3.5连接池并发安全（防串租户的关键） 常见串租户来源： 1. 使用 `SET search_path`（非 LOCAL）改了 session级别 search_path，被连接池复用后污染下一请求2. 在事务外执行查询（search_path 未设置） 3. 把 tx client 泄漏到 tx 外（闭包/异步任务延迟执行） 4. schema 名称来自不可信输入**强制策略（建议做成硬性 guard）**： -只允许在 `w…
TenantTx` 内执行 tenant业务查询-任何 repo/service 拿 DB client 必须来自 `db()` 工厂，该工厂会检查“当前是否处于 tenant tx” - 在开发环境加入断言：如果在 tenant相关模块中调用了 system db 或无 tx db，直接抛错###3.6 防串租户清单（可直接作为验收） 1. 禁止 `SET search_path`（只能
`SET LOCAL`） 2. 禁止在 tx 外进行 tenant业务读写（强校验） 3. tenant schema 名称必须从 `public.tenants` 映射获取（不可由 token直接拼接） 4. tx结束后不得持有 db 引用（lint/类型约束 + runtime 检查） 5. 所有跨租户敏感操作（迁移/初始化）必须走 system tx 并显式指定 schema6. 默认 `public` schema 不允许创建
业务表（权限/DDL 管控；见下一节）
###3.7 public schema约束（建议） - `public`只放“平台级元数据”： - tenants（租户注册表：tenantId、schemaName、状态、版本等） - users（若跨租户账号体系；或仅 SSO 主体） - global_audit / outbox（可选） - tenant业务表一律在 tenant schema- 数据库权限层面： - 应用运行账号对 `public` 的 DDL 权限尽
量收紧（不允许随意 create table） -迁移账号（CI/管理员）才有 DDL 权限---
##4) migrations 多 schema 策略：对每个 tenant schema 执行迁移；新租户初始化；基线/回滚；版本管理###4.1迁移策略总览（推荐：一份迁移源，多 schema apply） **迁移文件只维护一份**（monorepo共享），但“执行时”对每个 tenant schema逐个 apply。
核心组件：`packages/platform-migrations`
建议模型： - `MigrationSource`：读取 prisma migrations 或自定义 SQL migration目录- `MigrationStore`：记录每个 tenant 已执行版本（每个 tenant schema 内一张表，或集中在 public 一张表） - `MigrationRunner`：按 tenantSchema 执行####迁移记录放哪里？ 两种方案：
**A. 每个 tenant schema 内有 migration 表（更隔离）** - 表：`__migrations`（在 tenant schema） - 优点：tenant 自包含，未来拆库/导出更方便- 缺点：运维需要跨 schema 聚合查看版本**B. public统一记录（更集中）** - 表：`public.tenant_migrations(tenant_id, version, applied_at, chec…
)` - 优点：运维一张表看全局- 缺点：tenant 不自包含；但一般可接受**建议**：B（public 集中）+ A（tenant 内可选）二选一即可；若强调未来可服务化与租户导出，选 A。
###4.2 “对每个 tenant schema 执行迁移”的执行方式伪流程：
1. system db（public）取所有活跃 tenant 列表（tenantId → schemaName） 2. 对每个 tenant： - 开事务（system tx 或 tenant tx 都可以，但要显式 schema） - `SET LOCAL search_path TO "<tenantSchema>", "public";` - 确保 migration 表存在 -读取已应用版本 - 顺序执行未应用 migra…
（DDL） - 写入 migration记录3. 对失败 tenant 做标记与重试策略（**不要无限重试**，要人工介入）
###4.3 Prisma适配建议（重要现实点） Prisma 的迁移体系默认面向单 schema/单数据库；要支持 schema-per-tenant，实践中常见做法是：
- **迁移使用 SQL 文件（推荐更可控）**：把 Prisma migrations产出的 SQL作为 source，但执行由你自
定义 runner 完成（`SET LOCAL search_path` 后执行 SQL）。 - 或：维护 `schema.prisma` 并使用 `prisma migrate diff`生成 SQL，再交给 runner。
**关键是：执行层要由你控制**，而不是直接 `prisma migrate deploy`。
###4.4 新租户初始化流程（Tenant Provisioning） 当创建新租户时：
1. 写入 `public.tenants`： - tenantId（逻辑 ID） - schemaName（物理 schema，如 `tenant_<shortid>`） - status = provisioning - dbVersion/baselineVersion（可选） 2. 创建 schema： - `CREATE SCHEMA "tenant_xxx";` 3. Apply baseline（两种）： - **
方式1：从0 开始跑全量 migrations**（简单可靠，慢一点） - **方式2：schema template 克隆**（快，但复杂；可后续再做） 4. 初始化默认 IAM： - 创建默认角色（Admin） -绑定创建者用户 - 写入默认资源策略（如系统管理权限） 5. status = active###4.5 基线（Baseline）与回滚（Rollback）策略#### Baseline当 migrations 很多
时，新租户从0 apply 会慢： - 定期“squash”成 baseline（例如每50 个迁移做一次） - baseline版本号：`2026-03-baseline` 或递增整数新租户： -直接导入 baseline SQL（或从 template schema 克隆） - 然后 apply baseline之后的增量 migrations#### Rollback（
现实可行） Prisma 风格 up-only 情况下，推荐主策略： - **回滚=数据库备份恢复（PITR）** +重新 apply 正确版本- 对线上 DDL 风险较高的迁移：要求写“手工 down SQL”（存放在 migration metadata 中），但不强制所有迁移都可逆###4.6 migration版本管理-版本号规则：`YYYYMMDDHHmm_<desc>` 或 Prisma 默认 hash目录- 必须记录 c…
（防止迁移文件被篡改导致不同租户执行不一致） - CI 校验： -迁移只允许追加，不允许修改已发布迁移（否则 checksum变更） - 若确需修复，新增新迁移补丁---
##5) 权限系统设计：auth vs iam 分层；RBAC 实体；Policy 扩展点（data/field/button/workflow）；资源定义归属（app vs platform）；示例 authorize(action, resource, ctx)
###5.1 分层：Auth vs IAM（不要混） - **Auth（认证）**：你是谁？token 是否有效？（platform-auth） - **Tenant（租户定位）**：你属于哪个 tenant？（platform-tenant） - **IAM（身份与授权数据）**：你在该 tenant 下有什么角色/权限绑定？（platform-iam） - **Policy（策略决策）**：在当前上下文下，允许你对某资源做某动作吗？
（platform-policy）
###5.2 RBAC 核心实体（建议最小可用） 在 tenant schema（或按你的偏好放 public + tenantId，但既然 schema-per-tenant，建议放 tenant schema）：
- `users`（或 tenant_users） - `roles` - `permissions`（可选；也可用 policy代替） - `role_bindings`：`userId ↔ roleId`（支持 group） - `groups` / `group_members`（可选，后期增强） - `resources`（资源注册表，可选） - `policies`（策略表，支撑扩展权限）
建议把“RBAC 的 Permission”做成 **动作-资源** 的最小集合，不要把 data/field/workflow 都塞进 permission 表，否则会爆炸。
###5.3 Policy 扩展点设计（关键：可扩展且统一） 将授权决策抽象为：
- `authorize(action, resource, ctx)`：返回 allow/deny + reason + obligations（附带约束） - obligations 用于承载“数据过滤条件”“字段可见列表”“可用按钮列表”“允许的 workflow transition”等####统一的决策结果（建议） ```tstype AuthorizationDecision = | { effect: "allow"; …
?: PolicyObligations } | { effect: "deny"; reason: string }
type PolicyObligations = { data?: DataObligation fields?: FieldObligation buttons?: ButtonObligation workflow?: WorkflowObligation} ```
#### 各类权限建议表达1. **数据权限（Data）**：输出“可拼接到查询的约束” -例如：`where: { ownerId: userId }` 或 `orgId in ...` - 不建议输出 SQL 字符串，建议
输出结构化 AST（便于 ORM适配） 2. **字段权限（Field）**：输出 allow/deny 字段集合 - `{ readable: ["name","phone"], writable:["phone"], masked:["phone"] }` 3. **按钮权限（Button）**：本质是 UI action gating - `{ allowedButtons: ["ORDER_EDIT","ORDER_APPRO…
"] }` 4. **工作流权限（Workflow）**：对状态机 transition 的授权 - `{ allowedTransitions: ["submit","approve"] }`
###5.4资源定义归属（app vs platform） 建议引入“资源命名空间”：
- platform资源：`platform:tenant`、`platform:user`、`platform:role` - app资源：`erp:order`、`crm:lead`
资源注册方式（manifest）： - 每个 app 在启动时向 `platform-policy` 注册其资源与动作字典（仅注册元信息，不是写 DB） - 权限策略/角色绑定在 tenant schema 内配置###5.5 authorize 示例（可落地接口） ```tsawait authorize( { action: "update" }, { resource: "erp:order", resourceId: order
Id }, { tenantId, userId, roles, // 可选：业务上下文，如部门、组织、数据拥有者等 attributes: { orgId, deptId } } ) ```
#### 执行链（建议） 1. `RBACPolicy`：基于角色是否拥有 action/resource 的粗粒度允许2. `DataPolicy`：若允许，返回 data obligation（过滤条件） 3. `FieldPolicy` / `ButtonPolicy` / `WorkflowPolicy`：返回各自 obligations4. 合并 obligations：上层 repo/service 按 obligatio…
约束查询与返回字段>这让系统从 Day-1 可用（先 RBAC），并且能渐进增强到复杂权限而不重构大表结构。
---
##6) 最小可交付里程碑拆分（3~6 tasks）：交付物、验收标准、风险与测试建议这里给6 个 task（你也可以合并为4 个更大粒度）。
### Task1：Monorepo 基建 + platform 包骨架与依赖约束**交付物** - `apps/*` 与 `packages/platform-*`目录落地- workspace 配置（pnpm/turbo/nx任选） -依赖规则工具：depcruise/nx-graph/eslint-import-restrictions- `platform-foundation`：errors、logger、types（最底层）
**验收标准** - apps 能编译运行（哪怕只是 hello route） -违反依赖规则会在 CI/本地 lint失败（例如 packages import apps）
**风险** -依赖规则不落地 → 后续反向依赖导致“中台变业务大杂烩”
**测试建议** - 单测：依赖图规则测试（简单脚本校验） - CI：lint + typecheck---
### Task2：TenantContext + RequestContext（ALS）+ Auth 中间件（token → tenantId） **交付物** - `platform-auth`：token 校验、claims 标准化- `platform-request-context`：ALS store + API- `platform-tenant`：tenantId → schemaName 映射（public.tena…
） - `platform-api-kit`：组合 middleware（auth → tenant resolve → ALS run）
**验收标准** - 任意请求能在 handler 内拿到：`requestId / userId / tenantId / tenantSchema` - token 是 tenant 的权威来源；header/subdomain 若存在不会覆盖 token tenantId**风险** - ALS 使用不当导致 context 丢失（尤其是某些异步边界） - 未验证 token 就读取 tenantId（严重安全问题）
**测试建议** - 单测：token解析、tenant 映射、ALS get/set- 集成测：并发50+ 请求，tenantId 不串---
### Task3：platform-db（DbRouter + withTenantTx）+ search_path 安全与防串租户机制**交付物** - `withTenantTx`：interactive tx + `SET LOCAL search_path` - schema identifier 安全函数（仅允许白名单字符，并强制从映射表取） - 禁止 tx 外 tenant 查询的 runtime guard（dev 强制
，prod 可降级为 error log + deny） - system db 与 tenant db 的明确分离（public vs tenant）
**验收标准** - 并发请求不同 tenant 写入各自 schema，绝不串-任何 tenant repo 在 tx 外调用直接抛错（至少在 dev/test）
**风险** - Prisma 与 interactive transaction 的边界用错，导致 search_path 不生效- 少数路径绕过 withTenantTx**测试建议** - 集成测：并发写入 tenantA/B，校验落表 schema- 故障注入：故意在 tx 外查，必须失败---
### Task4：platform-migrations（多 schema迁移 runner）+ 新租户初始化 CLI**交付物** - `migrate-all-tenants`：对全部 tenant schema apply migrations- `tenant-init`：创建 schema → apply baseline/迁移 → 初始化默认角色与管理员绑定
- migration version store（public 表 or tenant 表）+ checksum 校验**验收标准** - 新建租户可在1 次命令后可用（包含默认 Admin角色） - migrate-all-tenants 可安全重复执行（幂等） - 单个 tenant迁移失败不会污染其他 tenant**风险** - DDL 锁表/长事务影响线上（需控制批量迁移的并发度与窗口） -迁移不可逆导致回滚困难（需预案）
**测试建议** - 集成测：创建3 个 tenant，跑迁移，验证版本一致- 回归：修改迁移文件 checksum 应导致失败（防篡改）
---
### Task5：platform-iam（RBAC 最小闭环）+ platform-policy（authorize + obligations 框架） **交付物** - IAM 实体：User/Role/RoleBinding（最小） - `authorize()`：RBAC allow/deny- obligations 框架与接口（即使暂时只返回空 obligations） - app资源注册机制（manifest）
**验收标准** - 可以配置：某用户在 tenant 下拥有 Admin角色 →允许访问 `erp:*` - `authorize()` 在任意 service 中可调用，且必须带 tenant/user 上下文- app 能注册资源与动作，平台能统一校验**风险** -资源命名不统一导致后续权限混乱- 将 data/field/button/workflow 硬塞 RBAC 表导致不可扩展**测试建议** - 单测：角色绑定、au…
allow/deny- 集成测：不同角色访问不同 route---
### Task6：增强权限（data/field/button/workflow）+ 在一个参考模块中端到端落地**交付物** - data obligation：输出结构化过滤条件（AST/where） - field/button/workflow obligations：最小实现 + 合并策略-选择一个参考资源（如 `erp:order`）： - 列表：自动加 data filter -详情：字段裁剪/脱敏 - UI：按钮显示
由 button obligation 决定 - 工作流：状态流转由 workflow obligation 决定**验收标准** - 同一资源在不同角色下展示字段/按钮/可流转状态不同- 不允许“只靠前端隐藏按钮”绕过（后端 authorize 必须兜底）
**风险** - obligations 与 ORM适配设计不好 →变成拼 SQL-复杂策略导致性能问题（需缓存策略/角色快照）
**测试建议** - 单测：obligation 合并、字段裁剪- 集成测：同一 API 在不同用户下返回不同字段/不同数据集合- 安全测：绕过前端直接调用接口应被 deny---
##7) 可直接用于 task-create 的中文 description（尽量具体）
>你可以把下面整段直接丢进任务系统（Linear/Jira/自研 task-create）。
**Task Description（建议拆为 Epic/Story也可）**：
> 为 miniERP（3 个应用）在 monorepo 路线 B（共享库 + 多应用）下抽离通用中台能力，落地可复用的租户隔离（Postgres schema-per-tenant）、请求上下文（AsyncLocalStorage）、DB 路由与事务封装（SET LOCAL search_path 防串租户）、多 schema migrations 执行器（含新租户初始化）、以及可扩展权限体系（Auth/IAM/Policy 分层，…
AC + 数据/字段/按钮/工作流权限 obligations）。>>具体交付要求：>1) 建立目录结构：apps/* 与 packages/platform-*（platform-foundation/auth/tenant/request-context/db/migrations/iam/policy/api-kit），并实现依赖规则（禁止 packages反向依赖 apps）。>2) Tenant 主入口以 token 为准：…
token 校验与 claims 标准化；从 claims取 tenantId，再映射到 tenantSchema（public.tenants）。提供 request-scoped context（ALS）在任意层读取 tenant/auth。>3) 实现 platform-db：提供 withTenantTx/DbRouter，强制所有 tenant业务查询在 tx 内执行，并在 tx 内 `SET LOCAL search_pa…
` 到 tenantSchema，确保连接池并发安全且不串租户；提供开发态 runtime guard 防止 tx 外查询。>4) 实现 platform-migrations：维护一份迁移源，但支持对每个 tenant schema逐个 apply；提供 migrate-all-tenants 与 tenant-init CLI（创建 schema、apply baseline/迁移、初始化默认 Admin角色与绑定），并有 mig…
版本与 checksum 管理。>5) 权限系统：实现 Auth vs IAM vs Policy 分层；RBAC 最小闭环（User/Role/RoleBinding）；提供 authorize(action, resource, ctx) API；设计并实现 obligations 扩展框架（data/field/button/workflow），先 RBAC 可用，再在一个参考资源（如 erp:order）上端到端落地 data/
field/button/workflow 权限。>> 验收标准：并发多租户请求不串数据；迁移可对所有 tenant 幂等执行；新租户一键初始化可用；authorize 在后端强制生效（不能仅靠前端隐藏）；权限框架可扩展到数据/字段/按钮/工作流。测试需覆盖单测 + 集成测（并发串租户、不同角色返回不同数据/字段/按钮/工作流流转）。---
如果你愿意，我可以在下一步把上述设计进一步“工程化”成更细的接口草图（每个 `platform-*` 包的导出 API、关键类型、以及 Prisma/HTTP适配层如何放置），并给出一份更偏实现层面的伪代码清单（middleware 链、withTenantTx、migration runner、policy engine pipeline）。
