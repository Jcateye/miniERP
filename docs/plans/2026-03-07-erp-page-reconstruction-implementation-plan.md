# ERP 页面重构 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 先完成页面重构的治理止损与实现底座搭建，再按设计稿逐页替换第一批错误的 T2 列表页主实现路径。

**Architecture:** 保留 T1/T2/T3/T4 名字，但重写其 family 定义；正式页面从“通用 assembly + 配置驱动”切换为“设计稿 → page view → family shell → primitives → BFF/hook”。旧 `WorkbenchAssembly` / `OverviewAssembly` 降级为 legacy fallback，不再作为正式页面主实现。

**Tech Stack:** Next.js App Router、React 19、TypeScript、现有 BFF hooks、Jest（已有 web 侧 *.spec.ts）、ESLint、Next build。

---

### Task 1: 更新核心治理文档

**Files:**
- Modify: `CLAUDE.md`
- Modify: `README.md`
- Modify: `AGENTS.md`
- Modify: `CLAW.md`
- Modify: `.claude/rules/erp-rules.md`
- Reference: `docs/plans/2026-03-07-erp-page-reconstruction-design.md`

**Step 1: 写文档一致性检查清单（手工）**

把以下事实作为必须写入的统一事实：

- 保留 T1/T2/T3/T4，但旧定义失效
- family 只约束骨架，不约束具体 UI
- 正式页面必须复刻 pencil 设计稿
- 允许抽 primitives / shells / 局部业务块
- 禁止新的万能 assembly
- `WorkbenchAssembly` / `OverviewAssembly` 降级为 legacy/fallback only

**Step 2: 修改 `CLAUDE.md` 的核心事实**

更新以下位置的语义：

- `Template-first frontend` 改为 `design-driven + family-governed frontend`
- 工程红线中的“模板合规”改成“family shell 合规 + design parity review”
- 明确旧 assembly 为 legacy

**Step 3: 修改 `README.md` 的开发者说明**

把以下段落从旧路线改为新路线：

- `前端：模板优先 + 配置驱动`
- 改成 `设计稿驱动 + family 治理 + 页面级 view 实现`

**Step 4: 修改 `AGENTS.md` 的 agent 执行规则**

明确：

- 默认不要再把正式页面接到 `WorkbenchAssembly/OverviewAssembly`
- 已有设计稿页面，优先 page-level view
- 旧 assembly 只用于 fallback / 临时页 / 未重构页

**Step 5: 修改 `CLAW.md` 与 `.claude/rules/erp-rules.md`**

将：

- `T1 OverviewLayout`
- `T2 WorkbenchLayout`
- `T3 DetailLayout`
- `T4 WizardLayout`

改为：

- `T1 Hub / Dashboard family`
- `T2 List / Index family`
- `T3 Detail / Record family`
- `T4 Flow / Wizard family`

并补充：family 是骨架治理，不是固定组件绑定。

**Step 6: 运行最小验证**

Run: `bun run lint`
Expected: 文档修改不影响 lint；若 lint 只跑代码，也应成功结束。

**Step 7: Commit**

```bash
git add CLAUDE.md README.md AGENTS.md CLAW.md .claude/rules/erp-rules.md
git commit -m "docs: redefine ERP page family governance"
```

---

### Task 2: 建立页面映射表与 legacy 清单

**Files:**
- Create: `docs/ui/erp-page-design-route-map.md`
- Modify: `docs/plans/2026-03-07-erp-page-reconstruction-design.md`
- Reference: `images/source/miniERP-pencil-opus4.6.pen`

**Step 1: 建立映射表结构**

使用 markdown 表格列：

- route
- family
- variant
- design_node_id
- design_name
- current_runtime
- status
- data_source
- notes

**Step 2: 先录入第一批 T2 页面**

至少包括：

