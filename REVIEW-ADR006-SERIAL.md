# ADR-006 Serial Development Review

> 生成时间: 2026-03-05
> 分支: feat/adr006-serial-dev
> 基线: main (44774e8)

---

## 1. 已实现 vs 未实现

### 1.1 已实现内容

| 任务 | 状态 | 实现位置 | 备注 |
|------|------|----------|------|
| 1.1 Documents list/detail/action | ✅ 完成 | 双路径实现（见冲突分析） | 状态机映射已复用 `status-transition.ts` |
| 1.2 Evidence links/upload-intents | ✅ 完成 | 双路径实现（见冲突分析） | 最小协议已实现 |
| 1.3 GRN/OUT 接 Inventory 过账 | ✅ 完成 | `modules/documents/services/documents.service.ts:263-278` | 幂等重放已集成 |
| P2.1-P2.4 SKU/Warehouse/Supplier/Customer CRUD | ✅ 完成 | `modules/masterdata/` | 含单测 |
| P2.5 模块注册到 AppModule | ✅ 完成 | `app.module.ts` | MasterdataModule 已注册 |

### 1.2 未实现内容

| 任务 | 状态 | 优先级 | 说明 |
|------|------|--------|------|
| 1.4 BFF 强制 Idempotency-Key | ❌ 未完成 | P0 | BFF 仅透传 header，未强制校验缺失返回 400 |
| 1.5 P0 集成测试 | ❌ 未完成 | P0 | 缺失：非法状态迁移、跨租户绑定拒绝、幂等重放、库存不足等分支测试 |
| 1.6 Staging 联调门禁验证 | ❌ 未完成 | P0 | fallback 命中率验证未执行 |
| 2.1-2.4 P1 Shared Contract 收敛 | ❌ 未完成 | P1 | DTO/枚举/错误码尚未统一到 `packages/shared` |

---

## 2. 边界冲突分析（CRITICAL）

### 2.1 Documents/Evidence 双路径冲突

**问题描述**: 存在两套并行的 documents/evidence 实现，路由注册存在歧义。

#### 路径 A: 根目录实现（孤立）

```
apps/server/src/
├── documents/
│   ├── documents.controller.ts   # @Controller('documents')
│   └── documents.module.ts       # DocumentsModule (未注册到 AppModule)
└── evidence/
    ├── evidence.controller.ts    # @Controller('evidence')
    └── evidence.module.ts        # EvidenceModule (未注册到 AppModule)
```

#### 路径 B: modules 目录实现（已注册）

```
apps/server/src/modules/
├── documents/
│   ├── controllers/documents.controller.ts  # @Controller('documents')
│   ├── services/documents.service.ts        # 含 Inventory 集成
│   └── documents.module.ts                  # DocumentsModule (已注册)
└── evidence/
    ├── controllers/evidence.controller.ts   # @Controller('evidence')
    └── evidence.module.ts                   # EvidenceModule (已注册)
```

**冲突点**:
1. 两个 `@Controller('documents')` 装饰器，NestJS 会按模块注册顺序决定路由优先级
2. 两个 `DocumentsModule`/`EvidenceModule` 类名，虽然只有 modules/ 下的被注册
3. 路径 A 的 `documents.controller.ts` 有 381 行独立实现（含 Swagger 装饰器）
4. 路径 B 的 `documents.service.ts` 才有 Inventory 集成逻辑

### 2.2 唯一方案

**决策**: 保留 `modules/` 路径，删除根目录 `documents/`、`evidence/` 目录

**理由**:
1. `modules/documents/services/documents.service.ts` 已实现 Inventory 集成（ADR-006 Phase 3 要求）
2. `app.module.ts` 已导入 `modules/` 下的模块
3. 代码组织符合 NestJS 模块化最佳实践

**执行步骤**:
```bash
# 删除孤立实现
rm -rf apps/server/src/documents/
rm -rf apps/server/src/evidence/
```

**补充**: 路径 A 的 `documents.controller.ts` 有完整的 Swagger 装饰器，需迁移到路径 B 的 controller。

---

## 3. 构建状态

**当前状态**: ❌ 构建失败

**错误原因**: 依赖未安装（worktree 环境问题，非代码问题）

```
TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.
TS2580: Cannot find name 'process'. Do you need to install @types/node
```

**修复命令**:
```bash
bun install
```

---

## 4. 串行执行计划

