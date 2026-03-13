UPDATE "inventory_balance"
SET "bin_id" = ''
WHERE "bin_id" IS NULL;

DROP INDEX IF EXISTS "inventory_balance_tenant_id_sku_id_warehouse_id_key";

ALTER TABLE "inventory_balance"
ALTER COLUMN "bin_id" SET DEFAULT '';

ALTER TABLE "inventory_balance"
ALTER COLUMN "bin_id" SET NOT NULL;

CREATE UNIQUE INDEX "inventory_balance_tenant_id_sku_id_warehouse_id_bin_id_key"
ON "inventory_balance" ("tenant_id", "sku_id", "warehouse_id", "bin_id");
