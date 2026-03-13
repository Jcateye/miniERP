## Context

当前采购/销售订单表单已经切到 canonical 状态码，但 counterparty 仍是裸字符串输入：

- `supplierId`
- `customerId`

这意味着表单仍允许用户随意提交页面猜测值，而不是从主数据中选择。

## Goals / Non-Goals

**Goals**
- 用远程 lookup selector 替换采购单的 `supplierId` 文本输入。
- 用远程 lookup selector 替换销售单的 `customerId` 文本输入。
- 让采购单和销售单编辑态优先加载真实草稿 detail，而不是仅用列表摘要兜底。

**Non-Goals**
- 本轮不改采购/销售列表页的行数据结构
- 本轮不重写 MDM 主数据页

## Decisions

### 1. 先使用远程 select，而不是复杂 autocomplete

原因：
- 当前主要问题是消除裸输外键。
- select 足够满足当前规模和验证目标。

### 2. 编辑态允许注入 fallback 当前值

当前列表页行模型尚未携带真实 counterparty id，因此编辑态可能只有展示名称。

处理方式：
- 若当前值不在远程选项中，selector 仍展示一个 `当前值` fallback option
- 不阻塞旧数据编辑

### 3. 编辑态先拉 draft detail，再保留旧行 fallback

当前采购/销售列表页只有摘要行模型，无法直接回填真实订单行。

处理方式：
- BFF 的采购/销售 detail route 增加 GET，优先从本地 draft store 返回真实 `header + lines`
- 编辑弹窗打开时先放入现有 fallback 数据，再异步请求 detail 覆盖
- 若 detail route 返回 404，则说明当前行来自旧 fixture / upstream 摘要，继续使用 fallback，不打断编辑

### 4. detail route 只承接本地 draft，不伪造上游事实

原因：
- 当前 canonical 顶层列表 alias 已就位，但 upstream 列表行仍不携带真正可回填的 detail 标识
- 在没有真实后端 detail 映射前，不应凭列表摘要拼装“伪明细”冒充事实源

因此：
- 本轮 detail GET 只为本地 draft / 已编辑单据提供真实 lines
- legacy/upstream 列表行继续显式走 fallback 兼容路径

## Validation

- `bun run --filter web build`
