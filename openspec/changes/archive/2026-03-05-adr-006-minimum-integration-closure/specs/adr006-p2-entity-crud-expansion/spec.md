## ADDED Requirements

### Requirement: P2 必须按优先级扩展实体 CRUD
系统 MUST 在 P0/P1 验收通过后，按既定优先级扩展实体 CRUD，避免跨阶段扩 scope。

#### Scenario: P2 扩展在前置阶段通过后启动
- **WHEN** P0 联调门禁与 P1 契约收敛未完成
- **THEN** 系统不得进入 P2 实体 CRUD 实施

#### Scenario: 优先级顺序执行
- **WHEN** 进入 P2 阶段
- **THEN** 先推进 SKU/Warehouse，再推进 Stocktake/Quotation，最后扩展 Supplier/Customer 等主数据

### Requirement: 每个新增实体 CRUD 必须具备最小质量保障
系统 MUST 为每个新增实体 CRUD 提供一致的验证与回归保障。

#### Scenario: CRUD 基本行为可验证
- **WHEN** 新增实体 CRUD 完成开发
- **THEN** 至少通过 create/read/update/delete 核心场景验证，并具备失败场景校验

#### Scenario: 联调与回归要求达标
- **WHEN** P2 变更进入联调验收
- **THEN** 必须通过对应页面联调用例，并不破坏 P0/P1 已通过门禁
