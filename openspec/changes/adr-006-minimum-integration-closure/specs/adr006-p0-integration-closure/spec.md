## ADDED Requirements

### Requirement: Documents 主链路必须可真实联调
系统 MUST 提供 `list/detail/action` 的真实后端能力，覆盖 PO/SO/GRN/OUT 主路径，并与状态机规则保持一致。

#### Scenario: List 与 Detail 查询成功
- **WHEN** 客户端请求 `GET /api/documents` 或 `GET /api/documents/:docType/:id`
- **THEN** 系统返回满足 BFF 预期结构的真实数据（非 fixture）

#### Scenario: 非法状态迁移被拒绝
- **WHEN** 客户端发起不满足状态机约束的 action 请求
- **THEN** 系统返回 409 与统一错误码 `VALIDATION_STATUS_TRANSITION_INVALID`

### Requirement: Evidence 读写链路必须可用
系统 MUST 支持 document/line 维度的证据查询与绑定，并提供 upload-intents 联调协议。

#### Scenario: 证据查询支持 document/line 维度
- **WHEN** 客户端按 document 或 line 维度请求 `GET /api/evidence/links`
- **THEN** 系统返回对应维度的证据集合并遵循租户隔离约束

#### Scenario: 证据绑定跨租户被拒绝
- **WHEN** 客户端尝试将证据绑定到非当前租户实体
- **THEN** 系统拒绝请求并返回租户越权错误

#### Scenario: 上传意图协议可联调
- **WHEN** 客户端调用 `POST /api/evidence/upload-intents`
- **THEN** 系统返回符合 P0 约定的最小上传意图协议字段

### Requirement: Inventory 过账必须具备幂等保护
系统 MUST 在 GRN/OUT 关键动作中接入库存过账，并强制幂等键约束，防止重复记账。

#### Scenario: 缺失幂等键请求被拒绝
- **WHEN** 客户端调用 documents action 且缺失 `Idempotency-Key`
- **THEN** 系统返回 400 并告知幂等键缺失

#### Scenario: 幂等键重放不重复过账
- **WHEN** 客户端使用相同 `Idempotency-Key` 重放同一 action 请求
- **THEN** 系统返回第一次处理结果且不重复写入库存流水

### Requirement: 联调阶段必须满足 fallback 门禁
系统 MUST 在 staging 联调环境中禁止依赖 fixture fallback，并将其作为验收门禁。

#### Scenario: staging 环境 fallback 命中率为零
- **WHEN** 在 staging 执行 P0 联调用例
- **THEN** 所有请求均命中真实后端，fallback 命中率为 0
