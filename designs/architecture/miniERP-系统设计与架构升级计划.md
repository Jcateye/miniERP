# MiniERP 系统设计与架构升级计划

## Context
当前仓库的产品与设计文档（PRD/TDD/设计总结/.pen）已经定义了清晰的业务目标与页面模板（T1/T2/T3/T4 + 证据系统），但代码层仍处于骨架阶段：后端仅 NestJS hello-world、前端仅 Next 首页、设计页未工程化落地。此次变更目标是在**不推翻既有业务与页面设计意图**前提下，补齐可实施的专业化系统架构与落地路径，形成从文档到可运行系统的一致方案（TypeScript + NestJS + React + Tailwind 为主，按需补强周边技术栈）。

## 推荐实施方案

### 1. 先统一“目标架构蓝图”（模块化单体优先）
1. 采用“模块化单体 + 清晰边界”作为第一阶段目标架构，保留未来微服务拆分可能。
2. 后端按领域拆分模块：`auth`、`tenant`、`sku`、`purchase`、`sales`、`inventory`、`quotation`、`evidence`、`audit`。
3. 业务流采用“REST 命令 + GraphQL 查询”双轨：
   - REST 负责创建/确认/过账等命令型操作。
   - GraphQL 负责分页查询、聚合读取、外部开放读取能力。
4. 明确关键约束：
   - 所有请求必须注入 `tenant_id` 上下文。
   - 库存仅由 `inventory_ledger` 驱动，不允许负库存。
   - 单据不可物理删除，仅作废。
   - 证据系统保留“单据级 + 行级”双层模型。

### 2. 技术栈补强（在用户倾向栈上增量增强）
1. 数据层：PostgreSQL + Prisma（迁移、类型、安全查询）。
2. 缓存与幂等：Redis（缓存、限流、幂等键、分布式锁）。
3. 异步任务：BullMQ（证据处理、报表预计算、审计异步任务）。
4. 文件证据：S3 兼容对象存储（如 MinIO/AWS S3）。
5. 鉴权与开放平台：OAuth2 + Scope（优先贴合现有文档约束）。
6. 可观测性：OpenTelemetry + Prometheus + Grafana + 结构化日志。
7. 测试体系：Jest（单元/集成）+ Playwright（E2E）。

### 3. 前端工程化落地策略（先母版后页面）
1. 先实现模板壳组件：`OverviewLayout(T1)`、`WorkbenchLayout(T2)`、`DetailLayout(T3)`、`WizardLayout(T4)`、`AuthLayout`、系统页模板。
2. 将设计系统沉淀为 tokens（颜色、字体、圆角、间距）并映射 Tailwind 主题变量。
3. 抽象跨页面复用组件：`DataTable`、`FilterBar`、`KpiCard`、`StepWizard`、`DetailTabs`、`EvidencePanel`、`EvidenceDrawer`。
4. 页面采用“模板 + 配置”方式装配，避免逐页重复实现。

### 4. 渐进交付节奏（MVP -> Beta -> GA）
1. **MVP**：打通 SKU/PO/GRN/SO/OUT 与库存流水主链路；完成核心模板与关键页面联调。
2. **Beta**：完善证据系统全链路、权限体系、GraphQL 开放查询、API 日志。
3. **GA**：完善可观测、性能压测、备份恢复、审计与安全治理。

### 5. 与现有设计兼容策略（不擅改原设计）
1. 保持 PRD/TDD 已定义流程与实体关系，不改变业务主流程语义。
2. 保持 T1/T2/T3/T4 页面范式，新增仅做工程化拆分，不改变交互骨架。
3. 证据系统坚持双层结构，不降级为单一附件表展示。
4. 优先复用 `packages/shared` 中单据类型/状态契约，避免前后端语义漂移。

## 关键文件（实施阶段将重点修改）
- `apps/server/src/app.module.ts`
- `apps/server/src/main.ts`
- `apps/server/src/**`（新增领域模块目录）
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/**`（新增路由页与布局接入）
- `apps/web/src/components/**`（模板与业务复用组件）
- `apps/web/src/app/globals.css`（tokens/全局样式）
- `packages/shared/src/types/document.ts`
- `packages/shared/src/types/api.ts`
- `packages/shared/src/index.ts`
- `designs/ui/miniERP_design_summary.md`（如需同步进度与落地映射）

## 可复用资产（优先沿用）
- 单据类型与状态契约：`packages/shared/src/types/document.ts`
- API 类型基础：`packages/shared/src/types/api.ts`
- 单据常量与映射：`packages/shared/src/constants/document.ts`
- 单据编号与格式化工具：`packages/shared/src/utils/format.ts`
- 页面模板规范：`designs/ui/minierp_page_spec.md`
- 证据系统规范：`designs/ui/miniERP_evidence_system.md`

## 验证方案（端到端）
1. **架构一致性验证**
   - 对照 PRD/TDD/设计总结，逐项核对模块边界、流程、实体是否一致。
2. **后端验证**
   - 运行 `bun run --filter server test` 与关键集成测试（采购/销售/库存流水）。
   - 验证不可负库存、幂等过账、租户隔离。
3. **前端验证**
   - 路由与模板映射核对（T1/T2/T3/T4、Auth、系统页、移动页）。
   - 证据系统在 GRN/OUT/Stocktake 页面进行单据级与行级交互检查。
4. **联调与安全验证**
   - OAuth2 + Scope + Rate Limit + GraphQL complexity/depth 限制验证。
   - 附件上传、审计记录、跨租户访问阻断验证。
5. **可观测与回归**
   - 核对日志、指标、链路追踪是否覆盖关键命令流。
   - 对核心流程执行 E2E 回归。
