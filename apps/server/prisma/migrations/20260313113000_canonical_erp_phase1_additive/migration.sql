-- Reviewed additive migration: canonical ERP phase 1.
-- Notes:
-- 1. Keep previously hand-authored inventory indexes and reversal FK in place.
-- 2. This migration only adds new tables/columns and must not remove runtime-critical objects.
-- 3. Review and back up the remote `minierp` database before `migrate deploy`.

-- AlterTable
ALTER TABLE "customer" ADD COLUMN     "bank_account" TEXT,
ADD COLUMN     "bank_name" TEXT,
ADD COLUMN     "billing_address" TEXT,
ADD COLUMN     "billing_phone" TEXT,
ADD COLUMN     "company_id" BIGINT,
ADD COLUMN     "contact_mobile" TEXT,
ADD COLUMN     "credit_limit" DECIMAL(20,6),
ADD COLUMN     "default_tax_code_id" BIGINT,
ADD COLUMN     "ext" JSONB,
ADD COLUMN     "invoice_title" TEXT,
ADD COLUMN     "org_id" BIGINT,
ADD COLUMN     "payment_term" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "taxpayer_id_or_uscc" TEXT;

-- AlterTable
ALTER TABLE "grn" ADD COLUMN     "approval_status" TEXT,
ADD COLUMN     "company_id" BIGINT,
ADD COLUMN     "counterparty_id" TEXT,
ADD COLUMN     "currency" TEXT DEFAULT 'CNY',
ADD COLUMN     "exchange_rate" DECIMAL(20,8),
ADD COLUMN     "ext" JSONB,
ADD COLUMN     "org_id" BIGINT,
ADD COLUMN     "source_ref_id" TEXT,
ADD COLUMN     "source_ref_type" TEXT,
ADD COLUMN     "tax_amount" DECIMAL(20,6) NOT NULL DEFAULT 0,
ADD COLUMN     "tax_included" BOOLEAN,
ADD COLUMN     "total_with_tax" DECIMAL(20,6) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "grn_line" ADD COLUMN     "accepted_qty" DECIMAL(20,6) NOT NULL DEFAULT 0,
ADD COLUMN     "batch_no" TEXT,
ADD COLUMN     "bin_id" BIGINT,
ADD COLUMN     "company_id" BIGINT,
ADD COLUMN     "ext" JSONB,
ADD COLUMN     "item_name_snapshot" TEXT,
ADD COLUMN     "line_status" TEXT,
ADD COLUMN     "org_id" BIGINT,
ADD COLUMN     "rejected_qty" DECIMAL(20,6) NOT NULL DEFAULT 0,
ADD COLUMN     "serial_no" TEXT,
ADD COLUMN     "source_line_id" TEXT,
ADD COLUMN     "spec_model_snapshot" TEXT,
ADD COLUMN     "tax_amount" DECIMAL(20,6),
ADD COLUMN     "tax_rate" DECIMAL(20,6),
ADD COLUMN     "uom" TEXT,
ADD COLUMN     "warehouse_id" BIGINT;

-- AlterTable
ALTER TABLE "inventory_balance" ADD COLUMN     "available_quantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "batch_no" TEXT,
ADD COLUMN     "bin_id" TEXT,
ADD COLUMN     "company_id" BIGINT,
ADD COLUMN     "ext" JSONB,
ADD COLUMN     "last_transaction_at" TIMESTAMP(3),
ADD COLUMN     "org_id" BIGINT,
ADD COLUMN     "reserved_quantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "serial_no" TEXT;

-- AlterTable
ALTER TABLE "inventory_ledger" ADD COLUMN     "batch_no" TEXT,
ADD COLUMN     "bin_id" TEXT,
ADD COLUMN     "company_id" BIGINT,
ADD COLUMN     "ext" JSONB,
ADD COLUMN     "org_id" BIGINT,
ADD COLUMN     "serial_no" TEXT;

