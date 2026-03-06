# QA Consistency Gates Checklist

更新时间：2026-03-06

## 目标

为以下三类能力建立最小可执行 QA 门禁，先收口 checklist + test plan，再逐步补自动化：

- inventory posting
- inventory query
- document wizard

本次首个交付先不强行补新测试代码，先把必须守住的门禁、现有覆盖、缺口和 CI 接入路径固化下来。

## 当前基线

已有覆盖：

- server 已有 `inventory-posting.service.spec.ts`，覆盖幂等、并发、负库存、冲销基础行为。
- server 已有 `inventory.controller.spec.ts`，覆盖库存查询过滤、分页和参数校验。
- server 已有 `documents.service.spec.ts` / `documents.controller.spec.ts`，覆盖单据动作、库存联动、缺失 `Idempotency-Key`、出库库存不足语义错误。
- web 已有 BFF route spec：
  - `apps/web/src/app/api/bff/inventory/balances/route.spec.ts`
  - `apps/web/src/app/api/bff/inventory/ledger/route.spec.ts`
  - `apps/web/src/app/api/bff/documents/[docType]/[id]/[action]/route.spec.ts`

当前缺口：

- `apps/web` 没有 `test` script，现有 web `*.spec.ts` 未进入根 `bun run test`。
- document wizard 关键按钮目前缺少自动化点击 smoke。
- 真实数据库语义下的并发/负库存回归还没有独立 e2e gate。
- 2026-03-06 本地试跑发现 `documents.service.spec.ts` 现有 2 条失败用例，原因是 Prisma mock 缺少 `salesOrderLine.groupBy` / `outboundLine.findMany`。

## P0 合并门禁

以下项建议定义为 PR 必过，缺一项不合并。

| 领域 | 风险 | 最小校验 | 自动化层级 | 当前状态 |
|---|---|---|---|---|
| inventory posting | 幂等重复提交 | 同一 `Idempotency-Key` + 同 payload 返回首次结果 | server unit | 已有 |
| inventory posting | 幂等冲突 | 同一 `Idempotency-Key` + 不同 payload 返回 conflict | server unit | 已有 |
| inventory posting | 并发丢写 | 同租户并发过账后余额累加正确 | server unit | 已有 |
| inventory posting | 负库存 | 出库导致负库存时拒绝且不产生部分台账/部分余额 | server unit | 已有 |
| inventory query | 查询契约 | balances 过滤条件成对出现；ledger 分页/过滤/排序稳定 | server unit/controller | 已有 |
| inventory query | BFF 转发 | query params 原样透传；4xx/5xx/503 语义稳定 | web BFF route spec | 已有代码，未接 CI |
| document action | 写接口幂等头 | BFF 缺失 `Idempotency-Key` 返回 400，存在时透传后端 | web BFF route spec | 已有代码，未接 CI |
| document action | 库存联动 | GRN/OUT/ADJ post 动作调用 inventory posting，库存不足时返回冲突语义 | server unit/service | 已有 |
| document wizard | 关键按钮可点击 | 向导主 CTA 与详情页 `confirm/post/cancel` 可点击，点击后出现 loading/notice 或跳转 | web smoke | 缺失 |

## 最小测试清单

### 1. Inventory Posting

必须覆盖：

1. 同一 `Idempotency-Key` 重试返回同一结果，不重复写 ledger。
2. 同一 `Idempotency-Key` 但 payload hash 不同，返回 `InventoryIdempotencyConflictError`。
3. 同 SKU/仓并发过账后余额正确，无 lost update。
4. 任一行触发负库存时整单失败，已有余额和 ledger 不被污染。
5. reversal 仅允许一次，重复冲销报错。

建议命令：

```bash
bun run --filter server test -- src/modules/inventory/application/inventory-posting.service.spec.ts
```

### 2. Inventory Query

必须覆盖：

1. `GET /inventory/balances` 在 `skuId` 存在时强制要求 `warehouseId`。
2. `GET /inventory/balances` 无过滤时返回租户下全部余额快照。
3. `GET /inventory/ledger` 分页参数非法时报 400。
4. `GET /inventory/ledger` 按 `docType` 过滤正确。
5. BFF `balances` / `ledger` route 正确透传 query params，并保持 upstream 错误语义。

建议命令：

```bash
bun run --filter server test -- src/modules/inventory/controllers/inventory.controller.spec.ts
```

说明：

- web BFF route spec 已存在，但当前没有 `apps/web test` 入口，暂时不能靠根 CI 自动执行。

### 3. Document Wizard / Document Action

必须覆盖：

