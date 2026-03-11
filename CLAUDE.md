# CLAUDE.md

本文件面向 Claude Code / Codex 一类代码代理，目标不是介绍项目，而是给出“先治理、再实现、可检查”的执行事实。

## 0. 第一性原理

1. 文档先于代码。
2. 约束必须可检查、可执行、可追责。
3. 路由可访问不代表页面完成。
4. family 只是骨架约束，不是模板系统。
5. 并行开发前必须冻结共享接口，避免边开发边漂移。

## 1. 项目定位

miniERP 是一个 design-first + runnable monorepo：

- 产品意图：`designs/`
- 运行时代码：`apps/web`、`apps/server`、`packages/shared`

若设计与实现冲突：

1. 用 `designs/` 理解目标意图
2. 用 `apps/*` 识别当前运行事实
3. 用本文档与 `AGENTS.md` / `README.md` / `CLAW.md` 判断“是否允许继续实现”

## 2. 非显然命令

```bash
bun install
bun run dev
bun run dev:web
bun run dev:server
bun run daily
bun run project -- all doctor
bun run project -- infra health
bun run project -- server logs
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
bun run --filter server test -- src/path/to/file.spec.ts -t "test name"
bun run --filter server test:e2e
bun run --filter server test:e2e -- test/app.e2e-spec.ts
```

命令注意事项：

- `apps/web` 当前无 `test` script。
- 根 `db:*` 命令代理到 server Prisma 脚本。
- `turbo.json` 让根 `lint` / `test` 依赖上游 `build`，耗时会高于单包命令。
- 本地基础设施以 `docs/Macmini-infra.md` 为准。

## 3. 页面状态机与完成口径

ERP 正式页面只允许处于以下五种状态之一：

| 状态              | 定义                                                           | 允许用途                 | 禁止宣称            |
| ----------------- | -------------------------------------------------------------- | ------------------------ | ------------------- |
| `placeholder`     | 仅占位，可能只有标题、空壳或说明                               | 占坑路由、等待设计/契约  | 已完成、已复刻      |
| `legacy-assembly` | 仍由旧 assembly / fallback 路径支撑                            | 兼容历史路由、过渡期运行 | page-level 重构完成 |
| `page-view`       | 已有独立 page-level view，但尚未完成联调或验证                 | 设计复刻、联调进行中     | verified            |
| `verified`        | 设计一致性、数据联调、测试三项均通过，但尚未完成发布前治理闭环 | 候选完成态               | production          |
| `production`      | 已完成代码审查、文档同步，并进入正式运行口径                   | 正式完成口径             | 无                  |

判定规则：

1. 仅“路由可访问”时，状态最多为 `placeholder` 或 `legacy-assembly`。
2. 仅“已有独立 view”时，状态最多为 `page-view`。
3. 只有同时满足设计一致性、数据联调、测试通过，才允许升级为 `verified`。
4. 只有在 `verified` 基础上再完成代码审查与文档同步，才允许升级为 `production`。

## 4. 完成标准

页面完成不是视觉感觉，而是满足以下五项：

1. 设计一致性
   - 页面骨架符合 T1/T2/T3/T4 family 约束
   - 具体 UI 与映射 pencil 设计稿一致
   - 不残留 legacy assembly 痕迹
2. 数据联调
   - 页面通过 VM Hook + BFF 获取数据
   - 使用冻结后的共享接口
   - 占位字段、降级策略、异常态已明示
3. 测试通过
   - 至少完成与改动范围匹配的验证
   - server 侧契约/状态/过账改动必须有测试
   - web 至少完成构建、lint、关键交互回归或手动验证记录
4. 代码审查
   - PR 已完成必要的 reviewer 检查
   - 门禁检查点中的风险项已有结论
5. 文档同步
   - 四文档与 `.claude/rules/erp-rules.md` 已同步
   - 页面状态、完成口径、接口冻结记录已回写

若前 3 项任一缺失，页面不得标记为 `verified`。
若第 4 或第 5 项缺失，页面不得标记为 `production`。

