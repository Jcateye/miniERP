## 1. P0 最小联调闭环（Documents + Evidence + Inventory）

- [ ] 1.1 在 server 明确 documents `list/detail/action` 的实现边界与状态机映射（复用现有状态迁移规则）。
- [ ] 1.2 在 server 完成 evidence `links` 查询/绑定与 `upload-intents` 最小协议实现。
- [ ] 1.3 在 documents 关键动作（GRN/OUT）接入 inventory 过账，并实现幂等结果重放。
- [ ] 1.4 在 BFF action 链路强制 `Idempotency-Key`（缺失返回 400）并保持错误语义透传一致。
- [ ] 1.5 补齐 P0 集成测试：非法状态迁移、跨租户绑定拒绝、幂等重放、库存不足等分支。
- [ ] 1.6 完成 staging 联调门禁验证：fallback 命中率=0、四条主链路（PO/SO/GRN/OUT）可复现。

## 2. P1 Shared Contract 收敛与审计一致性

- [ ] 2.1 在 `packages/shared` 收敛 Documents/Evidence/Inventory DTO、枚举与错误码定义。
- [ ] 2.2 将 Web hooks、BFF route、Server DTO 对齐到 shared contract，移除重复定义。
- [ ] 2.3 统一 action 审计最小字段并补齐对应测试验证。
- [ ] 2.4 验证 P1 后三端类型与错误语义一致，不破坏 P0 门禁。

## 3. P2 实体 CRUD 扩展

- [ ] 3.1 按优先级扩展 SKU/Warehouse CRUD，并补齐页面联调路径。
- [ ] 3.2 扩展 Stocktake/Quotation CRUD，并补齐关键流程测试。
- [ ] 3.3 扩展 Supplier/Customer 等主数据 CRUD，补齐回归验证。
- [ ] 3.4 完成 P2 回归：确保 P0/P1 验收项持续通过。

## 4. OpenSpec 验收与执行准备

- [ ] 4.1 运行 `openspec status --change "adr-006-minimum-integration-closure"`，确认 proposal/design/specs/tasks 全部 complete。
- [ ] 4.2 运行 `openspec instructions apply --change "adr-006-minimum-integration-closure"`，确认 apply 从 blocked 变为 ready。
- [ ] 4.3 将联调门禁与 KPI 对齐 ADR-006 文档，确保需求与任务一致。