1. document action BFF route 缺失 `Idempotency-Key` 时返回 400。
2. 合法 `docType/id/action` + `Idempotency-Key` 时正确透传后端。
3. GRN `validate -> post` 会触发 inventory posting。
4. OUT `pick -> post` 会触发 inventory posting，库存不足时返回语义化冲突。
5. ADJ `validate -> post` 会以 `ADJUSTMENT` reference 过账。
6. wizard 主 CTA 至少满足“存在、可点击、点击后有可观察反馈”。
7. 详情页 `confirm/post/cancel` 至少满足“存在、可点击、点击后按钮进入 loading，结束后出现 notice”。

建议命令：

```bash
bun run --filter server test -- src/modules/documents/services/documents.service.spec.ts
bun run --filter server test -- src/modules/documents/controllers/documents.controller.spec.ts
```

## 关键按钮可点击检查

在 web 自动化未接入前，先保留一份人工 smoke checklist，作为 P0 临时替代门禁。

检查页面：

- `/inventory`
- `/inventory/ledger`
- `/purchasing/po/new`
- `/purchasing/grn/new`
- `/sales/so/new`
- `/sales/out/new`
- 任一已存在单据详情页（用于 `confirm/post/cancel`）

人工检查项：

1. 页面可打开，无白屏/崩溃。
2. 主按钮可见且非永久 disabled。
3. 点击主按钮后出现可观察反馈：loading、notice、路由跳转三者之一。
4. 详情页 `confirm/post/cancel` 点击后不会无响应。
5. 库存查询页筛选和分页改变后 URL 可回放。

## CI 接入建议

### Phase 0：先把已有 server 门禁单独拉出来

目标：

- 不等 web runner，先让 inventory/document 的核心一致性在 CI 中显式可见。

建议：

1. 在 `.github/workflows/ci.yml` 里增加 `qa-gates-server` step 或独立 job。
2. 只跑以下最小集合：

```bash
bun run --filter server test -- src/modules/inventory/application/inventory-posting.service.spec.ts
bun run --filter server test -- src/modules/inventory/controllers/inventory.controller.spec.ts
bun run --filter server test -- src/modules/documents/services/documents.service.spec.ts
bun run --filter server test -- src/modules/documents/controllers/documents.controller.spec.ts
```

收益：

- 幂等、并发、负库存、单据动作联动先进入强门禁。
- 即使 `bun run test` 覆盖面变化，这四个用例仍是显式 gate。

落地前提：

- 先修复 `documents.service.spec.ts` 当前 2 条红灯，再把该文件升级为硬门禁。
- 若要今天先落地 CI，可先只纳入 3 个已通过集合：

```bash
bun run --filter server test -- src/modules/inventory/application/inventory-posting.service.spec.ts
bun run --filter server test -- src/modules/inventory/controllers/inventory.controller.spec.ts
bun run --filter server test -- src/modules/documents/controllers/documents.controller.spec.ts
```

### Phase 1：给 web 增加正式 test 入口

建议优先级：

1. 给 `apps/web` 增加 `test` script。
2. 选型优先 `Vitest + jsdom` 或 `Jest`，不要继续让 `route.spec.ts` 游离在 CI 之外。
3. 先纳入以下 web 测试：
   - inventory balances route spec
   - inventory ledger route spec
   - document action route spec
   - wizard/button smoke spec

建议最小 smoke：

- 渲染 `WizardAssembly`，点击“创建单据并进入详情”，断言进入 submitting 状态。
- 渲染详情装配，点击 `confirm/post/cancel`，断言按钮进入 loading，且调用 BFF client。

### Phase 2：补数据库级 nightly / pre-release gate

目标：

- 校验 Prisma store + DB 唯一键/事务在真实环境下的并发一致性。

建议场景：

1. 同一库存键并发两次 GRN，最终余额正确。
2. OUT 在临界库存下并发提交，仅允许合法请求成功。
3. 同一 `Idempotency-Key` 并发重放，只落一条业务结果。

建议执行：

- 用 `apps/server test:e2e` 或新增 integration suite 跑在共享 PostgreSQL / CI 临时库上。
- 该层建议先 nightly，再评估是否升级为 release gate。

## 本次首个 commit 的交付边界

本次先提交：

- `docs/qa/gates-checklist.md`
- 最小测试清单
- CI 分阶段接入建议

本次暂不提交：

- 新测试代码
- CI workflow 改动
- web test runner 初始化

这样做的原因：

- 先把 gate 定义清楚，避免直接补测试但门禁口径仍然漂移。
- 当前 web 测试尚未有统一执行入口，先文档化再接 runner，风险更低。
