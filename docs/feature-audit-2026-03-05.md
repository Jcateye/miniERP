# miniERP 功能特性盘点（基于页面 + PRD + 现有代码）

- 盘点日期：2026-03-05
- 盘点范围：`designs/ui/*`、`apps/web`、`apps/server`、`packages/shared`
- 结论口径：
  - `页面已存在` 仅表示路由/模板可访问
  - `前端已联调` 表示页面真实调用 BFF/后端，而不是装配静态数据
  - `后端已实现` 以 controller + service + repository/DB 为准

---

## 1. PRD 页面覆盖情况（从页面出发）

### 1.1 PRD 路由（`minierp_page_spec.md`）对比当前 Web 路由

- PRD 核心页面：30
- 当前已落路由（覆盖 PRD）：28/30
- PRD 缺失路由：
  - `/mappings`
  - `/skus/:id/edit`
- 当前代码里额外存在（不在该 PRD 30 页中）：
  - `/sales/quotations`
  - `/sales/quotations/new`
  - `/sales/quotations/:id`
  - `/login`
  - `/403`

### 1.2 模板体系落实

- T1/T2/T3/T4 模板已在前端统一装配（`erp-page-config.tsx` + `erp-page-assemblies.tsx`）。
- 但多数页面仍是“模板壳 + 种子数据”，并非完整业务交互。

---

## 2. 全功能矩阵（查询/新增/修改/删除 + 前后端完成度）

状态说明：✅ 已完成；⚠️ 部分完成；❌ 未完成

