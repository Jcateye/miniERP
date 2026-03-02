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

## 2. G2-后端实现组（Backend Group）

- [ ] 2.1 核心链路流：`purchase/inbound/sales/outbound/inventory/stocktake` 按 DFP 实现命令/查询边界
- [ ] 2.2 核心链路流：完成库存过账幂等、原子事务、防负库存与冲销路径
- [ ] 2.3 支撑能力流：`tenant/iam/audit/evidence/platform` 按 DFP 实现
- [ ] 2.4 支撑能力流：完成证据双层绑定（document/line）与鉴权审计
- [ ] 2.5 运行 `bun run --filter server test`，通过后发布 `BE-READY`

## 3. G3-前端实现组（Frontend Group）

- [ ] 3.1 底座流：完成 T1/T2/T3/T4 模板契约与 Evidence 组件契约
- [ ] 3.2 底座流：完成 `lib/sdk`、`lib/bff`、`hooks` 分层骨架
- [ ] 3.3 装配流：优先完成 GRN/OUT/Stocktake 页面装配（可先 mock）
- [ ] 3.4 装配流：完成 SKU/PO/SO/设置页面装配
- [ ] 3.5 在 `BE-READY` 后切换真实接口并清理 mock 依赖
- [ ] 3.6 运行 `bun run --filter web lint`，通过后发布 `FE-READY`

## 4. G4-联调验收组（Acceptance Group）

- [ ] 4.1 验证主流程：`PO -> GRN -> inventory_ledger`
- [ ] 4.2 验证主流程：`SO -> OUT -> inventory_ledger`
- [ ] 4.3 验证主流程：`Stocktake -> diff -> adjustment`
- [ ] 4.4 验证证据流程：单据级绑定 + 行级绑定 + 差异行校验
- [ ] 4.5 验证权限流程：跨租户越权拦截与审计追踪
- [ ] 4.6 运行 `bun run test && bun run build` 并发布 `READY-FOR-APPLY`

## 5. 执行文件映射（索引，不作为阻塞任务）

- [ ] 5.1 Freeze Group：`execution/l0-foundation.md`
- [ ] 5.2 Backend Group：`execution/l1-core-backend.md` + `execution/l1-support-backend.md`
- [ ] 5.3 Frontend Group：`execution/l2-frontend-foundation.md` + `execution/l2-frontend-integration.md`
- [ ] 5.4 Acceptance Group：`execution/e2e-closure.md`