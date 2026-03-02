# CLAW.md - Agent 项目配置

> 此文件为 AI Agent 提供项目级别的标准化配置。
> 由 `claw-init` 生成后按项目实际持续维护。

---

## 项目信息

- **名称**: miniERP
- **类型**: monorepo（Bun Workspaces + Turborepo）
- **包管理器**: bun
- **主要技术栈**: Next.js 15 + React 19 + Tailwind CSS 4（web）+ NestJS 11（server）+ TypeScript

---

## 安装依赖

```bash
bun install
```

---

## 开发命令（仓库根目录）

```bash
# 开发
bun run dev
bun run dev:web
bun run dev:server

# 质量与构建
bun run lint
bun run test
bun run build
```

### 定向命令

```bash
# server
bun run --filter server dev
bun run --filter server test
bun run --filter server test -- src/path/to/file.spec.ts
bun run --filter server test:watch
bun run --filter server test:cov
bun run --filter server test:e2e

# web
bun run --filter web dev
bun run --filter web build
bun run --filter web lint
```

### 说明

- `apps/web` 当前没有 `test` script。
- 根目录有 `db:generate` / `db:migrate` 入口，但 `apps/server/package.json` 尚未定义对应脚本。
- 未单独提供 `typecheck` 命令，通常通过 `bun run build` 间接发现类型问题。

---

## 项目结构（高频边界）

```text
apps/web         前端（Next.js App Router，src/app）
apps/server      后端（NestJS）
packages/shared  前后端共享 contracts/constants/utils
designs          UI/PRD/spec 设计来源
openspec         spec-driven 变更工件
.claude/rules    项目业务规则（含 erp-rules.md）
```

---

## 特殊说明（Agent 必读）

1. **设计优先 + 骨架实现**
   - `designs/` 是产品/交互意图来源。
   - `apps/*` + `packages/shared` 是当前运行时实现真相。

2. **页面模板体系（T1-T4）**
   - 参考：`designs/ui/minierp_page_spec.md`
   - 若页面与某模板匹配约 80% 以上，应复用模板并仅替换字段/数据。

3. **两层凭证模型（跨采购/销售/库存）**
   - 参考：`designs/ui/miniERP_evidence_system.md`
   - 单据级凭证（全局附件）+ 行级凭证（SKU 行 drawer 工作流）

4. **业务硬约束（`.claude/rules/erp-rules.md`）**
   - 单据号格式：`DOC-{type}-{YYYYMMDD}-{seq}`
   - 金额计算：必须使用 `decimal.js`
   - 状态流转：必须显式且可审计

5. **OpenSpec 工作流**
   - 常用：`/opsx:new` `/opsx:ff` `/opsx:apply` `/opsx:verify` `/opsx:archive`
   - 推荐：规划 → 实现 → 验证 → 归档

6. **Agent 沟通语言**
   - 所有 agents 必须使用中文与用户沟通。

7. **额外指令文件（若存在需检查）**
   - `.cursor/rules/*` 或 `.cursorrules`
   - `.github/copilot-instructions.md`

---

## CI/CD

- **平台**: none
- **配置文件**: none

---

## 代码规范

- **Lint**: ESLint（`apps/web/eslint.config.mjs`、`apps/server/eslint.config.mjs`）
- **Format**: Prettier（server 提供 `format` 脚本）
- **提交规范**: 仓库内未单独声明（按团队约定执行）

---

*此文件应提交到版本控制，随项目一起维护。*
