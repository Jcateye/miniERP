# L2 Frontend Integration（执行者 E）

## 目标
按优先级完成页面装配与联调，最先打通高依赖流程页。

## 前置依赖
- `BOOTSTRAP-READY`
- `L2-FOUNDATION-READY`
- `L1-CORE-READY`
- `L1-SUPPORT-READY`（证据与权限）

## 输入
- `specs/frontend-template-composition/spec.md`
- 后端 API 契约与 mock

## 输出
- GRN/OUT/Stocktake 优先联调页面
- SKU/PO/SO/设置页后续联调
- L2 页面联调解锁标记：`L2-INTEGRATION-READY`

## 任务
- 优先装配 T4 向导链路页面
- 再装配 T2/T3 工作台与详情页
- 对接 evidence document/line 交互

## 完成定义（DoD）
- 关键页面能走通提交/查询/状态反馈
- 无阻塞的 API 契约缺口
- 通过 `bun run --filter web lint`