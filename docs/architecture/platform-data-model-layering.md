# platform-data-model-layering

最后更新：2026-03-15

## 目标与范围

本规范用于统一 `apps/server` 的数据模型分层与职责边界，解决：

- DTO / Domain / Persistence 混用导致的耦合与漂移
- ORM 模型被当成领域模型，导致业务规则外泄
- 跨层字段与状态口径不一致

范围：`apps/server` 全域模块（含 `masterdata`、`inventory`、`trading` 等）。

## 分层总览（服务端）

```text
Controller / API Layer
        │
        ▼
Application Layer
        │
        ▼
Domain Layer
        │
        ▼
Infrastructure Layer
        │
        ▼
Database
```

## 五类模型（模型层级）

### 1) DTO（Request/Response）
- 仅用于 API 输入输出与校验。
- 不包含业务逻辑。
- 允许与数据库字段不一致。
- 建议命名：`CreateXxxRequest` / `XxxResponse` / `XxxQuery`.

### 2) Domain Model / Entity
- 业务规则与核心状态的表达。
- 不依赖 ORM 与 API 协议。
- 可包含方法或规则校验（当前代码多以纯数据结构表达）。
- 建议命名：`XxxEntity`。

### 3) VO（Value Object）
- 领域内可复用值对象（不可变、无唯一 ID）。
- 例如：`Money` / `Email` / `DocNo`。
- 若暂未引入，可先以字符串/number 过渡，但新增规则应优先 VO 化。

### 4) Repository
- Domain 与持久层之间的契约。
- Domain 只依赖 repository interface。
- Infrastructure 提供具体实现（Prisma / InMemory）。

### 5) PO / DO（Persistence Object）
- 数据库映射对象（Prisma model 或 SQL row）。
- 仅承载持久化字段，不含业务规则。
- 与数据库 schema 一一对应。

## 转换职责（Mapper 约定）

```text
DTO -> Domain Entity -> PO (DB)
DB -> PO -> Domain Entity -> DTO
```

- Controller 负责解析与基础校验（当前多数 controller 使用手写 parse 函数）。
- Application 负责 DTO <-> Domain 的组装与业务流程编排。
- Infrastructure 负责 PO <-> Domain 的映射（例如 `mapWarehouseEntity`）。

## 与 shared canonical contract 的关系

`packages/shared/src/types/erp/*` 是 canonical ERP contract 的唯一新增入口：

- BFF / Server 交互的 DTO 必须优先复用 shared canonical 类型。
- 页面私有字段或暂未冻结的字段走局部 DTO 或 `ext`。
- 状态枚举统一来自 shared（禁止自造枚举）。

## 目录映射（现状对齐）

当前 `apps/server` 主要结构已接近分层，但仍存在模型混用：

```text
apps/server/src/modules/<module>/
  controllers/      -> DTO 解析、校验、输入输出
  application/      -> 业务编排、调用 repository
  domain/           -> Entity/VO/Repository 接口、错误
  infrastructure/   -> Repository 实现、PO <-> Domain 映射
  prisma/           -> Prisma schema (PO/DO)
```

示例（masterdata）：
- Domain：`domain/*.types.ts` 定义 `XxxEntity / Command / Repository`。
- Infrastructure：`prisma-*.repository.ts` 实现映射与持久化。
- Controller：手写校验与 command 组装。

说明：当前 `domain/*.types.ts` 中 `Create/Update/Query` 结构属于“过渡命令模型”。
新增模块应优先将 **Request/Response DTO** 放入 `controllers` 邻近目录（或新增 `dto/`），并保持 Domain 仅保留实体与 repository 接口。

## 命名与落地约定（新增/改动时遵守）

- DTO：`XxxRequest` / `XxxResponse` / `XxxQuery`
- Domain：`XxxEntity` / `XxxVO`
- Repository：`XxxRepository`
- PO/DO：由 Prisma model 命名（`Xxx`），映射函数 `mapXxxEntity`
- 允许 `Command` 作为过渡类型，但不要把它当作长期 domain 模型

## 禁止事项

- 不允许在 Controller / Application 直接使用 Prisma model 作为领域模型。
- 不允许把 DTO 放进 `domain/` 作为实体替代物。
- 不允许在 `packages/shared` 之外新增跨层状态枚举。

## 可选扩展（AI / Agent 体系）

若引入 AI/Agent 领域，可新增以下模型类型（仍遵循分层）：

```text
Session / Message / ToolCall / Memory / Event
```

这些模型作为独立领域模块引入，不应污染既有业务域模型。