| 功能域 | 操作 | 页面层（FE） | BFF | 后端（BE） | 备注 |
|---|---|---|---|---|---|
| SKU | 列表查询 | ⚠️ `/skus` 页面存在，但当前用静态装配行 | ✅ `GET /api/bff/skus` | ✅ `GET /api/skus` | 前端未接 SKU 列表接口 |
| SKU | 详情查询 | ⚠️ `/skus/:id` 存在，但主体信息静态；仅凭证会拉取接口 | ✅ `GET /api/bff/skus/:id` | ✅ `GET /api/skus/:id` | 明细信息非真实联调 |
| SKU | 新增 | ⚠️ `/skus/new` 向导页存在，但无提交逻辑 | ✅ `POST /api/bff/skus` | ✅ `POST /api/skus` | 前端未调用 |
| SKU | 修改 | ❌ 缺 `/skus/:id/edit`；当前无真实编辑提交流程 | ✅ `PUT /api/bff/skus/:id` | ✅ `PUT /api/skus/:id` | 仅接口就绪 |
| SKU | 删除 | ❌ 无删除按钮/流程 | ❌ 无 SKU 删除 BFF 路由 | ✅ `DELETE /api/skus/:id` | BFF 与前端缺口 |
| 仓库 | 列表查询 | ❌ 设置页未接真实仓库列表 | ✅ `GET /api/bff/warehouses` | ✅ `GET /api/warehouses` | UI 目前为通用静态主数据页 |
| 仓库 | 新增 | ❌ | ✅ `POST /api/bff/warehouses` | ✅ `POST /api/warehouses` | 前端未接 |
| 仓库 | 修改 | ❌ | ❌（BFF 无 `/:id` PATCH） | ✅ `PATCH /api/warehouses/:id` | BFF 缺口 |
| 仓库 | 删除 | ❌ | ❌ | ✅ `DELETE /api/warehouses/:id` | BFF/前端缺口 |
| 供应商 | 列表查询 | ❌ | ✅ `GET /api/bff/suppliers` | ✅ `GET /api/suppliers` | 同上 |
| 供应商 | 新增 | ❌ | ✅ `POST /api/bff/suppliers` | ✅ `POST /api/suppliers` | 同上 |
| 供应商 | 修改 | ❌ | ❌ | ✅ `PATCH /api/suppliers/:id` | BFF 缺口 |
| 供应商 | 删除 | ❌ | ❌ | ✅ `DELETE /api/suppliers/:id` | BFF 缺口 |
| 客户 | 列表查询 | ❌ | ✅ `GET /api/bff/customers` | ✅ `GET /api/customers` | 同上 |
| 客户 | 新增 | ❌ | ✅ `POST /api/bff/customers` | ✅ `POST /api/customers` | 同上 |
| 客户 | 修改 | ❌ | ❌ | ✅ `PATCH /api/customers/:id` | BFF 缺口 |
| 客户 | 删除 | ❌ | ❌ | ✅ `DELETE /api/customers/:id` | BFF 缺口 |
| PO | 列表查询 | ✅ `/purchasing/po` 已接 `documents` 列表 | ✅ `GET /api/bff/documents?docType=PO` | ✅ `GET /api/documents`（PO） | 真链路可跑 |
| PO | 详情查询 | ✅ `/purchasing/po/:id` 已接详情 | ✅ `GET /api/bff/documents/PO/:id` | ✅ `GET /api/documents/:docType/:id` | 真链路可跑 |
| PO | 新增 | ⚠️ `/purchasing/po/new` 存在但静态 | ❌（无 documents create） | ❌（无 documents create） | 仅向导壳 |
| PO | 修改单据内容 | ❌ | ❌ | ❌ | 暂无编辑接口 |
| PO | 删除 | ❌ | ❌ | ❌ | 暂无删除接口 |
| PO | 状态流转（确认/关闭/取消等） | ⚠️ 页面按钮无联调 | ✅ `POST /api/bff/documents/PO/:id/:action` | ✅ `POST /api/documents/:docType/:id/:action` | 后端有状态机与审计 |
| GRN | 列表查询 | ✅ `/purchasing/grn` 已接列表 | ✅ | ✅ | 真链路可跑 |
| GRN | 详情查询 | ✅ `/purchasing/grn/:id` 已接详情 | ✅ | ✅ | 真链路可跑 |
| GRN | 新增 | ⚠️ `/purchasing/grn/new` 存在但静态 | ❌ | ❌ | 无创建接口 |
| GRN | 过账 | ⚠️ 前端无联调触发 | ✅ action 路由 | ✅ 后端含 pre-post 校验 + inventory post + 回滚 | 后端能力较完整 |
| SO | 列表/详情 | ✅ `/sales/so`、`/sales/so/:id` | ✅ `documents` | ✅（走 DB） | 真链路可跑 |
| SO | 新增/编辑/删除 | ⚠️ 仅有 `/sales/so/new` 静态 | ❌ | ❌ | 暂无创建/编辑 API |
| SO | 状态流转 | ⚠️ 页面未接 action | ✅ | ✅ | 后端有状态机 |
| OUT | 列表/详情 | ✅ `/sales/out`、`/sales/out/:id` | ✅ | ✅（走 DB） | 真链路可跑 |
| OUT | 新增 | ⚠️ `/sales/out/new` 静态 | ❌ | ❌ | 暂无创建 API |
| OUT | 过账 | ⚠️ 前端未接 action | ✅ | ✅（库存下穿保护 + 失败返回） | 后端能力较完整 |
| 库存余额 | 查询 | ⚠️ `/inventory` 页面静态（未接接口） | ✅ `GET /api/bff/inventory/balances` | ✅ `GET /api/inventory/balances` | 接口有，页面未用 |
| 库存流水 | 查询 | ⚠️ `/inventory/ledger` 页面静态（未接接口） | ✅ `GET /api/bff/inventory/ledger` | ✅ `GET /api/inventory/ledger` | 接口有，页面未用 |
| 库存补货建议 | 查询/生成 | ⚠️ `/inventory/reorder` 静态 | ❌ | ❌ | 仅展示层 |
| 盘点（ADJ） | 列表/详情 | ✅ `/stocktake`、`/stocktake/:id` 走 `docType=ADJ` | ✅ `documents` | ⚠️ ADJ 当前由 DocumentsService 内存数据处理（非 stocktake 表） | 持久化链路未打通 |
| 盘点（ADJ） | 新增 | ⚠️ `/stocktake/new` 静态 | ❌ | ❌ | 无创建接口 |
| 盘点（ADJ） | 过账 | ⚠️ 前端未接 action | ✅ | ⚠️ 内存路径可过账；未接 stocktake 持久化表 | 需要重构为真实单据链路 |
| 凭证（单据级） | 查询 | ✅ 详情页会请求 `evidence/links` | ✅ `GET /api/bff/evidence/links` | ✅ `GET /api/evidence/links` | 可用 |
| 凭证（行级） | 查询 | ⚠️ 当前 Drawer 多为静态装配，不走 `useLineEvidence` | ✅ | ✅ | 前端未落真实行级查询 |
| 凭证上传意图 | 创建 | ❌ 前端未调用 | ✅ `POST /api/bff/evidence/upload-intents` | ✅ `POST /api/evidence/upload-intents` | 接口已就绪 |
| 凭证绑定 | 创建 | ❌ 前端未调用 | ✅ `POST /api/bff/evidence/links` | ✅ `POST /api/evidence/links` | 接口已就绪 |
| 报价（Quotation） | 列表/详情/新增 | ⚠️ 页面存在（`/sales/quotations*`），但当前借用 SO 配置/数据 | ❌ 专属 BFF 无 | ❌ 专属 controller/service 无 | 与 DB 的 quotation 表未打通 |

