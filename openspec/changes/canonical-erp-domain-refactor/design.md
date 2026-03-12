## Context

miniERP 当前存在一组已经写进设计蓝图、但尚未沉淀为代码契约的正式业务对象：`item`、`goods_receipt`、`shipment`、`invoice`、`receipt`、`payment`、`journal_entry`。与此同时，运行时代码仍混用 `sku`、`grn`、`outbound`、两套 document status source、BFF fixture 补字段和前端页面私有表单结构，导致系统无法继续以“加字段”的方式扩展为完整 ERP。

本次变更先落第一批基础设施，而不是一次性重写全链路。目标是为后续 Prisma、Server、BFF、Web 分阶段迁移建立单一 contract source，并恢复可用的构建验证基线。

## Goals / Non-Goals

**Goals:**
- 在仓库内建立正式的 canonical ERP contract freeze 文档。
- 在 `packages/shared` 建立 `types/erp/*` 目录，作为后续域模型的唯一新增入口。
- 统一旧 document / documents 的状态与类型来源，避免新增第三套状态定义。
- 修复当前 `apps/web` 的 build 阻塞，并把采购/销售表单状态入参改为 canonical code。
- 为后续 OpenSpec / Prisma / Server / BFF 重构提供可继续实施的变更工件。

**Non-Goals:**
- 本次不一次性重写 Prisma schema 为完整 ERP 目标模型。
- 本次不移除旧 `sku/grn/outbound` 路径，只建立兼容边界。
- 本次不完成财务、库存事务层或多组织全链路实现。
- 本次不把所有页面表单立即切换到 lookup selector。

## Decisions

### 1. 新建 canonical 目录，而不是在旧文件上继续堆字段

选择 `packages/shared/src/types/erp/{common,master-data,trading,inventory,finance,compat}.ts` 作为新的 contract 主入口。旧文件继续存在，但只做兼容导出。

原因：
- 旧文件职责已经混乱，继续在上面补字段只会扩大漂移。
- 新入口可以逐步迁移调用方，不需要一次性替换整个仓库。

备选方案：
- 直接重写旧文件：风险高，现有调用面过大。
- 只写文档不建类型：无法形成真正可编译的共享边界。

### 2. canonical 命名使用正式业务域名，旧命名保留兼容别名

正式域名使用 `item/goods_receipt/shipment/invoice/receipt/payment/journal_entry`。旧 `sku/grn/outbound` 只作为 compat alias。

原因：
- 蓝图、迁移清单与后续财务链路都以正式域名组织。
- 若继续把旧命名当主口径，后续 schema 与 API 会重复迁移。

备选方案：
- 双主口径长期并存：会永久放大维护成本。

### 3. 文档状态源只保留一个共享入口

`document.ts` 与 `documents.ts` 不再各自维护独立状态常量，而是由 canonical trading types 提供统一来源，再由旧文件转发。

原因：
- 当前两个文件的状态语义已经不一致，是 shared 漂移的核心来源之一。
- 后续 BFF / Server / Web 必须共享同一个 status graph。

### 4. 先恢复 web build，再继续全域迁移

新增一个最小 `DataTable` 组件并修复 UI 导出，使 `apps/web` build 重新通过。

原因：
- 当前主分支构建失败会掩盖后续 canonical 重构带来的真实回归。
- 这属于基础门禁修复，优先级高于继续扩写类型。

## Risks / Trade-offs

- [兼容期延长] → 旧命名与新命名会短期并存；通过 `compat.ts` 和 freeze 文档明确“新增只进 canonical”来收敛。
- [类型过早膨胀] → canonical 类型会先于后端落库；通过文档明确“本轮只冻结 contract，不承诺全部已实现”控制预期。
- [BFF 与表单仍有历史 shape] → 本次只先收敛状态 code 和导出边界，复杂 lookup 与 schema 落库留到后续任务。
- [文档与代码再度漂移] → 同批更新四文档、规则文档、OpenSpec 与 memory，保证治理事实同步。

## Migration Plan

1. 新增 OpenSpec proposal/design/spec/tasks，锁定 canonical 重构方向。
2. 新增 canonical contract freeze 文档并同步四文档与规则文档。
3. 在 `packages/shared` 新建 `types/erp/*` 并把旧导出转成 compat 层。
4. 修复 `apps/web` 的 `DataTable` 构建错误。
5. 将采购/销售表单和对应 BFF draft store 改成 canonical status code。
6. 运行 `bun run --filter web build` 与 `bun run --filter server test` 验证。

## Open Questions

- `company/org` 的正式 shared DTO 是否在下一轮与 Prisma 迁移一起落地，还是先只冻结字段名。
- `documents` 聚合读模型何时拆成 `trading` 正式模块。
- BFF fixture fallback 的完全收敛，是分路由推进还是作为独立变更推进。

## Phase 2 Decisions

### 5. Prisma canonical phase 1 采用 additive rollout

本轮 Prisma 不直接重命名 `sku/grn/outbound` 模型，也不强制改写现有 Prisma client 调用路径，而是：

- 新增 canonical `item / goods_receipt / shipment` 表
- 保留 legacy `sku / grn / outbound` 表
- 在 legacy 表上补 `company_id / org_id / status / ext` 与 canonical 扩展字段

原因：

- 远程数据库当前正在被现有服务使用，直接 rename 会让 `this.prisma.sku`、`this.prisma.grn`、`this.prisma.outbound` 全面失效。
- additive rollout 可以先冻结持久层目标，再逐步切 server/BFF/web 主写路径。

### 6. Inventory decimal 目标继续保留，但本轮不强切现有 ledger/balance 数值类型

canonical contract 仍以 decimal 为目标口径，但本轮仅新增 `inventory_txn / inventory_txn_line` 的 decimal 事务层，不立刻把现有 `inventory_ledger.quantity_delta` 与 `inventory_balance.on_hand` 从 `Int` 改成 `Decimal`。

原因：

- inventory server 代码和 BFF 目前仍大量以 `number` 为运行事实。
- 先把事务层和扩展字段加进去，可以避免一次 schema 改动把库存链路全部打断。

### 7. Server trading baseline 先统一 catalog，再拆主写路径

本轮 server trading 不直接移除 `DocumentsService`，而是先新增独立 trading catalog：

- canonical/legacy document type mapping
- canonical status source
- boundary 可复用的 status membership 判断

原因：

- 现有 purchase / sales / inbound / outbound boundary 各自定义联合类型，虽然内容接近，但没有被 shared canonical source 约束。
- 先统一 catalog，后续再拆 `DocumentsService` 时边界不会继续分叉。