-- AlterTable
ALTER TABLE "outbound" ADD COLUMN     "approval_status" TEXT,
ADD COLUMN     "carrier" TEXT,
ADD COLUMN     "company_id" BIGINT,
ADD COLUMN     "counterparty_id" TEXT,
ADD COLUMN     "currency" TEXT DEFAULT 'CNY',
ADD COLUMN     "exchange_rate" DECIMAL(20,8),
ADD COLUMN     "ext" JSONB,
ADD COLUMN     "handover_status" TEXT,
ADD COLUMN     "org_id" BIGINT,
ADD COLUMN     "ship_date" TIMESTAMP(3),
ADD COLUMN     "source_ref_id" TEXT,
ADD COLUMN     "source_ref_type" TEXT,
ADD COLUMN     "tax_amount" DECIMAL(20,6) NOT NULL DEFAULT 0,
ADD COLUMN     "tax_included" BOOLEAN,
ADD COLUMN     "total_amount" DECIMAL(20,6) NOT NULL DEFAULT 0,
ADD COLUMN     "total_with_tax" DECIMAL(20,6) NOT NULL DEFAULT 0,
ADD COLUMN     "tracking_no" TEXT;

-- AlterTable
ALTER TABLE "outbound_line" ADD COLUMN     "amount" DECIMAL(20,6),
ADD COLUMN     "batch_no" TEXT,
ADD COLUMN     "bin_id" BIGINT,
ADD COLUMN     "company_id" BIGINT,
ADD COLUMN     "ext" JSONB,
ADD COLUMN     "item_name_snapshot" TEXT,
ADD COLUMN     "line_status" TEXT,
ADD COLUMN     "org_id" BIGINT,
ADD COLUMN     "serial_no" TEXT,
ADD COLUMN     "shipped_qty" DECIMAL(20,6) NOT NULL DEFAULT 0,
ADD COLUMN     "source_line_id" TEXT,
ADD COLUMN     "spec_model_snapshot" TEXT,
ADD COLUMN     "tax_amount" DECIMAL(20,6),
ADD COLUMN     "tax_rate" DECIMAL(20,6),
ADD COLUMN     "unit_price" DECIMAL(20,6),
ADD COLUMN     "uom" TEXT,
ADD COLUMN     "warehouse_id" BIGINT;

-- AlterTable
ALTER TABLE "purchase_order" ADD COLUMN     "approval_status" TEXT,
ADD COLUMN     "company_id" BIGINT,
ADD COLUMN     "counterparty_id" TEXT,
ADD COLUMN     "currency" TEXT DEFAULT 'CNY',
ADD COLUMN     "exchange_rate" DECIMAL(20,8),
ADD COLUMN     "expected_receipt_date" TIMESTAMP(3),
ADD COLUMN     "ext" JSONB,
ADD COLUMN     "org_id" BIGINT,
ADD COLUMN     "source_ref_id" TEXT,
ADD COLUMN     "source_ref_type" TEXT,
ADD COLUMN     "tax_amount" DECIMAL(20,6) NOT NULL DEFAULT 0,
ADD COLUMN     "tax_included" BOOLEAN,
ADD COLUMN     "total_with_tax" DECIMAL(20,6) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "purchase_order_line" ADD COLUMN     "accepted_qty" DECIMAL(20,6) NOT NULL DEFAULT 0,
ADD COLUMN     "batch_no" TEXT,
ADD COLUMN     "bin_id" BIGINT,
ADD COLUMN     "company_id" BIGINT,
ADD COLUMN     "ext" JSONB,
ADD COLUMN     "item_name_snapshot" TEXT,
ADD COLUMN     "line_status" TEXT,
ADD COLUMN     "org_id" BIGINT,
ADD COLUMN     "received_qty" DECIMAL(20,6) NOT NULL DEFAULT 0,
ADD COLUMN     "rejected_qty" DECIMAL(20,6) NOT NULL DEFAULT 0,
ADD COLUMN     "serial_no" TEXT,
ADD COLUMN     "source_line_id" TEXT,
ADD COLUMN     "spec_model_snapshot" TEXT,
ADD COLUMN     "tax_amount" DECIMAL(20,6),
ADD COLUMN     "tax_rate" DECIMAL(20,6),
ADD COLUMN     "uom" TEXT,
ADD COLUMN     "warehouse_id" BIGINT;

-- AlterTable
ALTER TABLE "quotation" ADD COLUMN     "company_id" BIGINT,
ADD COLUMN     "currency" TEXT DEFAULT 'CNY',
ADD COLUMN     "ext" JSONB,
ADD COLUMN     "org_id" BIGINT;

