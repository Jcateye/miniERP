## Context

当前 BFF 既有 canonical 倾向，也有明显 legacy 残留：

- 顶层已有 `customers / suppliers / warehouses`
- 但交易仍主要走 `procure/purchase-orders`、`sales/orders`
- 物料仍分裂为 `items`、`skus`、`mdm/skus`

对 web 来说，当前最重要的是先冻结“以后页面应该调用哪类 BFF 资源”，而不是一次把所有 DTO 都彻底换掉。

## Goals / Non-Goals

**Goals**
- 为 item / purchase order / sales order 提供 canonical 顶层 BFF 资源。
- 让实际页面和 hooks 改用 canonical 顶层资源。
- legacy 路径继续保留，作为 alias。
- 收敛采购/销售 BFF route 的内部 mapper，让 list/detail/status 形状通过共享转换层输出。

**Non-Goals**
- 本轮不移除 legacy 页面 route
- 本轮不重写 purchase/sales list DTO 结构
- 本轮不落 finance canonical 资源
- 本轮不直接改后端 documents/detail DTO

## Decisions

### 1. 顶层 BFF 资源先通过 alias 方式暴露

canonical 顶层 route 先复用现有实现或作为 primary export source。

原因：
- 先让前端依赖面切到 canonical 命名。
- 不把本轮扩大成 DTO 深度重构。

### 2. web consumer 立即切到 canonical 顶层资源

hooks 和 mutation endpoint 改成使用：

- `/items`
- `/purchase-orders`
- `/sales-orders`

原因：
- 真正降低前端对 legacy BFF path 的依赖。
- 后续只需在 BFF 内部继续换后端映射，不必反复改页面。

### 3. canonical route 内部共享 mapper，而不是继续复制 legacy 逻辑

采购/销售 route 当前已经开始出现两类重复：

- upstream document status -> 页面展示状态
- draft store -> detail payload / list item

处理方式：
- 在 `apps/web/src/app/api/bff/_shared` 下抽出共享 mapper
- canonical route 与 compatibility alias 继续共用同一实现
- route 自身只保留请求控制、fallback 策略和响应包装

原因：
- canonical route 不应只是“换了名字但内部继续散乱”
- 下一步接真实 upstream detail 或 canonical DTO 时，只需要替换共享 mapper，不必同时重写多个 route 文件

### 4. canonical list row 需要稳定 id，而不只是展示单号

当前采购/销售页面展示的是 `po/so = docNo`，但 upstream detail 读取需要真实 `id`。

处理方式：
- canonical list row 继续保留 `po/so` 作为页面展示列
- 同时补上稳定 `id`
- 本地 draft 仍可用 `orderNo` 作为 id；persisted upstream 行则使用真实 backend id

原因：
- 不破坏当前页面展示和排序字段
- 让 edit/delete/detail preload 统一使用稳定主键，而不是继续把 `docNo` 当作资源 id

### 5. upstream detail 先补真实 id 与行快照，再考虑补名称映射

当前 persisted `PO/SO` detail 已能从 backend `/documents/:docType/:id` 读取真实行数据，但 BFF 还缺两类字段：

- counterparty id
- item name snapshot / spec model / uom

处理方式：
- server/shared detail 契约先带出 `counterpartyId` 与 line snapshot 字段
- BFF mapper 将它们映射到订单表单的 `supplierId/customerId` 与 `itemLabel`
- 若 upstream 仍缺人类可读名称，则页面继续保留当前列表行 fallback label，仅把真实 id 覆盖进去

原因：
- 先让 lookup selector 获得真实主键
- 避免继续把展示名称误当作业务 id
- 把“名称补全”与“真实 id 接通”拆开，保持每一步都可验证

### 6. persisted detail 的名称解析优先走主数据 detail，而不是继续依赖列表 fallback

当 persisted `PO/SO` detail 已拿到真实 `supplierId/customerId` 后，BFF 可以再请求一次对应主数据 detail：

- `/suppliers/:id`
- `/customers/:id`

处理方式：
- detail route 在 mapper 之后补一次名称解析
- 若主数据 detail 成功，则返回 `code · name` 作为 selector label
- 若主数据 detail 失败，则保留当前 mapper 或页面 fallback label

原因：
- 让 selector 标签尽量反映真实主数据
- 不把这一步扩大成 server join 或跨域 DTO 改造
- 出错时仍可退回已有 fallback，不阻塞编辑流程

