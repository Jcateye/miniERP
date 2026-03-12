# CLAW.md - Agent 项目配置

> 面向 AI Agent 的项目级配置清单。重点不是“能跑什么命令”，而是“什么条件下才算可以继续实现”。

---

## 项目定位

- 名称：miniERP
- 形态：monorepo（Bun Workspaces + Turborepo）
- 基本原则：设计优先、文档先行、实现受治理约束

运行边界：

- `designs/`：产品与页面意图
- `apps/web`：前端运行时
- `apps/server`：后端运行时
- `packages/shared`：共享契约边界

---

## 第一性原则

1. 文档先于代码。
2. 约束必须可执行、可检查、可追责。
3. 页面完成必须有显式状态，而不是主观判断。
4. family 只定义骨架，不定义模板。
5. 并行开发必须先冻结共享接口。

---

## 命令（根目录）

```bash
bun install

# 开发
bun run dev
bun run dev:web
bun run dev:server
bun run daily
bun run project -- all doctor
bun run project -- infra health
bun run project -- server logs

# 质量
bun run build
bun run lint
bun run test
bun run db:generate
bun run db:migrate
bun run db:seed
```

定向命令：

```bash
# web
bun run --filter web dev
bun run --filter web build
bun run --filter web lint

# server
bun run --filter server dev
bun run --filter server build
bun run --filter server lint
bun run --filter server test
bun run --filter server test -- src/path/to/file.spec.ts
bun run --filter server test:e2e
```

注意：

- `apps/web` 当前无 `test` script。
- 根 `db:*` 依赖 server Prisma 脚本。
- 本地中间件与访问方式以 `docs/Macmini-infra.md` 为准。
- 2026-03-13 起，canonical ERP shared contract 统一从 `packages/shared/src/types/erp/*` 新增。
- 2026-03-13 已完成 Prisma canonical phase 1 additive migration，并已应用到远程 `192.168.1.68:5432/minierp`。
- server 交易状态口径统一由 shared canonical types + trading catalog 提供。

---

## 页面状态定义

| 状态              | 含义                       | 典型表现                 | 完成口径   |
| ----------------- | -------------------------- | ------------------------ | ---------- |
| `placeholder`     | 页面仅占位                 | 空壳、说明、待实现入口   | 未完成     |
| `legacy-assembly` | 仍依赖旧 assembly/fallback | 共享模板主导页面结构     | 未完成     |
| `page-view`       | 已有独立 page-level view   | 路由已切到独立页面实现   | 重构进行中 |
| `verified`        | 已完成工程验证             | 设计、联调、测试均通过   | 候选完成   |
| `production`      | 已完成发布前治理闭环       | 代码审查通过，文档已同步 | 已完成     |

关键规则：

1. 路由可访问不等于页面完成。
2. `legacy-assembly` 不是正式重构完成态。
3. `page-view` 也不是最终完成态。
4. `verified` 不是最终完成态。
5. 只有 `production` 才能用于“已完成”统计。

---

## 完成标准

页面要升级为 `production`，必须完成以下五项：

1. 设计一致性
   - family 归类正确
   - 具体 UI 与映射设计稿一致
   - 无遗留 assembly 痕迹
2. 数据联调
   - 通过 VM Hook + BFF 接入
   - 共享接口使用冻结版本
   - 占位 / fixture / 降级均明确记录
3. 测试通过
   - 运行与改动范围匹配的 lint / build / test / 手动验证
   - 契约、状态、过账改动必须有对应验证
4. 代码审查
   - PR reviewer 已完成必要审查
   - 门禁问题已有处理结论
5. 文档同步
   - 四文档与规则文档已同步
   - 页面状态、冻结记录、风险说明已更新

状态升级约束：

1. 满足前 3 项，可进入 `verified`。
2. 满足 5 项，才可进入 `production`。

### 2026-03-12 状态快照

本轮新增 PR #33，完成了以下页面的精细化复刻：

- `/inventory/balance`（库存余额）：按钮、搜索栏、配色严格对齐高保真设计。
- `/workspace`（工作台）：修复了顶部搜索栏的不对称布局。

以下 7 个页面当前统一判定为 `page-view`：

