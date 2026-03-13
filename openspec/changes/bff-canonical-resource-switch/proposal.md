# Proposal: bff-canonical-resource-switch

## Why

server 和 shared 已经开始收敛到 canonical ERP 口径，但 web 侧仍主要通过 legacy BFF 路径取数，例如 `/api/bff/procure/purchase-orders`、`/api/bff/sales/orders`、`/api/bff/mdm/skus`。如果不先把 BFF 暴露层切到 canonical 顶层资源，前端将继续围绕旧命名堆逻辑。

## What Changes

- 在 BFF 增加 canonical 顶层资源：`/api/bff/items`、`/api/bff/purchase-orders`、`/api/bff/sales-orders`。
- 让现有 web hooks / 页面 mutation 改用 canonical 顶层资源。
- 保留 legacy 路径作为兼容 alias，不移除现有页面 route。
- 将采购/销售 BFF 内部的 list/detail/status 转换收敛到共享 mapper，避免 canonical route 继续依赖散落的 legacy 映射实现。
- 让采购/销售 canonical list row 在保留 `po/so` 展示字段的同时携带稳定 `id`，为 upstream detail preload 和后续真实编辑链路提供主键。
- 扩展 upstream document detail 读取链路，带出 `counterpartyId` 与行快照字段，让采购/销售编辑态优先使用真实 id 和 item label，而不是继续依赖页面 fallback。
- 在 persisted upstream detail 命中后，再解析对应客户/供应商主数据名称，让 edit form 的 lookup selector 尽量显示真实标签，而不是数字 id 或旧列表 fallback。
- 为 `customers/[id]` 与 `suppliers/[id]` canonical BFF detail route 增加 GET，并让 legacy `mdm/*/[id]` 继续作为 alias，避免订单 detail route 继续直接命中 backend masterdata path。
- 在 persisted order detail 缺少行快照标签时，通过 canonical item detail 解析 `code · name`，继续压缩编辑态对“兼容摘要行”和裸 `itemId` 的依赖。
- 将 `customers/suppliers/items` 的 canonical detail 读取进一步收敛到共享 helper，让 route GET 和订单 enrichment 使用同一套 backend/fixture fallback 规则。
- 将客户/供应商页面的 list、mutation 与 edit preload 切到 canonical 顶层资源，减少 `mdm/*` 路径和列表行 fallback 的继续扩散。
- 将 `mdm/skus` 的编辑弹窗也切到 canonical item detail preload，避免继续把列表摘要字段当作 item detail 全量事实。
- 将 SKU/Item 表单字段向 canonical item contract 扩展到 `barcode / batchManaged / serialManaged / minStockQty / maxStockQty / leadTimeDays`，先完成 BFF 与页面层承接。

## Impact

- 影响模块：`apps/web/src/app/api/bff`、`apps/web/src/lib/hooks`、`apps/web/src/components/views/erp/integrated/*`
- 不改页面 URL route
- 不改 server API 契约
