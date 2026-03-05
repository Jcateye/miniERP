# MASTERDATA-READY

## Gate
- Marker: `MASTERDATA-READY`
- Stream: B (masterdata)
- Date: 2026-03-05

## Completed Scope
- 3.1 sku/warehouse/supplier/customer repository 切换为 Prisma 持久化实现。
- 3.2 保持 CRUD + 查询与 shared contract 对齐。
- 3.3 输出交付：`MASTERDATA-READY`。

## Implementation Notes
- Masterdata module provider 切换：`apps/server/src/modules/masterdata/masterdata.module.ts`
  - `NODE_ENV=test` 使用 in-memory repository。
  - 其他环境切换到 Prisma repository（SKU/Warehouse/Supplier/Customer）。
- 新增并启用 SKU controller：
  - `apps/server/src/modules/masterdata/controllers/sku.controller.ts`
  - `apps/server/src/modules/masterdata/controllers/sku.controller.spec.ts`
- 新增 Prisma repositories：
  - `apps/server/src/modules/masterdata/infrastructure/prisma-sku.repository.ts`
  - `apps/server/src/modules/masterdata/infrastructure/prisma-warehouse.repository.ts`
  - `apps/server/src/modules/masterdata/infrastructure/prisma-supplier.repository.ts`
  - `apps/server/src/modules/masterdata/infrastructure/prisma-customer.repository.ts`
  - `apps/server/src/modules/masterdata/infrastructure/prisma-tenant-id.resolver.ts`
- shared contract 对齐字段：
  - `apps/server/prisma/schema.prisma` 新增 `sku.specification`、`supplier.address`、`customer.address`。
  - `apps/server/prisma/migrations/20260305223000_masterdata_contract_alignment/migration.sql`

## Validation
- `bun run --filter server db:generate`
- `bun run --filter server test -- src/modules/masterdata/application/sku.service.spec.ts src/modules/masterdata/application/warehouse.service.spec.ts src/modules/masterdata/application/supplier.service.spec.ts src/modules/masterdata/application/customer.service.spec.ts src/modules/masterdata/controllers/sku.controller.spec.ts src/modules/masterdata/controllers/warehouse.controller.spec.ts src/modules/masterdata/controllers/supplier.controller.spec.ts src/modules/masterdata/controllers/customer.controller.spec.ts`
- `bun run --filter server build`
