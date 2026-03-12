# Warehouse / SKU Demo Ready

- 日期：2026-03-12
- 范围：local demo P0（warehouse / sku create+list，可作为 GRN / OUT 仓库下拉数据源）

## 结论

- `apps/server` 已确认可通过真实 API 完成：
  - 仓库创建
  - 仓库列表读取
  - SKU 创建
  - SKU 列表读取
  - GRN / OUT 创建时携带 `warehouseId`
- 本次额外补齐：
  - `db:seed` 可在本地稳定执行
  - `GRN` / `OUT` 创建强制要求 `warehouseId`
  - 仓库与 SKU 在单据创建时按租户校验真实存在，避免伪造 bigint id

## API Data Source

- 仓库下拉数据源：`GET /api/warehouses`
- SKU 行录入数据源：`GET /api/skus`
- 入库创建：`POST /api/documents` with `docType=GRN`
- 出库创建：`POST /api/documents` with `docType=OUT`

## Manual Verification

1. 执行 `bun run --filter server db:generate`
2. 执行 `bun run --filter server db:migrate`
3. 执行 `bun run --filter server db:seed`
4. 启动 server：
   - `DATABASE_URL=postgresql://admin:admin123@localhost:5432/minierp REDIS_URL=redis://localhost:6379 PORT=3001 NODE_ENV=development bun run --filter server dev`
5. 使用 `Authorization: Bearer dev-token` 调 `POST /api/warehouses` 创建 `WH-A`、`WH-B`
6. 调 `GET /api/warehouses` 确认列表可见
7. 调 `POST /api/skus` 创建测试 SKU
8. 调 `GET /api/skus` 确认列表可见
9. 调 `POST /api/documents` 创建 `GRN` / `OUT`，请求体带 `warehouseId`
10. 调 `GET /api/warehouses` 作为前端仓库下拉候选源验证

## Known Limitation

- 当前 web 的 `/procure/receipts/new` 与 `/sales/outbound/new` 仍是静态 UI；本次未改动 web，因此“下拉候选源”已在后端就绪，但页面本身是否动态消费该数据仍需后续 web 接入。
