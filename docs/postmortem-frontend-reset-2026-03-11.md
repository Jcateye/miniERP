# miniERP 前端页面失控复盘

日期：2026-03-11  
范围：`apps/web/src/app`、`apps/web/src/components`、治理文档与相关 Git 历史  
结论口径：本报告基于当前工作树 + Git 历史回放；由于 `2026-03-11` 已发生大规模裁剪提交，历史证据优先于 HEAD 现状。

## 一、结论摘要

这次前端页面失控，不是单一提交导致的，而是 2026-03-02 到 2026-03-11 之间连续几次错误抽象叠加的结果：

1. 先用“模板/装配器优先”批量铺页面，再试图切回“设计稿优先 + page-level view”，方向发生了二次反转。
2. `WorkbenchAssembly` / `OverviewAssembly` 不只是 UI 骨架，还吞掉了数据编排、凭证、命令动作，形成高耦合中心。
3. 大量路由在 `2026-03-07` 之后仍然是 `re-export settings/master-data` 或 `RoutePlaceholderPage`，表面进入 T1-T4，实际没有独立页面实现。
4. family 治理文档和工程红线是后加的，不是先验门禁；治理写进文档时，页面扩张和模板固化已经发生。
5. 多 agent 并行开发时，共享热点文件没有先冻结接口，导致“共享壳层不断改、页面不断重做、最后只能物理裁剪 reset”。

一句话总结：根因不是“页面太多”，而是“错误的抽象层在页面增长初期被确立，并在治理落地前被快速复制到大量路由上”。

## 二、时间线

| 日期 | 提交 | 事件 | 影响 |
| --- | --- | --- | --- |
| 2026-03-02 | `bcde51d` | 从设计图生成首批前端页面代码 | 以页面生成物为起点，尚未建立 family 治理或 page-level view 约束 |
| 2026-03-03 | `323a3c4` | `complete stage1 frontend integration gate` | 引入 `erp-page-assemblies.tsx`、`erp-page-config.tsx`、四类 layout，模板系统正式成为主路径 |
| 2026-03-05 | `cd25993` | “复刻 .pen 设计稿全部26个页面” | dashboard 页面数迅速扩张到约 43，视觉覆盖快于架构收敛 |
| 2026-03-05 | `f9c0c1e` | “rewire 26-page visual routes as primary navigation” | 模板页从示例变为主导航入口，技术债被提升为正式运行路径 |
| 2026-03-06 | `ced3b60` | `realign settings master-data and SKU workbenches` | `settings/master-data/page.tsx`、`skus/page.tsx` 成为高 churn 中心，页面语义继续模板化 |
| 2026-03-06 | `bdd64da` | `docs(governance): add engineering redlines and inventory roadmap` | 工程红线首次进入治理文档，但晚于模板体系铺开 |
| 2026-03-07 | `8d02c57` | `reshape ERP IA and tighten BFF contracts` | 路由规模冲到约 113 个 dashboard 页面，但其中大量是 placeholder / re-export，不是真实页面 |
| 2026-03-07 | `016e78c` / `3073979` | 补 ERP 页面重构计划与治理说明 | 文档开始明确“停止万能装配器、回到设计稿驱动” |
| 2026-03-07 ~ 2026-03-10 | `c500d6d` / `192703e` / `1873f5d` / `76e045b` / `0d57c62` | 多批次 route-by-route 重构 | 开始从 placeholder / assembly 回切 page-level 页面，但属于补救，不是起始架构 |
| 2026-03-10 | `c2f944d` | `docs(erp): sync reconstruction design closeout` | 文档宣告 37 页复刻完成，但治理和实际代码仍存在混合态 |
| 2026-03-11 | `4af3006` | `implement secondary navigation and enhance primary route matching` | 在治理要求收敛时，又新增 secondary nav 和 family variants，继续扩大抽象层 |
| 2026-03-11 | `c7c0922` | `prune dashboard pages to workspace items and reports` | 直接物理裁剪大量页面，说明前一阶段的页面规模和结构已难以持续维护 |

