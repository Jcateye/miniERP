# DFP 通用规则冻结（v1.0）

## 目标
冻结跨模块通用规则，避免实现阶段重复争论。

## 1. 多租户隔离规则
- 所有核心业务实体必须含 `tenant_id NOT NULL`
- 服务端统一注入 tenant 上下文；客户端 tenant 参数不作为信任来源
- 访问控制必须同时满足 tenant 边界与权限边界

## 2. 审计规则
- 命令类操作必须写入审计事件
- 状态迁移必须写入状态迁移审计
- 审计最小字段：`request_id`, `tenant_id`, `actor_id`, `action`, `entity_type`, `entity_id`, `occurred_at`

## 3. 模块边界规则
- 模块内分层固定：`controller -> application -> domain + infrastructure`
- 跨模块调用仅允许 application 接口，不允许 repository 直连

## 4. 库存一致性规则
- `inventory_ledger` 是库存事实源
- `inventory_balance` 是查询快照，不可替代 ledger
- 出库/调整必须防负库存
- 过账必须具备幂等与原子性
- 更正通过冲销，不可删除或篡改历史流水

## 5. 证据双层规则
- 单据级：`scope=document`
- 行级：`scope=line + line_ref`
- 证据模型分离：
  - `evidence_asset` 负责对象元数据与状态
  - `evidence_link` 负责业务绑定

## 6. 编号与金额规则
- 单据号：`DOC-{type}-{YYYYMMDD}-{seq}`
- 金额语义：decimal 计算，禁止 float 业务计算

## 7. 变更门禁
- 任意改动 DFP 规则均需评审并升级 DFP 版本
- 未通过评审不得进入 `DFP-READY`