## 0. G0-治理门禁（先完成）

- [x] 0.1 定义 DFP 版本规则（`v主.次`）与变更审批流程
- [x] 0.2 约定冻结窗口：实现阶段默认禁止改 DFP 语义
- [x] 0.3 约定 DFP 变更申请模板（影响范围、兼容性、回滚方案）
- [x] 0.4 发布门禁标签：`DFP-READY`、`BE-READY`、`FE-READY`、`READY-FOR-APPLY`

## 1. G1-协议冻结组（Freeze Group）

- [x] 1.1 完成 `freeze/dfp-field-dictionary.md` 字段字典评审
- [x] 1.2 完成 `freeze/dfp-api-contract.md` 协议与错误语义评审
- [x] 1.3 完成 `freeze/dfp-state-machines.md` 状态机与非法迁移规则评审
- [x] 1.4 完成 `freeze/dfp-common-rules.md` 通用规则评审（tenant/审计/一致性/证据）
- [x] 1.5 完成 `freeze/dfp-db-model-baseline.md` 数据模型与索引评审
- [x] 1.6 发布 `freeze/DFP-READY.md` 冻结签字记录

## 2. G2-后端实现组（3人并行）

> 说明：后端 3 个人并行。谁被依赖，谁优先；有依赖就等依赖完成再继续执行。

### 2.1 后端-B（核心单据流）
- [ ] 2.1.1 实现 `purchase/inbound/sales/outbound` 命令与查询边界（按 DFP）
- [ ] 2.1.2 对齐单据状态机（PO/GRN/SO/OUT）与非法迁移错误语义
- [ ] 2.1.3 产出后端-B 交付标记：`BE-B-READY`

### 2.2 后端-C（库存一致性流）
- [ ] 2.2.1 实现 `inventory` 过账原子事务与幂等（`idempotency_record`）
- [ ] 2.2.2 实现防负库存与冲销路径（按 DFP 约束）
- [ ] 2.2.3 产出后端-C 交付标记：`BE-C-READY`

### 2.3 后端-D（支撑能力流）
- [ ] 2.3.1 实现 `tenant/iam/audit/platform` 基础能力（按 DFP）
- [ ] 2.3.2 实现 `evidence` 双层绑定能力（document/line）与鉴权审计
- [ ] 2.3.3 产出后端-D 交付标记：`BE-D-READY`

### 2.4 后端汇总门禁
- [ ] 2.4.1 仅在 `BE-B-READY`、`BE-C-READY`、`BE-D-READY` 全部完成后，执行 `bun run --filter server test`
- [ ] 2.4.2 测试通过后发布 `BE-READY`

## 3. G3-前端实现组（2人并行）

> 说明：前端 2 个人并行。先按冻结协议做 mock；依赖后端时，等对应依赖完成再继续。

### 3.1 前端-E（底座流）
- [ ] 3.1.1 完成 T1/T2/T3/T4 模板契约与 Evidence 组件契约
- [ ] 3.1.2 完成 `lib/sdk`、`lib/bff`、`hooks` 分层骨架
- [ ] 3.1.3 产出前端-E 交付标记：`FE-E-READY`

### 3.2 前端-F（页面装配流）
- [ ] 3.2.1 在 `DFP-READY` + `FE-E-READY` 条件下，先装配 GRN/OUT/Stocktake 页面（可先 mock）
- [ ] 3.2.2 在 `BE-READY` 条件下，切换真实接口并清理 mock 依赖
- [ ] 3.2.3 完成 SKU/PO/SO/设置页面装配
- [ ] 3.2.4 产出前端-F 交付标记：`FE-F-READY`

### 3.3 前端汇总门禁
- [ ] 3.3.1 仅在 `FE-E-READY` 与 `FE-F-READY` 完成后，执行 `bun run --filter web lint`
- [ ] 3.3.2 校验通过后发布 `FE-READY`

## 4. G4-联调验收组（依赖完成后执行）

> 说明：联调与验收不抢跑，等 `BE-READY` + `FE-READY` 完成后再执行。

- [ ] 4.1 验证主流程：`PO -> GRN -> inventory_ledger`
- [ ] 4.2 验证主流程：`SO -> OUT -> inventory_ledger`
- [ ] 4.3 验证主流程：`Stocktake -> diff -> adjustment`
- [ ] 4.4 验证证据流程：单据级绑定 + 行级绑定 + 差异行校验
- [ ] 4.5 验证权限流程：跨租户越权拦截与审计追踪
- [ ] 4.6 运行 `bun run test && bun run build` 并发布 `READY-FOR-APPLY`

## 5. 执行文件映射（索引）

- [ ] 5.1 Freeze Group：`execution/l0-foundation.md`
- [ ] 5.2 Backend-B：`execution/l1-core-backend.md`
- [ ] 5.3 Backend-D：`execution/l1-support-backend.md`
- [ ] 5.4 Frontend-E：`execution/l2-frontend-foundation.md`
- [ ] 5.5 Frontend-F：`execution/l2-frontend-integration.md`
- [ ] 5.6 Acceptance：`execution/e2e-closure.md`