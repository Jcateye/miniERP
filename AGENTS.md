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
2. `designs/ui/minierp_page_spec.md`（T1–T4 模板体系）
3. `designs/ui/miniERP_evidence_system.md`（单据级/行级凭证）
4. `designs/ui/miniERP_design_summary.md`
5. `.claude/rules/erp-rules.md`
6. `openspec/config.yaml`
7. `docs/commit.md`（提交信息规范，含执行者恢复信息）
8. `docs/Macmini-infra.md`（本地开发基础设施：共享中间件、访问地址、排障）

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

### A. 前端：模板优先 + 配置装配
- 路由主入口：`apps/web/src/app/(dashboard)/...`
- 页面配置：`apps/web/src/components/business/erp-page-config.tsx`
- 页面装配：`apps/web/src/components/business/erp-page-assemblies.tsx`
- 模板壳：`apps/web/src/components/layouts/`

默认策略：优先复用 T1/T2/T3/T4，而不是新增一次性页面结构。

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

## 6) OpenSpec 工作流

常用：`/opsx:new` `/opsx:ff` `/opsx:apply` `/opsx:verify` `/opsx:archive`

推荐：规划 -> 实现 -> 验证 -> 归档

---

## 7) 沟通语言

**所有 agents 必须使用中文与用户沟通。**

调用 agent 时在 prompt 附加：

```text
使用中文与我沟通。
```

---

## 8) 文档一致性约定（四文档）

以下四个文件共享同一组“核心事实”：
- `CLAUDE.md`
- `AGENTS.md`
- `README.md`
- `CLAW.md`

更新原则：
1. 先改 `CLAUDE.md` 的核心事实
2. 同步改另外三份，但保留各自受众风格
3. 若命令/架构/约束变更，四份文档必须同批更新
