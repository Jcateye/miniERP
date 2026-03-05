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

1. `designs/ui/minierp_page_spec.md`（T1–T4 模板体系）
2. `designs/ui/miniERP_evidence_system.md`（单据级 + 行级凭证）
3. `designs/ui/miniERP_design_summary.md`
4. `.claude/rules/erp-rules.md`
5. `openspec/config.yaml`

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

### 1) 前端：模板优先 + 配置驱动

页面按 T1/T2/T3/T4 模板装配：
- 页面配置：`apps/web/src/components/business/erp-page-config.tsx`
- 页面装配：`apps/web/src/components/business/erp-page-assemblies.tsx`
- 模板壳：`apps/web/src/components/layouts/`

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

`CLAUDE.md`、`AGENTS.md`、`README.md`、`CLAW.md` 四份文档共享同一组核心事实（命令、架构、约束）。

若其中一份发生相关变更，应同批同步另外三份（允许表达风格按受众区分）。
