# ERP Domain Migration Checklist

## 1. 目标

把目标 ERP 域模型从“设计蓝图”拆成可执行的数据库迁移清单。

本文聚焦 5 件事：

1. 目标表分阶段怎么落库
2. 旧表如何映射到新表
3. 每阶段应该做哪些迁移动作
4. 每阶段的风险点是什么
5. 如何判定这一阶段完成

设计总基线见：

- [miniERP-ERP总体架构与主业务流程蓝图.md](/Users/haoqi/OnePersonCompany/miniERP/designs/architecture/miniERP-ERP%E6%80%BB%E4%BD%93%E6%9E%B6%E6%9E%84%E4%B8%8E%E4%B8%BB%E4%B8%9A%E5%8A%A1%E6%B5%81%E7%A8%8B%E8%93%9D%E5%9B%BE.md)
- [schema.prisma](/Users/haoqi/OnePersonCompany/miniERP/apps/server/prisma/schema.prisma)

---

## 2. 迁移原则

- 不允许静默丢字段
- 先兼容，后切主路径，最后删旧名
- 先补公共字段，再补业务字段
- 先补读模型和唯一键，再补写路径
- 库存只认 `inventory_ledger`
- 所有金额/税额/数量统一 Decimal
- 所有写路径必须保留 `tenant_id + audit + idempotency`

---

## 3. 旧表到新表映射

| 当前表 | 目标表 | 动作 |
|---|---|---|
| `sku` | `item` | 重命名或新建 `item` 后双写迁移 |
| `sku_mapping` | `item_mapping` | 重命名或新建后回填 |
| `sku_substitution` | `item_substitution` | 重命名或新建后回填 |
| `grn` | `goods_receipt` | 重命名或新建后回填 |
| `grn_line` | `goods_receipt_line` | 重命名或新建后回填 |
| `outbound` | `shipment` | 重命名或新建后回填 |
| `outbound_line` | `shipment_line` | 重命名或新建后回填 |
| `purchase_order` | `purchase_order` | 补字段 |
| `purchase_order_line` | `purchase_order_line` | 补字段 |
| `sales_order` | `sales_order` | 补字段 |
| `sales_order_line` | `sales_order_line` | 补字段 |
| `stocktake` | `stocktake` | 补字段 |
| `stocktake_line` | `stocktake_line` | 补字段 |
| `quotation` | `quotation` | 保留并补字段 |
| `quotation_version` | `quotation_version` | 保留并补字段 |
| `quotation_line` | `quotation_line` | 保留并补字段 |
| `inventory_ledger` | `inventory_ledger` | 保留为事实源并增强 |
| `inventory_balance` | `inventory_balance` | 保留为投影并增强 |
| `evidence_*` | `evidence_*` | 保留并扩展到更多实体 |
| `audit_log` | `audit_log` | 保留 |
| `state_transition_log` | `state_transition_log` | 保留 |
| `idempotency_record` | `idempotency_record` | 保留 |
| `outbox_event` | `outbox_event` | 保留 |

---

## 4. 分阶段迁移

## Phase 1. 平台根模型

### 目标

补齐 `company / org_unit / role_permission / user_org_scope`，把租户模型升级成“租户 + 公司 + 组织”三层。

### 新增表

```text
company
org_unit
role_permission
user_org_scope
```

### 迁移动作

1. 为现有租户生成默认 `company`
2. 为现有业务数据生成默认 `org_unit`
3. 给业务表补 `company_id / org_id`
4. 回填旧数据的 `company_id / org_id`
5. 对权限模型增加 `role_permission`
6. 对用户增加 `user_org_scope`

### 风险

- 现有数据只有 `tenant_id`，没有组织归属
- 若组织默认值定错，后续数据权限会全部偏移

### 验收

- 所有业务表可按 `tenant + company + org` 定位
- 用户能看到明确的数据范围
- 新写入链路强制带 `company_id / org_id`

---

## Phase 2. 主数据域升级

### 目标

完成 `item` 正名，并补齐 `warehouse_bin / uom / tax_code`。

### 新增表

```text
item
item_mapping
item_substitution
warehouse_bin
uom
tax_code
```

### 旧表动作

```text
sku -> item
sku_mapping -> item_mapping
sku_substitution -> item_substitution
warehouse -> 补 company_id / org_id / manage_bin / address / contact 字段
customer -> 补开票与结算字段
supplier -> 补结算与收款字段
```

### 迁移动作

1. 新建 `item*` 表或做 rename migration
2. 回填 `sku*` 数据到 `item*`
3. 补齐税务字段：`spec_model / tax_code / tax_rate / uom`
4. 给采购、销售、报价、库存行表增加 `item_id` 新引用
5. 页面和 BFF 从 `/skus` 逐步切到 `/mdm/items`

### 风险

- 旧业务行表仍引用 `sku_id`
- 迁移期间可能出现 `item_id / sku_id` 双字段并存

### 验收

- `item` 成为正式主表
- 新页面和新接口以 `item` 为主路径
- 旧 `sku` 路径仅做兼容

---

## Phase 3. 库存事务层补齐

### 目标

把库存从“台账 + 余额”升级为“事务 -> 台账 -> 余额投影”完整模型。

