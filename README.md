# miniERP

Mini ERP System - 采购、销售、库存、财务管理

## 项目定位

本仓库是一个**设计优先 + 可运行骨架并存**的 miniERP 工作区：

- 设计来源：`designs/*.pen`、PRD、页面规格、凭证系统文档
- 代码骨架：`apps/web`（Next.js）、`apps/server`（NestJS）、`packages/shared`

> 设计意图与流程优先从 `designs/` 理解；运行时实现以 `apps/*` 与 `packages/shared` 为准。

## 技术栈

| 部分 | 技术 |
|------|------|
| 前端 | Next.js 15 + React 19 + Tailwind CSS 4 |
| 后端 | NestJS 11 + TypeScript |
| Monorepo | Turborepo + Bun Workspaces |
| 数据库 | PostgreSQL + Prisma（脚本入口已预留） |

## 目录结构（高频）

```text
miniERP/
├── apps/
│   ├── web/                    # 前端 (Next.js App Router)
│   └── server/                 # 后端 (NestJS)
├── packages/
│   └── shared/                 # 前后端共享类型/常量/工具
├── designs/                    # 设计文档 + .pen 文件
├── openspec/                   # OpenSpec 变更工件与配置
├── .claude/                    # Claude Code 配置/规则/skills
├── package.json                # Root scripts
└── turbo.json                  # Turborepo pipeline
```

## 开发命令（根目录）

```bash
# 安装依赖
bun install

# 同时启动前后端
bun run dev

# 单独启动
bun run dev:web
bun run dev:server

# 质量与构建
bun run lint
bun run test
bun run build

# DB
# 根目录已预留 db:* 入口：
# `bun run db:generate` / `bun run db:migrate`
# 当前会失败，因为 apps/server/package.json 尚未定义
# `db:generate` / `db:migrate` 对应脚本。
```

## 测试命令

### Workspace 级

```bash
bun run test
```

### Server（Jest）

```bash
# 仅跑 server 测试
bun run --filter server test

# 单个测试文件
bun run --filter server test -- src/path/to/file.spec.ts

# watch / coverage / e2e
bun run --filter server test:watch
bun run --filter server test:cov
bun run --filter server test:e2e
```

> `apps/web` 当前没有 `test` script。

## 架构要点

### 1) 模板驱动页面体系（T1-T4）

参考 `designs/ui/minierp_page_spec.md`：
- **T1 OverviewLayout**：仪表盘/概览
- **T2 WorkbenchLayout**：列表/表格高密度操作
- **T3 DetailLayout**：详情页（tabs + 上下文动作）
- **T4 WizardLayout**：向导式流程页

多数页面应优先复用模板而不是新造布局。

### 2) 凭证系统（跨流程核心能力）

参考 `designs/ui/miniERP_evidence_system.md`：
- **单据级凭证**（全局附件）
- **行级凭证**（SKU 行 camera-count entry + drawer）

该模型贯穿采购/销售/库存流程，扩展相关页面时应保持一致。

### 3) Runtime 分层

- `apps/web`：页面路由、UI 组合、交互层
- `apps/server`：业务模块、API、状态流转
- `packages/shared`：跨端协议类型与共享基础能力

## 当前成熟度说明

- `designs/` 中的设计与规格资料较完整；
- 运行时代码处于可运行骨架阶段，具体功能覆盖请结合：
  - `designs/ui/miniERP_design_summary.md`
  - 对应模块源码（`apps/web`, `apps/server`）

## OpenSpec 工作流

本项目启用 OpenSpec（spec-driven）进行变更管理。

### 常用命令

```bash
/opsx:new      # 创建新变更
/opsx:ff       # 快进模式生成 artifacts
/opsx:apply    # 实现变更
/opsx:verify   # 验证实现
/opsx:archive  # 归档变更
```

### 推荐流程

1. 规划：`/plan "功能描述"` 或 `/opsx:new`
2. 实现：`/opsx:apply` 或 `/tdd`
3. 验证：`/opsx:verify` 或 `/verify`
4. 归档：`/opsx:archive`

## 业务规则与参考文档

### 业务规则

- `.claude/rules/erp-rules.md`

关键规则包括：
- 单据编号格式：`DOC-{type}-{YYYYMMDD}-{seq}`
- 金额计算必须使用 `decimal.js`
- 状态流转必须可追踪

### 快速阅读顺序

1. `designs/ui/minierp_page_spec.md`
2. `designs/ui/miniERP_evidence_system.md`
3. `designs/ui/miniERP_design_summary.md`
4. `.claude/rules/erp-rules.md`
5. `openspec/config.yaml`