- `/mdm/customers` → `iYRfh`
- `/mdm/suppliers`
- `/mdm/warehouses` → `S8YEo`
- `/mdm/users`
- `/mdm/roles`
- `/mdm/organizations`
- `/finance/receipts` → `ZvGFp`
- `/finance/payments`
- `/finance/gl-accounts` → `Ch7yZ`
- `/finance/cost-centers` → `LQFcg`
- `/finance/budgets` → `iHpnf`
- `/integration/endpoints` → `Cl9W4`

**Step 3: 标记 legacy 主实现路径**

在 notes 中明确以下页面当前运行态是错误路径：

- `page.tsx -> WorkbenchAssembly`
- `page.tsx -> OverviewAssembly`

**Step 4: 回写设计文档中的映射章节**

把映射表文档路径补充到设计文档中，形成交叉引用。

**Step 5: Commit**

```bash
git add docs/ui/erp-page-design-route-map.md docs/plans/2026-03-07-erp-page-reconstruction-design.md
git commit -m "docs: add ERP design route mapping"
```

---

### Task 3: 为新 family shells 建立最小类型与目录结构

**Files:**
- Create: `apps/web/src/components/shells/erp/t1-hub-shell.tsx`
- Create: `apps/web/src/components/shells/erp/t2-list-shell.tsx`
- Create: `apps/web/src/components/shells/erp/t3-detail-shell.tsx`
- Create: `apps/web/src/components/shells/erp/t4-flow-shell.tsx`
- Create: `apps/web/src/components/shells/erp/index.ts`
- Modify: `apps/web/src/contracts/template-contracts.ts`
- Reference: `apps/web/src/components/layouts/template-shared.tsx`
- Test: `apps/web/src/app/(dashboard)/skus/page.spec.ts`

**Step 1: 写最小 failing test（类型/纯函数级别）**

如果不方便直接测 shell 组件，先提取并测试 family 元数据 helper，例如新增：

- `apps/web/src/components/shells/erp/family-variants.ts`
- `apps/web/src/components/shells/erp/family-variants.spec.ts`

示例测试：

```ts
import { describe, expect, it } from '@jest/globals';
import { isSupportedFamilyVariant } from './family-variants';

describe('family variants', () => {
  it('accepts supported T2 variants', () => {
    expect(isSupportedFamilyVariant('T2', 'search-list')).toBe(true);
  });
});
```

**Step 2: 运行测试确保先失败**

Run: `bun run --filter web test -- apps/web/src/components/shells/erp/family-variants.spec.ts`
Expected: FAIL（若 web 无 test script，则改用现有 jest 入口；如仓库无 web test 命令，则将该 helper spec 挪入已有可运行测试入口或先在计划执行时补 web test command）。

**Step 3: 写最小实现**

实现：

- 新 family / variant 类型
- 4 个 shell 组件的最小骨架
- shell 只负责 page frame / header / content containers
- 不包含旧 slot 命名

**Step 4: 运行类型与构建验证**

Run: `bun run --filter web build`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/src/components/shells/erp apps/web/src/contracts/template-contracts.ts
git commit -m "refactor(web): add ERP family shells"
```

---

### Task 4: 抽取第一批稳定 primitives

**Files:**
- Create: `apps/web/src/components/primitives/erp/page-title-block.tsx`
- Create: `apps/web/src/components/primitives/erp/list-toolbar-row.tsx`
- Create: `apps/web/src/components/primitives/erp/data-table-card.tsx`
- Create: `apps/web/src/components/primitives/erp/index.ts`
- Modify: `apps/web/src/components/ui/page-header.tsx`
- Modify: `apps/web/src/components/ui/search-bar.tsx`
- Modify: `apps/web/src/components/ui/data-table.tsx`
- Test: `apps/web/src/app/(dashboard)/skus/page.spec.ts`

**Step 1: 写最小 failing test（纯 props mapping 或 helper）**

如果组件难直接测，先写 helper 测试，例如表头/按钮 props 归一化函数。

```ts
import { describe, expect, it } from '@jest/globals';
import { buildTableCardTitle } from './data-table-card';