### Phase 0: 环境准备（前置）

| 步骤 | 命令 | 产出 | 验收 |
|------|------|------|------|
| 0.1 安装依赖 | `bun install` | node_modules 就绪 | 无报错 |
| 0.2 验证构建 | `bun run --filter server build` | 构建成功 | exit code 0 |

### Phase 1: 冲突清理（必须先做）

| 步骤 | 操作 | 产出 | 验收 |
|------|------|------|------|
| 1.1 迁移 Swagger 装饰器 | 从 `src/documents/documents.controller.ts` 复制到 `src/modules/documents/controllers/documents.controller.ts` | 完整 API 文档 | `bun run dev:server` 后 Swagger 可访问 |
| 1.2 删除孤立目录 | `rm -rf src/documents/ src/evidence/` | 单一路径 | 目录不存在 |
| 1.3 验证构建 | `bun run --filter server build` | 构建成功 | exit code 0 |
| 1.4 验证路由 | `curl localhost:3001/api/documents` | 返回数据 | HTTP 200 |

### Phase 2: P0 补齐（核心闭环）

| 步骤 | 操作 | 产出 | 验收 |
|------|------|------|------|
| 2.1 BFF 强制 Idempotency-Key | 修改 `apps/web/src/app/api/bff/documents/[docType]/[id]/[action]/route.ts` | 缺失时返回 400 | 无 header 时返回 `{error: {code: 'IDEMPOTENCY_KEY_REQUIRED'}}` |
| 2.2 状态迁移测试 | 在 `modules/documents/` 添加 `documents.service.spec.ts` | 覆盖非法迁移、幂等重放 | `bun run --filter server test` 通过 |
| 2.3 跨租户测试 | 在 `modules/evidence/` 添加测试 | 覆盖跨租户绑定拒绝 | 测试通过 |
| 2.4 库存不足测试 | 在 `modules/inventory/` 补充分支测试 | 覆盖库存不足场景 | 测试通过 |

### Phase 3: P0 验收

| 步骤 | 操作 | 产出 | 验收 |
|------|------|------|------|
| 3.1 四链路联调 | 手动测试 PO/SO/GRN/OUT 的 list/detail/action | 页面可操作 | 无 fallback 命中 |
| 3.2 Staging 门禁 | 确认 `x-bff-fallback-hit=1` 请求为 0 | fallback 命中率=0 | 日志确认 |

### Phase 4: P1 收敛（可选延后）

| 步骤 | 操作 | 产出 | 验收 |
|------|------|------|------|
| 4.1 DTO 统一 | 迁移到 `packages/shared/src/types/` | 单一来源 | 三端引用 shared |
| 4.2 枚举统一 | 迁移状态码、错误码 | 单一来源 | 无重复定义 |
| 4.3 回归验证 | 重新执行 Phase 3 | P0 门禁持续通过 | 无破坏 |

---

## 5. 依赖关系图

```
Phase 0 (环境)
    │
    ▼
Phase 1 (冲突清理) ─────────────────────────┐
    │                                        │
    ▼                                        │
Phase 2 (P0 补齐)                            │
    ├─ 2.1 BFF Idempotency-Key              │
    ├─ 2.2 状态迁移测试                      │
    ├─ 2.3 跨租户测试                        │
    └─ 2.4 库存不足测试                      │
    │                                        │
    ▼                                        │
Phase 3 (P0 验收)                            │
    │                                        │
    ▼                                        │
Phase 4 (P1 收敛) ◄──────────────────────────┘
```

---

## 6. 风险提示

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 双路径删除遗漏 | 运行时路由冲突 | Phase 1.2 后全局搜索确认 |
| Swagger 装饰器丢失 | API 文档不完整 | Phase 1.1 逐行对比迁移 |
| BFF 强制校验破坏现有调用 | 前端报错 | 先确认前端已传 header |
| 测试覆盖不足 | 边缘 case 未验证 | Phase 2 必须完成全部 4 项 |

---

## 7. 等待确认

请确认以下事项后开始执行：

- [ ] Phase 1 冲突清理方案（保留 modules/ 路径）是否同意？
- [ ] Phase 2 测试用例是否需要补充其他场景？
- [ ] Phase 4 P1 收敛是否在本次串行计划中执行，还是延后？

---

**下一步**: 确认后执行 Phase 0 -> Phase 1 -> Phase 2 -> Phase 3
