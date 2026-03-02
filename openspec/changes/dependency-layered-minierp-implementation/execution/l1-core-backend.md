# L1 Core Backend（执行者 B）

## 目标
实现核心交易链路后端边界：PO/GRN/SO/OUT/库存/盘点。

## 前置依赖
- `L0-READY`

## 输入
- `specs/backend-module-boundaries/spec.md`
- `specs/inventory-posting-integrity/spec.md`
- `specs/database-logical-model/spec.md`

## 输出
- 核心模块命令/查询接口边界
- 库存过账一致性能力（幂等、原子过账、防负库存）
- L1 核心解锁标记：`L1-CORE-READY`

## 任务
- 定义 `purchase/inbound/sales/outbound/inventory/stocktake` 模块边界
- 实施 inventory posting 的幂等与事务边界
- 保证跨模块仅走 application 接口

## 完成定义（DoD）
- 主流程接口可联调：PO->GRN、SO->OUT、盘点调整
- 过账重复请求不重复落账
- 通过 `bun run --filter server test`