# 设计文档错误设计分析（Zoe + Codex 联合分析）

> **分析日期**：2026-03-11
> **分析者**：Zoe-miniERP + Codex
> **目的**：分析技术设计文档本身存在的错误设计，导致实现偏离

---

## 核心发现

**文档本身就是问题的源头**。

不仅是"治理晚于实现"，而是**文档本身的指导思想就是错误的**，直接引导 agent 走向错误实现。

---

## 1. designs/ui/minierp_page_spec.md 的错误设计

### 1.1 错误点 1：把 family 定义成"模板"而非"骨架"

**原文（第 3 行）**：
```
## A. 通用页面模板（4 种布局）

### T1) 概览页模板 OverviewLayout
### T2) 列表工作台模板 WorkbenchLayout
### T3) 详情页模板 DetailLayout
### T4) 过账工作流模板 WizardLayout
```

**问题**（Codex 分析）：
- ❌ 用词是"**模板**"而不是"**骨架约束**"
- ❌ 把搜索框、工具条、抽屉、批量浮条、Tab、右侧快捷区这些具体 UI 结构写成"模板固件"
- ❌ 暗示 agent 可以先选模板，再往模板里填字段

**导致的错误实现**：
- agent 创建 `erp-page-assemblies.tsx` 作为"模板生产工厂"
- 用配置驱动页面生成，而不是逐页实现设计稿
- T2 的 toolbar + drawer + bulk bar 绑定成默认结构（15-23 行），鼓励做万能 workbench

**Codex 原话**：
> "minierp_page_spec.md:3 直接写了 OverviewLayout / WorkbenchLayout / DetailLayout / WizardLayout，并把搜索框、工具条、抽屉、批量浮条、Tab、右侧快捷区这些具体 UI 结构写成'模板固件'。这会让 agent 合理地认为：先选模板，再往模板里填字段。"

### 1.2 错误点 2：把路由表当成"批量生成计划"

**原文（43-87 行）**：
```
| `/skus` | T2 |
| `/purchasing/po` | T2 |
| `/sales/so` | T2 |
...
```

**问题**（Codex 分析）：
- ❌ 对每个路由直接标注 T1/T2/T3/T4
- ❌ 语义上更像"批量生成计划"而不是"设计归类"
- ❌ 暗示 agent 可以按模板批量生成页面

**Codex 原话**：
> "这份页面规格还把'route -> 模板'当成一张分发表。43-87 行对每个路由直接标注 T1/T2/T3/T4，语义上更像'批量生成计划'而不是'设计归类'。所以'模板 vs 骨架'的混淆不是隐性的，是文档主结构本身造成的。答案是：它确实暗示 agent 可以按模板批量生成页面。"

---

## 2. designs/ui/miniERP_design_summary.md 的错误设计

### 2.1 错误点 1："模板覆盖率 100%" 误导

**原文（25-36 行）**：
```
## 六种布局模板全部覆盖 ✅

| 布局 | 已实现页面 | 核心特征 |
|------|-----------|----------| 
| **T1 概览页** | `/ 工作台首页` · `/skus/overview` ... | ... |
...
```

**原文（287-299 行）**：
```
**模板覆盖率** | **100%**（所有布局类型均已有代表实现）
```

**问题**（Codex 分析）：
- ❌ 用"✅"标记"已覆盖"，暗示模板比设计稿重要
- ❌ 没有明确"模板覆盖 ≠ 页面完成"
- ❌ 暗示 agent 可以"套模板"就完成页面

**Codex 原话**：
> "designs/ui/miniERP_design_summary.md 的错误更强。它在 25-36 行写'六种布局模板全部覆盖'，在 287-299 行写'模板覆盖率 100%''剩余 24 页都是换数据+换字段，直接套用母版组件即可'。这会把'设计稿复刻'降级成'母版覆盖率'，等于告诉实现者：设计稿已经不重要了，只要模板齐了，剩下页面都是机械复用。"

### 2.2 错误点 2："换数据+换字段" 的错误复用策略

**原文**：
```
> [!TIP]
> 6 种布局模板均已有代表性实现。剩余 24 页都是"换数据+换字段"的复用变体，开发时直接套用对应母版组件即可。
```

**问题**（Codex + Zoe 联合分析）：
- ❌ 暗示"换数据+换字段"就够了
- ❌ 忽略页面差异：信息密度、交互节奏、是否需要搜索、是否有 drawer、是否有批量操作、是否需要 URL state、是否存在凭证入口、是否允许 mock 降级、状态语义是否一致
- ❌ 复用发生在"整页母版"，而不是 primitives/shells/局部业务块