- `/mdm/skus`
- `/mdm/customers`
- `/mdm/suppliers`
- `/inventory/balance`
- `/inventory/ledger`
- `/sales/orders`
- `/procure/purchase-orders`

判定原因：

- 设计一致性：✅
- 数据联调：✅（VM Hook + BFF mock）
- 测试通过：⏳
- 代码审查：⏳
- 文档同步：✅

因此这批页面不能直接宣称为 `verified` 或 `production`。

---

## 门禁检查点

PR 或合并前必须检查：

1. 页面状态是否标注准确。
2. 完成标准五项是否有证据。
3. 是否误把 family 当模板系统使用。
4. 是否把业务编排塞进共享 assembly。
5. 是否绕过 BFF 或 shared 契约。
6. 是否在并行开发前冻结了共享接口。
7. 是否同步更新四文档与 `.claude/rules/erp-rules.md`。

---

## 并行开发接口冻结机制

多人并行前，必须冻结以下接口：

1. `packages/shared` 的共享类型、状态枚举、常量。
2. BFF 的 request / response DTO。
3. shells / primitives 的公开 props。
4. 页面状态定义、完成标准、门禁口径。

冻结规则：

1. 先产出冻结清单，再拆 route 任务。
2. 冻结后若需改动，先改文档，再通知相关 agent，最后改代码。
3. 未冻结接口时，不要同时推进多个依赖它的页面任务。

### Canonical Contract Freeze（2026-03-13）

新增共享事实统一遵循 [erp-canonical-contract-freeze.md](/Users/haoqi/OnePersonCompany/miniERP/docs/architecture/erp-canonical-contract-freeze.md)：

1. 正式域名使用 `item / goods_receipt / shipment / invoice / receipt / payment / journal_entry`
2. `sku / grn / outbound` 仅保留兼容别名
3. `document.ts` / `documents.ts` 不得继续维护独立状态源
4. 所有新的 shared ERP 类型必须进入 `packages/shared/src/types/erp/*`

---

## 执行策略

1. 设计优先 + 可运行实现
   - 用 `designs/` 理解目标
   - 以 `apps/*` 当前实现为落地依据
2. 前端采用设计稿驱动 + family 治理
   - 页面级 view：`apps/web/src/components/views/erp/`
   - family shells：`apps/web/src/components/shells/erp/`
   - primitives：`apps/web/src/components/primitives/erp/`
   - 语义配置与 legacy：`apps/web/src/components/business/`
3. 凭证模型固定为两层
   - document-level + line-level
4. Web 请求链路
   - SDK -> BFF(`/api/bff/*`) -> Backend
5. 跨层契约统一
   - 新增共享类型优先进入 `packages/shared`

---

## 工程红线

1. 新页面只能落在 `T1/T2/T3/T4`。
2. T1/T2/T3/T4 只定义骨架：
   - T1 = Hub / Dashboard family
   - T2 = List / Index family
   - T3 = Detail / Record family
   - T4 = Flow / Wizard family
3. 正式页面必须复刻映射 pencil 设计稿。
4. 页面只通过 VM Hook + BFF 取数。
5. 禁止新的万能页面装配器。
6. `WorkbenchAssembly` / `OverviewAssembly` 仅允许用于 `legacy-assembly` 页面、临时页、未重构页。
7. 所有过账接口必须带 `Idempotency-Key`。
8. 所有写操作必须带 `tenant_id` 与审计字段。

---

## OpenSpec

常用：`/opsx:new` `/opsx:ff` `/opsx:apply` `/opsx:verify` `/opsx:archive`

推荐：规划 -> 冻结接口 -> 实现 -> 验证 -> 归档

---

## Agent 沟通语言

**所有 agents 必须使用中文与用户沟通。**

调用其他 agent 时附加：

```text
使用中文与我沟通。
```

---

## 四文档一致性维护

四份文档：

- `CLAUDE.md`
- `AGENTS.md`
- `README.md`
- `CLAW.md`

维护规则：

1. 核心事实先改 `CLAUDE.md`
2. 同批同步三份文档
3. 允许文风差异，但状态定义、完成标准、门禁、接口冻结机制必须一致
4. family / legacy / 并行规则变更时，同步更新 `.claude/rules/erp-rules.md`