-- AlterTable
ALTER TABLE "quotation_line" ADD COLUMN     "company_id" BIGINT,
ADD COLUMN     "ext" JSONB,
ADD COLUMN     "item_name_snapshot" TEXT,
ADD COLUMN     "org_id" BIGINT,
ADD COLUMN     "spec_model_snapshot" TEXT,
ADD COLUMN     "tax_amount" DECIMAL(20,6),
ADD COLUMN     "tax_rate" DECIMAL(20,6),
ADD COLUMN     "uom" TEXT;

-- AlterTable
ALTER TABLE "quotation_version" ADD COLUMN     "company_id" BIGINT,
ADD COLUMN     "ext" JSONB,
ADD COLUMN     "org_id" BIGINT,
ADD COLUMN     "tax_amount" DECIMAL(20,6) NOT NULL DEFAULT 0,
ADD COLUMN     "total_with_tax" DECIMAL(20,6) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "sales_order" ADD COLUMN     "approval_status" TEXT,
ADD COLUMN     "company_id" BIGINT,
ADD COLUMN     "counterparty_id" TEXT,
ADD COLUMN     "currency" TEXT DEFAULT 'CNY',
ADD COLUMN     "exchange_rate" DECIMAL(20,8),
ADD COLUMN     "ext" JSONB,
ADD COLUMN     "org_id" BIGINT,
ADD COLUMN     "ship_date" TIMESTAMP(3),
ADD COLUMN     "source_ref_id" TEXT,
ADD COLUMN     "source_ref_type" TEXT,
ADD COLUMN     "tax_amount" DECIMAL(20,6) NOT NULL DEFAULT 0,
ADD COLUMN     "tax_included" BOOLEAN,
ADD COLUMN     "total_with_tax" DECIMAL(20,6) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "sales_order_line" ADD COLUMN     "batch_no" TEXT,
ADD COLUMN     "bin_id" BIGINT,
ADD COLUMN     "company_id" BIGINT,
ADD COLUMN     "ext" JSONB,
ADD COLUMN     "item_name_snapshot" TEXT,
ADD COLUMN     "line_status" TEXT,
ADD COLUMN     "org_id" BIGINT,
ADD COLUMN     "serial_no" TEXT,
ADD COLUMN     "shipped_qty" DECIMAL(20,6) NOT NULL DEFAULT 0,
ADD COLUMN     "source_line_id" TEXT,
ADD COLUMN     "spec_model_snapshot" TEXT,
ADD COLUMN     "tax_amount" DECIMAL(20,6),
ADD COLUMN     "tax_rate" DECIMAL(20,6),
ADD COLUMN     "uom" TEXT,
ADD COLUMN     "warehouse_id" BIGINT;

-- AlterTable
ALTER TABLE "sku" ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "batch_managed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "company_id" BIGINT,
ADD COLUMN     "ext" JSONB,
ADD COLUMN     "item_type" TEXT,
ADD COLUMN     "lead_time_days" INTEGER,
ADD COLUMN     "max_stock_qty" DECIMAL(20,6),
ADD COLUMN     "min_stock_qty" DECIMAL(20,6),
ADD COLUMN     "org_id" BIGINT,
ADD COLUMN     "serial_managed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shelf_life_days" INTEGER,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "tax_code_id" BIGINT,
ADD COLUMN     "tax_rate" DECIMAL(20,6),
ADD COLUMN     "uom_code" TEXT;

-- AlterTable
ALTER TABLE "sku_mapping" ADD COLUMN     "company_id" BIGINT,
ADD COLUMN     "ext" JSONB,
ADD COLUMN     "org_id" BIGINT;

-- AlterTable
ALTER TABLE "sku_substitution" ADD COLUMN     "company_id" BIGINT,
ADD COLUMN     "ext" JSONB,
ADD COLUMN     "org_id" BIGINT;

-- AlterTable
ALTER TABLE "stocktake" ADD COLUMN     "approval_status" TEXT,
ADD COLUMN     "company_id" BIGINT,
ADD COLUMN     "ext" JSONB,
ADD COLUMN     "org_id" BIGINT,
ADD COLUMN     "source_ref_id" TEXT,
ADD COLUMN     "source_ref_type" TEXT;

