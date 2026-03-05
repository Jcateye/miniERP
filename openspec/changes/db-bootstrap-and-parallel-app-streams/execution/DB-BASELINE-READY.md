# DB-BASELINE-READY

## Gate
- Marker: `DB-BASELINE-READY`
- Stream: DB 初始化
- Date: 2026-03-05

## Completed Scope
- Prisma 基线模型已建立：`apps/server/prisma/schema.prisma`。
- 首批迁移已建立并可执行：
  - `20260305170000_init_baseline`
  - `20260305203000_inventory_append_only_constraints`
  - `20260305223000_masterdata_contract_alignment`
- 初始化脚本已可执行：`db:generate`、`db:migrate`、`db:seed`。
- `PrismaService` 已接入 `DatabaseModule`。

## Validation
- `bun run --filter server db:generate`
- `DATABASE_URL=postgresql://minierp:change_me@localhost:5432/minierp bun run --filter server db:migrate`
- `DATABASE_URL=postgresql://minierp:change_me@localhost:5432/minierp bun run --filter server db:seed`
