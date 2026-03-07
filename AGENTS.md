# AGENTS.md - Agent 执行上下文

此文件提供给 Claude/Codex/子代理，目标是让 agent 快速进入可执行状态。

---

## 1) 项目定位（先建立共识）

miniERP 是一个 **design-first + runnable monorepo**：
- 产品意图：`designs/`
- 运行时代码：`apps/web`、`apps/server`、`packages/shared`

若设计与代码冲突：
1. 用 `designs/` 理解业务意图
2. 以 `apps/*` 当前实现作为落地真相

---

## 2) 进入任务前先读

1. `README.md`
2. `docs/plans/2026-03-07-erp-page-reconstruction-design.md`（ERP 页面新治理路线）
3. `docs/plans/2026-03-07-erp-page-reconstruction-implementation-plan.md`（实施批次与顺序）
4. `designs/ui/minierp_page_spec.md`（历史 T1–T4 语义参考，正式定义以重构设计文档为准）
5. `designs/ui/miniERP_evidence_system.md`（单据级/行级凭证）
6. `designs/ui/miniERP_design_summary.md`
7. `.claude/rules/erp-rules.md`
8. `openspec/config.yaml`
9. `docs/commit.md`（提交信息规范，含执行者恢复信息）
10. `docs/Macmini-infra.md`（本地开发基础设施：共享中间件、访问地址、排障）

---

## 3) 高频命令（仓库根目录）

```bash
bun install

bun run dev
bun run dev:web
bun run dev:server
bun run daily
bun run project -- all doctor
bun run project -- infra health
bun run project -- server logs

bun run build
bun run lint
bun run test
bun run db:generate
bun run db:migrate
bun run db:seed
```

### 定向命令

```bash
# web
bun run --filter web dev
bun run --filter web build
bun run --filter web lint

# server
bun run --filter server dev
bun run --filter server build
bun run --filter server lint
bun run --filter server test
bun run --filter server test -- src/path/to/file.spec.ts
bun run --filter server test -- src/path/to/file.spec.ts -t "test name"
bun run --filter server test:watch
bun run --filter server test:cov
bun run --filter server test:e2e
bun run --filter server test:e2e -- test/app.e2e-spec.ts
```

### 外部中间件探活

```bash
bun run project -- infra health
bun run project -- infra doctor
```

注意：
- `apps/web` 当前无 `test` script。
- 根 `db:generate` / `db:migrate` / `db:seed` 会代理到 server Prisma 脚本。
- 本地基础设施（共享 PostgreSQL/Redis/RabbitMQ/Nginx）与访问地址以 `docs/Macmini-infra.md` 为准。

---

## 4) 架构执行要点（Agent 视角）

### A. 前端：设计稿驱动 + family shells + page views
- 路由主入口：`apps/web/src/app/(dashboard)/...`
- 页面级 view：`apps/web/src/components/views/erp/`
- family shells：`apps/web/src/components/shells/erp/`
- 局部 primitives：`apps/web/src/components/primitives/erp/`
- 语义配置与 legacy：`apps/web/src/components/business/`

默认策略：
- 已有设计稿映射的正式页面，优先实现 page-level view。
- 只复用 primitives / shells / 局部业务块，不要新造一次性大模板，也不要复活万能 assembly。
- `apps/web/src/components/business/erp-page-assemblies.tsx`、旧 `apps/web/src/components/layouts/overview-layout.tsx`、`workbench-layout.tsx` 仅作 legacy/fallback 参考，不再作为重构页面默认主路径。

### B. 凭证模型是跨域能力
- 单据级凭证 + 行级凭证（line drawer）
- 相关组件：
  - `apps/web/src/components/evidence/evidence-panel.tsx`
  - `apps/web/src/components/evidence/line-evidence-drawer.tsx`
- 相关 BFF 路由：
  - `apps/web/src/app/api/bff/evidence/upload-intents/route.ts`
  - `apps/web/src/app/api/bff/evidence/links/route.ts`