## 三、Git 历史分析

### 3.1 规模变化

按关键提交回放，`apps/web/src/app` 下页面规模变化如下：

| 提交 | 总页面数 | dashboard 页面数 | 特征 |
| --- | ---: | ---: | --- |
| `bcde51d` | 6 | 4 | 初始生成 |
| `cd25993` | 48 | 43 | 26 页视觉扩张 |
| `ced3b60` | 51 | 45 | settings / SKU 模板进一步复杂化 |
| `8d02c57` | 119 | 113 | IA 大扩张，含大量 placeholder / alias |
| `c7c0922` | 4 | 4 | reset 式裁剪 |

这不是正常的“稳定增长”，而是典型的“先爆炸式扩张，再硬裁剪回撤”。

### 3.2 热点文件

前端历史中修改次数最高的文件包括：

- `apps/web/src/components/layout/sidebar.tsx`：11 次
- `apps/web/src/app/(dashboard)/skus/page.tsx`：10 次
- `apps/web/src/app/(dashboard)/settings/master-data/page.tsx`：7 次
- `apps/web/src/components/business/erp-page-assemblies.tsx`：6 次
- `apps/web/src/app/(dashboard)/page.tsx`：6 次

这说明 churn 不是平均分布在各页面，而是集中在“共享壳层 + 万能模板入口 + 少数样板页”。这类热点一旦失控，会把局部需求放大成全局重构。

### 3.3 多作者并行

在 `apps/web/src/app` / `apps/web/src/components` 历史上，主要作者提交数为：

- `xuxunjian`：13
- `Jcateye`：7
- `haoqi`：6

并行本身不是问题，问题是并行修改高度集中在共享文件，而不是严格按 route 隔离。

## 四、架构演进复盘

### 4.1 第一阶段：family 被实现成模板系统，不是治理壳层

`2026-03-03` 的 `323a3c4` 引入：

- `apps/web/src/components/business/erp-page-assemblies.tsx`
- `apps/web/src/components/business/erp-page-config.tsx`
- `apps/web/src/components/layouts/overview-layout.tsx`
- `apps/web/src/components/layouts/workbench-layout.tsx`
- `apps/web/src/components/layouts/detail-layout.tsx`
- `apps/web/src/components/layouts/wizard-layout.tsx`

从 `erp-page-config.tsx` 看，family 不是轻量壳层，而是携带：

- family
- readiness
- header
- filters
- slots
- metrics
- steps

再由 `erp-page-assemblies.tsx` 统一渲染。

问题在于：family 在这里不是“约束骨架”，而是“生产页面的模板 DSL”。

### 4.2 第二阶段：assembly 吞掉数据编排，变成高耦合中心

`erp-page-assemblies.tsx` 在 `8d02c57` 仍直接依赖：

- `useWorkbenchList`
- `useBffGet`
- `useDocumentDetail`
- `useDocumentEvidence`
- `useLineEvidence`
- `createDocument`
- `submitDocumentCommand`
- `attachEvidence`

也就是说，这个文件同时承担：

- family 结构渲染
- 列表数据获取
- 明细数据获取
- 过账命令
- 凭证上传与关联
- URL 状态处理

这已经不是“可复用 UI 组件”，而是“跨域业务编排中心”。一旦中心抽象不对，所有页面一起偏。

### 4.3 第三阶段：用 placeholder 和 re-export 扩充 IA，制造了“假完成”

`8d02c57` 是失控加速点。

在该提交中：

- `apps/web/src/app/(dashboard)/mdm/customers/page.tsx` 直接 `export { default } from '@/app/(dashboard)/settings/master-data/page'`
- `apps/web/src/app/(dashboard)/mdm/warehouses/page.tsx` 同样 re-export 到 `settings/master-data/page`
- `apps/web/src/app/(dashboard)/finance/receipts/page.tsx` 使用 `RoutePlaceholderPage`

这意味着：

