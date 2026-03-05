-- CreateEnum
CREATE TYPE "EvidenceScope" AS ENUM ('document', 'line');

-- CreateTable
CREATE TABLE "tenant" (
    "id" BIGSERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL DEFAULT 'system',
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission" (
    "id" BIGSERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_role" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "role_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_client" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "client_id" TEXT NOT NULL,
    "client_secret_hash" TEXT NOT NULL,
    "scopes" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_call_log" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "client_id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "status_code" INTEGER NOT NULL,
    "request_id" TEXT,
    "called_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_call_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sku" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "sku_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category_id" TEXT,
    "unit" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL DEFAULT 'system',
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "sku_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sku_mapping" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "sku_id" BIGINT NOT NULL,
    "source_type" TEXT NOT NULL,
    "external_code" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sku_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sku_substitution" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "sku_id" BIGINT NOT NULL,
    "substitute_sku_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sku_substitution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "contact_person" TEXT,
    "contact_phone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL DEFAULT 'system',
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact_name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL DEFAULT 'system',
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact_name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL DEFAULT 'system',
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "doc_no" TEXT NOT NULL,
    "doc_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "supplier_id" BIGINT,
    "warehouse_id" BIGINT,
    "remarks" TEXT,
    "total_qty" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL DEFAULT 'system',
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "purchase_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_line" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "po_id" BIGINT NOT NULL,
    "line_no" INTEGER NOT NULL,
    "sku_id" BIGINT NOT NULL,
    "qty" DECIMAL(20,6) NOT NULL,
    "unit_price" DECIMAL(20,6) NOT NULL,
    "amount" DECIMAL(20,6) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_order_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grn" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "doc_no" TEXT NOT NULL,
    "doc_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "po_id" BIGINT,
    "warehouse_id" BIGINT,
    "remarks" TEXT,
    "total_qty" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL DEFAULT 'system',
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "grn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grn_line" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "grn_id" BIGINT NOT NULL,
    "line_no" INTEGER NOT NULL,
    "sku_id" BIGINT NOT NULL,
    "qty" DECIMAL(20,6) NOT NULL,
    "unit_price" DECIMAL(20,6) NOT NULL,
    "amount" DECIMAL(20,6) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grn_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_order" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "doc_no" TEXT NOT NULL,
    "doc_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "customer_id" BIGINT,
    "warehouse_id" BIGINT,
    "remarks" TEXT,
    "total_qty" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL DEFAULT 'system',
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "sales_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales_order_line" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "so_id" BIGINT NOT NULL,
    "line_no" INTEGER NOT NULL,
    "sku_id" BIGINT NOT NULL,
    "qty" DECIMAL(20,6) NOT NULL,
    "unit_price" DECIMAL(20,6) NOT NULL,
    "amount" DECIMAL(20,6) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sales_order_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbound" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "doc_no" TEXT NOT NULL,
    "doc_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "so_id" BIGINT,
    "warehouse_id" BIGINT,
    "remarks" TEXT,
    "total_qty" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL DEFAULT 'system',
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "outbound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbound_line" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "outbound_id" BIGINT NOT NULL,
    "line_no" INTEGER NOT NULL,
    "sku_id" BIGINT NOT NULL,
    "qty" DECIMAL(20,6) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outbound_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stocktake" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "doc_no" TEXT NOT NULL,
    "doc_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "warehouse_id" BIGINT,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL DEFAULT 'system',
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "stocktake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stocktake_line" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "stocktake_id" BIGINT NOT NULL,
    "line_no" INTEGER NOT NULL,
    "sku_id" BIGINT NOT NULL,
    "system_qty" DECIMAL(20,6) NOT NULL,
    "counted_qty" DECIMAL(20,6) NOT NULL,
    "diff_qty" DECIMAL(20,6) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stocktake_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "quote_no" TEXT NOT NULL,
    "customer_id" BIGINT,
    "status" TEXT NOT NULL,
    "current_version" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL DEFAULT 'system',
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "quotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_version" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "quotation_id" BIGINT NOT NULL,
    "version_no" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "total_amount" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "quotation_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotation_line" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "quotation_version_id" BIGINT NOT NULL,
    "line_no" INTEGER NOT NULL,
    "sku_id" BIGINT NOT NULL,
    "qty" DECIMAL(20,6) NOT NULL,
    "unit_price" DECIMAL(20,6) NOT NULL,
    "amount" DECIMAL(20,6) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotation_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_ledger" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "sku_id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "quantity_delta" INTEGER NOT NULL,
    "reference_type" TEXT NOT NULL,
    "reference_id" TEXT NOT NULL,
    "reversal_of_ledger_id" BIGINT,
    "posted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "request_id" TEXT,

    CONSTRAINT "inventory_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_balance" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "sku_id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "on_hand" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_balance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence_asset" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "object_key" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "size_bytes" BIGINT NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "uploaded_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidence_asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence_link" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "asset_id" BIGINT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "scope" "EvidenceScope" NOT NULL DEFAULT 'document',
    "line_ref" TEXT,
    "tag" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,

    CONSTRAINT "evidence_link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" BIGSERIAL NOT NULL,
    "request_id" TEXT NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "reason" TEXT,
    "metadata" JSONB,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "state_transition_log" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "from_status" TEXT,
    "to_status" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "state_transition_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_record" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "action_type" TEXT NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "payload_hash" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "response_body" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idempotency_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbox_event" (
    "id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "aggregate_type" TEXT NOT NULL,
    "aggregate_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "outbox_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_code_key" ON "tenant"("code");

-- CreateIndex
CREATE INDEX "user_tenant_id_idx" ON "user"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_tenant_id_username_key" ON "user"("tenant_id", "username");

-- CreateIndex
CREATE UNIQUE INDEX "user_tenant_id_email_key" ON "user"("tenant_id", "email");

-- CreateIndex
CREATE INDEX "role_tenant_id_idx" ON "role"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_tenant_id_code_key" ON "role"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "permission_code_key" ON "permission"("code");

-- CreateIndex
CREATE INDEX "user_role_tenant_id_user_id_idx" ON "user_role"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_role_tenant_id_user_id_role_id_key" ON "user_role"("tenant_id", "user_id", "role_id");

-- CreateIndex
CREATE INDEX "api_client_tenant_id_idx" ON "api_client"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "api_client_tenant_id_client_id_key" ON "api_client"("tenant_id", "client_id");

-- CreateIndex
CREATE INDEX "api_call_log_tenant_id_called_at_idx" ON "api_call_log"("tenant_id", "called_at");

-- CreateIndex
CREATE INDEX "sku_tenant_id_is_active_idx" ON "sku"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "sku_tenant_id_sku_code_key" ON "sku"("tenant_id", "sku_code");

-- CreateIndex
CREATE INDEX "sku_mapping_tenant_id_sku_id_idx" ON "sku_mapping"("tenant_id", "sku_id");

-- CreateIndex
CREATE UNIQUE INDEX "sku_mapping_tenant_id_source_type_external_code_key" ON "sku_mapping"("tenant_id", "source_type", "external_code");

-- CreateIndex
CREATE INDEX "sku_substitution_tenant_id_sku_id_idx" ON "sku_substitution"("tenant_id", "sku_id");

-- CreateIndex
CREATE UNIQUE INDEX "sku_substitution_tenant_id_sku_id_substitute_sku_id_key" ON "sku_substitution"("tenant_id", "sku_id", "substitute_sku_id");

-- CreateIndex
CREATE INDEX "warehouse_tenant_id_is_active_idx" ON "warehouse"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_tenant_id_code_key" ON "warehouse"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "supplier_tenant_id_is_active_idx" ON "supplier"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_tenant_id_code_key" ON "supplier"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "customer_tenant_id_is_active_idx" ON "customer"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "customer_tenant_id_code_key" ON "customer"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "purchase_order_tenant_id_status_doc_date_idx" ON "purchase_order"("tenant_id", "status", "doc_date");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_order_tenant_id_doc_no_key" ON "purchase_order"("tenant_id", "doc_no");

-- CreateIndex
CREATE INDEX "purchase_order_line_tenant_id_po_id_idx" ON "purchase_order_line"("tenant_id", "po_id");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_order_line_tenant_id_po_id_line_no_key" ON "purchase_order_line"("tenant_id", "po_id", "line_no");

-- CreateIndex
CREATE INDEX "grn_tenant_id_status_doc_date_idx" ON "grn"("tenant_id", "status", "doc_date");

-- CreateIndex
CREATE UNIQUE INDEX "grn_tenant_id_doc_no_key" ON "grn"("tenant_id", "doc_no");

-- CreateIndex
CREATE INDEX "grn_line_tenant_id_grn_id_idx" ON "grn_line"("tenant_id", "grn_id");

-- CreateIndex
CREATE UNIQUE INDEX "grn_line_tenant_id_grn_id_line_no_key" ON "grn_line"("tenant_id", "grn_id", "line_no");

-- CreateIndex
CREATE INDEX "sales_order_tenant_id_status_doc_date_idx" ON "sales_order"("tenant_id", "status", "doc_date");

-- CreateIndex
CREATE UNIQUE INDEX "sales_order_tenant_id_doc_no_key" ON "sales_order"("tenant_id", "doc_no");

-- CreateIndex
CREATE INDEX "sales_order_line_tenant_id_so_id_idx" ON "sales_order_line"("tenant_id", "so_id");

-- CreateIndex
CREATE UNIQUE INDEX "sales_order_line_tenant_id_so_id_line_no_key" ON "sales_order_line"("tenant_id", "so_id", "line_no");

-- CreateIndex
CREATE INDEX "outbound_tenant_id_status_doc_date_idx" ON "outbound"("tenant_id", "status", "doc_date");

-- CreateIndex
CREATE UNIQUE INDEX "outbound_tenant_id_doc_no_key" ON "outbound"("tenant_id", "doc_no");

-- CreateIndex
CREATE INDEX "outbound_line_tenant_id_outbound_id_idx" ON "outbound_line"("tenant_id", "outbound_id");

-- CreateIndex
CREATE UNIQUE INDEX "outbound_line_tenant_id_outbound_id_line_no_key" ON "outbound_line"("tenant_id", "outbound_id", "line_no");

-- CreateIndex
CREATE INDEX "stocktake_tenant_id_status_doc_date_idx" ON "stocktake"("tenant_id", "status", "doc_date");

-- CreateIndex
CREATE UNIQUE INDEX "stocktake_tenant_id_doc_no_key" ON "stocktake"("tenant_id", "doc_no");

-- CreateIndex
CREATE INDEX "stocktake_line_tenant_id_stocktake_id_idx" ON "stocktake_line"("tenant_id", "stocktake_id");

-- CreateIndex
CREATE UNIQUE INDEX "stocktake_line_tenant_id_stocktake_id_line_no_key" ON "stocktake_line"("tenant_id", "stocktake_id", "line_no");

-- CreateIndex
CREATE INDEX "quotation_tenant_id_status_created_at_idx" ON "quotation"("tenant_id", "status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "quotation_tenant_id_quote_no_key" ON "quotation"("tenant_id", "quote_no");

-- CreateIndex
CREATE INDEX "quotation_version_tenant_id_quotation_id_idx" ON "quotation_version"("tenant_id", "quotation_id");

-- CreateIndex
CREATE UNIQUE INDEX "quotation_version_tenant_id_quotation_id_version_no_key" ON "quotation_version"("tenant_id", "quotation_id", "version_no");

-- CreateIndex
CREATE INDEX "quotation_line_tenant_id_quotation_version_id_idx" ON "quotation_line"("tenant_id", "quotation_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "quotation_line_tenant_id_quotation_version_id_line_no_key" ON "quotation_line"("tenant_id", "quotation_version_id", "line_no");

-- CreateIndex
CREATE INDEX "inventory_ledger_tenant_id_sku_id_posted_at_idx" ON "inventory_ledger"("tenant_id", "sku_id", "posted_at");

-- CreateIndex
CREATE INDEX "inventory_ledger_tenant_id_reference_type_reference_id_idx" ON "inventory_ledger"("tenant_id", "reference_type", "reference_id");

-- CreateIndex
CREATE INDEX "inventory_balance_tenant_id_warehouse_id_idx" ON "inventory_balance"("tenant_id", "warehouse_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_balance_tenant_id_sku_id_warehouse_id_key" ON "inventory_balance"("tenant_id", "sku_id", "warehouse_id");

-- CreateIndex
CREATE INDEX "evidence_asset_tenant_id_status_idx" ON "evidence_asset"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "evidence_asset_tenant_id_object_key_key" ON "evidence_asset"("tenant_id", "object_key");

-- CreateIndex
CREATE INDEX "evidence_link_tenant_id_entity_type_entity_id_line_ref_idx" ON "evidence_link"("tenant_id", "entity_type", "entity_id", "line_ref");

-- CreateIndex
CREATE UNIQUE INDEX "evidence_link_tenant_id_asset_id_entity_type_entity_id_scop_key" ON "evidence_link"("tenant_id", "asset_id", "entity_type", "entity_id", "scope", "line_ref");

-- CreateIndex
CREATE INDEX "audit_log_tenant_id_occurred_at_idx" ON "audit_log"("tenant_id", "occurred_at");

-- CreateIndex
CREATE INDEX "state_transition_log_tenant_id_entity_type_entity_id_occurr_idx" ON "state_transition_log"("tenant_id", "entity_type", "entity_id", "occurred_at");

-- CreateIndex
CREATE INDEX "idempotency_record_tenant_id_action_type_created_at_idx" ON "idempotency_record"("tenant_id", "action_type", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_record_tenant_id_idempotency_key_action_type_key" ON "idempotency_record"("tenant_id", "idempotency_key", "action_type");

-- CreateIndex
CREATE INDEX "outbox_event_tenant_id_status_created_at_idx" ON "outbox_event"("tenant_id", "status", "created_at");


-- Custom constraints for business invariants
ALTER TABLE "inventory_balance"
  ADD CONSTRAINT "inventory_balance_on_hand_non_negative" CHECK ("on_hand" >= 0);

ALTER TABLE "evidence_link"
  ADD CONSTRAINT "evidence_link_scope_line_ref_check"
  CHECK (("scope" = 'document' AND "line_ref" IS NULL) OR ("scope" = 'line' AND "line_ref" IS NOT NULL));

CREATE UNIQUE INDEX "evidence_link_tenant_asset_entity_scope_line_ref_uq"
  ON "evidence_link" ("tenant_id", "asset_id", "entity_type", "entity_id", "scope", COALESCE("line_ref", '0'));