## 4.1 当前进展（2026-03-11）

当前页面状态快照：

- `production`：1 页（`/workspace`）
- `verified`：3 页（`/mdm/items`、`/reports`、`/reports/[slug]`）
- `page-view`：7 页（`/mdm/skus`、`/mdm/customers`、`/mdm/suppliers`、`/inventory/balance`、`/inventory/ledger`、`/sales/orders`、`/procure/purchase-orders`）

这 7 个 `page-view` 页面的当前结论一致：

- 设计一致性：已满足
- 数据联调：已满足（VM Hook + BFF mock）
- 测试通过：待补
- 代码审查：待完成
- 文档同步：已完成

最近完成的 PR：

- `#30` `fix(web): 修复二级菜单样式 - 紧挨着一级菜单显示`
- `#31` `feat(web): 列表页 URL 状态管理 + 核心类型定义`
- `#32` `feat(web): 数据联调 - VM Hook + BFF + 页面集成（7 个模块）`

## 5. 架构决策记录（ADR）

### ADR-001 文档先于代码

- 决策：共享事实、状态口径、页面治理先写入文档，再允许落代码。
- 原因：治理晚于实现会放大返工和并行漂移。
- 结果：涉及 family、完成定义、共享接口、legacy 边界的变更，必须先更新四文档与规则文档。

### ADR-002 family 只治理骨架

- 决策：T1/T2/T3/T4 是页面骨架约束，不是模板系统。
- 原因：把 family 做成模板会吞掉页面差异与业务编排。
- 结果：正式页面必须复刻映射设计稿；允许复用 shells / primitives，但不能把 family 退化成配置驱动模板。

### ADR-003 共享装配器不承载业务编排

- 决策：禁止新增万能页面 assembly。
- 原因：共享装配器会模糊“骨架复用”和“业务编排”边界。
- 结果：业务编排留在 page-level view 与对应 VM Hook；复用只落在 primitives / shells / 局部业务块。

### ADR-004 完成口径采用显式状态机

- 决策：页面完成以 `placeholder -> legacy-assembly -> page-view -> verified -> production` 管理。
- 原因：过去“可访问即完成”的口径掩盖了设计、联调、测试缺失。
- 结果：所有页面盘点、计划、PR 描述都必须显式标注状态。

### ADR-005 并行开发先冻结共享接口

- 决策：并行开发前先冻结共享接口，再拆 route 任务。
- 原因：共享接口在实现中漂移会导致页面 agent 互相阻塞或返工。
- 冻结范围：
  - `packages/shared` 类型、常量、状态枚举
  - BFF request / response DTO
  - family shell / primitive 的公开 props
  - 页面状态定义与完成口径

## 6. 技术债台账

| 债项                              | 当前表现                                                | 风险                     | 退出条件                                           |
| --------------------------------- | ------------------------------------------------------- | ------------------------ | -------------------------------------------------- |
| legacy assembly 仍在运行路径      | 部分页面仍依赖 `WorkbenchAssembly` / `OverviewAssembly` | 设计偏移、难以验证完成度 | 页面迁移到独立 page-level view，并移出默认主路径   |
| 页面状态缺少统一标记              | 历史盘点容易把可访问页面算作完成                        | 进度失真、排期失真       | 路由盘点统一采用五状态定义                         |
| 接口冻结机制未制度化              | 并行开发时 shared/BFF 容易边改边用                      | 多 agent 冲突、页面返工  | 每轮并行任务先产出冻结清单                         |
| web 验证链路偏弱                  | `apps/web` 无独立 test script                           | “看起来能用”替代验证     | 补足页面级验证脚本或稳定的手动门禁记录             |
| fixture fallback 容易掩盖上游故障 | development/test 可回退 fixtures                        | 误判联调完成             | 在页面状态判断中显式区分“真实联调”与“fixture 降级” |

## 7. 项目级架构事实

### 前端

