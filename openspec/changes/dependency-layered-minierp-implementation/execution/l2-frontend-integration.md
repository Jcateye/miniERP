# G3 Frontend Group - Integration Stream（执行者 E）

## 目标
按优先级完成页面装配与联调，最先打通高依赖流程页。

## 前置依赖
- `DFP-READY`
- `FE-E-READY`
- `BE-READY`

## 输入
- `specs/frontend-template-composition/spec.md`
- 后端 API 契约与 mock

## 输出
- GRN/OUT/Stocktake 优先联调页面
- SKU/PO/SO/设置页后续联调
- G3 页面联调解锁标记：`FE-F-READY`

## 任务
- 优先装配 T4 向导链路页面
- 再装配 T2/T3 工作台与详情页
- 对接 evidence document/line 交互

## 完成定义（DoD）
- 关键页面能走通提交/查询/状态反馈
- 无阻塞的 API 契约缺口
- 通过 `bun run --filter web lint`

## FE-F-READY 结果
- 状态：`READY`
- 页面装配：
  - 已完成 GRN / OUT / Stocktake 的 T2 / T3 / T4 页面装配
  - 已完成 SKU / PO / SO / 设置页装配，并补齐概览、工作台、详情、向导骨架
- 接口切换：
  - SDK 默认 transport 已切换为 HTTP + `/api/bff`
  - 新增 BFF route handlers，优先代理后端接口，失败时回退 fixture，移除默认 `MockSdkClient` 依赖
- Evidence：
  - GRN / OUT / Stocktake 详情与向导页均接入 document / line evidence 展示壳
- 验证：
  - `bun run --filter web lint` ✅
  - `bun run --filter web build` ✅

## 对 G4 的影响
- 页面路由与 BFF 入口已就绪，可在 PR 合入 `main` 后继续执行 G4 联调验收。