**Codex 原话**：
> "'换数据+换字段'的复用策略本身是不正确的，至少不能用于 page-level。页面差异不只在字段，还在信息密度、交互节奏、是否需要搜索、是否有 drawer、是否有批量操作、是否需要 URL state、是否存在凭证入口、是否允许 mock 降级、状态语义是否一致。复用可以发生在 primitives/shells/局部业务块，但不能发生在'整页母版'。"

---

## 3. AGENTS.md / CLAW.md 的错误设计（重置前）

### 3.1 错误点 1：缺少明确的"完成标准"

**原文（AGENTS.md）**：
```
默认策略：
- 已有设计稿映射的正式页面，优先实现 page-level view。
- 只复用 primitives / shells / 局部业务块，不要新造一次性大模板，也不要复活万能 assembly。
```

**问题**（Codex + Zoe 联合分析）：
- ❌ 没有定义什么是"实现 page-level view"
- ❌ 没有明确"完成"的标准
- ❌ 没有可检查的检查点
- ❌ 缺少页面状态机（placeholder / legacy-assembly / page-view / verified / production）

**Codex 原话**：
> "重置前的 AGENTS.md / CLAW.md，我按 fad2166 前一版，也就是 c7c0922 时点做了对比。那一版确实缺少明确完成标准和页面状态机。旧 AGENTS.md 只有架构要点和工程红线，没有 placeholder / legacy-assembly / page-view / verified / production 这套状态，也没有'五项完成标准'；旧 CLAW.md 同样没有。结果就是：只要路由能打开、或 page-level view 已经切出来，就很容易被口头算作'完成'。"

### 3.2 错误点 2：没有彻底切断旧模板语义

**原文（.claude/rules/erp-rules.md 标题）**：
```
## 模板系统
```

**原文（openspec/config.yaml:18）**：
```
Reuse T1-T4 template system
```

**问题**（Codex 分析）：
- ❌ 规则文件标题还是"模板系统"
- ❌ openspec/config.yaml 也把 T1-T4 写成"template system"
- ❌ 错误设计不仅在设计稿文档里，还进入了 spec/proposal 生成链路
- ❌ 会持续放大偏差

**Codex 原话**：
> "更深一层的问题是，旧治理文档虽然开始说'family 只约束骨架'，但没有彻底切断旧模板语义。比如当前仍能看到 openspec/config.yaml:18 写着 Reuse T1-T4 template system，而重置前规则文件标题也还是'模板系统'。这说明错误设计不仅在设计稿文档里，还进入了 spec/proposal 生成链路，会持续放大偏差。"

---

## 4. docs/plans/2026-03-07-erp-page-reconstruction-design.md 的问题

### 4.1 错误点 1：为什么在 03-07 才提出"停止万能装配器"？

**原文（20-32 行）**：
```
当前运行时大量 dashboard 页面并不是按 pencil 设计稿逐页实现，而是：

- route 直接转发到 `settings/master-data` 或 placeholder
- 或通过旧 assembly / template config 生成"像模板"的页面
- 页面中出现了设计稿没有的 tab rail、toolbar、drawer、bulk bar、表单卡等结构
```

**问题**（Zoe 分析）：
- ❌ 说明之前的文档本身就允许万能装配器
- ❌ 说明之前的文档没有明确"禁止万能装配器"
- ❌ 说明之前的文档没有可执行的约束

**Codex 原话**：
> "3 月 7 日的纠偏文档已经直接承认旧路径会长出设计稿里没有的 tab rail / toolbar / drawer / bulk bar，docs/plans/2026-03-07-erp-page-reconstruction-design.md:20 到 32 就是在点这个根因。"

---

## 5. 文档与实现的因果关系

### 5.1 文档的哪些表述直接导致了错误实现？

| 文档 | 表述 | 错误理解 | 错误实现 |
|------|------|----------|----------|
| minierp_page_spec.md:3 | "通用页面模板（4 种布局）" | 模板系统 | erp-page-assemblies.tsx |
| minierp_page_spec.md:43-87 | "route -> 模板"分发表 | 批量生成计划 | RoutePlaceholderPage |
| miniERP_design_summary.md:25-36 | "六种布局模板全部覆盖 ✅" | 模板覆盖=完成 | 满足于模板套用 |
| miniERP_design_summary.md:287-299 | "模板覆盖率 100%" | 模板优先 | 不复刻设计稿 |
| miniERP_design_summary.md:TIP | "换数据+换字段的复用变体" | 只需换数据 | 万能母版复用 |
| AGENTS.md（旧版） | "优先实现 page-level view" | 文件存在=完成 | 空壳页面 |
| CLAW.md（旧版） | "family 治理" | family=模板 | family-variants |
| erp-rules.md（旧版标题） | "模板系统" | 模板是正确的 | 持续误导 |
| openspec/config.yaml:18 | "Reuse T1-T4 template system" | 生成链路继续走模板 | proposal 自动偏差 |

