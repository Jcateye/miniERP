# Inventory Schema Migration Plan（草案）

## 1. 目标
- 梳理 `inventory` 相关 Prisma/SQL 约束缺口。
- 产出一版可评审迁移草案，覆盖三类能力：唯一约束、索引、非负约束。
- 提供最小 seed 样例与回滚说明，便于预演。

## 2. 当前基线（已覆盖）
- `inventory_balance` 已有唯一键：`(tenant_id, sku_id, warehouse_id)`。
- `inventory_balance` 已有非负约束：`on_hand >= 0`。
- `inventory_ledger` 已有 append-only 触发器（禁 UPDATE/DELETE）。
- `inventory_ledger` 已有 `quantity_delta <> 0` 约束。
- `inventory_ledger` 已有 reversal 语义检查、FK、以及每条源流水最多一次 reversal 的 partial unique。
- 现有索引覆盖：`(tenant_id, sku_id, posted_at)` 与 `(tenant_id, reference_type, reference_id)`。

## 3. 缺口梳理
| 分类 | 缺口 | 影响 | 草案动作 |
|---|---|---|---|
| 唯一约束 | `inventory_balance` 只按原值唯一，无法拦截大小写/首尾空格漂移导致的逻辑重复 | 同一租户下可能出现 `sku-a` 与 `SKU-A` 的重复余额键 | 新增标准化唯一索引（`lower(btrim())`） |
| 索引 | `/inventory/ledger` 默认按 `posted_at desc` 全量分页，缺少 tenant + 时间排序索引 | 租户数据增大后排序扫描成本上升 | 新增 `tenant_id + posted_at desc + id desc` 索引 |
| 索引 | ledger 多条件常见筛选（仓库+SKU+时间、单据类型+单据号+时间）缺少覆盖索引 | 条件查询退化为额外排序/回表 | 新增两组 tenant-first 复合索引 |
| 索引 | `/inventory/balances` 常见列表是 tenant + warehouse + sku 顺序读取 | 当前索引顺序对该排序路径不最优 | 新增 `tenant_id + warehouse_id + sku_id` 索引 |
| 非负约束 | 过账来源行（PO/GRN/SO/OUT/Stocktake）数量字段无 DB 层正负约束 | 异常数据可绕过应用层进入数据库 | 为相关数量字段补充 `> 0` 或 `>= 0` 约束 |

## 4. 迁移草案
- 路径：`apps/server/prisma/migrations/20260306093000_inventory_query_and_guardrail_draft/migration.sql`
- 类型：以兼容为主的“约束增强”草案。
- 兼容性判定：
  - 对“干净数据”是 backward-compatible。
  - 对“历史脏数据”可能是 apply-time breaking（迁移会失败并阻断上线），需先执行 preflight SQL。

## 5. Seed 样例（用于约束预演）

### 5.1 SQL 样例
```sql
-- tenant: 1001
INSERT INTO inventory_balance (tenant_id, sku_id, warehouse_id, on_hand, updated_at)
VALUES
  (1001, 'CAB-HDMI-2M', 'WH-001', 120, NOW()),
  (1001, 'ADP-USB-C-DP', 'WH-001', 30, NOW())
ON CONFLICT (tenant_id, sku_id, warehouse_id)
DO UPDATE SET on_hand = EXCLUDED.on_hand, updated_at = NOW();

INSERT INTO inventory_ledger (
  tenant_id,
  sku_id,
  warehouse_id,
  quantity_delta,
  reference_type,
  reference_id,
  posted_at,
  request_id
)
VALUES
  (1001, 'CAB-HDMI-2M', 'WH-001', 120, 'GRN', 'DOC-GRN-20260306-001', NOW(), 'seed-inv-req-001'),
  (1001, 'ADP-USB-C-DP', 'WH-001', -10, 'OUT', 'DOC-OUT-20260306-001', NOW(), 'seed-inv-req-002');
```

### 5.2 Prisma seed 片段
```ts
await prisma.inventoryBalance.upsert({
  where: {
    tenantId_skuId_warehouseId: {
      tenantId,
      skuId: 'CAB-HDMI-2M',
      warehouseId: 'WH-001',
    },
  },
  update: { onHand: 120 },
  create: {
    tenantId,
    skuId: 'CAB-HDMI-2M',
    warehouseId: 'WH-001',
    onHand: 120,
  },
});

await prisma.inventoryLedger.create({
  data: {
    tenantId,
    skuId: 'CAB-HDMI-2M',
    warehouseId: 'WH-001',
    quantityDelta: 120,
    referenceType: 'GRN',
    referenceId: 'DOC-GRN-20260306-001',
    requestId: 'seed-inv-req-001',
  },
});
```

## 6. 回滚说明（草案）
按“先删新增约束/索引，再保留历史基线”执行：

```sql
DROP INDEX IF EXISTS "inventory_balance_tenant_sku_wh_normalized_uq";
DROP INDEX IF EXISTS "inventory_ledger_tenant_posted_at_id_desc_idx";
DROP INDEX IF EXISTS "inventory_ledger_tenant_warehouse_sku_posted_at_id_desc_idx";
DROP INDEX IF EXISTS "inventory_ledger_tenant_ref_posted_at_id_desc_idx";
DROP INDEX IF EXISTS "inventory_balance_tenant_warehouse_sku_idx";

ALTER TABLE "purchase_order_line" DROP CONSTRAINT IF EXISTS "purchase_order_line_qty_positive";
ALTER TABLE "grn_line" DROP CONSTRAINT IF EXISTS "grn_line_qty_positive";
ALTER TABLE "sales_order_line" DROP CONSTRAINT IF EXISTS "sales_order_line_qty_positive";
ALTER TABLE "outbound_line" DROP CONSTRAINT IF EXISTS "outbound_line_qty_positive";
ALTER TABLE "stocktake_line" DROP CONSTRAINT IF EXISTS "stocktake_line_system_qty_non_negative";
ALTER TABLE "stocktake_line" DROP CONSTRAINT IF EXISTS "stocktake_line_counted_qty_non_negative";
```

## 7. 建议执行顺序
1. 在 staging 跑 preflight SQL，确认无脏数据冲突。
2. 应用本草案迁移并回归 `inventory` 查询与过账路径。
3. 校验 seed 样例与回滚脚本可执行。
4. 通过后再决定是否将草案固化到正式 Prisma 迁移链路。
