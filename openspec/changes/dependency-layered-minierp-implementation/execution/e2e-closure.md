# G4 Acceptance Group（执行者 F）

## 目标
执行端到端收口，验证依赖层推进结果可交付。

## 前置依赖
- `BE-READY`
- `FE-READY`

## 输入
- 各 stream 输出与联调环境
- `tasks.md` 中第 7 组验证项

## 输出
- 主流程回归结果
- 风险清单与阻塞项
- 收口结论：`READY-FOR-APPLY`

## 任务
- 验证 PO->GRN、SO->OUT、Stocktake 调整流程
- 验证证据双层绑定流程
- 验证跨租户越权拦截与审计可追溯

## 完成定义（DoD）
- 核心流程回归通过
- 关键风险有明确结论（接受/修复计划）
- 通过 `bun run test && bun run build`

## 验收基线
- 验收日期：`2026-03-03`
- 基线：`origin/main@323a3c4`（已包含 PR #12 `feat(web): complete stage1 frontend integration gate`）
- 本次收口补丁：
  - 补齐 `apps/web/src/app/(dashboard)/sales/out/page.tsx`
  - 补齐 `apps/web/src/app/(dashboard)/sales/out/new/page.tsx`
  - 补齐 `apps/web/src/app/(dashboard)/sales/out/[id]/page.tsx`
- 结论：`READY-FOR-APPLY = yes`

## 执行命令
```bash
git fetch origin
git merge --ff-only origin/main

bun run --filter server test -- \
  src/modules/core-document/domain/status-transition.spec.ts \
  src/modules/inventory/application/inventory-posting.service.spec.ts \
  src/evidence/application/evidence-binding.service.spec.ts \
  src/common/iam/iam.guard.spec.ts \
  src/platform/application/platform-access.service.spec.ts

bun run --filter server test -- \
  src/audit/application/audit.service.spec.ts \
  src/common/tenant/tenant-context.middleware.spec.ts \
  src/common/iam/auth-context.middleware.spec.ts

bun run test
bun run build
```

## 验收记录

### 4.1 `PO -> GRN -> inventory_ledger`
- 结果：`PASS`
- 证据：
  - `GET /api/bff/documents?docType=PO` 返回 `DOC-PO-20260303-001/002`
  - `GET /api/bff/documents/GRN/3001` 返回 `DOC-GRN-20260303-003`
  - 浏览器访问 `/purchasing/grn/new`，页面展示来源 `DOC-PO-20260303-001`、差异校验和 document/line evidence
  - 浏览器访问 `/inventory/ledger`，可见 `DOC-GRN-20260303-003` 的 posted 流水
  - 后端测试 `status-transition.spec.ts` 与 `inventory-posting.service.spec.ts` 通过

### 4.2 `SO -> OUT -> inventory_ledger`
- 结果：`PASS`
- 验收中发现：
  - `erp-page-config.tsx` 已配置 `/sales/out*`，但 `app` 路由缺失，访问会 404
- 收口动作：
  - 新增 `sales/out` 工作台、详情、向导 3 个页面，直接复用既有 `out*Config`
- 证据：
  - `GET /api/bff/documents/OUT/5001` 返回 `DOC-OUT-20260303-002`
  - 浏览器访问 `/sales/out` 与 `/sales/out/5001` 成功，页面展示 `SO -> OUT`、交接凭证、审计轨迹
  - 浏览器访问 `/inventory/ledger`，可见 `DOC-OUT-20260303-002` 的 posted 流水
  - 后端测试 `inventory-posting.service.spec.ts` 覆盖出库负库存保护与过账原子性

### 4.3 `Stocktake -> diff -> adjustment`
- 结果：`PASS`
- 证据：
  - 浏览器访问 `/stocktake/new`，页面展示差异行 `CAB-HDMI-2M 562 -> 558 (-4)` 与差异规则
  - 浏览器访问 `/inventory/ledger`，可见 `DOC-ADJ-20260303-001` 调整流水
  - 后端测试 `inventory-posting.service.spec.ts` 覆盖 reversal / atomic posting

### 4.4 证据流程：单据级绑定 + 行级绑定 + 差异行校验
- 结果：`PASS`
- 证据：
  - `GET /api/bff/evidence/links?entityType=grn&entityId=3001&scope=line&lineRef=1` 返回 line evidence fixture
  - `/purchasing/grn/new`、`/sales/out/5001`、`/stocktake/new` 页面均展示 document evidence 与 line evidence drawer
  - `evidence-binding.service.spec.ts` 通过，覆盖 document-level、line-level、跨租户拒绝、参数校验、幂等绑定

### 4.5 权限流程：跨租户越权拦截与审计追踪
- 结果：`PASS`
- 证据：
  - `iam.guard.spec.ts` 通过，覆盖缺失 auth context、tenant 不一致、权限缺失、platform action 校验
  - `platform-access.service.spec.ts` 通过，覆盖 whitelist cross-tenant action 与非平台角色拒绝
  - `tenant-context.middleware.spec.ts` / `auth-context.middleware.spec.ts` 通过，覆盖 tenant 上下文与签名鉴权
  - `audit.service.spec.ts` 通过，覆盖 deny 场景最小审计字段落库

### 4.6 `bun run test && bun run build`
- 结果：`PASS`
- 证据：
  - `bun run test`：19 suites / 60 tests 全部通过
  - `bun run build`：server + web 全量构建通过
  - `next build` 产物中已包含 `/sales/out`、`/sales/out/[id]`、`/sales/out/new`

## 风险与结论
- 已关闭阻塞项：`/sales/out*` 路由缺失
- 剩余观察项：Next.js 仍提示 workspace root 依据 `/Users/haoqi/package-lock.json` 推断；当前不影响构建通过，但建议后续单独清理锁文件或设置 `outputFileTracingRoot`
- 最终结论：G4 4.1~4.6 完成，发布 `READY-FOR-APPLY`
