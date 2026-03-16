# miniERP 中台设计落地计划（origin-dccb69fa）

## 目标
把 [docs/architecture/origin-dccb69fa-middle-platform-design.md](docs/architecture/origin-dccb69fa-middle-platform-design.md) 的“路线 B：共享 packages + 多应用（未来可服务化）+ schema-per-tenant + authorize/obligations”设计，映射到当前仓库的真实落地状态，并输出下一阶段可执行的实现计划（可按夜间开发节奏拆分）。

## 约束 / 不做
- 不做微服务化。
- schema-per-tenant 必须可验证（测试/集成测）。
- Tenant 以 token/认证上下文为准（当前实现有 HMAC + JWT-ready 过渡态，需要明确差距）。
- 计划以最小可交付迭代推进：先 RBAC 可用，再 obligations（data/field/button/workflow）落一个参考资源端到端。

## 当前已落地（来自 platform-design.md 与代码现实）
- ✅ packages/platform-kernel（基础 types/errors/config utils）
- ✅ packages/platform-tenant（ALS tenant context + resolver + middleware）
- ✅ packages/platform-db（withTenantTx + SET LOCAL search_path + tenant registry public.tenants + dev guard）
- ✅ packages/platform-policy（authorize contract + obligations 结构 + merge 逻辑）
- ✅ packages/platform-iam（GrantedPermissionsStore + createAuthorizer，RBAC 最小闭环）
- ✅ apps/server/scripts/tenant-migrations.ts（tenant-init + migrate-all-tenants）
- ✅ server 侧 Guard/Decorator enforcement 示例（authorize.guard / policy spec）

## 核心差距（需要继续实现）
1) 业务模块仍大量直接使用 PrismaService：未统一强制进入 PlatformDbService.withTenantTx（search_path 隔离能力未全面覆盖）。
2) Tenant 以 token claims 为准：当前 server 认证仍以 x-auth-context(HMAC) + dev bypass 为主，JWT 虽已引入但 claims/issuer/aud 等仍是最小实现。
3) obligations（data/field/button/workflow）尚未端到端落在一个真实资源上（Task6 未启动）。
4) migrations runner 仍在 apps/server/scripts，是否要抽 packages/platform-migrations 尚未决定（可后置）。

## 里程碑 / Phase

### Phase 0：盘点与冻结接口（complete）
- [ ] 输出“设计→代码”映射表：origin-dccb69fa 的模块 vs 当前 repo 目录/实现
- [ ] 冻结下一阶段要落地的最小接口（authorize 输入/输出、obligations 的最小 AST 形态）
- [ ] 记录决策：资源/permission 的 scope 段 **先不做字符集强约束**（未来可能配置化）。当前仅要求：trim 后非空且不包含 `:`（否则无法用 `:` 作为分隔符）。

### Phase 1：业务侧强制 withTenantTx（pending，作为 A 的一部分）
- [ ] 说明：平台层 withTenantTx 已落地，但业务模块是否“强制走 tenant tx”仍不完整。
- [ ] A1（优先）：选 1 个写链路把 PrismaService 直连收敛到 PlatformDbService.withTenantTx（推荐从 Document/Trading 写链路开始，因为并发/状态机更敏感）。
- [ ] A2（后续）：按模块分批推进（Inventory/Masterdata/...），每批都补 1 个“tx 外访问必失败”的用例作为验收点。

### Phase 2：obligations 端到端（计划 B：先跑通 Inventory）（pending）
> 目标：把“RBAC allow/deny”升级为“allow/deny + obligations”，并让业务端实际消费 obligations（后端兜底）。

- [ ] B0：冻结资源/动作命名（本期）：
  - 资源：`erp:inventory`
  - 动作：`read | create`（后续再细分 ledger/balances/inbound/outbound）
  - scope 段（如 warehouseId）先不限定格式，按“原样字符串”处理（仅要求不含 `:`）。
- [ ] B1：打通 obligations 的“传递路径”（Guard → request-scoped context → handler 可读取）：
  - 不改 request 对象字段（避免 mutation）；优先用 ALS / request-scoped service 存储本次 authorize 的结果（含 obligations）。
- [ ] B2：Inventory 接口接入 RequireAuthorize：
  - GET /inventory/balances 与 GET /inventory/ledger：RequireAuthorize(resource=erp:inventory, action=read)
  - POST /inventory/inbound 与 POST /inventory/outbound：RequireAuthorize(resource=erp:inventory, action=create)
- [ ] B3：落地 1 个最小可验证的 obligations（推荐从 data obligation 开始）：
  - 约定：用 granted permissions 推导 warehouse scope（示例：`erp:warehouse:<id>:read`），生成 obligations.data = { allowedWarehouseIds: [...] }
  - 在 inventory read 路由中强制应用该过滤（即使前端绕过也必须生效）。
- [ ] B4：测试（RED→GREEN）：
  - unit：platform-iam/authorizer 能从 permissions 推导 obligations（至少覆盖 allow/deny + obligations.data 组合）
  - integration：inventory controller 在不同权限下返回不同 warehouse 的数据集合

### Phase 3：obligations 端到端（计划 A：Document）（pending，B 完成后立刻做 A1）
- [ ] A0：冻结资源/动作命名（本期）：
  - 资源：`erp:document`
  - 动作：`read | create | post`（只覆盖 PO/GRN 先）
- [ ] A1（你要求的“干完 B 马上继续做”）：在 Document 写链路落地 workflow/button obligations 的最小版本：
  - `post` 动作必须后端 enforce（不能只靠前端隐藏）
  - 失败直接返回 409/403，并给出清晰 code/message，提示用户“重试提交/无权限”（不做自动重试）
- [ ] A2：data obligation（列表/查询过滤）与 fields obligation（字段裁剪/脱敏）按需要补齐

### Phase 4：JWT 目标态收敛（pending）
- [ ] 明确 token claims 规范（sub/tenantId/roles/iat/exp/jti）
- [ ] server 侧将 tenantId 权威来源切到 JWT（或明确过渡策略）

### Phase 5：文档同步与验收（pending）
- [ ] platform-design.md 与 origin-dccb69fa 的关系：标注 canonical 文档、过期内容处理
- [ ] 给出可执行的验收 checklist（并发不串租户、权限兜底、obligations 生效）

### Phase 3：JWT 目标态收敛（pending）
- [ ] 明确 token claims 规范（sub/tenantId/roles/iat/exp/jti）
- [ ] server 侧将 tenantId 权威来源切到 JWT（或明确过渡策略）

### Phase 4：文档同步与验收（pending）
- [ ] platform-design.md 与 origin-dccb69fa 的关系：标注 canonical 文档、过期内容处理
- [ ] 给出可执行的验收 checklist（并发不串租户、权限兜底、obligations 生效）

## 风险清单
- 大范围迁移 PrismaService → withTenantTx 会触及很多模块，需分批推进。
- obligations 的 data filter AST 若设计不当会导致 ORM 适配困难；需先选用 Prisma where 结构或自定义 AST。

## Errors Encountered
| 时间 | 错误 | 处理 |
|---|---|---|
| 2026-03-15 | （无） |  |
