-- Draft migration: inventory query/index/non-negative hardening
-- Compatibility: backward-compatible for clean data;
-- potential breaking only when historical rows violate new checks/normalized uniqueness.

-- ---------------------------------------------------------------------------
-- 0) Preflight checks (manual, run before apply in production)
-- ---------------------------------------------------------------------------
-- A. Detect normalized key collisions in inventory_balance (case/space drift)
-- SELECT
--   tenant_id,
--   lower(btrim(sku_id)) AS sku_key,
--   lower(btrim(warehouse_id)) AS warehouse_key,
--   COUNT(*) AS dup_count
-- FROM inventory_balance
-- GROUP BY 1, 2, 3
-- HAVING COUNT(*) > 1;
--
-- B. Detect invalid non-positive quantities in inventory-related lines
-- SELECT 'purchase_order_line' AS table_name, COUNT(*) AS bad_rows FROM purchase_order_line WHERE qty <= 0
-- UNION ALL
-- SELECT 'grn_line', COUNT(*) FROM grn_line WHERE qty <= 0
-- UNION ALL
-- SELECT 'sales_order_line', COUNT(*) FROM sales_order_line WHERE qty <= 0
-- UNION ALL
-- SELECT 'outbound_line', COUNT(*) FROM outbound_line WHERE qty <= 0
-- UNION ALL
-- SELECT 'stocktake_line.system_qty', COUNT(*) FROM stocktake_line WHERE system_qty < 0
-- UNION ALL
-- SELECT 'stocktake_line.counted_qty', COUNT(*) FROM stocktake_line WHERE counted_qty < 0;

-- ---------------------------------------------------------------------------
-- 1) Unique constraint hardening (normalized key uniqueness)
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS "inventory_balance_tenant_sku_wh_normalized_uq"
  ON "inventory_balance" (
    "tenant_id",
    lower(btrim("sku_id")),
    lower(btrim("warehouse_id"))
  );

-- ---------------------------------------------------------------------------
-- 2) Query-path indexes (tenant-first, aligned with inventory read hot paths)
-- ---------------------------------------------------------------------------
-- /inventory/ledger list (tenant + posted_at desc)
CREATE INDEX IF NOT EXISTS "inventory_ledger_tenant_posted_at_id_desc_idx"
  ON "inventory_ledger" ("tenant_id", "posted_at" DESC, "id" DESC);

-- /inventory/ledger filtered by warehouse + sku + time
CREATE INDEX IF NOT EXISTS "inventory_ledger_tenant_warehouse_sku_posted_at_id_desc_idx"
  ON "inventory_ledger" (
    "tenant_id",
    "warehouse_id",
    "sku_id",
    "posted_at" DESC,
    "id" DESC
  );

-- /inventory/ledger filtered by reference document + time
CREATE INDEX IF NOT EXISTS "inventory_ledger_tenant_ref_posted_at_id_desc_idx"
  ON "inventory_ledger" (
    "tenant_id",
    "reference_type",
    "reference_id",
    "posted_at" DESC,
    "id" DESC
  );

-- /inventory/balances list (tenant + warehouse + sku)
CREATE INDEX IF NOT EXISTS "inventory_balance_tenant_warehouse_sku_idx"
  ON "inventory_balance" ("tenant_id", "warehouse_id", "sku_id");

-- ---------------------------------------------------------------------------
-- 3) Non-negative constraints for inventory-related quantity fields
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'purchase_order_line_qty_positive'
  ) THEN
    ALTER TABLE "purchase_order_line"
      ADD CONSTRAINT "purchase_order_line_qty_positive"
      CHECK ("qty" > 0);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'grn_line_qty_positive'
  ) THEN
    ALTER TABLE "grn_line"
      ADD CONSTRAINT "grn_line_qty_positive"
      CHECK ("qty" > 0);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'sales_order_line_qty_positive'
  ) THEN
    ALTER TABLE "sales_order_line"
      ADD CONSTRAINT "sales_order_line_qty_positive"
      CHECK ("qty" > 0);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'outbound_line_qty_positive'
  ) THEN
    ALTER TABLE "outbound_line"
      ADD CONSTRAINT "outbound_line_qty_positive"
      CHECK ("qty" > 0);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'stocktake_line_system_qty_non_negative'
  ) THEN
    ALTER TABLE "stocktake_line"
      ADD CONSTRAINT "stocktake_line_system_qty_non_negative"
      CHECK ("system_qty" >= 0);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'stocktake_line_counted_qty_non_negative'
  ) THEN
    ALTER TABLE "stocktake_line"
      ADD CONSTRAINT "stocktake_line_counted_qty_non_negative"
      CHECK ("counted_qty" >= 0);
  END IF;
END
$$;
