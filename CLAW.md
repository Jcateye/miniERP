# CLAW.md - Agent 项目配置

> 面向 AI Agent 的项目级配置清单（执行导向）。

---

## 项目信息

- **名称**: miniERP
- **形态**: monorepo（Bun Workspaces + Turborepo）
- **包管理器**: bun
- **技术栈**:
  - Web: Next.js 15 + React 19
  - Server: NestJS 11 + TypeScript
  - Shared: workspace 包 `@minierp/shared`

---

## 安装

```bash
bun install
```

---

## 命令（根目录）

```bash
# 开发
bun run dev
bun run dev:web
bun run dev:server
bun run daily
bun run project -- all doctor
bun run project -- infra health
bun run project -- server logs

# 质量
bun run build
bun run lint
bun run test
```

### 定向命令

```bash
# web
bun run --filter web dev
bun run --filter web build
bun run --filter web lint

# server
bun run --filter server dev
bun run --filter server build
bun run --filter server lint
bun run --filter server test
bun run --filter server test -- src/path/to/file.spec.ts
bun run --filter server test -- src/path/to/file.spec.ts -t "test name"
bun run --filter server test:watch
bun run --filter server test:cov
bun run --filter server test:e2e
bun run --filter server test:e2e -- test/app.e2e-spec.ts
```

### 命令注意事项

- `apps/web` 当前无 `test` script。
- 根 `db:generate` / `db:migrate` / `db:seed` 依赖 server Prisma 脚本。
- Turborepo 配置中，`lint` 和 `test` 依赖上游 `build`。
- 本地基础设施（共享 PostgreSQL/Redis/RabbitMQ/Nginx）与访问方式以 `docs/Macmini-infra.md` 为准。

---

## 目录边界

```text
apps/web         前端（App Router）
apps/server      后端（NestJS）
packages/shared  跨端共享契约
designs          设计与规格源
openspec         变更工件
.claude/rules    项目规则（含 erp-rules）
```

---

## 执行策略（Agent 必读）

1. **设计优先 + 可运行实现**
   - 用 `designs/` 理解目标
   - 以 `apps/*` 当前实现为落地依据

2. **前端采用模板驱动装配**
   - 核心文件：
     - `apps/web/src/components/business/erp-page-config.tsx`
     - `apps/web/src/components/business/erp-page-assemblies.tsx`
     - `apps/web/src/components/layouts/`
   - 页面优先复用 T1/T2/T3/T4 模板

3. **凭证模型固定为两层**
   - document-level + line-level
   - 相关入口：
     - `apps/web/src/components/evidence/*`
     - `apps/web/src/app/api/bff/evidence/*`

4. **Web 请求链路**
   - SDK -> BFF(`/api/bff/*`) -> Backend
   - 部分 GET 仅在 `development/test` 且上游不可用时回退 fixtures；非开发环境返回上游不可用错误

5. **Server 全局约束**
   - 中间件：auth/tenant context
   - 全局校验：ValidationPipe
   - 全局响应/异常：interceptor + filter

6. **跨层契约统一**
   - 新增共享类型优先进入 `packages/shared`

---

## 业务硬约束

来自 `.claude/rules/erp-rules.md`：
- 单据号：`DOC-{type}-{YYYYMMDD}-{seq}`
- 金额：必须使用 `decimal.js`
- 状态：显式流转 + 可审计

---

## 工程红线（必须遵守）

1. 新页面只能落在 **T1/T2/T3/T4**，禁止第 5 种布局。
2. 列表页筛选/排序/分页必须 URL 化（可分享、可回放）。
3. 模板组件禁止直连 API；页面只通过 VM Hook + BFF。
4. 前端禁止自定义状态枚举；状态只来自 `packages/shared`。
5. 库存只认 `inventory_ledger` 为事实源，余额表仅做查询加速。
6. 所有过账接口强制 `Idempotency-Key`。
7. 禁止物理删除已过账单据；只能作废/冲销。
8. 所有写操作必须带 `tenant_id` 与审计字段（who/when/what）。
9. BFF 是前端唯一数据入口，禁止页面绕过 BFF。
10. PR 必须通过：模板合规 + 状态契约 + 过账一致性测试。

---

## OpenSpec

常用：`/opsx:new` `/opsx:ff` `/opsx:apply` `/opsx:verify` `/opsx:archive`

推荐：规划 -> 实现 -> 验证 -> 归档

---

## Agent 沟通语言

**所有 agents 必须使用中文与用户沟通。**

调用其他 agent 时附加：

```text
使用中文与我沟通。
```

---

## 四文档一致性维护

四份文档：
- `CLAUDE.md`
- `AGENTS.md`
- `README.md`
- `CLAW.md`

维护规则：
1. 核心事实（命令、架构边界、业务约束）先改 `CLAUDE.md`
2. 同批同步三份文档
3. 允许文风差异（面向用户/面向 agent/面向执行清单），但事实必须一致

---

*此文件应纳入版本控制并持续维护。*