---

## 3. 当前“真正可跑通”的主链路

### 3.1 已跑通（读链路）

- 文档工作台与详情（PO/GRN/SO/OUT/ADJ）
  - FE Hooks -> BFF `/api/bff/documents*` -> BE `DocumentsController`

- 单据级凭证查询
  - FE Detail -> BFF `/api/bff/evidence/links` -> BE `EvidenceController`

### 3.2 后端具备但前端未用

- 仓库/供应商/客户/SKU 的完整（或大部分）主数据 CRUD
- 库存余额/流水查询接口
- 凭证上传意图与绑定
- 文档 action 状态流转（含幂等键）

### 3.3 前端存在但业务未闭环

- 所有 `/new` 向导页（SKU/PO/GRN/SO/OUT/Stocktake/Quotation）
- 行级凭证真实上传与绑定
- `/inventory` 与 `/inventory/ledger` 的真实数据联调

---

## 4. 架构与实现层关键观察

1. 页面覆盖率高，但“业务完成度”偏低
- 路由已覆盖 PRD 绝大多数页面，但大量是 Stage1 装配页面。

2. BFF 与 BE 存在能力错配
- BE 有主数据删除/更新接口，BFF 未完全透传（尤其 suppliers/customers/warehouses/SKU delete）。

3. 单据链路偏“状态驱动”，缺“创建/编辑驱动”
- `documents` 目前重点是 list/detail/action；缺 create/update/delete，导致向导页无法落库。

4. 盘点链路未接真实 stocktake 表
- ADJ 在 DocumentsService 中多为内存路径，和 Prisma 的 `stocktake/stocktake_line` 未形成统一读写链路。

5. 合同层有漂移风险
- shared 的 `DocumentStatus`（pending/approved/completed）与核心状态机（confirmed/validating/posted/picking/closed）不一致，易导致前后端语义偏差。

---

## 5. 对标市场 ERP（Odoo / NetSuite / SAP B1 / 金蝶云星空）后的缺口

> 以“中小企业可落地、先跑通核心闭环”为目标做优先级。

### P0（建议立即补齐，形成最小可用 ERP 闭环）

1. 单据创建闭环
- PO/GRN/SO/OUT/ADJ 的 create API + FE 提交。

2. 单据动作联调
- FE 接 `documents/:action`，打通确认/过账/取消。

3. 库存页面真数据
- `/inventory`、`/inventory/ledger` 接后端查询接口。

4. 主数据 CRUD 闭环
- 主数据页接入 warehouses/suppliers/customers/skus，补编辑与删除。

5. 行级凭证真实化
- 用 `upload-intent + attach-link` 打通 Drawer 上传与绑定。

### P1（建议 1-2 个迭代补齐，提升可运营性）