### 7. masterdata detail canonical route 自己也要可读

既然采购/销售 detail 已经需要主数据 detail 作为依赖，那么 canonical BFF 主数据 detail route 本身也应该具备 GET：

- `/api/bff/customers/:id`
- `/api/bff/suppliers/:id`

处理方式：
- top-level canonical route 新增 GET
- `mdm/customers/[id]`、`mdm/suppliers/[id]` 改为纯 alias re-export

原因：
- 避免订单 detail route 继续直连 backend masterdata path
- 让 canonical BFF 路径在读写两侧都闭合
- 减少 legacy `mdm/*` 与 top-level canonical 路由各自漂移的风险

### 8. item label 补全继续通过 canonical detail 资源收敛

当 persisted `PO/SO` detail 的行数据缺少 `itemNameSnapshot` 时，当前页面仍可能退回到 `物料 #id` 或“兼容摘要行”。

处理方式：
- 在共享 resolver 中补充 item detail 读取能力
- 采购/销售 detail route 在返回前，对缺少快照标签的行再尝试解析 `/items/:id`
- 成功时返回 `code · name` 作为 `itemLabel`
- 失败时保留现有 mapper/fallback 行为

原因：
- 让订单编辑态优先使用 canonical item 资源补足显示信息
- 继续减少页面对 legacy 摘要 shape 的依赖
- 保持失败可退回，不阻塞当前编辑流

### 9. canonical masterdata detail route 与 enrichment 必须共享同一套读取规则

当前 `customers/[id]`、`suppliers/[id]`、`items/[id]` 与订单 detail enrichment 虽然都在读同一批主数据，但 fallback 规则仍然分散。

处理方式：
- 在共享 resolver 中引入统一的 detail fetch result 模型
- canonical detail route 只负责把 result 包装成 HTTP 响应
- 订单 detail enrichment 继续直接消费共享 resolver

原因：
- 避免同一实体在 route GET 和 enrichment 中出现不同的 404 / fallback 行为
- 减少后续 canonical 资源继续分叉实现的风险

### 10. MDM 客户/供应商页面应直接消费 canonical 顶层资源

当前客户和供应商页面虽然已有 canonical 顶层 BFF route，但页面自身仍在使用 `mdm/customers`、`mdm/suppliers`，编辑态也直接吃列表行数据。

处理方式：
- 将 list hook 切到 `/customers`、`/suppliers`
- 将 create/update/delete mutation 切到 canonical 顶层 route
- 编辑弹窗打开后补一次 detail preload，并允许详情覆盖列表行 fallback

原因：
- 让 canonical 资源真正成为页面主入口，而不只是保留给其他模块调用
- 让编辑态逐步摆脱“列表摘要就是详情”的隐式假设

### 11. SKU 编辑态也应显式 preload canonical item detail

当前 `mdm/skus` 已经通过 `/items` 做 list/create/update/delete，但编辑弹窗仍直接使用列表行摘要作为表单初值。

处理方式：
- 编辑弹窗打开时先注入当前列表行 fallback
- 然后再请求 `/items/:id`
- 若 detail 返回更完整的 `baseUnit/categoryId/specification/isActive`，则覆盖表单初值

原因：
- 避免继续把列表页为展示拼出的字段误当作 item detail 事实源
- 让 item canonical route 在 MDM 页面真正承担 detail 读取职责

### 12. Item 表单字段先在 web/BFF 层向 canonical contract 扩容

当前 SKU/Item 页面只覆盖了 `code/name/specification/baseUnit/category/status`，离 canonical item contract 还差一层。

处理方式：
- 先在 shared `Sku` 最小实体上补 `minStockQty/maxStockQty/leadTimeDays`
- 在 BFF list/detail fallback 与表单中补 `barcode / batchManaged / serialManaged / minStockQty / maxStockQty / leadTimeDays`
- create/update 先通过 BFF 接口校验并转发；上游若暂未完整持久化，页面显式提示这是当前能力边界

原因：
- 让 richer item 字段先进入页面契约和 canonical detail 口径
- 避免后续每次扩字段都重新翻动表单/列表/详情链路

## Validation

- `bun run --filter web build`
- 如有需要，运行 `bun run --filter server test` 确认共享改动未引入回归