- 路由数量增加了
- 导航可访问了
- family 名字也挂上了

但并没有形成独立页面实现。

这类“假完成”会让路线图看起来推进很快，实际上把未完成工作隐藏到了共享模板和 placeholder 里。

### 4.4 第四阶段：试图用 page-level route batch 反向修复

`2026-03-07` 之后，`c500d6d`、`1873f5d`、`76e045b` 开始把页面拆回：

- `*-page.ts`
- `*-page-view.tsx`
- `use-*-page-vm.ts`

这是正确方向，但属于补救动作，因为：

- 旧 assembly 体系还在
- placeholder 还在
- `settings/master-data` 等共享样板仍在被复用
- 文档治理刚刚写清，代码尚未整体迁出

另外，治理文档要求的目标目录：

- `apps/web/src/components/views/erp/`
- `apps/web/src/components/shells/erp/`
- `apps/web/src/components/primitives/erp/`

在实际历史里并没有成为稳定主路径：

- `views/erp`、`primitives/erp` 基本没有形成真实实现沉淀
- `shells/erp` 直到 `2026-03-10/11` 才短暂出现，内容主要是 `family-variants`，而不是可消费的正式 shells

这说明“目标架构已经说清”与“目标架构已经执行”之间存在明显落差。

### 4.5 第五阶段：family variants 重新长出第二层 taxonomy

`2026-03-11` 的 `4af3006` 新增：

- `apps/web/src/components/shells/erp/family-variants.ts`
- `TemplateFamilyVariant`

其中包含：

- T2：`simple-list` / `search-list` / `filter-list` / `action-list` / `tree-list`
- T3：`record-detail` / `document-detail` / `masterdata-detail` / `tabbed-detail`
- T4：`linear-wizard` / `posting-flow` / `review-submit` / `evidence-flow`

这没有字面上创建“第 5 种 family”，但实质上又长出一层新的模板分类法。它会带来两个问题：

1. family 的边界再次模糊，从“骨架治理”回到“模板谱系”。
2. 未来页面实现会围绕 variant 命名，而不是围绕设计稿节点和业务页面本身。

## 五、规则遵守检查

### 5.1 明确偏离或违反的点

#### 红线 3：正式页面必须复刻 mapped pencil 设计稿

存在明确偏离。

证据：

- `mdm/customers`、`mdm/warehouses` 在 `8d02c57` 仍直接复用 `settings/master-data/page.tsx`
- `finance/receipts` 在 `8d02c57` 仍是 placeholder
- `mdm/items/page.tsx` 在 `76e045b` 和当前裁剪后的 `c7c0922` 中仍保留 filter chips、preview panel、toolbar 等模板痕迹

结论：大量“正式路由”在相当长一段时间并不是按设计稿独立实现。

#### 红线 13 / 14：禁止新的万能页面装配器；WorkbenchAssembly / OverviewAssembly 仅允许 legacy fallback

存在明确偏离。

证据：

- `erp-page-assemblies.tsx` 从 `2026-03-03` 起就是主实现中心
- `f9c0c1e` 将 26 页视觉 routes 接入 primary navigation
- `4af3006` 时仍有大量 route 直接引用 `WorkbenchAssembly` / `OverviewAssembly` / `DetailAssembly` / `WizardAssembly`

结论：在治理文件明确之前，assembly 不是 fallback，而是主路径；在治理文件明确之后，也未立即退居 legacy。

#### 红线 5：页面/壳组件禁止直连 API；页面只通过 VM Hook + BFF

没有发现页面直接绕过 BFF 访问 backend 的证据，但存在“通用业务组件吞掉 VM/数据编排”的问题。

证据：

- 页面层没有发现直接使用 `NEXT_PUBLIC_API_BASE_URL` 或 backend URL 的代码
- 但 `erp-page-assemblies.tsx` 直接调用 hooks 和 BFF actions，导致页面数据组织不再由 page-local VM 掌控

结论：不是“绕过 BFF”，而是“绕过 page-local VM 边界”。

