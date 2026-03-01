# ADR-005: 前端模板化实现规范（T1/T2/T3/T4 的组件边界与状态管理约束）

## Title
前端模板化实现规范（T1/T2/T3/T4 的组件边界与状态管理约束）

## Status
Proposed（建议采纳并作为前端开发强制规范）

## Date
2026-03-01

## Context
设计资产已明确 T1/T2/T3/T4 模板化页面体系，且页面覆盖高、复用空间大。现阶段风险：
- 页面各自开发导致布局与交互漂移，模板失效。
- 组件层直接发请求、跨层状态污染，导致维护成本陡增。
- 列表筛选、分页、排序状态未统一到 URL，分享与回放能力弱。
- 过账向导（T4）步骤状态与服务端草稿状态不一致，易出现“前端显示成功但后端未保存”。

目标：建立可工程化的前端模板边界与状态约束，确保“换字段不换架构”。

## Decision

### 核心决策
采用“**Page Container（编排） + Template Shell（纯展示） + Domain Blocks（业务组件） + Hook ViewModel（状态聚合）**”四层架构。

### 决策清单表格

| 决策项 | 方案 | 结论 | 级别 |
|---|---|---|---|
| 页面分层 | 路由页仅做编排；模板组件不含数据获取副作用 | 采纳 | 强制 |
| 模板边界 | T1/T2/T3/T4 统一 slot 接口，禁止页面直接改模板骨架 | 采纳 | 强制 |
| Server State | 使用 TanStack Query 管理缓存、失效、重试 | 采纳 | 强制 |
| URL State | 列表筛选/排序/分页必须 URL 化（searchParams） | 采纳 | 强制 |
| Form State | React Hook Form + Zod 统一校验 | 采纳 | 强制 |
| 全局状态 | 仅允许 Auth/Tenant/Theme 等横切状态进全局 Store | 采纳 | 强制 |
| 业务状态存放 | 业务实体列表/详情禁止放全局 Store，必须走 Query Cache | 采纳 | 强制 |
| T4 草稿策略 | 步骤草稿“本地临时 + 服务端草稿”双写，提交以服务端为准 | 采纳 | 推荐 |

### 模板组件边界规范

| 模板 | 允许职责 | 禁止职责 | 必需输入 |
|---|---|---|---|
| T1 OverviewLayout | KPI/待办/入口展示与导航跳转 | 直接请求 API、写业务逻辑 | `kpiCards`, `todoItems`, `quickActions`, `timeline` |
| T2 WorkbenchLayout | 查询条件展示、表格渲染、抽屉展示、批量条 UI | 在表格组件内调用 fetch、直接提交命令 | `filtersVM`, `tableVM`, `drawerVM`, `bulkActionsVM` |
| T3 DetailLayout | 详情头部、分栏信息、Tab 容器 | 详情加载、副作用操作 | `headerVM`, `sectionsVM`, `tabsVM`, `actionsVM` |
| T4 WizardLayout | Stepper、步骤容器、汇总区、底部动作条 | 在 Step 组件中直接过账 | `stepsVM`, `draftVM`, `summaryVM`, `submitActionsVM` |

### 状态管理约束（单一事实源）
1. **URL State（可分享）**：`page`, `pageSize`, `sort`, `filters`。
2. **Server State（可缓存）**：列表/详情/字典/权限数据，统一由 Query 管理。
3. **Form State（可校验）**：表单输入与错误，仅由 RHF 控制。
4. **UI Ephemeral State（不可持久）**：弹窗开关、hover、抽屉展开。
5. **Command State（可追踪）**：提交中、幂等键、最近一次命令结果。

### 推荐与不推荐
- **推荐**：模板纯展示 + Hook 聚合 ViewModel + Query 统一服务端状态。
- **不推荐**：
  1) 在模板内部 `fetch`；
  2) 用全局 Store 存放业务列表详情；
  3) 页面之间通过临时变量共享状态；
  4) T4 每步直接调用后端“最终过账”接口。

### 目标文件（绝对路径）
- `/Users/haoqi/OnePersonCompany/miniERP/apps/web/src/features/templates/t1-overview-layout.tsx`
- `/Users/haoqi/OnePersonCompany/miniERP/apps/web/src/features/templates/t2-workbench-layout.tsx`
- `/Users/haoqi/OnePersonCompany/miniERP/apps/web/src/features/templates/t3-detail-layout.tsx`
- `/Users/haoqi/OnePersonCompany/miniERP/apps/web/src/features/templates/t4-wizard-layout.tsx`
- `/Users/haoqi/OnePersonCompany/miniERP/apps/web/src/features/templates/contracts.ts`
- `/Users/haoqi/OnePersonCompany/miniERP/apps/web/src/features/inventory/hooks/use-inventory-workbench-vm.ts`
- `/Users/haoqi/OnePersonCompany/miniERP/apps/web/src/features/purchasing/hooks/use-grn-wizard-vm.ts`
- `/Users/haoqi/OnePersonCompany/miniERP/apps/web/src/app/(dashboard)/purchasing/grn/new/page.tsx`
- `/Users/haoqi/OnePersonCompany/miniERP/apps/web/src/lib/query/query-client.ts`

