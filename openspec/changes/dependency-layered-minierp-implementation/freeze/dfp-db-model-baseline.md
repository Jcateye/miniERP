# DFP 数据库模型基线冻结（v1.0）

## 目标
冻结逻辑模型、关系与关键索引，保障后续实现可并行。

## 1. 核心实体分组

### 1.1 租户与权限
- `tenant`, `user`, `role`, `permission`, `user_role`, `api_client`, `api_call_log`

### 1.2 主数据
- `sku`, `sku_mapping`, `sku_substitution`, `warehouse`

### 1.3 采购/入库
- `purchase_order`, `purchase_order_line`, `grn`, `grn_line`

### 1.4 销售/出库
- `sales_order`, `sales_order_line`, `outbound`, `outbound_line`

### 1.5 库存/盘点
- `inventory_ledger`, `inventory_balance`, `stocktake`, `stocktake_line`

### 1.6 报价
- `quotation`, `quotation_version`, `quotation_line`

### 1.7 证据
- `evidence_asset`, `evidence_link`

### 1.8 横切能力
- `audit_log`, `state_transition_log`, `idempotency_record`, `outbox_event`

## 2. 关系基线
- 单据头 `1-N` 单据行
- 单据 `1-N` 状态迁移日志
- 证据资产与业务实体通过 `evidence_link` 解耦（支持 document/line）

## 3. 关键唯一约束（tenant 维度）
- `(tenant_id, doc_no)`
- `(tenant_id, sku_code)`
- `(tenant_id, idempotency_key, action_type)`

## 4. 热路径索引基线
- `(tenant_id, status, doc_date)`
- `(tenant_id, sku_id, posted_at)` on `inventory_ledger`
- `(tenant_id, entity_type, entity_id, line_ref)` on `evidence_link`

## 5. 字段基线
业务表至少包含：
- `id`, `tenant_id`, `status`
- `created_at/by`, `updated_at/by`, `deleted_at/by`
- 交易表包含金额与数量 decimal 字段

## 6. 迁移原则
- 优先前向兼容迁移
- 破坏性字段变更必须先弃用再删除
- 索引与约束变更需附带回滚策略