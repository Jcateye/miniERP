# AGENTS.md - Agent 执行上下文

此文件提供给 Claude/Codex/子代理，目标是让 agent 快速进入“先治理、再实现、可验证”的执行状态。

---

## 1) 第一性共识

1. 文档的目的是指导开发，防止偏离。
2. 文档必须先于代码；共享规则未落文档时，不得把实现当正式方案。
3. family 只是骨架约束，不是模板系统。
4. 路由可访问不代表页面完成。
5. 并行开发前，必须先冻结共享接口。

---

## 2) 项目定位

miniERP 是一个 **design-first + runnable monorepo**：
- 产品意图：`designs/`
- 运行时代码：`apps/web`、`apps/server`、`packages/shared`

若设计与代码冲突：
1. 用 `designs/` 理解业务意图
2. 以 `apps/*` 当前实现作为运行事实
3. 以四文档和 `.claude/rules/erp-rules.md` 判断能否继续实现

---

## 3) 进入任务前先读

1. `README.md`
2. `CLAUDE.md`
3. `CLAW.md`
4. `docs/plans/2026-03-07-erp-page-reconstruction-design.md`
5. `docs/plans/2026-03-07-erp-page-reconstruction-implementation-plan.md`
6. `designs/ui/minierp_page_spec.md`
7. `designs/ui/miniERP_evidence_system.md`
8. `designs/ui/miniERP_design_summary.md`
9. `.claude/rules/erp-rules.md`
10. `openspec/config.yaml`
11. `docs/commit.md`
12. `docs/Macmini-infra.md`

---

## 4) 高频命令（仓库根目录）

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

注意：
- `apps/web` 当前无 `test` script。
- 根 `db:*` 代理到 server Prisma 脚本。
- 本地基础设施与访问地址以 `docs/Macmini-infra.md` 为准。

---

## 5) 页面状态定义（执行口径）

ERP 页面只允许五种状态：

| 状态 | 判定 | 允许说法 | 不允许说法 |
| --- | --- | --- | --- |
| `placeholder` | 只有占位内容或待实现路由 | 路由占坑、待设计/待联调 | 页面完成 |
| `legacy-assembly` | 仍经由旧 assembly/fallback 主路径运行 | 历史兼容、过渡中 | 独立 page-level view 已完成 |
| `page-view` | 已有独立 page-level view，但未满足全部完成标准 | 已开始正式重构 | 已 verified |
| `verified` | 设计一致性 + 数据联调 + 测试通过 | 候选完成 | `production` |
| `production` | 已通过代码审查并完成文档同步，进入正式运行口径 | 正式完成 | 无 |

执行要求：

1. 任务开始前先标注目标页面当前状态。
2. 任务结束时更新状态，不得跳过中间判定。
3. 仅在设计一致性、数据联调、测试通过满足时，才能改成 `verified`。
4. 仅在 `verified` 基础上再完成代码审查与文档同步时，才能改成 `production`。

---

## 6) 任务执行流程

### A. 接任务

1. 确认任务范围是 route、共享模块、还是文档治理。
2. 找到对应设计稿、现有实现、共享契约。
3. 判断是否涉及 family、完成标准、共享接口或 legacy 边界。

### B. 先治理

1. 若任务会改变共享事实，先更新文档，再改代码。
2. 若多人并行，先产出接口冻结清单：
   - `packages/shared` 类型/状态
   - BFF DTO
   - shells / primitives 公开 props
   - 页面状态与完成口径
3. 若接口未冻结，不要让页面 agent 并行落实现。

### C. 再实现

1. 正式页面优先实现 page-level view。
2. family 只提供骨架，业务编排放在 page view + VM Hook。
3. 禁止新增万能 assembly。
4. 页面只能通过 VM Hook + BFF 取数。

### D. 后验证

1. 设计一致性：对照 design mapping 与页面结构。
2. 数据联调：确认走真实链路或明确说明 fixture/占位。
3. 测试通过：执行与改动范围匹配的验证。
4. 代码审查：确认门禁项有 reviewer 结论。
5. 文档同步：回写文档、状态、风险。

---

## 7) 架构执行要点（Agent 视角）

