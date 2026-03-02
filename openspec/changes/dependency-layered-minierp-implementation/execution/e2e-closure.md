# G4 Acceptance Group（执行者 F）

## 目标
执行端到端收口，验证依赖层推进结果可交付。

## 前置依赖
- `BE-READY`
- `FE-READY`

## 输入
- 各 stream 输出与联调环境
- `tasks.md` 中第 7 组验证项

## 输出
- 主流程回归结果
- 风险清单与阻塞项
- 收口结论：`READY-FOR-APPLY`

## 任务
- 验证 PO->GRN、SO->OUT、Stocktake 调整流程
- 验证证据双层绑定流程
- 验证跨租户越权拦截与审计可追溯

## 完成定义（DoD）
- 核心流程回归通过
- 关键风险有明确结论（接受/修复计划）
- 通过 `bun run test && bun run build`