### C. Web 数据链路：SDK -> BFF -> Backend
- 客户端通过 `lib/bff/client.ts` + `lib/sdk/client.ts` 请求 `/api/bff/*`
- BFF 转发后端并注入租户/签名头
- 部分 GET 在上游不可用时仅在 `development/test` 回退 fixtures（`lib/bff/server-fixtures.ts`）

### D. Server 全局约束
- `main.ts`：auth context、tenant context、中间件 + 全局 ValidationPipe
- `app.module.ts`：全局响应包裹拦截器 + 全局异常过滤器
- 响应约定被 web SDK/BFF 依赖

### E. 领域实现组织
- 领域能力在 `apps/server/src/modules/*`
- 共享能力在 `common`、`audit`、`evidence`、`platform`、`database`
- 库存能力示例：`modules/inventory/application/inventory-posting.service.ts`
  - 幂等键
  - payload hash 冲突检测
  - 库存下穿保护
  - reversal 与原台账关联

### F. 契约边界
- `packages/shared` 是前后端共享契约边界（types/constants/utils）
- 新增跨层数据结构时优先沉淀 shared

---

## 5) 业务硬约束（必须遵守）

来自 `.claude/rules/erp-rules.md`：
- 单据号：`DOC-{type}-{YYYYMMDD}-{seq}`
- 金额：必须使用 `decimal.js`
- 状态：显式流转 + 可审计

---

## 6) 工程红线（必须遵守）

1. 新页面只能落在 **T1/T2/T3/T4**，禁止第 5 种 family。
2. 当前 family 定义为：
   - T1 = Hub / Dashboard family
   - T2 = List / Index family
   - T3 = Detail / Record family
   - T4 = Flow / Wizard family
3. family 只约束骨架，不约束具体 UI；正式页面必须复刻已映射的 pencil 设计稿。
4. 列表页筛选/排序/分页必须 URL 化（可分享、可回放）。
5. 页面/壳组件禁止直连 API；页面只通过 VM Hook + BFF。
6. 前端禁止自定义状态枚举；状态只来自 `packages/shared`。
7. 库存只认 `inventory_ledger` 为事实源，余额表仅做查询加速。
8. 所有过账接口强制 `Idempotency-Key`。
9. 禁止物理删除已过账单据；只能作废/冲销。
10. 所有写操作必须带 `tenant_id` 与审计字段（who/when/what）。
11. BFF 是前端唯一数据入口，禁止页面绕过 BFF。
12. PR 必须通过：设计一致性审查 + 状态契约 + 过账一致性测试。
13. 禁止新的万能页面装配器；只允许抽象到 primitives / shells / 局部业务块。
14. `WorkbenchAssembly` / `OverviewAssembly` 仅允许用于 legacy fallback、临时页、未重构页。
15. 并行执行时优先按 route / 文档范围拆任务；涉及共享规则的变更，必须同步更新 `CLAUDE.md`、`AGENTS.md`、`README.md`、`CLAW.md`、`.claude/rules/erp-rules.md`。

---

## 7) OpenSpec 工作流

常用：`/opsx:new` `/opsx:ff` `/opsx:apply` `/opsx:verify` `/opsx:archive`

推荐：规划 -> 实现 -> 验证 -> 归档

---

## 8) 沟通语言

**所有 agents 必须使用中文与用户沟通。**

调用 agent 时在 prompt 附加：

```text
使用中文与我沟通。
```

---

## 9) 文档一致性约定（四文档）

以下四个文件共享同一组“核心事实”：
- `CLAUDE.md`
- `AGENTS.md`
- `README.md`
- `CLAW.md`

更新原则：
1. 先改 `CLAUDE.md` 的核心事实
2. 同步改另外三份，但保留各自受众风格
3. 若命令/架构/约束变更，四份文档必须同批更新
4. 若变更的是 ERP 页面 family 治理、legacy 范围或并行协作规则，还必须同步更新 `.claude/rules/erp-rules.md`