### 新增表

```text
inventory_txn
inventory_txn_line
```

### 旧表动作

```text
inventory_ledger   保留并增强
inventory_balance  保留并增强
stocktake          补齐 source / posted / owner 字段
stocktake_line     补齐 batch / serial / reason / bin 字段
```

### 迁移动作

1. 新建 `inventory_txn / inventory_txn_line`
2. 所有库存类业务动作先落事务层
3. 由事务层驱动 `inventory_ledger`
4. 由台账异步或事务内更新 `inventory_balance`
5. 增强调拨、调整、盘点、收货、发运的统一引用关系

### 风险

- 若继续绕过事务层直接写台账，会形成两套库存事实
- 若余额投影更新失败，需要可重放机制

### 验收

- 所有库存变更都能追到 `inventory_txn`
- `inventory_ledger` 仍然 append-only
- `inventory_balance` 可完全由台账重建

---

## Phase 4. 采购与销售单据正名

### 目标

完成 `goods_receipt / shipment` 正名，并补齐上下游引用字段。

### 目标表

```text
purchase_order
purchase_order_line
goods_receipt
goods_receipt_line
sales_order
sales_order_line
shipment
shipment_line
quotation
quotation_version
quotation_line
```

### 旧表动作

```text
grn -> goods_receipt
grn_line -> goods_receipt_line
outbound -> shipment
outbound_line -> shipment_line
```

### 迁移动作

1. 完成采购、收货、销售、发运字段统一
2. 增加 `source_ref_type / source_ref_id / source_line_id`
3. 增加税额、含税金额、交期、发运字段
4. 全链路统一 Evidence 和 Audit
5. 旧路由 `/purchasing/* /sales/out` 逐步切到新 IA

### 风险

- 旧业务名称和新业务名称同时存在会混淆开发与用户
- 单据行和库存行引用不统一时，联查会断

### 验收

- 新单据模型能覆盖旧功能不缩水
- 采购到入库、报价到发运链路可全链路联查

---

## Phase 5. 财务核算域

### 目标

补齐业财税一体化最关键的一层。

### 新增表

```text
invoice
invoice_line
receipt
receipt_allocation
payment
payment_allocation
gl_account
journal_entry
journal_entry_line
cost_center
project
budget
budget_line
fiscal_period
```

### 迁移动作

1. 先做 `invoice / invoice_line`
2. 再做 `receipt / payment` 及 allocation
3. 最后做 `journal_entry / gl_account / fiscal_period`
4. 保证票面字段、税额字段、归档字段完整
5. 保证借贷平衡、核销关系、期间结账状态完整

### 风险

- 发票字段不完整会导致后续税务接口无法接
- Allocation 不设计好会导致核销逻辑反复返工

### 验收

- AR/AP、收付款、凭证、期间可闭环
- 发票可追到业务单据、收付款、凭证

---

## Phase 6. 流程、报表、集成、制造质量

### 新增表

```text
workflow_instance
approval_task
notification
report_definition
dashboard_definition
integration_endpoint
integration_job
integration_log
attachment_archive
production_order
work_order
qc_record
```

### 迁移动作

1. 先做 workflow / notification
2. 再做 integration / report
3. 最后做 manufacturing / quality

### 验收

- 单据状态流转可审计
- 失败集成可追踪可重试
- 制造和质检可挂到主库存与财务骨架中

---

## 5. 每阶段通用动作模板

每一阶段都按同一个顺序做：

1. Prisma schema 设计
2. migration SQL 草案
3. preflight SQL 检查脏数据
4. seed / backfill 脚本
5. BFF / server DTO 契约升级
6. Web 页面与路由切换
7. 回归测试与回滚脚本

---

## 6. 迁移风险总表

| 风险 | 场景 | 缓解方式 |
|---|---|---|
| 字段丢失 | 旧表字段没有映射到新表 | 所有旧字段先映射到同名字段或 `ext/json` |
| 双主路径混乱 | `sku` 与 `item` 长期并存 | 新接口切主，旧接口只保留 redirect / compatibility |
| 库存事实分裂 | 事务层与台账层并行写入 | 强制库存写入先过 `inventory_txn` |
| 财务断链 | 发票、核销、凭证分阶段设计过碎 | `invoice + allocation + journal` 作为一组设计 |
| 组织数据错误 | 无 `company/org` 的旧数据默认回填错误 | 迁移前出具 mapping 表并人工确认 |

---

## 7. 验收总表

| 阶段 | 完成标志 |
|---|---|
| Phase 1 | 所有业务数据具备 `tenant + company + org` |
| Phase 2 | `item` 成为主数据正式命名 |
| Phase 3 | 所有库存变动都能追到 `inventory_txn` |
| Phase 4 | 采购/销售单据完成正名并保持联查 |
| Phase 5 | 发票、收付款、凭证、期间结账闭环 |
| Phase 6 | 流程、报表、集成、制造质量挂到统一骨架 |

---

## 8. 建议下一步

如果按当前代码库实际状态推进，优先顺序建议是：

1. `company / org_unit`
2. `item` 正名
3. `inventory_txn / inventory_txn_line`
4. `goods_receipt / shipment`
5. `invoice / receipt / payment / journal_entry`
