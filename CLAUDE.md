# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository purpose

This repository is a **hybrid workspace** for miniERP:
- **Design-first artifacts** (Pencil `.pen` files + product/spec docs)
- **Runnable monorepo scaffold** (`apps/web`, `apps/server`, `packages/shared`)

Design intent is defined primarily in `designs/`; runtime implementation status is reflected in the app/server code.

## Fast onboarding (read order)

1. `README.md` (commands + structure)
2. `designs/ui/minierp_page_spec.md` (T1-T4 template system)
3. `designs/ui/miniERP_evidence_system.md` (core evidence interaction model)
4. `designs/ui/miniERP_design_summary.md` (design coverage/progress)
5. `.claude/rules/erp-rules.md` (ERP business constraints)
6. `openspec/config.yaml` (spec workflow context)

## Key project structure

- `apps/web/` - Next.js 15 frontend (App Router)
- `apps/server/` - NestJS 11 backend modules
- `packages/shared/` - shared types/constants/utils between web and server
- `designs/` - PRD/specs + `.pen` source of truth for UI structure
- `.claude/rules/erp-rules.md` - project-level domain rules
- `openspec/` - OpenSpec artifacts/config

## Common development commands

All commands run from repository root:

```bash
# Install dependencies
bun install

# Development
bun run dev
bun run dev:web
bun run dev:server

# Quality/build
bun run lint
bun run test
bun run build

# DB
# 根目录已预留 db:* 入口：
# `bun run db:generate` / `bun run db:migrate`
# 当前会失败，因为 apps/server/package.json 尚未定义
# `db:generate` / `db:migrate` 对应脚本。
```

### Single-test commands

Server uses Jest (`apps/server/package.json`):

```bash
# Server tests only
bun run --filter server test

# Single spec file
bun run --filter server test -- src/path/to/file.spec.ts

# Extra server test modes
bun run --filter server test:watch
bun run --filter server test:cov
bun run --filter server test:e2e
```

`apps/web` currently has no `test` script.

## Architecture overview (big picture)

### 1) Template-driven screen system
UI is organized around 4 reusable page archetypes in `designs/ui/minierp_page_spec.md`:
- **T1 OverviewLayout**: KPI + tasks + shortcuts + timeline
- **T2 WorkbenchLayout**: list/table-heavy operational pages
- **T3 DetailLayout**: single-entity detail + tabs/actions
- **T4 WizardLayout**: step-based transaction/posting flows

Most pages should be implemented by reusing these templates with field/data substitution.

### 2) Evidence system is cross-workflow capability
`designs/ui/miniERP_evidence_system.md` defines a two-layer model used across purchase/sales/inventory:
- **Document-level evidence** (global attachments)
- **Row-level evidence** (SKU-line camera-count entry + drawer)

Preserve this pattern when implementing GRN/OUT/stocktake-like workflows.

### 3) Runtime layering
- `apps/web`: route/UI composition and page-level workflows
- `apps/server`: domain modules (purchase/sales/inventory/finance/evidence)
- `packages/shared`: cross-layer contracts and shared primitives

## Working with .pen files

- Use Pencil MCP tools for reading/editing `.pen` files.
- Avoid editing `.pen` content with normal file tools.
- If Pencil MCP is unavailable, use `designs/*.md` as intent source and avoid speculative structural edits.

## OpenSpec workflow

本项目使用 OpenSpec 管理变更工件；用于规范变更过程，不替代 build/test 命令。

### 常用命令

| 命令 | 用途 |
|------|------|
| `/opsx:new` | 创建新变更 |
| `/opsx:ff` | 快进模式（一次性创建 artifacts） |
| `/opsx:apply` | 实现变更任务 |
| `/opsx:verify` | 验证实现 |
| `/opsx:archive` | 归档完成变更 |

### 推荐流程

1. 规划：`/plan "功能描述"` 或 `/opsx:new`
2. 实现：`/opsx:apply` 或 `/tdd`
3. 验证：`/opsx:verify` 或 `/verify`
4. 归档：`/opsx:archive`

## Project-level notes

- 权限配置：`.claude/settings.local.json`
- 业务规则：`.claude/rules/erp-rules.md`
- Skills：`.claude/skills/`（OpenSpec + web-design-guidelines 等）
- Agent 沟通语言：默认使用中文（见 `.claude/rules/erp-rules.md`）
