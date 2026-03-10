你在 miniERP 仓库内运行 Ralph Loop。你的唯一目标是：**按照 `images/source/miniERP-pencil-opus4.6.pen` 与仓库内既有设计计划，持续复刻全部前端页面，直到所有 user stories 都通过。**

## 必读上下文

每一轮开始前，必须先读：

1. `AGENTS.md`
2. `CLAUDE.md`
3. `docs/plans/2026-03-07-erp-page-reconstruction-design.md`
4. `docs/ui/erp-page-design-route-map.md`
5. `docs/ui/erp-page-priority-and-interface-map.md`
6. `scripts/ralph/log.md`
7. `docs/user-stories/erp-page-reconstruction/**/*.json`

## 总体规则

1. 一次只处理一个 feature / 一组紧密相关页面。
2. 优先处理 `passes: false` 的 story。
3. 优先级：
   - 先按 `docs/ui/erp-page-priority-and-interface-map.md` 的 P0/P1/P2/P3/P4 执行
   - 同优先级内，优先处理 `functional`
4. 页面必须对齐 `.pen` 设计稿；不要继续扩展旧 template / assembly 路线。
5. 正式页面优先采用 `page.tsx -> page-level view -> page-local view model`。
6. 允许第一轮先完成视觉复刻，但 **只有 `scope=route` 且 `stage=rebuilt` 的 story 才能标记 `passes=true`**。
7. 不要一次性铺开太多共享抽象；允许小范围重复。
8. 每轮结束前必须：
   - 更新对应 story 的 `stage`
   - 只有在 route story 达到 `rebuilt` 时才可更新 `passes=true`
   - 更新 `scripts/ralph/log.md`
   - 记录改动文件
   - 运行最小必要验证
9. 当所有 stories 都通过时，输出：

<promise>FINISHED</promise>

## 每轮工作流

1. 读取未完成 stories。
2. 选择最优先的一条或一个紧密页面批次。
3. 实现。
4. 运行最小验证：
   - `bun run user-stories:verify`
   - 与当前改动直接相关的构建/测试/检查
5. 若只是完成视觉阶段，则把 story 的 `stage` 更新为 `visual-done` 或更高，但不要过早把 `passes` 标记为 `true`。
6. 只有当 route story 已达到 `rebuilt`，且最小验证完成，才允许更新 `passes: true`。
7. 在 `scripts/ralph/log.md` 追加：
   - 处理的 story
   - 改动文件
   - 是否完成
   - 下一轮建议
8. 如果 story 未完成，不要误标为 `true`。

## 本项目特定目标

你要持续推进“全部前端页面复刻”，完成后才能停下来。重点依据：

- `docs/ui/erp-page-design-route-map.md`
- `docs/ui/erp-page-priority-and-interface-map.md`
- `images/source/miniERP-pencil-opus4.6.pen`

当前已明确首批可直接推进的页面包括但不限于：

- `/mdm/customers`
- `/mdm/warehouses`
- `/finance/receipts`
- 以及映射表中所有 `status != rebuilt` 的页面

## 输出要求

- 使用中文。
- 简洁说明本轮处理了什么。
- 不要停在分析阶段；除非完全被阻塞，否则必须继续推进实现。
- 只有当所有 user stories 都通过时，才输出 `<promise>FINISHED</promise>`。
