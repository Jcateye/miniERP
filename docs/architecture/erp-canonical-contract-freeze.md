# ERP Canonical Contract Freeze

最后更新：2026-03-13

## 目的

为 miniERP 的全域 ERP 重构建立单一共享事实源，避免 `designs/`、`packages/shared`、Prisma schema、BFF route、页面表单继续各自扩字段。

本文档定义：

- 正式业务域名
- 公共共享字段
- 单据状态与兼容别名
- canonical contract 的唯一入口
- 迁移窗口内允许与禁止的做法

## 1. 正式域名

以下名称为今后新增能力的正式业务域名：

| 领域 | 正式域名 | 兼容旧名 |
| --- | --- | --- |
| 商品主数据 | `item` | `sku` |
| 入库单 | `goods_receipt` | `grn` |
| 发运单 | `shipment` | `outbound` |
| 发票 | `invoice` | - |
| 收款单 | `receipt` | `rec` |
| 付款单 | `payment` | `pay` |
| 总账凭证 | `journal_entry` | `je` |

规则：

1. 新增 shared 类型、Prisma 新表、BFF 新 route、设计文档新能力，统一使用正式域名。
2. 旧命名只允许存在于 compat alias、兼容 route、历史页面或迁移脚本。
3. 禁止再新增以 `sku/grn/outbound` 为主定义的新字段或新模块。

## 2. Canonical 类型入口

`packages/shared/src/types/erp/` 是 canonical ERP contract 的唯一新增入口。

目录冻结为：

```text
types/erp/
  common.ts
  master-data.ts
  trading.ts
  inventory.ts
  finance.ts
  compat.ts
```

旧文件：

- `types/document.ts`
- `types/documents.ts`
- `types/entities.ts`
- `types/masterdata.ts`
- `types/inventory.ts`

只允许做以下动作：

1. re-export canonical type
2. 提供兼容别名
3. 标注 deprecated 注释

禁止：

1. 在旧文件里新增第二套状态源
2. 在旧文件里定义 canonical 新字段
3. 在旧文件里再发明新的业务域名

## 3. 公共字段冻结

所有新的 canonical ERP 实体必须至少具备以下共享字段：

```text
id
tenantId
companyId
orgId?
status
ext
createdAt
createdBy
updatedAt
updatedBy
deletedAt?
deletedBy?
```

说明：

- `ext` 统一作为长尾扩展字段承载层。
- 任何页面私有字段如果未达到共享冻结标准，先落 `ext` 或页面私域 DTO，不得直接污染共享主契约。

## 4. 数值字段冻结

### 传输层

- 数量、金额、税额、汇率统一使用字符串承载：
  - `DecimalString`
  - `BigIntString`

### 计算层

- Server 侧金额与税额计算必须使用 `decimal.js`。
- 禁止业务金额直接使用 JavaScript 浮点数。

### 持久层目标

- `qty / unit_price / amount / tax_amount / total_amount / total_with_tax` 使用 `Decimal(20,6)`。
- `exchange_rate` 使用 `Decimal(20,8)`。
- 库存数量从现有 `Int` 迁移到 decimal 口径。

## 5. 单据头字段冻结

canonical 单据头字段：

```text
docNo
docDate
docType
status
approvalStatus?
currency?
exchangeRate?
taxIncluded?
warehouseId?
counterpartyId?
remarks?
sourceRefType?
sourceRefId?
totalQty
totalAmount
taxAmount?
totalWithTax?
ext
```

canonical 单据行字段：

```text
lineNo
itemId
itemNameSnapshot?
specModelSnapshot?
uom
qty
unitPrice?
taxRate?
amount?
taxAmount?
warehouseId?
binId?
batchNo?
serialNo?
sourceLineId?
lineStatus?
ext
```

## 6. 状态源冻结

文档状态定义只允许保留一个 canonical source。

现阶段：

- `document.ts` 与 `documents.ts` 都可能被旧代码引用
- 但实际状态常量必须来自 canonical `trading.ts`

兼容层规则：

1. `document.ts` 只做 legacy alias
2. `documents.ts` 只做 canonical DTO 的旧入口转发
3. 禁止两边继续独立扩状态

## 7. BFF 兼容规则

允许：

1. GET read route 在 `development/test` 下 fallback fixture
2. 旧 `/documents?docType=*` 兼容 canonical 读模型
3. 旧 `/skus` route 继续存在，但返回 compat DTO

禁止：

1. POST/PATCH/PUT/DELETE/action route fallback 到 fixture
2. 用 fixture/view meta 假装后端已有 canonical 字段
3. 页面表单提交中文状态或展示态字符串作为业务状态

## 8. 前端表单规则

1. 业务状态值必须是 shared 中的 canonical code
2. 中文仅用于 label，不得用于 payload
3. 客户、供应商、仓库、税码、项目、成本中心逐步切换 lookup selector
4. 迁移期间若仍为文本输入，字段语义必须标明是 `code` 还是 `id`

## 9. 当前兼容窗口

本轮兼容窗口只保留一轮重构周期，用于：

- `sku -> item`
- `grn -> goods_receipt`
- `outbound -> shipment`
- `documents 聚合读模型 -> trading 正式资源`

兼容窗口结束后：

1. 删除旧主定义
2. 删除仅为兼容存在的重复常量
3. 删除旧路由的主写路径
