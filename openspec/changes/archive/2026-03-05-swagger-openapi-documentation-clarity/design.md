## Context

miniERP 服务端基于 NestJS 11，当前具备全局校验、统一响应拦截与异常过滤，但尚未形成可直接消费的 OpenAPI 文档。接口说明散落在代码与沟通中，无法作为稳定协作契约。

本设计在不改变现有业务分层（controller/application/domain/infrastructure）的前提下，为 REST 接口建立可持续维护的 Swagger 文档体系，并把“接口解释和字段解释清晰”变成可验证标准。

## Goals / Non-Goals

**Goals**
- 提供统一 Swagger 出口，支持 UI 浏览与 JSON 导出。
- 让每个公开接口具备清晰业务解释（做什么、何时用、关键约束）。
- 让每个关键字段具备清晰含义（单位、格式、示例、可选性）。
- 用最小质量门禁保证新接口不会“裸奔”上线。

**Non-Goals**
- 本变更不重构现有业务流程与权限模型。
- 不在本次引入 API 文档门户系统（仅 Swagger/OpenAPI 基础能力）。
- 不要求一次性补全全部历史接口；按模块逐步补齐并有门禁策略。

## Decisions

### 决策 1：文档入口采用 SwaggerModule + DocumentBuilder

- 在 `main.ts` 启动阶段生成 OpenAPI 文档。
- 统一路径：`/api/docs`（Swagger UI）与 `/api/docs-json`（原始 JSON）。
- 文档元信息包含：项目名 miniERP、版本、鉴权方式（Bearer）。

**理由**：NestJS 官方方案，维护成本最低，能快速对齐前后端协作。

---

### 决策 2：接口说明采用“强制最小集”

每个公开 controller endpoint 至少具备：
- `@ApiOperation({ summary, description })`
- `@ApiTags(...)`
- 常见响应说明（成功 + 核心错误场景）

**理由**：强制最小集可确保“解释清晰”，又不会造成过重文档负担。

---

### 决策 3：字段说明采用 DTO 装饰器标准化

DTO 字段要求：
- `@ApiProperty` / `@ApiPropertyOptional`
- `description`（中文业务语义）
- `example`（典型值）
- 必要时补充 `enum/format/minLength/maxLength/minimum` 等约束

**理由**：字段文档与校验规则就近维护，降低漂移概率。

---

### 决策 4：文档质量通过“可自动检查”落地

- 提供 OpenAPI 文档生成脚本。
- 增加轻量校验（至少检查 operation summary 与关键 schema 描述存在）。
- 在 CI 对新增/变更接口执行校验。

**理由**：没有门禁的规范会逐步失效；自动校验是长期有效机制。

## Risks / Trade-offs

- [历史接口补齐成本] → 采用“增量补齐 + 新增接口强制”策略，避免一次性大改。
- [文档与实现漂移] → 通过 DTO 与装饰器同文件维护 + CI 校验减轻漂移。
- [过度注释造成噪音] → 规定说明模板（业务语义 + 约束 + 示例），避免空话。

## Migration Plan

1. Phase A（基础接入）
   - 安装 Swagger 依赖，接入 `main.ts`。
   - 暴露 `/api/docs` 与 `/api/docs-json`。

2. Phase B（规范落地）
   - 优先补齐 `health` 与核心业务 controller 的接口说明。
   - 对关键 DTO 增加字段解释与示例。

3. Phase C（质量门禁）
   - 增加文档生成/校验脚本。
   - 在 CI 中执行，阻断明显缺失的文档质量问题。

## Open Questions

- 错误码是否沿用现有统一响应结构，还是额外定义 OpenAPI 专用错误 schema（推荐后者逐步补齐）？
- 对内部接口是否默认隐藏（`@ApiExcludeEndpoint`）还是统一暴露并用 tag 标注 internal？
- 是否需要在本阶段同步生成静态 `openapi.json` 并纳入版本管理？
