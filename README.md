# miniERP

Mini ERP System（采购、销售、库存、财务）

## 项目定位

miniERP 是一个 **设计优先 + 可运行 monorepo**：
- 产品与交互意图：`designs/`
- 运行时代码：`apps/web`、`apps/server`、`packages/shared`

当设计与实现不一致时：
- `designs/` 用于理解目标形态
- `apps/*` 代表当前可运行实现

## 优先阅读

1. `docs/plans/2026-03-07-erp-page-reconstruction-design.md`（ERP 页面新治理路线）
2. `docs/plans/2026-03-07-erp-page-reconstruction-implementation-plan.md`（实施批次与顺序）
3. `designs/ui/minierp_page_spec.md`（历史 T1–T4 语义参考，正式定义以重构设计文档为准）
4. `designs/ui/miniERP_evidence_system.md`（单据级 + 行级凭证）
5. `designs/ui/miniERP_design_summary.md`
6. `.claude/rules/erp-rules.md`
7. `openspec/config.yaml`

## Monorepo 边界

```text
apps/web         Next.js 15 + React 19 前端（App Router）
apps/server      NestJS 11 后端
packages/shared  前后端共享 contracts/constants/utils
designs          UI/PRD/spec 设计源
openspec         spec-driven 变更工件
```

## 常用命令（仓库根目录）

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

### 外部中间件探活命令

```bash
bun run project -- infra health
bun run project -- infra doctor
```

说明：
- `apps/web` 当前无 `test` script。
- 根 `db:generate` / `db:migrate` / `db:seed` 会代理到 server Prisma 脚本。
- `turbo.json` 中 `lint` 与 `test` 依赖上游 `build`。
- Redis key 前缀默认值为 `erp_`（可通过 `REDIS_KEY_PREFIX` 覆盖）。
- 本地开发共享中间件（PostgreSQL/Redis/RabbitMQ/Nginx）与访问地址见 `docs/Macmini-infra.md`。

## 架构总览

### 1) 前端：设计稿驱动 + family 治理 + 页面级 view 实现

正式页面实现路径：
- 设计源与映射：pencil `.pen` + 页面映射文档
- 页面级 view：`apps/web/src/components/views/erp/`
- family shells：`apps/web/src/components/shells/erp/`
- primitives：`apps/web/src/components/primitives/erp/`
- route 入口：`apps/web/src/app/(dashboard)/.../page.tsx`

说明：
- 保留 T1/T2/T3/T4 名字，但旧“模板优先 + 配置驱动”定义失效。
- family 只治理骨架，不定义具体 UI。
- `apps/web/src/components/business/erp-page-assemblies.tsx` 与旧 `layouts/` 语义属于 legacy/fallback only，不再作为重构页面默认主路径。
- 可以抽共用 primitives / shells / 局部业务块，但禁止再造新的万能 assembly。

### 2) 凭证：跨采购/销售/库存统一能力

统一采用两层模型：
- 单据级凭证
- 行级凭证（line drawer 工作流）

### 3) Web 数据流

hooks/components -> SDK/BFF client -> Next.js `/api/bff/*` -> backend

在部分 GET 场景下，若上游不可用，BFF 仅在 `development/test` 环境允许回退 fixtures；非开发环境返回上游不可用错误，避免掩盖真实故障。

### 4) Server 全局能力

- 全局中间件：auth context、tenant context
- 全局校验：ValidationPipe
- 全局响应/异常：ApiResponseInterceptor + ApiExceptionFilter

### 5) Shared 契约边界

`packages/shared` 作为跨层类型/常量/工具的统一出口，避免 web/server 契约漂移。

## 业务约束

来自 `.claude/rules/erp-rules.md`：
- 单据号格式：`DOC-{type}-{YYYYMMDD}-{seq}`
- 金额计算：必须使用 `decimal.js`
- 单据状态：必须显式流转并保留审计线索

## 工程红线（必须遵守）

1. 新页面只能落在 **T1/T2/T3/T4**，禁止第 5 种 family。
2. T1/T2/T3/T4 的当前定义为：
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
13. 允许抽象的层级仅限 primitives / shells / 局部业务块；禁止新的万能页面装配器。
14. `WorkbenchAssembly` / `OverviewAssembly` 仅允许用于 legacy fallback、临时页、未重构页。
15. 并行执行时，agent 应按页面路由或文档范围拆分任务；涉及共享事实的修改必须同批同步 `CLAUDE.md`、`AGENTS.md`、`README.md`、`CLAW.md`、`.claude/rules/erp-rules.md`。

## OpenSpec 工作流

常用命令：
- `/opsx:new`
- `/opsx:ff`
- `/opsx:apply`
- `/opsx:verify`
- `/opsx:archive`

推荐流程：规划 -> 实现 -> 验证 -> 归档

## CI/CD 与容器化现状

- CI：`.github/workflows/ci.yml`
  - 执行 `bun install`、`bun run lint`、`bun run build`、`bun run test`
  - 额外执行 web/server Dockerfile 构建校验
- CD（staging）：`.github/workflows/cd-staging.yml`
  - 监听 `CI` 在 `main` 分支的成功运行（或手动触发）
  - 构建并推送 web/server 镜像到 GHCR
  - 预留 staging 部署步骤 TODO（凭据、rollout、健康检查、回滚）
- Dockerfile：
  - `apps/web/Dockerfile`
  - `apps/server/Dockerfile`
- Docker 构建上下文忽略：`.dockerignore`

## 文档一致性

`CLAUDE.md`、`AGENTS.md`、`README.md`、`CLAW.md` 四份文档共享同一组核心事实；ERP 页面 family 治理还必须与 `.claude/rules/erp-rules.md` 保持一致。

若其中一份发生相关变更，应同批同步另外四份（允许表达风格按受众区分）。

并行执行建议：
- 以 route 或文档范围拆任务，避免多个 agent 同时改同一页面主实现。
- 共享 primitives / shells 的接口要先冻结，再并行接入页面。
- 涉及 family 定义、legacy 范围、工程红线的修改，不允许只改单份文档。
