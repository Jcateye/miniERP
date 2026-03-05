-- Stream B (masterdata) contract alignment:
-- add columns required by shared masterdata contracts

ALTER TABLE "sku"
  ADD COLUMN "specification" TEXT;

ALTER TABLE "supplier"
  ADD COLUMN "address" TEXT;

ALTER TABLE "customer"
  ADD COLUMN "address" TEXT;
