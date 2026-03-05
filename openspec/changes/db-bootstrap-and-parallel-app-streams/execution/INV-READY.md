# INV-READY

## Gate
- Marker: `INV-READY`
- Stream: E (inventory)
- Date: 2026-03-05

## Completed Scope
- 4.1 ledger append-only + reversal 约束
- 4.2 幂等记录持久化 + payload hash 冲突校验
- 4.3 防负库存事务校验

## Implementation Notes
- 新增 Prisma 库存一致性存储：`apps/server/src/modules/inventory/infrastructure/prisma-inventory-consistency.store.ts`
  - 生产环境走 Prisma 事务，测试环境保留 in-memory。
  - 幂等记录落库到 `idempotency_record`（`inventory.post` / `inventory.reverse`）。
  - 使用事务内 `SELECT ... FOR UPDATE` + upsert 防并发丢更新。
  - reversal 重复校验基于 `inventory_ledger.reversal_of_ledger_id` 反查。
- inventory module provider 切换：`apps/server/src/modules/inventory/inventory.module.ts`
- inventory service 升级为 async 事务操作：`apps/server/src/modules/inventory/application/inventory-posting.service.ts`
- DB 约束迁移：`apps/server/prisma/migrations/20260305203000_inventory_append_only_constraints/migration.sql`
  - `quantity_delta <> 0`
  - reversal 语义 check + FK
  - partial unique（每条原 ledger 只允许一次 reversal）
  - trigger 阻断 `inventory_ledger` 的 UPDATE/DELETE（append-only）

## Validation
- `bun run --filter server db:generate`
- `bun run --filter server build`
- `bun run --filter server test -- src/modules/inventory/application/inventory-posting.service.spec.ts src/modules/inventory/controllers/inventory.controller.spec.ts`