```ts
// contracts.ts（示意）
export interface T2WorkbenchVM<T> {
  title: string;
  filters: {
    keyword: string;
    chips: ReadonlyArray<{ key: string; label: string; value: string }>;
    onChange: (next: Readonly<Record<string, string>>) => void;
  };
  table: {
    rows: ReadonlyArray<T>;
    total: number;
    page: number;
    pageSize: number;
    loading: boolean;
    onPageChange: (page: number) => void;
    onSortChange: (sort: string) => void;
  };
}
```

## Alternatives

### 替代方案对比表格

| 方案 | 描述 | 优点 | 缺点 | 结论 |
|---|---|---|---|---|
| A. 每页独立开发 | 每个页面自行定义布局与状态 | 初期上手快 | 长期碎片化、复用低、维护高 | 不推荐 |
| B. 大一统全局 Store | 所有状态进全局状态库 | 调试表面统一 | 污染严重、回收困难、并发与缓存冲突 | 不推荐 |
| C. 模板化 + 分层状态（本 ADR） | 模板纯展示 + VM Hook + Query/RHF/URL 分层 | 可复用、可测、可扩展、与设计一致 | 需要前期规范投入 | 推荐 |
| D. 低代码配置全驱动 | 页面主要由 JSON Schema 渲染 | 快速铺页面 | 复杂交互与性能调优困难 | 当前阶段不推荐 |

## Consequences

### Positive
- 页面开发从“造页面”变为“装配模板”，交付速度提升。
- 设计一致性可控，减少 UI 漂移与返工。
- 状态来源清晰，调试路径可预测，Bug 定位更快。
- 为 46 页持续扩展提供稳定骨架。

### Negative
- 初期需要重构部分已有页面到标准模板契约。
- 团队需学习并遵守 VM 接口与状态分层规则。
- 某些特例页面需要通过“受控扩展点”实现，灵活性受限。

## Implementation Plan

### Phase 1（规范落地）
1. 定义模板契约 `contracts.ts` 与四类模板骨架组件。
2. 建立 ESLint/Code Review 规则：禁止模板组件内直接调用 API。
3. 完成 4 个代表页改造：`/skus`, `/skus/:id`, `/purchasing/grn/new`, `/reports`。

### Phase 2（批量迁移）
1. 按路由清单将剩余页面映射到 T1/T2/T3/T4。
2. 统一 URL 参数解析与序列化工具。
3. T4 引入草稿持久化（服务端草稿 API + 本地恢复）。

### Phase 3（治理与优化）
1. 建立模板覆盖率看板（页面是否使用标准模板）。
2. 建立状态反模式扫描（全局 Store 误用、重复缓存）。
3. 发布开发手册与脚手架（生成 Page Container + VM Hook）。

## Validation

### 架构合规验证
- 模板组件文件中 `fetch/axios` 调用为 0。
- T2 页面筛选/分页/排序 URL 化覆盖率 100%。
- T4 页面提交动作统一经 `submitActionsVM`，无步骤内直接过账。

### 质量指标（建议门槛）
- 页面模板复用率 >= 90%。
- 新增页面平均开发时长较基线下降 >= 30%。
- 状态相关回归缺陷（筛选丢失、分页错乱）下降 >= 50%。

### 测试策略
- 单元测试：VM Hook（参数 -> Query key -> ViewModel 输出）。
- 组件测试：模板 slot 渲染与交互回调。
- E2E：T2 列表筛选 URL 回放、T4 草稿恢复与过账流程。

## Risks

| 风险 | 说明 | 缓解措施 |
|---|---|---|
| 规范执行走样 | 页面开发绕过模板 | PR 模板检查 + lint 规则 + 架构评审门禁 |
| 过度抽象 | 模板 API 过复杂影响效率 | 保持最小必需接口，按季度审查契约 |
| 迁移期间双轨成本 | 老页面与新规范并存 | 设定迁移截止里程碑与模块优先级 |
| URL 状态复杂 | 过滤条件多导致参数膨胀 | 参数白名单 + 压缩编码策略（必要时） |

## Open Questions
1. 是否引入统一“页面装配 DSL”以进一步减少重复路由样板代码？
2. T4 草稿恢复是否需要跨设备同步（仅服务端草稿）？
3. 报表类（T1/T2 混合）是否单独定义 `T2-ReportVariant` 契约？
4. 移动端 `/scan` 是否纳入 T4 的受控子模板，还是保持独立移动模板？
5. 是否在 CI 中加入“模板合规扫描”作为必过检查？