describe('data table card helper', () => {
  it('uses provided title first', () => {
    expect(buildTableCardTitle('客户列表', '列表结果')).toBe('客户列表');
  });
});
```

**Step 2: 运行测试确认失败**

Run: `bun run --filter web test -- apps/web/src/components/primitives/erp/*.spec.ts`
Expected: FAIL

**Step 3: 写最小实现**

抽取以下稳定块：

- 标题块
- 列表页工具条容器
- 表格卡片容器

注意：

- 不要复活万能 list page
- 只抽局部块

**Step 4: 运行 build 与 lint**

Run: `bun run --filter web build && bun run --filter web lint`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/src/components/primitives/erp apps/web/src/components/ui/page-header.tsx apps/web/src/components/ui/search-bar.tsx apps/web/src/components/ui/data-table.tsx
git commit -m "refactor(web): extract ERP page primitives"
```

---

### Task 5: 用逐页 view 替换 `/mdm/customers`

**Files:**
- Create: `apps/web/src/components/views/erp/customer-list-view.tsx`
- Create: `apps/web/src/components/views/erp/customer-list-view-model.ts`
- Modify: `apps/web/src/app/(dashboard)/mdm/customers/page.tsx`
- Modify: `apps/web/src/components/business/erp-page-config.tsx`
- Reference: `apps/web/src/app/api/bff/customers/route.ts`
- Reference: `apps/web/src/app/api/bff/customers/route.spec.ts`
- Reference: `images/source/miniERP-pencil-opus4.6.pen` (`iYRfh`)
- Test: `apps/web/src/app/api/bff/customers/route.spec.ts`

**Step 1: 写 failing test（view model/helper）**

新增一个纯函数，把 BFF 数据映射成客户列表 view row：

```ts
import { describe, expect, it } from '@jest/globals';
import { mapCustomerToListRow } from './customer-list-view-model';

describe('customer list view model', () => {
  it('maps customer dto to list row', () => {
    expect(
      mapCustomerToListRow({
        id: '1',
        code: 'CUST-001',
        name: '中兴通讯',
        contactName: '赵经理',
        phone: '0755-8888xxxx',
        creditLimit: '500000',
        isActive: true,
      }),
    ).toEqual(
      expect.objectContaining({
        code: 'CUST-001',
        name: '中兴通讯',
        status: 'active',
      }),
    );
  });
});
```

**Step 2: 运行测试确认失败**

Run: `bun run --filter web test -- apps/web/src/components/views/erp/customer-list-view-model.spec.ts`
Expected: FAIL

**Step 3: 写最小实现**

- 新建 `CustomerListView`
- 使用 `T2ListShell`
- 使用 page title / search row / data table card primitives
- 页面结构按设计稿 `iYRfh` 复刻
- `page.tsx` 不再渲染 `WorkbenchAssembly`

**Step 4: 移除该页对旧 assembly 的主依赖**

- `apps/web/src/app/(dashboard)/mdm/customers/page.tsx` 改为渲染新 view
- 若需要保留旧 config，仅保留数据语义，去掉对页面长相的驱动作用

**Step 5: 跑相关验证**

Run: `bun run --filter web build`
Expected: PASS

**Step 6: Commit**

```bash
git add apps/web/src/components/views/erp/customer-list-view.tsx apps/web/src/components/views/erp/customer-list-view-model.ts apps/web/src/app/(dashboard)/mdm/customers/page.tsx apps/web/src/components/business/erp-page-config.tsx
git commit -m "refactor(web): rebuild customer list page from design"
```

---

### Task 6: 用逐页 view 替换 `/mdm/warehouses`

**Files:**
- Create: `apps/web/src/components/views/erp/warehouse-list-view.tsx`
- Create: `apps/web/src/components/views/erp/warehouse-list-view-model.ts`
- Modify: `apps/web/src/app/(dashboard)/mdm/warehouses/page.tsx`
- Modify: `apps/web/src/components/business/erp-page-config.tsx`
- Reference: `images/source/miniERP-pencil-opus4.6.pen` (`S8YEo`)
- Reference: `apps/web/src/app/(dashboard)/settings/master-data/master-data-config.spec.ts`

**Step 1: 写 failing test（view model/helper）**

```ts
import { describe, expect, it } from '@jest/globals';
import { mapWarehouseToListRow } from './warehouse-list-view-model';

describe('warehouse list view model', () => {
  it('maps warehouse dto to list row', () => {
    expect(
      mapWarehouseToListRow({
        id: '1',
        code: 'WH-001',
        name: '深圳总仓',
        type: '成品仓',
        managerName: '李仓管',
        isActive: true,
      }),
    ).toEqual(expect.objectContaining({ code: 'WH-001', status: 'active' }));
  });
});
```

**Step 2: 运行测试确认失败**

Run: `bun run --filter web test -- apps/web/src/components/views/erp/warehouse-list-view-model.spec.ts`
Expected: FAIL

**Step 3: 写最小实现**

- 新建 `WarehouseListView`
- 按 `S8YEo` 复刻结构
- 仅复用 primitives / shell
- 不引入新的万能 T2 组件

**Step 4: 运行验证**

Run: `bun run --filter web build`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/src/components/views/erp/warehouse-list-view.tsx apps/web/src/components/views/erp/warehouse-list-view-model.ts apps/web/src/app/(dashboard)/mdm/warehouses/page.tsx apps/web/src/components/business/erp-page-config.tsx
git commit -m "refactor(web): rebuild warehouse list page from design"
```

---

### Task 7: 用逐页 view 替换 `/finance/receipts`

**Files:**
- Create: `apps/web/src/components/views/erp/receipt-list-view.tsx`
- Create: `apps/web/src/components/views/erp/receipt-list-view-model.ts`
- Modify: `apps/web/src/app/(dashboard)/finance/receipts/page.tsx`
- Modify: `apps/web/src/components/business/erp-page-config.tsx`
- Reference: `images/source/miniERP-pencil-opus4.6.pen` (`ZvGFp`)
- Reference: `apps/web/src/app/api/bff/documents/route.ts`
- Reference: `apps/web/src/app/api/bff/documents/route.spec.ts`

**Step 1: 写 failing test（view model/helper）**

```ts
import { describe, expect, it } from '@jest/globals';
import { mapReceiptToListRow } from './receipt-list-view-model';

describe('receipt list view model', () => {
  it('maps receipt dto to list row', () => {
    expect(
      mapReceiptToListRow({
        id: '1',
        docNo: 'REC-20260306-008',
        customerName: '中兴通讯',
        amount: '128000',
        status: 'completed',
      }),
    ).toEqual(expect.objectContaining({ docNo: 'REC-20260306-008', status: 'completed' }));
  });
});
```

**Step 2: 运行测试确认失败**

Run: `bun run --filter web test -- apps/web/src/components/views/erp/receipt-list-view-model.spec.ts`
Expected: FAIL

**Step 3: 写最小实现**

- 新建 `ReceiptListView`
- 按 `ZvGFp` 复刻结构
- 若该页无需 search row，则不要为了统一硬加 search row
- route 改为新 view

**Step 4: 运行验证**

Run: `bun run --filter web build`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/src/components/views/erp/receipt-list-view.tsx apps/web/src/components/views/erp/receipt-list-view-model.ts apps/web/src/app/(dashboard)/finance/receipts/page.tsx apps/web/src/components/business/erp-page-config.tsx
git commit -m "refactor(web): rebuild receipt list page from design"
```

---

### Task 8: 将旧 assembly 标记为 legacy，并移除正式路径默认依赖

**Files:**
- Modify: `apps/web/src/components/business/erp-page-assemblies.tsx`
- Modify: `apps/web/src/components/layouts/overview-layout.tsx`
- Modify: `apps/web/src/components/layouts/workbench-layout.tsx`
- Modify: `apps/web/src/components/layouts/index.ts`
- Modify: `apps/web/src/components/business/route-placeholder-page.tsx`
- Test: `apps/web/src/lib/bff/server-fixtures.spec.ts`

**Step 1: 写最小 failing test（若能提炼 helper）**

例如新增一个 helper 测试 legacy flags：

```ts
import { describe, expect, it } from '@jest/globals';
import { isLegacyErpAssemblyRoute } from './erp-page-assemblies';

describe('legacy assembly routes', () => {
  it('treats migrated routes as non-legacy runtime targets', () => {
    expect(isLegacyErpAssemblyRoute('/mdm/customers')).toBe(false);
  });
});
```

**Step 2: 运行测试确认失败**

Run: `bun run --filter web test -- apps/web/src/components/business/erp-page-assemblies.spec.ts`
Expected: FAIL

**Step 3: 写最小实现**

- 给旧 assembly 明确加上 legacy 注释与导出说明
- layouts index 中避免将其继续暗示为默认正式路径
- 保留 fallback 能力，但不继续扩大使用面

**Step 4: 运行验证**

Run: `bun run --filter web build && bun run --filter web lint`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/src/components/business/erp-page-assemblies.tsx apps/web/src/components/layouts/overview-layout.tsx apps/web/src/components/layouts/workbench-layout.tsx apps/web/src/components/layouts/index.ts apps/web/src/components/business/route-placeholder-page.tsx
git commit -m "refactor(web): mark legacy ERP assemblies"
```

---

### Task 9: 统一验证并准备下一批页面

**Files:**
- Modify: `docs/ui/erp-page-design-route-map.md`
- Modify: `docs/plans/2026-03-07-erp-page-reconstruction-design.md`
- Optional Modify: `apps/web/src/components/views/erp/index.ts`

**Step 1: 更新映射表状态**

把已完成页面状态改为 `rebuilt`：

- `/mdm/customers`
- `/mdm/warehouses`
- `/finance/receipts`

**Step 2: 记录新增稳定 primitives/shells**

将已证实稳定的复用块写回设计文档，作为后续页面重构基线。

**Step 3: 运行统一验证**

Run: `bun run lint && bun run --filter web build`
Expected: PASS

**Step 4: Commit**

```bash
git add docs/ui/erp-page-design-route-map.md docs/plans/2026-03-07-erp-page-reconstruction-design.md apps/web/src/components/views/erp
git commit -m "docs: update ERP reconstruction progress"
```

---

## 执行注意事项

1. 页面必须先对上设计稿 node，再写代码。
2. 允许小范围重复；不要为消灭重复而新造万能 page renderer。
3. 抽象只能落在 primitives / shells / 局部业务块。
4. 正式页面不再默认走 `WorkbenchAssembly` / `OverviewAssembly`。
5. 任何一页如与设计稿冲突，优先向设计稿收敛。
6. 如果某页确实没有对应设计稿节点，先补映射与说明，再决定是否临时保留 legacy。

---

## 验收检查清单

- [ ] 五份规则文档已同步为新治理路线
- [ ] 已建立 route ↔ design node 映射表
- [ ] 新 family shells 已建立
- [ ] 第一批 primitives 已落地
- [ ] `/mdm/customers` 已按设计稿复刻并脱离旧 assembly 主路径
- [ ] `/mdm/warehouses` 已按设计稿复刻并脱离旧 assembly 主路径
- [ ] `/finance/receipts` 已按设计稿复刻并脱离旧 assembly 主路径
- [ ] legacy assembly 已明确降级
- [ ] `bun run lint` 通过
- [ ] `bun run --filter web build` 通过