-- AlterTable
ALTER TABLE "stocktake_line" ADD COLUMN     "batch_no" TEXT,
ADD COLUMN     "bin_id" BIGINT,
ADD COLUMN     "company_id" BIGINT,
ADD COLUMN     "ext" JSONB,
ADD COLUMN     "org_id" BIGINT,
ADD COLUMN     "reason_code" TEXT,
ADD COLUMN     "serial_no" TEXT,
ADD COLUMN     "warehouse_id" BIGINT;

-- AlterTable
ALTER TABLE "supplier" ADD COLUMN     "company_id" BIGINT,
ADD COLUMN     "contact_mobile" TEXT,
ADD COLUMN     "default_tax_code_id" BIGINT,
ADD COLUMN     "ext" JSONB,
ADD COLUMN     "org_id" BIGINT,
ADD COLUMN     "payee_account" TEXT,
ADD COLUMN     "payee_bank" TEXT,
ADD COLUMN     "payment_term" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "taxpayer_id_or_uscc" TEXT;

-- AlterTable
ALTER TABLE "warehouse" ADD COLUMN     "company_id" BIGINT,
ADD COLUMN     "ext" JSONB,
ADD COLUMN     "manage_bin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "org_id" BIGINT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "warehouse_type" TEXT;

-- CreateTable
CREATE TABLE "company" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "company_code" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "ext" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL DEFAULT 'system',
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_unit" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "company_id" BIGINT,
    "org_code" TEXT NOT NULL,
    "org_name" TEXT NOT NULL,
    "parent_org_id" BIGINT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "ext" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL DEFAULT 'system',
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "org_unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "role_id" BIGINT NOT NULL,
    "permission_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_org_scope" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "org_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "user_org_scope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uom" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "company_id" BIGINT,
    "org_id" BIGINT,
    "uom_code" TEXT NOT NULL,
    "uom_name" TEXT NOT NULL,
    "precision" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "ext" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL DEFAULT 'system',
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "uom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_code" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "company_id" BIGINT,
    "org_id" BIGINT,
    "tax_code" TEXT NOT NULL,
    "tax_name" TEXT NOT NULL,
    "tax_type" TEXT NOT NULL,
    "rate" DECIMAL(20,6) NOT NULL,
    "inclusive" BOOLEAN NOT NULL DEFAULT false,
    "jurisdiction" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "ext" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL DEFAULT 'system',
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "tax_code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "company_id" BIGINT,
    "org_id" BIGINT,
    "item_code" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "spec_model" TEXT,
    "item_type" TEXT,
    "category_id" TEXT,
    "uom_code" TEXT NOT NULL,
    "tax_code_id" BIGINT,
    "tax_rate" DECIMAL(20,6),
    "barcode" TEXT,
    "batch_managed" BOOLEAN NOT NULL DEFAULT false,
    "serial_managed" BOOLEAN NOT NULL DEFAULT false,
    "shelf_life_days" INTEGER,
    "min_stock_qty" DECIMAL(20,6),
    "max_stock_qty" DECIMAL(20,6),
    "lead_time_days" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'active',
    "ext" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL DEFAULT 'system',
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_mapping" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "company_id" BIGINT,
    "org_id" BIGINT,
    "item_id" BIGINT NOT NULL,
    "source_type" TEXT NOT NULL,
    "external_code" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "ext" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_substitution" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "company_id" BIGINT,
    "org_id" BIGINT,
    "item_id" BIGINT NOT NULL,
    "substitute_item_id" BIGINT NOT NULL,
    "ext" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_substitution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_bin" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "company_id" BIGINT,
    "org_id" BIGINT,
    "warehouse_id" BIGINT NOT NULL,
    "bin_code" TEXT NOT NULL,
    "bin_name" TEXT NOT NULL,
    "zone_code" TEXT,
    "bin_type" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "ext" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL DEFAULT 'system',
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "warehouse_bin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_receipt" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "company_id" BIGINT,
    "org_id" BIGINT,
    "doc_no" TEXT NOT NULL,
    "doc_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "approval_status" TEXT,
    "supplier_id" BIGINT,
    "warehouse_id" BIGINT,
    "currency" TEXT DEFAULT 'CNY',
    "exchange_rate" DECIMAL(20,8),
    "tax_included" BOOLEAN,
    "counterparty_id" TEXT,
    "remarks" TEXT,
    "source_ref_type" TEXT,
    "source_ref_id" TEXT,
    "total_qty" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "total_with_tax" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "ext" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL DEFAULT 'system',
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "goods_receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_receipt_line" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "company_id" BIGINT,
    "org_id" BIGINT,
    "goods_receipt_id" BIGINT NOT NULL,
    "line_no" INTEGER NOT NULL,
    "item_id" BIGINT NOT NULL,
    "item_name_snapshot" TEXT,
    "spec_model_snapshot" TEXT,
    "uom" TEXT NOT NULL,
    "qty" DECIMAL(20,6) NOT NULL,
    "unit_price" DECIMAL(20,6),
    "tax_rate" DECIMAL(20,6),
    "amount" DECIMAL(20,6),
    "tax_amount" DECIMAL(20,6),
    "warehouse_id" BIGINT,
    "bin_id" BIGINT,
    "batch_no" TEXT,
    "serial_no" TEXT,
    "source_line_id" TEXT,
    "line_status" TEXT,
    "accepted_qty" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "rejected_qty" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "ext" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "goods_receipt_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipment" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "company_id" BIGINT,
    "org_id" BIGINT,
    "doc_no" TEXT NOT NULL,
    "doc_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "approval_status" TEXT,
    "sales_order_id" BIGINT,
    "warehouse_id" BIGINT,
    "customer_id" BIGINT,
    "currency" TEXT DEFAULT 'CNY',
    "exchange_rate" DECIMAL(20,8),
    "tax_included" BOOLEAN,
    "counterparty_id" TEXT,
    "remarks" TEXT,
    "source_ref_type" TEXT,
    "source_ref_id" TEXT,
    "total_qty" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "total_with_tax" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "ship_date" TIMESTAMP(3),
    "carrier" TEXT,
    "tracking_no" TEXT,
    "handover_status" TEXT,
    "ext" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL DEFAULT 'system',
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipment_line" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "company_id" BIGINT,
    "org_id" BIGINT,
    "shipment_id" BIGINT NOT NULL,
    "line_no" INTEGER NOT NULL,
    "item_id" BIGINT NOT NULL,
    "item_name_snapshot" TEXT,
    "spec_model_snapshot" TEXT,
    "uom" TEXT NOT NULL,
    "qty" DECIMAL(20,6) NOT NULL,
    "unit_price" DECIMAL(20,6),
    "tax_rate" DECIMAL(20,6),
    "amount" DECIMAL(20,6),
    "tax_amount" DECIMAL(20,6),
    "warehouse_id" BIGINT,
    "bin_id" BIGINT,
    "batch_no" TEXT,
    "serial_no" TEXT,
    "source_line_id" TEXT,
    "line_status" TEXT,
    "shipped_qty" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "ext" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipment_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_txn" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "company_id" BIGINT,
    "org_id" BIGINT,
    "txn_no" TEXT NOT NULL,
    "txn_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "warehouse_id" BIGINT,
    "source_ref_type" TEXT,
    "source_ref_id" TEXT,
    "posted_at" TIMESTAMP(3),
    "ext" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL DEFAULT 'system',
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "inventory_txn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_txn_line" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "company_id" BIGINT,
    "org_id" BIGINT,
    "txn_id" BIGINT NOT NULL,
    "line_no" INTEGER NOT NULL,
    "item_id" BIGINT NOT NULL,
    "warehouse_id" BIGINT NOT NULL,
    "from_bin_id" BIGINT,
    "to_bin_id" BIGINT,
    "batch_no" TEXT,
    "serial_no" TEXT,
    "qty" DECIMAL(20,6) NOT NULL,
    "ext" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_txn_line_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "company_tenant_id_status_idx" ON "company"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "company_tenant_id_company_code_key" ON "company"("tenant_id", "company_code");

