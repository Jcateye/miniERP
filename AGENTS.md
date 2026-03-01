# AGENTS.md - AI Assistant Context

此文件为 Codex 等 AI 助手提供项目上下文。

---

## 项目概述

miniERP 是一个 **前后端分离的全栈 ERP 系统**，包含采购、销售、库存、财务管理。

## 技术栈

| 部分 | 技术 |
|------|------|
| 前端 | Next.js 15 + React 19 + Tailwind CSS 4 |
| 后端 | NestJS 11 + TypeScript |
| Monorepo | Turborepo + Bun Workspaces |
| 数据库 | PostgreSQL + Prisma |

## 目录结构

```
miniERP/
├── apps/
│   ├── web/          # 前端 (Next.js)
│   └── server/       # 后端 (NestJS)
├── packages/
│   └── shared/       # 共享类型/常量/工具
├── designs/          # 设计文档
└── .claude/          # Claude Code 配置
```

## 开发命令

```bash
bun install           # 安装依赖
bun run dev           # 同时启动前后端
bun run dev:web       # 只启动前端
bun run dev:server    # 只启动后端
bun run build         # 构建
bun run test          # 测试
```

## 架构要点

### 1. 页面模板系统 (T1-T4)

参考 `designs/minierp_page_spec.md`：

- **T1 OverviewLayout** - 仪表盘/概览
- **T2 WorkbenchLayout** - 列表/表格操作
- **T3 DetailLayout** - 详情页（带 tabs）
- **T4 WizardLayout** - 向导/流程

### 2. 凭证系统

参考 `designs/miniERP_evidence_system.md`：

- 单据级凭证 - 全局附件
- 行级凭证 - SKU 行的 camera-count entry

### 3. 共享类型

`packages/shared/src/types/`:

- `DocumentStatus` - 单据状态
- `DocumentType` - 单据类型 (PO/SO/GRN/OUT/ADJ)
- `BaseDocument` - 基础单据
- `ApiResponse<T>` - API 响应格式

## 编码规范

### 业务逻辑

- 单据编号: `DOC-{type}-{YYYYMMDD}-{seq}`
- 金额计算: 使用 `decimal.js`，禁止浮点数
- 状态机: 所有单据必须有明确状态流转

### API 规范

- 版本化: `/api/v1/`
- 资源命名: 复数形式 `/api/v1/purchase-orders`
- 响应格式: `{ data, message }` 或 `{ error: { code, message } }`

### 数据库

- 表命名: 小写+下划线 `purchase_orders`
- 审计字段: `created_at`, `updated_at`, `deleted_at`

## 设计文档

- `designs/miniERP-PRD-V1.md` - PRD
- `designs/miniERP-TDD-技术方案书-v1.md` - 技术方案
- `designs/minierp_page_spec.md` - 页面规格
- `designs/miniERP_evidence_system.md` - 凭证系统

## 注意事项

1. 这是一个 Monorepo，修改 `packages/shared` 后需要重新构建
2. 前端在 `apps/web`，后端在 `apps/server`
3. 共享类型放在 `packages/shared/src/types/`
4. 遵循 ERP 业务规则 (`.claude/rules/erp-rules.md`)