### 5.2 错误设计如何导致实现偏离？

**因果链**（Codex 分析）：

1. **minierp_page_spec.md** 把 T1-T4 定义成"模板" →
2. agent 创建 `erp-page-assemblies.tsx` 作为"模板工厂" →
3. **miniERP_design_summary.md** 说"模板覆盖率 100%" →
4. agent 满足于"套模板"，不复刻设计稿 →
5. **AGENTS.md/CLAW.md** 缺少完成标准 →
6. agent 把"路由可访问"当成"完成" →
7. **openspec/config.yaml** 写"Reuse template system" →
8. 新 proposal 自动继续走模板复用 →
9. **持续放大偏差**

### 5.3 哪些重要约束缺失？

| 缺失的约束 | 导致的问题 |
|-----------|-----------|
| 页面状态定义 | 路由可访问=完成 |
| 完成标准（5 项） | 文件存在=完成 |
| 禁止假完成清单 | re-export、placeholder、静态 mock |
| 时间窗口 | "后续再补充"无期限 |
| 可检查性 | 文档说了但不检查 |

---

## 6. 已修复情况

### 6.1 当前纠偏后的改进

**Codex 原话**：
> "当前文档已经在纠偏，方向是对的。最关键的修正点都在 CLAUDE.md:124 到 150：family 明确定义为骨架，不是模板系统；完成口径改成显式状态机；并行开发前先冻结共享接口。这三件事，正好对冲了旧文档的三大错误。"

**已修复**：
1. ✅ CLAUDE.md:124-150 - family 明确定义为骨架，不是模板
2. ✅ CLAUDE.md:71-114 - 完成口径改成显式状态机（5 状态 + 5 项标准）
3. ✅ CLAUDE.md:124-150 - 并行开发前先冻结共享接口

### 6.2 还需修复的

**Codex 原话**：
> "如果你要我继续，我下一步可以直接给你出一份'错误设计清单'，按'错误事实 / 误导机制 / 已修复情况 / 还需补的文档改动'四列整理成可落库的复盘文档。"

**待修复**：
1. ⚠️ openspec/config.yaml - 仍然写着"Reuse T1-T4 template system"
2. ⚠️ designs/ui/minierp_page_spec.md - 仍然使用"模板"措辞
3. ⚠️ designs/ui/miniERP_design_summary.md - 仍然强调"模板覆盖率"

---

## 7. 总结

### 7.1 根本问题

**文档本身就是按照"模板系统"的思想设计的**，而不是按照"骨架约束 + 设计稿复刻"的思想。

### 7.2 三大错误

1. **把 family 定义成模板**，而不是骨架约束
2. **缺少完成标准**，让"路由可访问"被当成"完成"
3. **没有彻底切断旧模板语义**，错误设计进入生成链路

### 7.3 教训

1. **文档的第一性原理**：文档的目的是指导开发，防止偏离
2. **用词必须精确**："模板" vs "骨架"会引导完全不同的实现
3. **约束必须可检查**：所有约束必须可以通过 CI/脚本检查
4. **文档必须先于代码**：从第一天开始就要有正确的约束
5. **切断旧语义**：纠偏时必须彻底修改所有文档，包括生成链路

---

## 8. 后续行动

### 8.1 立即修复

- [ ] 修改 openspec/config.yaml，把"template system"改成"family governance"
- [ ] 修改 designs/ui/minierp_page_spec.md，把"模板"改成"骨架约束"
- [ ] 修改 designs/ui/miniERP_design_summary.md，删除"模板覆盖率"强调

### 8.2 中期行动

- [ ] 建立文档审查机制，新文档必须经过审查
- [ ] 建立"禁止用词"清单（如"模板"、"万能装配器"等）
- [ ] 建立 CI 门禁，检查文档是否使用禁止用词

### 8.3 长期行动

- [ ] 定期复盘文档质量
- [ ] 持续优化文档结构
- [ ] 建立文档测试机制（如可检查性测试）

---

*此分析由 Zoe-miniERP 和 Codex 联合完成，2026-03-11。*
