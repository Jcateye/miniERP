## 0. Bootstrap-项目初始化（最先完成）

- [ ] 0.1 在 `apps/server/src/` 初始化模块化目录骨架（`modules/*`、`common/*`、`database/*`）并明确装配入口
- [ ] 0.2 在 `apps/web/src/` 初始化模板化目录骨架（`components/templates`、`components/evidence`、`lib/sdk`、`lib/bff`、`hooks`）
- [ ] 0.3 在 `apps/server` 初始化数据库工具链入口（schema、迁移目录、连接配置占位、`db:*` 脚本约定）
- [ ] 0.4 在 `packages/shared/src/` 初始化契约出口结构（types/constants/utils 的统一导出边界）
- [ ] 0.5 定义并发布 Bootstrap 基线标记：`BOOTSTRAP-READY`
- [ ] 0.6 运行基线命令 `bun run lint && bun run --filter server test && bun run --filter web lint`

## 1. L0-基础依赖冻结（必须先完成）

- [ ] 1.1 在 `packages/shared/src/types/document.ts` 冻结 `DocumentType/DocumentStatus` 与状态流转映射草案
- [ ] 1.2 在 `packages/shared/src/types/api.ts` 冻结 API 包络、分页与错误结构约定
- [ ] 1.3 在 `packages/shared/src/` 输出金额与数量字段语义约定（decimal.js 对齐说明）
- [ ] 1.4 在 `designs/architecture/` 补充并确认数据库逻辑模型基线（实体、关系、索引、唯一约束）
- [ ] 1.5 定义并确认租户隔离与审计字段基线（`tenant_id`、`created_at/by`、`updated_at/by`）
- [ ] 1.6 执行 `bun run lint` 验证基础契约变更未破坏现有代码基线

## 2. L0-数据库与一致性底座（并行流 A，先于业务过账）

- [ ] 2.1 在 `apps/server/src/database/` 规划并落位实体到模块的映射表（文档化）
- [ ] 2.2 定义 `inventory_ledger` 事实源规则与 `inventory_balance` 快照规则
- [ ] 2.3 定义幂等记录模型（`idempotency_record`）与唯一键策略
- [ ] 2.4 定义状态流转审计模型（`state_transition_log`）与最小字段集
- [ ] 2.5 定义证据资产与绑定模型（`evidence_asset`/`evidence_link`）
- [ ] 2.6 运行 `bun run --filter server test` 作为后端基线校验

## 3. L1-后端核心链路（并行流 B，可分执行者文件）

- [ ] 3.1 `purchase` 模块：定义 PO 命令与查询边界（create/confirm/close/cancel）
- [ ] 3.2 `inbound` 模块：定义 GRN 草稿/校验/过账接口与状态机
- [ ] 3.3 `sales` 模块：定义 SO 命令与查询边界（create/confirm/close/cancel）
- [ ] 3.4 `outbound` 模块：定义 OUT 草稿/校验/过账接口与状态机
- [ ] 3.5 `inventory` 模块：实现库存校验、ledger 写入、原子过账接口契约
- [ ] 3.6 `stocktake` 模块：定义盘点差异与调整过账边界
- [ ] 3.7 运行 `bun run --filter server test` 验证核心链路契约回归

## 4. L1-后端支撑能力（并行流 C，可分执行者文件）

- [ ] 4.1 `tenant`/`iam` 模块：定义租户上下文注入与授权边界
- [ ] 4.2 `audit` 模块：定义命令级审计事件与字段变更审计接口
- [ ] 4.3 `evidence` 模块：定义上传会话、完成确认、文档级/行级绑定接口
- [ ] 4.4 `platform` 模块：定义查询层访问治理边界（限流/复杂度）
- [ ] 4.5 运行 `bun run --filter server test` 验证支撑能力基线

## 5. L2-前端模板与数据编排底座（并行流 D）

- [ ] 5.1 在 `apps/web/src/components/templates/` 建立 T1/T2/T3/T4 模板契约
- [ ] 5.2 在 `apps/web/src/components/evidence/` 建立 EvidencePanel 与 LineEvidenceDrawer 契约
- [ ] 5.3 在 `apps/web/src/lib/sdk/` 按业务域建立 typed client 分组
- [ ] 5.4 在 `apps/web/src/lib/bff/` 建立页面聚合读取层（工作台与向导汇总）
- [ ] 5.5 在 `apps/web/src/hooks/` 建立筛选/分页/stepper 视图模型 hooks
- [ ] 5.6 运行 `bun run --filter web lint` 验证模板与编排层基线

## 6. L2-页面装配与联调（并行流 E，按优先级）

- [ ] 6.1 先装配 GRN 向导页（依赖 inbound + inventory + evidence API ready）
- [ ] 6.2 装配 OUT 向导页（依赖 outbound + inventory + evidence API ready）
- [ ] 6.3 装配 Stocktake 向导页（依赖 stocktake + inventory + evidence API ready）
- [ ] 6.4 再装配 SKU/PO/SO 工作台与详情页（依赖对应模块 API ready）
- [ ] 6.5 装配设置与审计相关页面（依赖 tenant/iam/audit API ready）
- [ ] 6.6 运行 `bun run --filter web lint` 校验页面装配质量

## 7. 端到端验证与回归（收口流）

- [ ] 7.1 验证主流程：`PO -> GRN -> inventory_ledger`
- [ ] 7.2 验证主流程：`SO -> OUT -> inventory_ledger`
- [ ] 7.3 验证主流程：`Stocktake -> diff -> adjustment`
- [ ] 7.4 验证证据流程：单据级上传绑定 + 行级绑定 + 差异行校验
- [ ] 7.5 验证权限流程：跨租户越权拦截与审计记录
- [ ] 7.6 运行 `bun run test && bun run build` 完整回归

## 8. 按文件分执行者的拆分交付（满足并行分工）

- [ ] 8.1 生成 `execution/l0-foundation.md`（执行者 A：shared+model）
- [ ] 8.2 生成 `execution/l1-core-backend.md`（执行者 B：purchase/inbound/sales/outbound/inventory）
- [ ] 8.3 生成 `execution/l1-support-backend.md`（执行者 C：tenant/iam/audit/evidence/platform）
- [ ] 8.4 生成 `execution/l2-frontend-foundation.md`（执行者 D：templates/sdk/bff/hooks）
- [ ] 8.5 生成 `execution/l2-frontend-integration.md`（执行者 E：页面装配与联调）
- [ ] 8.6 生成 `execution/e2e-closure.md`（执行者 F：回归与验收）
- [ ] 8.7 在每个执行文件中标注“前置依赖/输入输出/完成定义(DoD)”并交叉引用