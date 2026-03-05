## ADDED Requirements

### Requirement: P0 域 DTO 必须统一到 shared contract
系统 MUST 将 Documents/Evidence/Inventory 的核心 DTO、枚举与错误码定义统一到 `packages/shared`，并作为三端唯一事实来源。

#### Scenario: Web/BFF/Server 引用同一 DTO 定义
- **WHEN** 三端编译与联调 P0 域接口
- **THEN** Web hooks、BFF route、Server DTO 使用同一 shared contract 类型，不存在并行定义

### Requirement: 错误语义必须跨层一致
系统 MUST 统一 P0 域关键错误码与状态码映射，并保证 BFF 透传语义一致。

#### Scenario: 状态迁移与幂等错误码一致
- **WHEN** 后端返回 `VALIDATION_STATUS_TRANSITION_INVALID` 或幂等相关错误
- **THEN** BFF 保持错误语义与状态码一致对外输出

### Requirement: action 审计必须满足可追溯最小字段
系统 MUST 对关键 action 写入可追溯审计记录，至少包含租户、操作者、请求与幂等上下文。

#### Scenario: action 审计字段完整
- **WHEN** 执行 documents action（含 inventory 联动）
- **THEN** 审计记录包含 tenantId、actorId、requestId、entityType、entityId、action、result、idempotencyKey
