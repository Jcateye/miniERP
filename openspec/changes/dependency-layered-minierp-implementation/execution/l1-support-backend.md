# L1 Support Backend（执行者 C）

## 目标
实现核心链路所依赖的支撑能力：tenant/iam/audit/evidence/platform。

## 前置依赖
- `BOOTSTRAP-READY`
- `L0-READY`

## 输入
- `specs/evidence-dual-layer-workflow/spec.md`
- `specs/backend-module-boundaries/spec.md`
- `specs/dependency-layered-delivery/spec.md`

## 输出
- 租户上下文与权限边界
- 审计事件能力
- 证据双层模型 API 能力
- L1 支撑解锁标记：`L1-SUPPORT-READY`

## 任务
- tenant/iam：租户隔离与授权边界
- audit：命令与状态流转审计
- evidence：upload session + document/line 绑定
- platform：查询治理边界（限流/复杂度）

## 完成定义（DoD）
- 证据 API 可为 GRN/OUT/Stocktake 提供联调输入
- 关键命令均有审计轨迹
- 通过 `bun run --filter server test`