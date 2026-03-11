# 页面状态台账（Page State Ledger）

> **用途**：记录所有页面的状态，防止"假完成"
> 
> **更新规则**：页面状态变更时必须同步更新此文件

---

## 状态定义

| 状态 | 含义 | 允许的操作 |
|------|------|-----------|
| `placeholder` | 占位页，仅显示"Coming Soon" | 添加到导航 |
| `legacy-assembly` | 使用旧装配器（WorkbenchAssembly/OverviewAssembly） | 标记为待重构 |
| `page-view` | 独立页面实现（在 `views/erp/` 下） | 开发、联调 |
| `verified` | 设计一致性 + 数据联调 + 测试通过 | 准备上线 |
| `production` | 线上运行，有真实用户 | 持续优化 |

---

## 当前页面状态

### 已上线（production）

| 路由 | 状态 | 设计稿 | 上线日期 | 负责人 | 备注 |
|------|------|--------|----------|--------|------|
| /workspace | production | workspace-v1 | 2026-03-11 | @haoqi | 工作台首页 |

### 已验证（verified）

| 路由 | 状态 | 设计稿 | 验证日期 | 负责人 | 备注 |
|------|------|--------|----------|--------|------|
| /mdm/items | verified | items-list-v2 | 2026-03-11 | @codex | 等待上线 |
| /reports | verified | reports-v1 | 2026-03-11 | @codex | 报表列表 |
| /reports/[slug] | verified | reports-detail-v1 | 2026-03-11 | @codex | 报表详情 |

### 开发中（page-view）

| 路由 | 状态 | 设计稿 | 开始日期 | 负责人 | 当前进度 |
|------|------|--------|----------|--------|----------|
| - | - | - | - | - | 暂无 |

### 待重构（legacy-assembly）

> **注意**：这些页面使用旧装配器，需要重构为 page-level view

| 路由 | 状态 | 原因 | 优先级 | 计划日期 |
|------|------|------|--------|----------|
| - | - | - | - | 暂无 |

### 占位页（placeholder）

> **注意**：这些页面仅显示"Coming Soon"，不算完成

| 路由 | 状态 | 计划功能 | 优先级 | 计划日期 |
|------|------|----------|--------|----------|
| - | - | - | - | 暂无 |

---

## 统计

**总览**：
- 总页面数：**4**
- 已上线：**1** (25%)
- 已验证：**3** (75%)
- 开发中：**0** (0%)
- 待重构：**0** (0%)
- 占位页：**0** (0%)

**健康度**：
- ✅ 没有 placeholder
- ✅ 没有 legacy-assembly
- ✅ 没有 re-export
- ✅ 所有页面都是 page-level view

---

## 历史记录

### 2026-03-11
- ✅ 删除 322 个文件，重置前端
- ✅ 保留 4 个页面：/workspace、/mdm/items、/reports、/reports/[slug]
- ✅ 创建页面状态台账

---

## 检查命令

```bash
# 检查页面状态
bun run scripts/check-page-state.sh

# 输出示例：
# ✅ /workspace: production
# ✅ /mdm/items: verified
# ✅ /reports: verified
# ✅ /reports/[slug]: verified
# 
# 统计：4 页面，1 production，3 verified
```

---

*此文件由 Zoe-miniERP 维护，最后更新：2026-03-11*
