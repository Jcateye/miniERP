# DFP 状态机冻结（v1.0）

## 目标
冻结单据与证据状态机，确保命令语义一致且可审计。

## 1. PO 状态机
- `draft -> confirmed -> closed|cancelled`
- 约束：
  - 已 `closed` 不可再回退
  - `cancelled` 仅允许在未闭环前进入

## 2. GRN 状态机
- `draft -> validating -> posted|cancelled`
- 约束：
  - `posted` 后只能走冲销链路，不可直接改回 `draft`

## 3. SO 状态机
- `draft -> confirmed -> closed|cancelled`

## 4. OUT 状态机
- `draft -> picking -> posted|cancelled`
- 约束：
  - `posted` 前必须通过库存可用量校验

## 5. Stocktake 状态机
- `draft -> counting -> reviewed -> posted|cancelled`

## 6. Evidence 资产状态机
- `pending_upload -> uploaded -> validating -> active`
- 风险分支：`rejected|quarantined`
- 约束：`quarantined` 状态禁止下载

## 7. 非法迁移统一处理
- 任意非法迁移必须返回 `VALIDATION_STATUS_TRANSITION_INVALID`
- 返回体必须包含：`from_status`, `to_status`, `entity_type`, `entity_id`

## 8. 审计要求
状态变更必须记录：
- `entity_type`, `entity_id`
- `from_status`, `to_status`
- `operator_id`
- `occurred_at`
- `reason`（可空）