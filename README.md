# miniERP

Mini ERP System（采购、销售、库存、财务）

## 项目定位

miniERP 是一个 **设计优先 + 可运行 monorepo**：

- 产品与交互意图：`designs/`
- 运行时代码：`apps/web`、`apps/server`、`packages/shared`

当设计与实现不一致时：

1. `designs/` 用于理解目标形态
2. `apps/*` 代表当前可运行实现
3. 四文档用于判断当前实现是否“被允许”

## 第一性原则

1. 文档的目的是指导开发，防止偏离。
2. 约束必须可检查、可执行。
3. 完成状态必须显式定义，不能靠口头口径。
4. 文档必须先于代码。
5. 并行开发前必须冻结共享接口。

## 项目健康度（2026-03-11）

| 维度     | 当前判断 | 说明                                                            |
| -------- | -------- | --------------------------------------------------------------- |
| 文档先行 | 需加强   | 历史上存在治理晚于实现的问题，本轮已收敛到四文档统一治理        |
| 页面治理 | 进行中   | family 已回归骨架约束，新增 7 个 `page-view` 页面待补测试与审查 |
| 完成口径 | 需收敛   | 历史上把“路由可访问”误算为完成，本轮改为五状态定义              |
| 并行协作 | 需制度化 | 共享接口冻结机制已写入文档，执行仍需持续监督                    |
| 前端验证 | 偏弱     | `apps/web` 仍无独立 `test` script，需要更稳定的验证闭环         |

## 2026-03-11 开发进度

当前页面状态台账：

- `production`：1 页（`/workspace`）
- `verified`：3 页（`/mdm/items`、`/reports`、`/reports/[slug]`）
- `page-view`：7 页（`/mdm/skus`、`/mdm/customers`、`/mdm/suppliers`、`/inventory/balance`、`/inventory/ledger`、`/sales/orders`、`/procure/purchase-orders`）

本轮已完成功能：

- 7 个页面已切到独立 page-level view，并完成设计对齐
- 7 个页面已通过 VM Hook + BFF mock 完成数据联调
- 列表页 URL 状态管理与核心类型定义已补齐
- 二级菜单样式已修复，导航层级表现与当前路由结构一致

最近完成的 PR：

- `#30` `fix(web): 修复二级菜单样式 - 紧挨着一级菜单显示`
- `#31` `feat(web): 列表页 URL 状态管理 + 核心类型定义`
- `#32` `feat(web): 数据联调 - VM Hook + BFF + 页面集成（7 个模块）`

当前状态说明：

- 上述 7 个页面目前仍是 `page-view`，原因是测试与代码审查尚未完成
- 只有补齐测试并完成代码审查后，才允许升级到 `verified` / `production`

## 页面状态定义

ERP 页面统一用以下五种状态表达进度：

| 状态              | 代表什么                          | 是否算完成 |
| ----------------- | --------------------------------- | ---------- |
| `placeholder`     | 只有占位路由或空壳页面            | 否         |
| `legacy-assembly` | 仍通过旧 assembly / fallback 运行 | 否         |
| `page-view`       | 已切到独立 page-level view        | 否         |
| `verified`        | 设计一致性 + 数据联调 + 测试通过  | 否         |
| `production`      | 代码审查通过且文档同步完成        | 是         |

这意味着：

- 路由可访问，不等于页面完成。
- page-level view 已存在，也不等于页面完成。
- 只有 `production` 才能进入“已完成”统计。

## 完成标准

页面要算完成，必须同时满足：

1. 设计一致性：family 归类正确，具体 UI 与映射设计稿一致，无 legacy 痕迹。
2. 数据联调：页面通过 VM Hook + BFF 使用冻结后的共享接口，降级策略明确。
3. 测试通过：完成与改动范围匹配的 lint / build / test / 手动验证。
4. 代码审查：完成必要 reviewer 审查与门禁确认。
5. 文档同步：四文档与规则文档同步更新。

## 历史债可视化

| 历史问题               | 根因                         | 当前治理动作             | 后续退出信号                           |
| ---------------------- | ---------------------------- | ------------------------ | -------------------------------------- |
| 治理晚于实现           | 先写代码，后补规则           | 四文档统一加入先治理流程 | 新共享规则变更先落文档再落代码         |
| family 被当模板系统    | 骨架与页面业务编排混在一起   | 明确 family 只管骨架     | 新页面不再依赖配置式万能模板           |
| 共享装配器吞掉业务编排 | 复用边界不清                 | 禁止新增万能 assembly    | page-level view + VM Hook 成为默认路径 |
| 完成口径被误导         | 把“能打开页面”当成“页面完成” | 引入五状态定义与完成标准 | 页面盘点只统计 `production`            |
| 并行开发共享接口漂移   | 没有先冻结共享契约           | 新增接口冻结机制         | 并行任务开始前产出冻结清单             |

## 优先阅读

