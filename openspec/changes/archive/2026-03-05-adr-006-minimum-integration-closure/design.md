## Context

ADR-006 已确定“最小闭环优先”策略：先以 P0 打通 Documents/Evidence/Inventory 真实联调，再在 P1 做 shared contract 收敛，P2 扩展实体 CRUD。当前主要矛盾不是页面不可用，而是“链路可见但不可验”：
- BFF 在 development/test 可回退到 fixture，掩盖后端缺口；
- 后端已存在状态机/证据绑定/库存过账等服务能力，但 HTTP 业务接口闭环不足；
- Web/BFF/Server 的 DTO 与错误语义尚未完全收敛到 shared。

## Goals / Non-Goals

**Goals:**
- 在最小范围内打通可真实联调的 P0 闭环，明确通过标准。
- 让幂等、租户隔离、审计在 action 链路中成为硬约束。
- 让 P1 shared contract 成为三端唯一事实来源（至少覆盖 P0 域）。
- 将 P2 扩展工作以能力边界拆分，避免跨阶段扩 scope。

**Non-Goals:**
- 不在本 change 内一次性补齐所有业务实体 CRUD。
- 不在 P0 阶段完成所有历史接口文档或数据迁移工程。
- 不在未完成 P0 门禁前提前并行大量 P2 实体开发。

## Decisions

### 决策 1：按能力分层拆分为 3 个 specs（P0/P1/P2）
- 采用 capability 级拆分：`adr006-p0-integration-closure`、`adr006-p1-contract-alignment`、`adr006-p2-entity-crud-expansion`。
- 原因：与 ADR 阶段目标一一对应，便于按门禁推进与归档。
- 备选：按模块（documents/evidence/inventory）拆分；未采纳，因为会弱化阶段边界，增加并行失控风险。

### 决策 2：P0 先定义“行为与门禁”，再讨论扩展范围
- P0 specs 强制覆盖成功/失败场景：状态迁移非法、缺失幂等键、重放幂等、跨租户拒绝、fallback 禁用验收。
- 原因：先保证“可验”，再做“可多”。
- 备选：先补 CRUD 再补门禁；未采纳，风险是联调再次失真。

### 决策 3：P1 shared contract 采用渐进收敛
- 先收敛 P0 域 DTO/枚举/错误码，再扩展到更多域。
- 原因：降低一次性迁移成本，保持交付连续性。
- 备选：一次性全域收敛；未采纳，变更面过大且回归风险高。

### 决策 4：P2 必须依赖 P0/P1 验收通过
- `tasks.md` 中显式设置先后依赖：P0 -> P1 -> P2。
- 原因：避免“扩展快于闭环”，导致重复返工。
- 备选：阶段并行；未采纳，质量不可控。

## Risks / Trade-offs

- [Risk] P0 与 P1 边界不清导致任务重复。
  → Mitigation：在 specs 中明确 capability 边界与验收责任归属。

- [Risk] fallback 在 staging 仍被误用。
  → Mitigation：把“fallback=0”作为 P0 验收硬门禁并写入 tasks。

- [Risk] contract 收敛期间出现前后端类型断层。
  → Mitigation：采用“P0 域优先 + 渐进迁移 + 集成测试护栏”。

- [Risk] P2 过早展开拖慢关键闭环。
  → Mitigation：tasks 按阶段 gating，未满足前置项不得进入下一阶段。

## Migration Plan

1. 完成 proposal，锁定 capability 名称和范围。
2. 完成 design/specs，明确 P0/P1/P2 行为标准与验收场景。
3. 完成 tasks，形成可执行顺序与可验证清单。
4. 通过 `openspec status --change "adr-006-minimum-integration-closure"` 验证 artifacts 全部 complete。
5. 进入后续 `/opsx:apply` 实施阶段，按任务清单推进。

回滚策略（本阶段为规格产物）：
- 若范围定义不合理，回滚为修改 proposal/design/specs/tasks，不触发代码层回滚。

## Open Questions

- `upload-intents` 在 P0 的最小返回字段集是否固定（用于后续对象存储兼容）？
- Documents create/update/delete 进入 P1 还是保留到 P2？
- staging “fallback=0”是否纳入 CI 强制检查？
- inventory 持久化从 in-memory 迁移的最晚阶段是 P1 还是 P2？
