-- Stream E (inventory) hardening:
-- 1) ledger append-only via update/delete trigger guard
-- 2) reversal consistency and one-time reversal uniqueness
-- 3) quantity_delta cannot be zero

ALTER TABLE "inventory_ledger"
  ADD CONSTRAINT "inventory_ledger_quantity_delta_non_zero"
  CHECK ("quantity_delta" <> 0);

ALTER TABLE "inventory_ledger"
  ADD CONSTRAINT "inventory_ledger_reversal_reference_check"
  CHECK (
    ("reversal_of_ledger_id" IS NULL AND "reference_type" <> 'REVERSAL')
    OR
    ("reversal_of_ledger_id" IS NOT NULL AND "reference_type" = 'REVERSAL')
  );

ALTER TABLE "inventory_ledger"
  ADD CONSTRAINT "inventory_ledger_reversal_of_fk"
  FOREIGN KEY ("reversal_of_ledger_id")
  REFERENCES "inventory_ledger"("id")
  ON DELETE RESTRICT
  ON UPDATE RESTRICT;

CREATE UNIQUE INDEX "inventory_ledger_tenant_id_reversal_of_ledger_id_uq"
  ON "inventory_ledger"("tenant_id", "reversal_of_ledger_id")
  WHERE "reversal_of_ledger_id" IS NOT NULL;

CREATE OR REPLACE FUNCTION prevent_inventory_ledger_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'inventory_ledger is append-only and does not allow %', TG_OP;
END;
$$;

CREATE TRIGGER inventory_ledger_no_update
  BEFORE UPDATE ON "inventory_ledger"
  FOR EACH ROW
  EXECUTE FUNCTION prevent_inventory_ledger_mutation();

CREATE TRIGGER inventory_ledger_no_delete
  BEFORE DELETE ON "inventory_ledger"
  FOR EACH ROW
  EXECUTE FUNCTION prevent_inventory_ledger_mutation();
