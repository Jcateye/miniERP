## Context

目标是把“数据库先统一、应用层再并行”的策略固化为可执行工程设计，并消除旧变更的任务歧义。

## Goals

1. 建立可执行的 Prisma 数据库基线（schema + migration + seed + script）。
2. 将应用层拆分为 6 条并行流并定义解锁门禁。
3. 明确跨流依赖、可并行项、阻塞项与最终汇总门禁。

## Non-Goals

1. 本 change 不直接完成所有业务代码实现。
2. 本 change 不变更产品页面范围（继续保留全路由）。
3. 本 change 不引入新框架（保持 Next.js + NestJS + Bun）。

## Database Bootstrap Architecture

### 1) Prisma baseline
- 统一模型：租户权限、主数据、单据、库存证据、横切治理。
- 统一约束：tenant 维度唯一、业务 check、软删审计字段。
- 统一索引：tenant-first 热路径索引。

### 2) Runtime boundary
- `PrismaService` 作为唯一 ORM client 入口。
- Repository 层不暴露裸 client 给 controller。
- 事务边界由 application 层控制（库存过账、状态流转）。

### 3) Initialization workflow
- `db:generate` -> `db:migrate` -> `db:seed`。
- seed 提供最小联调样本：tenant/user/masterdata/documents/ledger/evidence。

## Parallel App Streams (6 Streams)

### Stream A: platform
- 范围：tenant + iam + audit 中间件与全局拦截能力。
- 输出：`PLATFORM-READY`。

### Stream B: masterdata
- 范围：SKU / warehouse / supplier / customer CRUD + 查询。
- 输出：`MASTERDATA-READY`。

### Stream C: purchase+inbound
- 范围：PO/GRN 状态机、校验、过账前准备。
- 输出：`PUR-IN-READY`。

### Stream D: sales+outbound
- 范围：SO/OUT 状态机、库存校验、出库命令。
- 输出：`SAL-OUT-READY`。

### Stream E: inventory
- 范围：ledger 原子写、幂等、冲销、防负库存。
- 输出：`INV-READY`。

### Stream F: evidence
- 范围：document/line 双层绑定、upload intents、查询审计。
- 输出：`EVIDENCE-READY`。

## Dependency and Unlock Gates

### Gate G0 (Foundation)
- DB baseline 初始化完成：`DB-BASELINE-READY`。
- Platform 基础能力完成：`PLATFORM-READY`。

### Gate G1 (Parallel Core)
- `MASTERDATA-READY`、`INV-READY`、`EVIDENCE-READY` 可并行。

### Gate G2 (Business Flows)
- `PUR-IN-READY` 依赖：`PLATFORM-READY` + `MASTERDATA-READY` + `INV-READY` + `DB-BASELINE-READY`。
- `SAL-OUT-READY` 依赖：`PLATFORM-READY` + `MASTERDATA-READY` + `INV-READY` + `DB-BASELINE-READY`。

### Gate G3 (Integration)
- FE 全量切真接口依赖：`PUR-IN-READY` + `SAL-OUT-READY` + `EVIDENCE-READY`。

## Risk Controls

1. 避免“伪联通”：BFF fallback 默认关闭，非开发环境禁止 fixture 隐式回退。
2. 避免“并行冲突”：共享契约变更统一进入 `packages/shared`，按兼容性治理。
3. 避免“库存破坏”：库存写路径只允许 append/reversal，不允许更新历史 ledger。

## Verification Strategy

1. 数据层验证：迁移、seed、重启持久化、租户隔离。
2. 后端验证：状态机、幂等冲突、防负库存、证据 scope 约束。
3. 前端验证：列表/详情/向导读写回路真实联通，无静默 fixture。
4. 文档验证：OpenAPI path 与 controller 对齐。