- route 主入口：`apps/web/src/app/(dashboard)/...`
- page-level view：`apps/web/src/components/views/erp/`
- family shells：`apps/web/src/components/shells/erp/`
- primitives：`apps/web/src/components/primitives/erp/`
- business / legacy：`apps/web/src/components/business/`

执行边界：

- 正式页面优先 page-level view。
- `apps/web/src/components/business/erp-page-assemblies.tsx` 与旧 `layouts/` 仅作 legacy/fallback。
- 页面与壳组件禁止直连 API，只能通过 VM Hook + BFF。

### Web 数据链路

- 客户端通过 `lib/bff/client.ts` + `lib/sdk/client.ts` 访问 `/api/bff/*`
- BFF 转发 backend 并注入租户/签名头
- 仅 `development/test` 且上游不可用时允许部分 GET 回退 fixtures

### Server

- `main.ts`：auth context、tenant context、中间件、ValidationPipe
- `app.module.ts`：全局响应包裹拦截器、全局异常过滤器
- 领域能力在 `apps/server/src/modules/*`

### Shared

- `packages/shared` 是跨层契约唯一共享边界
- 新增跨层数据结构优先沉淀到 shared，而不是页面私有重复定义

## 8. 业务硬约束

来自 `.claude/rules/erp-rules.md`：

- 单据号：`DOC-{type}-{YYYYMMDD}-{seq}`
- 金额：必须使用 `decimal.js`
- 状态：显式流转 + 可审计

## 9. 工程红线

1. 新页面只能落在 `T1/T2/T3/T4`，禁止第 5 种 family。
2. T1/T2/T3/T4 定义固定为：
   - T1 = Hub / Dashboard family
   - T2 = List / Index family
   - T3 = Detail / Record family
   - T4 = Flow / Wizard family
3. family 只约束骨架，不约束具体 UI；正式页面必须复刻映射 pencil 设计稿。
4. 列表页筛选/排序/分页必须 URL 化。
5. 页面与壳组件禁止直连 API；页面只通过 VM Hook + BFF。
6. 前端禁止自定义状态枚举；状态只来自 `packages/shared`。
7. 库存只认 `inventory_ledger` 为事实源，余额表仅做查询加速。
8. 所有过账接口强制 `Idempotency-Key`。
9. 禁止物理删除已过账单据；只能作废/冲销。
10. 所有写操作必须带 `tenant_id` 与审计字段。
11. BFF 是前端唯一数据入口，禁止页面绕过 BFF。
12. PR 必须通过设计一致性审查、状态契约检查、过账一致性测试、代码审查与文档同步检查。
13. 禁止新的万能页面装配器；允许抽象仅限 primitives / shells / 局部业务块。
14. `WorkbenchAssembly` / `OverviewAssembly` 仅允许用于 `legacy-assembly` 页面、临时页、未重构页。
15. 并行开发前必须冻结共享接口；冻结后若需改动，必须先改文档再改代码。

## 10. PR 门禁检查点

提交前至少确认：

1. 页面状态是否显式标注，且未夸大完成度。
2. 设计稿映射、family 归类、legacy 边界是否写清楚。
3. 是否存在绕过 BFF、绕过 shared、绕过状态契约的实现。
4. 若是并行任务，是否已有共享接口冻结记录。
5. 四文档与 `.claude/rules/erp-rules.md` 是否同步。
6. 验证记录是否覆盖设计、联调、测试、代码审查、文档同步五类完成标准。

## 11. OpenSpec

常用命令：

- `/opsx:new`
- `/opsx:ff`
- `/opsx:apply`
- `/opsx:verify`
- `/opsx:archive`

推荐流程：规划 -> 冻结接口 -> 实现 -> 验证 -> 归档

## 12. 四文档一致性

以下文件共享同一组核心事实：

- `CLAUDE.md`
- `AGENTS.md`
- `README.md`
- `CLAW.md`

若变更下列内容，必须同批同步：

- 页面状态定义
- 完成标准
- family 定义
- legacy 边界
- 并行开发接口冻结机制
- 工程红线与门禁口径