### A. 前端：设计稿驱动 + family shells + page views
- 路由主入口：`apps/web/src/app/(dashboard)/...`
- 页面级 view：`apps/web/src/components/views/erp/`
- family shells：`apps/web/src/components/shells/erp/`
- primitives：`apps/web/src/components/primitives/erp/`
- 语义配置与 legacy：`apps/web/src/components/business/`

默认策略：
- 已有设计稿映射的正式页面，优先实现 page-level view。
- 只复用 primitives / shells / 局部业务块，不要新造一次性大模板，也不要复活万能 assembly。
- `apps/web/src/components/business/erp-page-assemblies.tsx`、旧 `overview-layout.tsx`、`workbench-layout.tsx` 仅作 `legacy-assembly` 参考，不是重构默认路径。

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
- 部分 GET 在上游不可用时仅在 `development/test` 回退 fixtures

### D. Server 全局约束
- `main.ts`：auth context、tenant context、中间件 + 全局 ValidationPipe
- `app.module.ts`：全局响应包裹拦截器 + 全局异常过滤器
- 响应约定被 web SDK/BFF 依赖

### E. 契约边界
- `packages/shared` 是前后端共享契约边界
- 新增跨层数据结构时优先沉淀 shared

---

## 8) 业务硬约束（必须遵守）

来自 `.claude/rules/erp-rules.md`：
- 单据号：`DOC-{type}-{YYYYMMDD}-{seq}`
- 金额：必须使用 `decimal.js`
- 状态：显式流转 + 可审计

---

## 9) 工程红线（必须遵守）

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
12. PR 必须通过：设计一致性审查 + 状态契约 + 过账一致性测试 + 代码审查 + 文档同步检查。
13. 禁止新的万能页面装配器；只允许抽象到 primitives / shells / 局部业务块。
14. `WorkbenchAssembly` / `OverviewAssembly` 仅允许用于 `legacy-assembly` 页面、临时页、未重构页。
15. 并行执行时优先按 route / 文档范围拆任务；共享接口未冻结前不得并行落页面实现。

---

## 10) 完成检查清单

提交前逐项自查：

1. 页面状态是否已标注为 `placeholder` / `legacy-assembly` / `page-view` / `verified` / `production` 之一。
2. 是否明确说明完成标准五项的当前结论：
   - 设计一致性
   - 数据联调
   - 测试通过
   - 代码审查
   - 文档同步
3. 是否确认 family 只是骨架，没有退化成模板系统。
4. 是否确认没有把业务编排塞回共享 assembly。
5. 是否确认共享接口已冻结或本任务不涉及共享接口。
6. 是否确认页面没有绕过 BFF，没有自造状态枚举。
7. 是否同步更新四文档与 `.claude/rules/erp-rules.md` 中受影响的核心事实。
8. 是否记录验证命令、验证结论、未覆盖风险。

---

## 11) PR 门禁检查点

PR 描述至少应回答：

1. 这次改动涉及哪些页面状态变化？
2. 完成标准五项分别如何验证？
3. 是否引入或移除了 legacy 路径？
4. 是否存在共享接口冻结记录？
5. 是否同步更新四文档与规则文档？

---

## 12) OpenSpec 工作流

常用：`/opsx:new` `/opsx:ff` `/opsx:apply` `/opsx:verify` `/opsx:archive`

推荐：规划 -> 冻结接口 -> 实现 -> 验证 -> 归档

---

## 13) 沟通语言

**所有 agents 必须使用中文与用户沟通。**

调用 agent 时在 prompt 附加：

```text
使用中文与我沟通。
```

---

## 14) 文档一致性约定（四文档）

以下四个文件共享同一组“核心事实”：
- `CLAUDE.md`
- `AGENTS.md`
- `README.md`
- `CLAW.md`

更新原则：
1. 先改 `CLAUDE.md` 的核心事实
2. 同步改另外三份，但保留各自受众风格
3. 若变更命令、架构、状态定义、完成标准、接口冻结机制，四份文档必须同批更新
4. 若变更 family 治理、legacy 范围或并行协作规则，还必须同步更新 `.claude/rules/erp-rules.md`
