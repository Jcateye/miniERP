# miniERP

Mini ERP System - 采购、销售、库存、财务管理

## 项目定位

miniERP 是一个**设计优先 + 可运行骨架**的 monorepo：
- 产品/交互意图在 `designs/`（spec 文档）
- 运行时代码在 `apps/web`、`apps/server`、`packages/shared`

当设计与代码不一致时：
- `designs/` 代表产品意图
- `apps/*` 代表当前实现真相

## 优先阅读（高 ROI）

1. `designs/ui/minierp_page_spec.md`（T1–T4 模板体系）
2. `designs/ui/miniERP_evidence_system.md`（两层凭证模型）
3. `designs/ui/miniERP_design_summary.md`
4. `.claude/rules/erp-rules.md`
5. `openspec/config.yaml`

## Monorepo 边界

```text
apps/web         前端（Next.js App Router，src/app）
apps/server      后端（NestJS）
packages/shared  前后端共享 contracts/constants/utils
designs          UI/PRD/spec 设计来源
openspec         spec-driven 变更工件
```

## 常用命令（仓库根目录）

```bash
bun install

bun run dev
bun run dev:web
bun run dev:server

bun run lint
bun run test
bun run build
```

### 定向命令

```bash
# server
bun run --filter server dev
bun run --filter server test
bun run --filter server test -- src/path/to/file.spec.ts
bun run --filter server test:watch
bun run --filter server test:cov
bun run --filter server test:e2e

# web
bun run --filter web dev
bun run --filter web build
bun run --filter web lint
```

说明：
- `apps/web` 当前没有 test script。
- 根目录 `db:generate` / `db:migrate` 会代理到 server，但 server 目前未定义对应脚本。

## 架构要点（Big Picture）

### 1) 模板驱动 UI

页面优先复用 `designs/ui/minierp_page_spec.md` 的四类模板：
- T1 OverviewLayout
- T2 WorkbenchLayout
- T3 DetailLayout
- T4 WizardLayout

若页面与某模板匹配约 80% 以上，应复用模板并仅替换字段/数据。

### 2) 凭证是跨域能力

`designs/ui/miniERP_evidence_system.md` 定义两层模型：
- 单据级凭证（全局附件）
- 行级凭证（SKU 行 drawer 工作流）

在采购/销售/库存相关流程中保持一致。

### 3) Runtime 分层

- Web（`apps/web`）：路由、页面组合、交互
- Server（`apps/server`）：领域 API 与状态流转
- Shared（`packages/shared`）：跨层协议与通用基础

### 4) 当前成熟度（重要）

当前运行时代码仍是骨架：
- Web：最小落地页
- Server：基础 hello-world 骨架
- Shared：已具备基础 ERP 类型/常量/工具

功能实现应按增量方式推进。

## 业务约束（来自 `.claude/rules/erp-rules.md`）

- 单据号格式：`DOC-{type}-{YYYYMMDD}-{seq}`
- 金额计算：必须使用 `decimal.js`（避免直接浮点运算）
- 单据状态：必须显式流转且可审计

## OpenSpec 工作流

常用命令：
- `/opsx:new`
- `/opsx:ff`
- `/opsx:apply`
- `/opsx:verify`
- `/opsx:archive`

推荐流程：
1. 规划（`/plan` 或 `/opsx:new`）
2. 实现（`/opsx:apply`，可选 `/tdd`）
3. 验证（`/opsx:verify`，可选 `/verify`）
4. 归档（`/opsx:archive`）

## 额外指令文件（若存在需检查）

- `.cursor/rules/*` 或 `.cursorrules`
- `.github/copilot-instructions.md`
