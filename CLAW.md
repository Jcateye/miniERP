# CLAW.md - Agent 项目配置

> 面向 AI Agent 的项目级配置清单（执行导向）。

---

## 项目信息

- **名称**: miniERP
- **形态**: monorepo（Bun Workspaces + Turborepo）
- **包管理器**: bun
- **技术栈**:
  - Web: Next.js 15 + React 19
  - Server: NestJS 11 + TypeScript
  - Shared: workspace 包 `@minierp/shared`

---

## 安装

```bash
bun install
```

---

## 命令（根目录）

```bash
# 开发
bun run dev
bun run dev:web
bun run dev:server
bun run daily
bun run project -- all doctor
bun run project -- infra health
bun run project -- server logs

# 质量
bun run build
bun run lint
bun run test
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

### 命令注意事项

- `apps/web` 当前无 `test` script。
- 根 `db:generate` / `db:migrate` / `db:seed` 依赖 server Prisma 脚本。
- Turborepo 配置中，`lint` 和 `test` 依赖上游 `build`。
- 本地基础设施（共享 PostgreSQL/Redis/RabbitMQ/Nginx）与访问方式以 `docs/Macmini-infra.md` 为准。

---

## 目录边界

```text
apps/web         前端（App Router）
apps/server      后端（NestJS）
packages/shared  跨端共享契约
designs          设计与规格源
openspec         变更工件
.claude/rules    项目规则（含 erp-rules）
```

---

## 执行策略（Agent 必读）

1. **设计优先 + 可运行实现**
   - 用 `designs/` 理解目标
   - 以 `apps/*` 当前实现为落地依据
   - ERP 页面治理以 `docs/plans/2026-03-07-erp-page-reconstruction-design.md` 为当前正式说明

2. **前端采用设计稿驱动 + family 治理**
   - 页面级 view：`apps/web/src/components/views/erp/`
   - family shells：`apps/web/src/components/shells/erp/`
   - primitives：`apps/web/src/components/primitives/erp/`
   - 语义配置与 legacy：`apps/web/src/components/business/`
   - 页面优先复刻设计稿，不再默认走 `erp-page-assemblies.tsx` 的通用装配路径
   - `WorkbenchAssembly` / `OverviewAssembly` 仅允许用于 legacy fallback、临时页、未重构页

3. **凭证模型固定为两层**
   - document-level + line-level
   - 相关入口：
     - `apps/web/src/components/evidence/*`
     - `apps/web/src/app/api/bff/evidence/*`

4. **Web 请求链路**
   - SDK -> BFF(`/api/bff/*`) -> Backend
   - 部分 GET 仅在 `development/test` 且上游不可用时回退 fixtures；非开发环境返回上游不可用错误

5. **Server 全局约束**
   - 中间件：auth/tenant context
   - 全局校验：ValidationPipe
   - 全局响应/异常：interceptor + filter

6. **跨层契约统一**
   - 新增共享类型优先进入 `packages/shared`

7. **并行协作规则**
   - 优先按页面 route 或文档范围拆分任务，避免多人同时修改同一页面主实现
   - 一名 agent 负责一批共享 primitives/shells 时，必须先冻结接口，再让页面 agent 消费
   - 涉及 family 定义、legacy 范围、工程红线的修改，必须同步更新 `CLAUDE.md`、`AGENTS.md`、`README.md`、`CLAW.md`、`.claude/rules/erp-rules.md`

---

## 业务硬约束

来自 `.claude/rules/erp-rules.md`：
- 单据号：`DOC-{type}-{YYYYMMDD}-{seq}`
- 金额：必须使用 `decimal.js`
- 状态：显式流转 + 可审计

---

## 工程红线（必须遵守）

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
13. 允许复用的层级仅限 primitives / shells / 局部业务块；禁止新的万能页面装配器。
14. `WorkbenchAssembly` / `OverviewAssembly` 仅允许用于 legacy fallback、临时页、未重构页。
15. 并行执行时，共享事实必须同批更新五份规则文档与 `.claude/rules/erp-rules.md`，避免 agent 间规则漂移。

---

## OpenSpec

常用：`/opsx:new` `/opsx:ff` `/opsx:apply` `/opsx:verify` `/opsx:archive`

推荐：规划 -> 实现 -> 验证 -> 归档

---

## Agent 沟通语言

**所有 agents 必须使用中文与用户沟通。**

调用其他 agent 时附加：

```text
使用中文与我沟通。
```

---

## 四文档一致性维护

四份文档：
- `CLAUDE.md`
- `AGENTS.md`
- `README.md`
- `CLAW.md`

维护规则：
1. 核心事实（命令、架构边界、业务约束）先改 `CLAUDE.md`
2. 同批同步三份文档
3. 允许文风差异（面向用户/面向 agent/面向执行清单），但事实必须一致

---

*此文件应纳入版本控制并持续维护。*