#### 红线 4：列表页筛选/排序/分页必须 URL 化

只有部分页面做到，且治理不一致。

证据：

- `erp-page-assemblies.tsx` 对 inventory workbench 做了 URL state
- 但很多 list page 在重构初期仍是静态表格或本地 state
- `RoutePlaceholderPage` 只是文案提示“应当 URL 化”，并不提供真实行为

结论：这条规则在文档中存在，但在页面批量生成阶段没有被作为统一门禁。

### 5.2 未发现的违规

就本次抽样和检索结果看，未发现 dashboard 页面直接绕过 `/api/bff/*` 去请求 backend 的明确证据。问题核心不在 BFF 绕过，而在模板治理失真。

## 六、文档漂移检查

### 6.1 四文档当前状态

`CLAUDE.md`、`AGENTS.md`、`README.md`、`CLAW.md` 在当前 HEAD 基本一致，核心事实对齐：

- T1/T2/T3/T4 定义一致
- family 只约束骨架，不约束具体 UI
- `WorkbenchAssembly` / `OverviewAssembly` 为 legacy/fallback only
- 页面必须通过 BFF
- 并行协作需同步更新四文档与 `.claude/rules/erp-rules.md`

结论：四文档“现在是同步的”。

### 6.2 真正的问题：治理同步发生得太晚

相关文档提交时间：

- `2026-03-04`：四文档开始进入整体对齐阶段
- `2026-03-06`：`docs(governance): add engineering redlines and inventory roadmap`
- `2026-03-07`：ERP 页面重构设计与实施计划落地

而模板体系和页面大扩张在此之前已经发生：

- `2026-03-03`：assembly 成为主路径
- `2026-03-05`：26 页视觉路由接入 primary navigation

结论：文档没有长期漂移，但治理滞后于实现，这是更关键的问题。

### 6.3 外围文档仍存在语义冲突

虽然四文档已对齐，但以下历史文档仍保留旧语义：

- `designs/ui/minierp_page_spec.md` 仍使用 `OverviewLayout / WorkbenchLayout / DetailLayout / WizardLayout` 的旧模板定义
- `designs/ui/miniERP_design_summary.md` 明确写出“六种布局模板全部覆盖”

这会造成认知冲突：

- 一边说 family 只是骨架
- 一边又保留“模板覆盖页面”的设计叙述

这类外围文档漂移，容易让 agent 继续沿模板系统解释需求。

## 七、Agent 协作复盘

### 7.1 并行开发的正反面

正面：

- `2026-03-07` 到 `2026-03-10` 的 route-by-route 重构推进速度很快
- 文档、实现、页面映射在这几天明显收敛

负面：

- 共享热点文件没有先冻结接口
- 共享导航、共享模板、共享样板页被多人连续修改
- 文档治理与代码治理没有形成“先规则后并行”的顺序

### 7.2 漂移证据

并行期间出现了典型的“同一周内同时扩张和收敛”：

- `8d02c57`：大规模扩张 IA + placeholder
- `c500d6d` / `1873f5d` / `76e045b`：route-by-route 纠偏
- `4af3006`：新增 secondary nav + family variants
- `c7c0922`：直接 prune 大部分 dashboard 页面

这说明协作不是沿单一迁移路线推进，而是多个方向同时存在：

- 扩张导航面
- 修正 page-level 实现
- 保留模板 legacy
- 引入新 variant 语义
- 最后裁剪重置

如果迁移策略是稳定的，不会在 24 小时内同时出现“增加抽象层”和“物理裁剪绝大多数页面”。

### 7.3 协作层面的根因

1. 没有前置冻结“共享层改动窗口”
2. 没有在并行前冻结 route inventory 与页面状态台账
3. 没有把 `legacy / placeholder / reconstructed / verified` 做成统一状态机
4. 没有把文档同步要求变成 PR gate 或 CI gate

## 八、失控信号

以下信号在当时已经足以判断前端进入失控区：