1. `CLAUDE.md`
2. `AGENTS.md`
3. `CLAW.md`
4. `docs/plans/2026-03-07-erp-page-reconstruction-design.md`
5. `docs/plans/2026-03-07-erp-page-reconstruction-implementation-plan.md`
6. `designs/ui/minierp_page_spec.md`
7. `designs/ui/miniERP_evidence_system.md`
8. `designs/ui/miniERP_design_summary.md`
9. `.claude/rules/erp-rules.md`
10. `openspec/config.yaml`

## Monorepo 边界

```text
apps/web         Next.js 15 + React 19 前端（App Router）
apps/server      NestJS 11 后端
packages/shared  前后端共享 contracts/constants/utils
designs          UI/PRD/spec 设计源
openspec         spec-driven 变更工件
```

## 常用命令（仓库根目录）

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

### 定向命令

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
bun run --filter server test:watch
bun run --filter server test:cov
bun run --filter server test:e2e
bun run --filter server test:e2e -- test/app.e2e-spec.ts
```

说明：

- `apps/web` 当前无 `test` script。
- 根 `db:generate` / `db:migrate` / `db:seed` 会代理到 server Prisma 脚本。
- `turbo.json` 中 `lint` 与 `test` 依赖上游 `build`。
- 本地开发共享中间件与访问地址见 `docs/Macmini-infra.md`。

## 架构总览

### 前端：设计稿驱动 + family 治理 + 页面级 view

- 页面级 view：`apps/web/src/components/views/erp/`
- family shells：`apps/web/src/components/shells/erp/`
- primitives：`apps/web/src/components/primitives/erp/`
- route 入口：`apps/web/src/app/(dashboard)/.../page.tsx`

说明：

- 保留 T1/T2/T3/T4 名字，但 family 只治理骨架。
- 正式页面必须复刻已映射的 pencil 设计稿。
- `apps/web/src/components/business/erp-page-assemblies.tsx` 与旧 `layouts/` 属于 legacy/fallback。
- 可以抽共用 primitives / shells / 局部业务块，但禁止新的万能 assembly。

### 凭证：跨域统一能力

- 单据级凭证
- 行级凭证（line drawer）

### Web 数据流

hooks/components -> SDK/BFF client -> Next.js `/api/bff/*` -> backend

部分 GET 在上游不可用时，仅 `development/test` 允许回退 fixtures；非开发环境应暴露真实上游不可用。

### Shared 契约边界

`packages/shared` 作为跨层类型、常量、工具的统一出口，避免 web/server 契约漂移。

## 并行开发接口冻结机制

多人并行前，必须先冻结：

1. `packages/shared` 的共享类型、状态枚举、常量
2. BFF request / response DTO
3. shells / primitives 的公开 props
4. 页面状态定义、完成标准、门禁口径

未冻结前，不应并行推进多个依赖同一共享接口的页面任务。

## 工程红线（必须遵守）

1. 新页面只能落在 **T1/T2/T3/T4**，禁止第 5 种 family。
2. T1/T2/T3/T4 的当前定义为：
   - T1 = Hub / Dashboard family
   - T2 = List / Index family
   - T3 = Detail / Record family
   - T4 = Flow / Wizard family
3. family 只约束骨架，不约束具体 UI；正式页面必须复刻已映射的 pencil 设计稿。
4. 列表页筛选/排序/分页必须 URL 化。
5. 页面/壳组件禁止直连 API；页面只通过 VM Hook + BFF。
6. 前端禁止自定义状态枚举；状态只来自 `packages/shared`。
7. 库存只认 `inventory_ledger` 为事实源，余额表仅做查询加速。
8. 所有过账接口强制 `Idempotency-Key`。
9. 禁止物理删除已过账单据；只能作废/冲销。
10. 所有写操作必须带 `tenant_id` 与审计字段。
11. BFF 是前端唯一数据入口，禁止页面绕过 BFF。
12. PR 必须通过设计一致性审查、状态契约检查、过账一致性测试、代码审查与文档同步检查。
13. 允许抽象的层级仅限 primitives / shells / 局部业务块；禁止新的万能页面装配器。
14. `WorkbenchAssembly` / `OverviewAssembly` 仅允许用于 `legacy-assembly` 页面、临时页、未重构页。
15. 并行执行时，涉及共享事实的修改必须同批同步 `CLAUDE.md`、`AGENTS.md`、`README.md`、`CLAW.md`、`.claude/rules/erp-rules.md`。

## OpenSpec 工作流

常用命令：

- `/opsx:new`
- `/opsx:ff`
- `/opsx:apply`
- `/opsx:verify`
- `/opsx:archive`

推荐流程：规划 -> 冻结接口 -> 实现 -> 验证 -> 归档

## 文档一致性

`CLAUDE.md`、`AGENTS.md`、`README.md`、`CLAW.md` 四份文档共享同一组核心事实；ERP 页面治理还必须与 `.claude/rules/erp-rules.md` 保持一致。

若其中一份发生以下变更，应同批同步另外几份：

- 页面状态定义
- 完成标准
- family 定义
- legacy 边界
- 接口冻结机制
- 门禁检查点