-- CreateIndex
CREATE INDEX "org_unit_tenant_id_company_id_status_idx" ON "org_unit"("tenant_id", "company_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "org_unit_tenant_id_company_id_org_code_key" ON "org_unit"("tenant_id", "company_id", "org_code");

-- CreateIndex
CREATE INDEX "role_permission_tenant_id_role_id_idx" ON "role_permission"("tenant_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permission_tenant_id_role_id_permission_id_key" ON "role_permission"("tenant_id", "role_id", "permission_id");

-- CreateIndex
CREATE INDEX "user_org_scope_tenant_id_user_id_idx" ON "user_org_scope"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_org_scope_tenant_id_user_id_org_id_key" ON "user_org_scope"("tenant_id", "user_id", "org_id");

-- CreateIndex
CREATE INDEX "uom_tenant_id_company_id_status_idx" ON "uom"("tenant_id", "company_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "uom_tenant_id_company_id_uom_code_key" ON "uom"("tenant_id", "company_id", "uom_code");

-- CreateIndex
CREATE INDEX "tax_code_tenant_id_company_id_status_idx" ON "tax_code"("tenant_id", "company_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "tax_code_tenant_id_company_id_tax_code_key" ON "tax_code"("tenant_id", "company_id", "tax_code");

-- CreateIndex
CREATE INDEX "item_tenant_id_company_id_status_idx" ON "item"("tenant_id", "company_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "item_tenant_id_item_code_key" ON "item"("tenant_id", "item_code");

-- CreateIndex
CREATE INDEX "item_mapping_tenant_id_item_id_idx" ON "item_mapping"("tenant_id", "item_id");

-- CreateIndex
CREATE UNIQUE INDEX "item_mapping_tenant_id_source_type_external_code_key" ON "item_mapping"("tenant_id", "source_type", "external_code");

-- CreateIndex
CREATE INDEX "item_substitution_tenant_id_item_id_idx" ON "item_substitution"("tenant_id", "item_id");

-- CreateIndex
CREATE UNIQUE INDEX "item_substitution_tenant_id_item_id_substitute_item_id_key" ON "item_substitution"("tenant_id", "item_id", "substitute_item_id");

-- CreateIndex
CREATE INDEX "warehouse_bin_tenant_id_warehouse_id_status_idx" ON "warehouse_bin"("tenant_id", "warehouse_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_bin_tenant_id_warehouse_id_bin_code_key" ON "warehouse_bin"("tenant_id", "warehouse_id", "bin_code");

-- CreateIndex
CREATE INDEX "goods_receipt_tenant_id_status_doc_date_idx" ON "goods_receipt"("tenant_id", "status", "doc_date");

-- CreateIndex
CREATE UNIQUE INDEX "goods_receipt_tenant_id_doc_no_key" ON "goods_receipt"("tenant_id", "doc_no");

-- CreateIndex
CREATE INDEX "goods_receipt_line_tenant_id_goods_receipt_id_idx" ON "goods_receipt_line"("tenant_id", "goods_receipt_id");

-- CreateIndex
CREATE UNIQUE INDEX "goods_receipt_line_tenant_id_goods_receipt_id_line_no_key" ON "goods_receipt_line"("tenant_id", "goods_receipt_id", "line_no");

-- CreateIndex
CREATE INDEX "shipment_tenant_id_status_doc_date_idx" ON "shipment"("tenant_id", "status", "doc_date");

-- CreateIndex
CREATE UNIQUE INDEX "shipment_tenant_id_doc_no_key" ON "shipment"("tenant_id", "doc_no");

-- CreateIndex
CREATE INDEX "shipment_line_tenant_id_shipment_id_idx" ON "shipment_line"("tenant_id", "shipment_id");

-- CreateIndex
CREATE UNIQUE INDEX "shipment_line_tenant_id_shipment_id_line_no_key" ON "shipment_line"("tenant_id", "shipment_id", "line_no");

-- CreateIndex
CREATE INDEX "inventory_txn_tenant_id_txn_type_status_created_at_idx" ON "inventory_txn"("tenant_id", "txn_type", "status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_txn_tenant_id_txn_no_key" ON "inventory_txn"("tenant_id", "txn_no");

-- CreateIndex
CREATE INDEX "inventory_txn_line_tenant_id_warehouse_id_item_id_idx" ON "inventory_txn_line"("tenant_id", "warehouse_id", "item_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_txn_line_tenant_id_txn_id_line_no_key" ON "inventory_txn_line"("tenant_id", "txn_id", "line_no");
