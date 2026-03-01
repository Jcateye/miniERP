# AGENTS.md - AI Assistant Context

此文件为 Codex 与其他子代理提供项目上下文。

---

## 项目概述

miniERP 是一个**设计优先 + 可运行骨架并存**的 ERP 项目，覆盖采购、销售、库存、财务与凭证流程。

- 设计/交互来源：`designs/*.pen` + 规格文档
- 运行时骨架：`apps/web`（Next.js）、`apps/server`（NestJS）、`packages/shared`

## 技术栈

| 部分 | 技术 |
|------|------|
| 前端 | Next.js 15 + React 19 + Tailwind CSS 4 |
| 后端 | NestJS 11 + TypeScript |
| Monorepo | Turborepo + Bun Workspaces |
| 数据库 | PostgreSQL + Prisma（迁移脚本入口已预留） |

## 目录边界（高频）

```text
apps/web         前端页面与组件（App Router）
apps/server      后端业务模块与 API
packages/shared  前后端共享类型/常量/工具
designs          PRD、页面规格、凭证系统、.pen 设计源
.claude/rules    项目级业务约束（含 erp-rules.md）
openspec         变更工件与 spec-driven 配置
```

## 常用命令（仓库根目录）

```bash
bun install

bun run dev
bun run dev:web
bun run dev:server

bun run lint
bun run test
bun run build

# 根目录已预留 db:* 入口：
# `bun run db:generate` / `bun run db:migrate`
# 当前会失败，因为 apps/server/package.json 尚未定义
# `db:generate` / `db:migrate` 对应脚本。
```

### Server 定向测试（Jest）

```bash
# 仅跑 server 测试
bun run --filter server test

# 跑单个 spec
bun run --filter server test -- src/path/to/file.spec.ts

# 其他模式
bun run --filter server test:watch
bun run --filter server test:cov
bun run --filter server test:e2e
```

说明：`apps/web` 当前无 `test` script。

## 架构要点

### 1) 页面模板系统（T1-T4）
参考 `designs/ui/minierp_page_spec.md`：
- **T1 OverviewLayout**：仪表盘/概览
- **T2 WorkbenchLayout**：列表/表格操作
- **T3 DetailLayout**：详情页（tabs）
- **T4 WizardLayout**：流程向导页

### 2) 凭证系统（核心能力）
参考 `designs/ui/miniERP_evidence_system.md`：
- 单据级凭证（全局附件）
- 行级凭证（SKU 行 camera-count entry + drawer）

### 3) Shared 合同层
`packages/shared` 提供跨端通用类型与约束，优先复用，避免在 web/server 重复定义。

## 业务规则入口

核心规则在 `.claude/rules/erp-rules.md`，重点包括：
- 单据编号格式：`DOC-{type}-{YYYYMMDD}-{seq}`
- 金额计算：必须使用 `decimal.js`
- 状态流转：必须可追踪并记录审计
- API 规范：`/api/v1` + 统一错误码结构

## Agent 沟通要求

**所有 agents 必须使用中文与用户沟通。**

调用 agent 时，在 prompt 中附加：

```text
使用中文与我沟通。
```
