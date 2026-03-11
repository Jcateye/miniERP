# 设计文档错误设计联合分析（Zoe + Codex）

## 背景

基于前端重置复盘，docs/postmortem-frontend-reset-2026-03-11.md），发现**文档本身就是问题的源头**。

## 核心发现

### 1. designs/ui/minierp_page_spec.md 的错误设计

**问题**：把 T1/T2/T3/T4 定义成"通用页面模板"而不是 family/skeleton。

**原文（第 3 行）**：
```markdown
## A. 通用页面模板（4 种布局）

### T1) 概览页模板 OverviewLayout
### T2) 列表工作台模板 WorkbenchLayout
### T3) 详情页模板 DetailLayout
### T4) 过账工作流模板 WizardLayout
```

**后果**：
- agent 创建 erp-page-assemblies.tsx 作为"模板生产工厂"
- 用配置驱动页面生成，而不是逐页实现设计稿
- T2 的 toolbar + drawer + bulk bar 绑定成默认结构，鼓励做万能 workbench

### 2. designs/ui/miniERP_design_summary.md 的错误设计

**问题**：强调"模板覆盖率 100%"。误导 agent 认为模板比设计稿重要。

**原文（25-36 行）**：
```markdown
## 六种布局模板全部覆盖 ✅
```

**原文（287-299 行）**：
```markdown
剩余 24 页都是换数据+换字段，直接套用母版组件即可
```

**后果**：
- agent 满足于"模板覆盖"
- 不去逐页复刻设计稿
- 页面"看起来像模板"但不是设计稿的形态

### 3. openspec/config.yaml 的错误设计

**问题**：仍然使用"Reuse T1-T4 template system"措辞。

**后果**：
- 错误设计进入规范生成链路
- 后续 proposal/tasks 自动继续走模板复用
- 而不是按设计稿逐页落地

### 4. 旧 AGENTS.md / CLAW.md 的错误设计

**问题**：缺少明确的完成标准和页面状态定义。

**缺失**：
- ❌ 没有 placeholder / legacy-assembly / page-view / verified / production 状态
- ❌ 没有"五项完成标准"
- ❌ 没有禁止假完成的明确约束

**后果**：
- 只要路由能打开就被口头算作"完成"
- re-export 和 placeholder 被大量使用
- 静态 mock 数据没有被发现

## 根本问题

**文档本身就是按照"模板系统"的思想设计的**，而不是按照"骨架约束 + 设计稿复刻"的思想。

## 因果关系

| 文档 | 表述 | 错误理解 | 错误实现 |
|------|------|----------|----------|
| minierp_page_spec.md | "通用页面模板" | 模板系统 | erp-page-assemblies.tsx |
| minierp_page_spec.md | "页面清单（30 页）" | 可以批量生成 | RoutePlaceholderPage |
| miniERP_design_summary.md | "模板全部覆盖 ✅" | 模板覆盖=完成 | 满足于模板套用 |
| miniERP_design_summary.md | "换数据+换字段" | 只需换数据 | 不复刻设计稿 |
| openspec/config.yaml | "template system" | 模板复用 | 生成链路偏差 |
| 旧 AGENTS.md | "优先实现" | 文件存在=完成 | 空壳页面 |

## 已修复情况

### ✅ 已修复（3 月 11 日）

1. CLAUDE.md:124-150 - family 明确定义为骨架，不是模板
2. CLAUDE.md:71-114 - 完成口径改成显式状态机（5 状态 + 5 项标准）
3. CLAUDE.md:124-150 - 并行开发前先冻结共享接口

### ⚠️ 待修复

1. openspec/config.yaml - 仍然写着"Reuse T1-T4 template system"
2. designs/ui/minierp_page_spec.md - 仍然使用"模板"措辞
3. designs/ui/miniERP_design_summary.md - 仍然强调"模板覆盖率"

## 教训

1. **文档的第一性原理**：文档的目的是指导开发，防止偏离
2. **用词必须精确**："模板" vs "骨架"会引导完全不同的实现
3. **约束必须可检查**：所有约束必须可以通过 CI/脚本检查
4. **文档必须先于代码**：从第一天开始就要有正确的约束
5. **切断旧语义**：纠偏时必须彻底修改所有文档，包括生成链路

## 下一步

### 立即修复

- [ ] 修改 openspec/config.yaml，把"template system"改成"family governance"
- [ ] 修改 designs/ui/minierp_page_spec.md，把"模板"改成"骨架约束"
- [ ] 修改 designs/ui/miniERP_design_summary.md，删除"模板覆盖率"强调

### 中期行动

- [ ] 建立文档审查机制，新文档必须经过审查
- [ ] 建立"禁止用词"清单（如"模板"、"万能装配器"等）
- [ ] 建立 CI 门禁，检查文档是否使用禁止用词

---

*此分析由 Zoe-miniERP 和 Codex 联合完成，2026-03-11。*
