# DFP 字段字典（v1.0）

## 目标
在实现启动前冻结跨前后端字段语义，避免并行开发阶段字段漂移。

## 1. 通用字段基线（所有业务实体）
- `id`: string，主键，必填
- `tenant_id`: string，租户键，必填
- `status`: string，状态机驱动字段，必填
- `created_at`: string(datetime)，必填
- `created_by`: string，必填
- `updated_at`: string(datetime)，必填
- `updated_by`: string，必填
- `deleted_at`: string(datetime)，可空（软删时使用）
- `deleted_by`: string，可空（软删时使用）

## 2. 单据头字段基线（Document Header）
- `doc_no`: string，唯一编号（租户内唯一）
- `doc_type`: `PO|SO|GRN|OUT|ADJ|PAY|REC`
- `status`: 由状态机定义
- `doc_date`: string(date)
- `remarks`: string，可空

编号规则固定：`DOC-{type}-{YYYYMMDD}-{seq}`。

## 3. 单据行字段基线（Document Line）
- `id`: string
- `doc_id`: string
- `line_no`: number（正整数）
- `sku_id`: string
- `qty`: decimal-string（禁止 float 语义）
- `unit_price`: decimal-string
- `amount`: decimal-string
- `tax_amount`: decimal-string，可空

## 4. 金额与数量语义冻结
- 前后端交互层统一使用 `decimal-string`（如 `"12.3400"`）
- 领域计算统一 decimal 语义（禁止二进制浮点累计）
- 格式化仅用于展示，不得反向参与业务计算

## 5. 证据字段基线
### 5.1 `evidence_asset`
- `id`, `tenant_id`
- `object_key`: string
- `content_type`: string
- `size_bytes`: number
- `sha256`: string
- `status`: `pending_upload|uploaded|validating|active|rejected|quarantined`
- `uploaded_by`, `uploaded_at`

### 5.2 `evidence_link`
- `id`, `tenant_id`
- `asset_id`: string
- `entity_type`: string
- `entity_id`: string
- `scope`: `document|line`
- `line_ref`: string，可空（scope=line 时必填）
- `tag`: string
- `created_at`: string(datetime)

## 6. Shared 映射规则
- 共享契约源：
  - `packages/shared/src/types/document.ts`
  - `packages/shared/src/types/api.ts`
  - `packages/shared/src/utils/format.ts`
- 若 shared 与模块本地 DTO 冲突，以 shared 为准，模块侧必须回收本地定义。