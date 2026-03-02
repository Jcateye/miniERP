# DFP 字段字典（v1.1）

## 目标
冻结跨前后端字段语义与数据库物理类型，避免并行开发阶段字段漂移与类型不一致。

## 0. 类型分层约定（强制）
- **DB 物理类型**：PostgreSQL 实际列类型（本文件冻结）
- **API 传输类型**：JSON 传输类型（前后端接口）
- **TypeScript 类型**：shared/应用层类型

> 关键约束：`bigint` 在 API 层必须以 `string` 传输，避免 JS 精度丢失。

## 1. 通用字段基线（所有业务实体）
| 字段 | DB 类型 | API 类型 | 约束 |
|---|---|---|---|
| `id` | `bigint` | `string` | 主键，必填 |
| `tenant_id` | `bigint` | `string` | 必填，tenant-owned 表必须有 |
| `status` | `varchar(32)` | `string` | 必填，受状态机约束 |
| `created_at` | `timestamptz` | `string(ISO8601)` | 必填 |
| `created_by` | `bigint` | `string` | 必填 |
| `updated_at` | `timestamptz` | `string(ISO8601)` | 必填 |
| `updated_by` | `bigint` | `string` | 必填 |
| `deleted_at` | `timestamptz` | `string(ISO8601) \| null` | 软删可空 |
| `deleted_by` | `bigint` | `string \| null` | 软删可空 |

## 2. 单据头字段基线（Document Header）
| 字段 | DB 类型 | API 类型 | 约束 |
|---|---|---|---|
| `doc_no` | `varchar(64)` | `string` | 租户内唯一 |
| `doc_type` | `varchar(16)` | `string` | `PO|SO|GRN|OUT|ADJ|PAY|REC` |
| `status` | `varchar(32)` | `string` | 状态机驱动 |
| `doc_date` | `date` | `string(YYYY-MM-DD)` | 必填 |
| `remarks` | `text` | `string \| null` | 可空 |

编号规则固定：`DOC-{type}-{YYYYMMDD}-{seq}`。

## 3. 单据行字段基线（Document Line）
| 字段 | DB 类型 | API 类型 | 约束 |
|---|---|---|---|
| `id` | `bigint` | `string` | 主键 |
| `doc_id` | `bigint` | `string` | 外键 |
| `line_no` | `integer` | `number` | 正整数 |
| `sku_id` | `bigint` | `string` | 外键 |
| `qty` | `numeric(20,6)` | `string` | decimal-string |
| `unit_price` | `numeric(20,6)` | `string` | decimal-string |
| `amount` | `numeric(20,6)` | `string` | decimal-string |
| `tax_amount` | `numeric(20,6)` | `string \| null` | 可空 |

## 4. 金额与数量语义冻结
- 前后端交互层统一 `decimal-string`（如 `"12.340000"`）
- 领域计算统一 decimal 语义，禁止 float 业务计算
- 展示格式化不得参与业务计算回写

## 5. 证据字段基线
### 5.1 `evidence_asset`
| 字段 | DB 类型 | API 类型 | 约束 |
|---|---|---|---|
| `id` | `bigint` | `string` | 主键 |
| `tenant_id` | `bigint` | `string` | 必填 |
| `object_key` | `varchar(512)` | `string` | 必填 |
| `content_type` | `varchar(128)` | `string` | 必填 |
| `size_bytes` | `bigint` | `string` | 必填，非负 |
| `sha256` | `char(64)` | `string` | 必填 |
| `status` | `varchar(32)` | `string` | `pending_upload|uploaded|validating|active|rejected|quarantined` |
| `uploaded_by` | `bigint` | `string` | 必填 |
| `uploaded_at` | `timestamptz` | `string(ISO8601)` | 必填 |

### 5.2 `evidence_link`
| 字段 | DB 类型 | API 类型 | 约束 |
|---|---|---|---|
| `id` | `bigint` | `string` | 主键 |
| `tenant_id` | `bigint` | `string` | 必填 |
| `asset_id` | `bigint` | `string` | 外键 |
| `entity_type` | `varchar(64)` | `string` | 必填 |
| `entity_id` | `bigint` | `string` | 必填 |
| `scope` | `varchar(16)` | `string` | `document|line` |
| `line_ref` | `bigint` | `string \| null` | `scope=line` 时必填 |
| `tag` | `varchar(64)` | `string` | 必填 |
| `created_at` | `timestamptz` | `string(ISO8601)` | 必填 |

## 6. Shared 映射规则
- 共享契约源：
  - `packages/shared/src/types/document.ts`
  - `packages/shared/src/types/api.ts`
  - `packages/shared/src/utils/format.ts`
- shared 当前可继续使用 `string` 承载 `bigint` ID，避免前端精度风险
- 若 shared 与模块本地 DTO 冲突，以 shared 为准，模块侧必须回收本地定义