1. 报价链路正式化
- 以 Quotation 独立 API（列表/详情/版本/转 SO）替代当前 SO 借壳。

2. 盘点真实落库
- 使用 `stocktake/stocktake_line` 作为 ADJ 主数据来源，统一到 documents 视图。

3. 审批与权限可配置化
- 用户/角色/权限页面 + 后端接口（当前仅 guard 能力，缺管理面）。

4. 报表与附件中心
- 最基础经营报表（库存周转、采购到货、出库及时率）与附件检索页。

### P2（中期竞争力，向成熟 ERP 看齐）

1. 财务闭环
- 应收应付、对账、收付款（PAY/REC）、发票关联。

2. 仓储深化
- 库位/bin、批次/序列号、调拨、预留/ATP、波次拣货。

3. 规则引擎
- 价格策略、信用控制、审批流（金额阈值、角色路由）。

4. 外部集成
- Webhook、EDI/电商平台、3PL、企业微信/钉钉通知。

---

## 6. 建议的下一步落地顺序（可直接执行）

1. 先打通 P0 的“单据创建 + 动作 + 库存真数据 + 主数据 CRUD + 行级凭证上传”。
2. 再处理 P1 的“报价正式化 + 盘点真实落库 + 权限管理面”。
3. 最后扩展 P2 的财务与高级仓储能力。

---

## 7. 业务流程版（缩写串联，一眼看懂）

> 缩写速记：`SKU` 商品编码，`PO` 采购订单，`GRN` 入库单，`SO` 销售订单，`OUT` 出库单，`ADJ` 调整单，`PAY` 付款单，`REC` 收款单。

### 7.1 采购入库流程（Procure to Stock）

`需求/补货建议 -> PO -> 供应商到货 -> GRN -> 库存增加 -> 对账/付款(PAY)`

- `PO`（Purchase Order）：计划买什么、买多少、多少钱。
- `GRN`（Goods Receipt Note）：实际收到了什么、是否有差异、是否补了凭证。
- 关键点：`GRN post` 后才写库存流水并增加库存。
- 当前系统状态：
  - `PO/GRN` 列表与详情：已可查。
  - `PO/GRN` 新建：页面有，但提交流程未闭环。
  - `PAY`：数据类型预留，业务链路未实现。

### 7.2 销售出库流程（Order to Cash 的前半段）

`客户询价 -> 报价(Quotation) -> SO -> OUT -> 库存减少 -> 开票/收款(REC)`

- `SO`（Sales Order）：客户下单，确认销售条目与数量。
- `OUT`（Outbound）：仓库实际发货与交接签收。
- 关键点：`OUT post` 时做库存扣减并校验下穿风险。
- 当前系统状态：
  - `SO/OUT` 列表与详情：已可查。
  - `SO/OUT` 新建：页面有，但提交流程未闭环。
  - `Quotation`：页面有，后端未形成独立链路（目前借 SO 数据）。
  - `REC`：数据类型预留，业务链路未实现。

### 7.3 盘点调整流程（Count to Adjust）

`盘点任务 -> 实盘录入 -> 差异复核 -> ADJ过账 -> 库存修正`

- `ADJ`（Adjustment）：把盘点差异变成正式库存调整。
- 关键点：差异行建议强制行级凭证（货位照/标签照）。
- 当前系统状态：
  - 盘点页面与 `docType=ADJ` 查询可用。
  - 盘点新增与真实持久化链路未闭环（现阶段以 documents 内存路径为主）。

### 7.4 凭证流程（Evidence Across Documents）

`单据/行 -> 上传意图(upload-intent) -> 文件上传 -> 绑定链接(link) -> 审计追溯`

- 单据级凭证：整单附件（清单、签收、面单）。
- 行级凭证：定位到具体 SKU 行（破损照、序列号、货位照）。
- 当前系统状态：
  - 后端/BFF 接口已具备（查询、上传意图、绑定）。
  - 前端目前以查询展示为主，上传与绑定未完全接入业务按钮。
