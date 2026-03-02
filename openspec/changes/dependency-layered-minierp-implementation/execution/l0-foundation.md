# L0 Foundation（执行者 A）

## 目标
冻结底层依赖，形成上层并行开发的统一输入。

## 前置依赖
- 无

## 输入
- `proposal.md`
- `design.md`
- `specs/shared-contract-governance/spec.md`
- `specs/database-logical-model/spec.md`
- `specs/dependency-layered-delivery/spec.md`

## 输出
- Shared 契约冻结清单（类型/状态/API 包络）
- 数据库逻辑模型冻结清单（实体/关系/索引/唯一约束）
- L0 解锁标记：`L0-READY`

## 任务
- 冻结 `packages/shared` 契约边界
- 冻结数据模型和 tenant 前缀索引策略
- 定义状态机与审计字段基线

## 完成定义（DoD）
- L1 团队可不再等待字段定义开始开发
- 契约与模型无冲突项
- 通过基础校验命令：`bun run lint` / `bun run --filter server test`