1. 页面数从 4 个 dashboard 页面在 5 天内膨胀到约 113 个。
2. `settings/master-data/page.tsx` 被复用为多个不同业务路由的主实现。
3. `RoutePlaceholderPage` 被大面积用于正式 IA 路由。
4. `erp-page-assemblies.tsx` 同时处理 family、数据、命令、凭证，职责严重过载。
5. `TemplateFamilyVariant` 在治理要求收敛后继续增长模板分类。
6. `sidebar.tsx`、`skus/page.tsx`、`settings/master-data/page.tsx` 等共享入口成为高 churn 热点。
7. 最终通过 `c7c0922` 物理裁剪页面，而不是平滑迁移下线。

## 九、根因分析

### 根因 1：把 family 误做成“页面生成系统”

正确含义应该是：

- family 约束骨架
- 页面实现仍以设计稿和页面本身为中心

实际做法却变成：

- family + config + assembly = 页面生产线

这是最根本的偏差。

### 根因 2：共享装配器承担了业务编排职责

当 `erp-page-assemblies.tsx` 既管 UI 又管数据和命令时，任何业务差异都会推高共享层复杂度。复杂度一旦进入共享层，就会反向污染所有页面。

### 根因 3：治理晚于实现

2026-03-06/07 才明确写出红线和重构路线，但 2026-03-03 到 2026-03-05 已经把模板路径做成主路径。后续所有“重构”都在修前面已经放大的债。

### 根因 4：并行开发没有先冻结共享接口

并行拆 route 是对的，但必须先冻结：

- 导航结构
- family 定义
- legacy 范围
- primitives/shells 接口

仓库实际情况是这些共享层仍在持续变化，导致各 agent 不在同一条轨道上。

### 根因 5：完成口径被“路由可访问”误导

路由可访问、导航可点开、页面有壳，不等于页面完成。`re-export` 和 `placeholder` 让完成率被系统性高估。

## 十、预防措施

### 10.1 立即措施

1. 建立页面状态台账，状态只能是：`placeholder`、`legacy-assembly`、`re-export`、`page-view`、`verified`。
2. 正式页面禁止使用 `RoutePlaceholderPage`；占位页只能存在于显式 allowlist。
3. 正式页面禁止 re-export 到其他业务路由的 `page.tsx`。
4. `WorkbenchAssembly` / `OverviewAssembly` 使用点必须收敛到 legacy allowlist，并在 CI 中做 grep 检查。

### 10.2 架构措施

1. 删除或冻结 `TemplateFamilyVariant`，除非先有真实 shell 实现和设计映射。
2. family contract 仅保留骨架描述，不再承载页面级数据契约和业务动作。
3. 所有正式页面必须具备 page-local VM 或 page-level view model，数据入口只通过该层组织。
4. 导航和页面映射分离管理，禁止“导航先开、页面后补”。

### 10.3 流程措施

1. 涉及 family、legacy 范围、导航、红线的改动，必须要求文档和实现同 PR。
2. 多 agent 并行前先冻结共享接口，按 route 分配 owner。
3. 引入设计一致性 gate：
   - 禁止正式页面出现设计稿未映射的 rail / drawer / bulk bar / form card
   - 禁止正式列表页复用无关领域的 page.tsx
4. 引入历史债可视化：
   - 每日输出 `placeholder` / `legacy-assembly` / `verified` 页面数量
   - 不允许“总页面数增长，verified 页面数不增长”

## 十一、最终判断

miniERP 前端页面失控的根本原因，不是单纯“页面太多”或“agent 太多”，而是：

- 在页面快速增长阶段，把 family 错误实现成模板生产体系；
- 让通用 assembly 承担了页面编排中心职责；
- 又在治理规则正式落地之前，把这套体系推广成主导航和主路由；
- 并行协作时没有先冻结共享层，导致扩张、纠偏、再抽象、再裁剪同时发生。

因此，`2026-03-11` 的 reset 本质上是一次迟到的架构止损。
