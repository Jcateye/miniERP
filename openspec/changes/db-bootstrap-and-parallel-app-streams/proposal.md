## Why

当前 miniERP 的 OpenSpec 变更存在多条并行历史，但任务状态与当前真实代码演进已脱节：
- 旧变更目标交叉，执行顺序与依赖门禁不够清晰。
- 数据库仍缺乏统一可执行基线，`db:generate/db:migrate` 尚未形成真实流程。
- 应用层需要明确并行边界，避免多人开发互相阻塞。

本变更将先建立 PostgreSQL + Prisma 的统一初始化基线，再把应用层拆成 6 条可并行 stream，并明确解锁条件、交付标记与依赖关系。

## What Changes

- 新增 `database-bootstrap` 能力：统一 Prisma schema、迁移、seed、数据库接入边界。
- 新增 `app-parallel-streams` 能力：平台/主数据/采购入库/销售出库/库存/证据 6 流拆分与门禁。
- 新增 `prisma-governance` 能力：迁移策略、约束与索引、变更兼容规则。
- 新增 `bff-fallback-policy` 能力：fixture fallback 默认关闭，只允许开发环境显式开启。
- 发布执行分工表与依赖图，支持并行开发排班。

## Capabilities

### New Capabilities
- `database-bootstrap`
- `app-parallel-streams`
- `prisma-governance`
- `bff-fallback-policy`

### Modified Capabilities
- 无（本次以新增能力形式统一管理，避免与历史 change 交叉覆盖）

## Impact

- 影响目录：
  - `apps/server/prisma/**`
  - `apps/server/src/database/**`
  - `apps/server/package.json`
  - `packages/shared/src/types/**`
  - `apps/web/src/lib/bff/**`
- 影响协作：
  - 以依赖门禁驱动并行推进（不是按人头抢模块）。
- 影响验收：
  - OpenSpec 任务完成后直接进入并行开发执行，最终通过 `/opsx:verify` 收口。
