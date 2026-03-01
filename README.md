# miniERP

Mini ERP System - 采购、销售、库存、财务管理

## 技术栈

| 部分 | 技术 |
|------|------|
| **前端** | Next.js 15 + React 19 + Tailwind CSS 4 |
| **后端** | NestJS 11 + TypeScript |
| **Monorepo** | Turborepo + Bun Workspaces |
| **数据库** | PostgreSQL + Prisma（待配置） |

## 目录结构

```
miniERP/
├── apps/
│   ├── web/                    # 前端 (Next.js)
│   │   ├── src/
│   │   │   ├── app/            # 页面路由 (App Router)
│   │   │   ├── components/
│   │   │   │   ├── layouts/    # T1-T4 页面模板
│   │   │   │   ├── shared/     # 通用组件
│   │   │   │   ├── business/   # 业务组件
│   │   │   │   └── evidence/   # 凭证组件
│   │   │   ├── hooks/          # 自定义 Hooks
│   │   │   ├── lib/            # 工具库
│   │   │   ├── styles/         # 样式文件
│   │   │   └── types/          # 类型定义
│   │   ├── public/             # 静态资源
│   │   ├── next.config.ts
│   │   └── package.json
│   │
│   └── server/                 # 后端 (NestJS)
│       ├── src/
│       │   ├── modules/        # 业务模块
│       │   │   ├── purchase/   # 采购模块
│       │   │   │   ├── purchase-order/
│       │   │   │   └── goods-receipt/
│       │   │   ├── sales/      # 销售模块
│       │   │   ├── inventory/  # 库存模块
│       │   │   ├── finance/    # 财务模块
│       │   │   └── evidence/   # 凭证模块
│       │   ├── common/         # 通用模块
│       │   │   ├── decorators/
│       │   │   ├── filters/
│       │   │   ├── guards/
│       │   │   ├── interceptors/
│       │   │   └── pipes/
│       │   ├── config/         # 配置
│       │   ├── database/       # 数据库
│       │   │   ├── migrations/
│       │   │   └── seeds/
│       │   ├── app.module.ts
│       │   └── main.ts
│       └── package.json
│
├── packages/
│   └── shared/                 # 共享包 (前后端共用)
│       └── src/
│           ├── types/          # 类型定义
│           │   ├── document.ts # 单据类型
│           │   └── api.ts      # API 类型
│           ├── constants/      # 常量
│           ├── utils/          # 工具函数
│           └── validations/    # 验证规则
│
├── designs/                    # 设计文档
│   ├── miniERP-PRD-V1.md       # PRD
│   ├── miniERP-TDD-技术方案书-v1.md
│   ├── minierp_page_spec.md    # 页面规格 (T1-T4)
│   ├── miniERP_evidence_system.md
│   └── *.pen                   # Pencil 设计文件
│
├── .claude/                    # Claude Code 配置
│   ├── settings.local.json     # 权限 + MCP
│   ├── skills/                 # OpenSpec skills
│   └── rules/                  # ERP 业务规则
│
├── package.json                # Root package.json
├── turbo.json                  # Turborepo 配置
└── bun.lock                    # 依赖锁定
```

## 开发命令

```bash
# 安装依赖
bun install

# 同时启动前后端
bun run dev

# 单独启动前端
bun run dev:web        # http://localhost:3000

# 单独启动后端
bun run dev:server     # http://localhost:3000

# 构建
bun run build

# 测试
bun run test

# Lint
bun run lint
```

## 页面模板系统

基于 `designs/minierp_page_spec.md` 的四种模板：

| 模板 | 用途 | 示例页面 |
|------|------|----------|
| **T1 OverviewLayout** | 仪表盘/概览 | 首页、工作台 |
| **T2 WorkbenchLayout** | 列表/表格操作 | 订单列表、库存查询 |
| **T3 DetailLayout** | 详情页（带 tabs） | 订单详情、商品详情 |
| **T4 WizardLayout** | 向导/流程 | 入库单、出库单 |

## 凭证系统

两层凭证模型（参考 `designs/miniERP_evidence_system.md`）：

1. **单据级凭证** - 全局附件面板
2. **行级凭证** - SKU 行的 camera-count entry + drawer

## AI 辅助开发

### Claude Code

```bash
cd /Users/haoqi/OnePersonCompany/miniERP
claude

# OpenSpec 变更管理
/opsx:new <change-name>     # 创建新变更
/opsx:apply                 # 实现变更
/opsx:verify                # 验证实现
/opsx:archive               # 归档变更
```

### Codex

```bash
cd /Users/haoqi/OnePersonCompany/miniERP
codex "<任务描述>"
```

## 参考文档

- [PRD](./designs/miniERP-PRD-V1.md)
- [技术方案书](./designs/miniERP-TDD-技术方案书-v1.md)
- [页面规格](./designs/minierp_page_spec.md)
- [凭证系统](./designs/miniERP_evidence_system.md)
