## Why

当前 miniERP server 已有基础 REST 接口，但缺少统一的 OpenAPI/Swagger 文档出口，接口使用方（web/BFF/第三方）难以快速确认：
- 每个接口的业务语义与使用场景
- 请求字段/响应字段的含义、约束与示例
- 错误码与异常场景

这会导致联调成本高、沟通反复、字段误用概率上升。需要通过 OpenSpec 新增“Swagger 接入 + 文档清晰化”能力，并作为后续接口开发的准入门槛。

## What Changes

- 新增 Swagger/OpenAPI 接入能力：在 NestJS 启动阶段挂载 `/api/docs`（UI）与 `/api/docs-json`（原始文档）。
- 新增接口说明规范：所有公开接口必须有 summary/description/tag。
- 新增字段说明规范：DTO 字段必须提供中文说明、示例、是否必填、格式约束（必要时）。
- 新增参数与返回规范：path/query/body/response 与常见错误响应必须在 OpenAPI 中可见。
- 新增文档质量门禁：CI 中增加 Swagger 文档完整性检查（最小规则集）。

## Capabilities

### New Capabilities
- `swagger-openapi-bootstrap`: 定义 server 启动时 OpenAPI 文档注册与访问路径。
- `api-contract-description-quality`: 定义接口级说明质量（summary/description/tag/错误语义）。
- `dto-field-description-quality`: 定义字段级说明质量（描述、示例、约束、可选性）。
- `openapi-quality-gates`: 定义 Swagger 文档生成与质量校验门禁。

### Modified Capabilities
- 无（本次新增能力，不修改既有 OpenSpec 能力语义）。

## Impact

- 影响目录：
  - `apps/server/src/main.ts`
  - `apps/server/src/**/controllers/*.ts`（或现有 controller 文件）
  - `apps/server/src/**/dto/*.ts`（或现有 DTO 定义文件）
  - `apps/server/package.json`（Swagger 依赖与脚本）
  - `openspec/changes/swagger-openapi-documentation-clarity/specs/**`
- 影响协作：前端/BFF/测试可通过 `/api/docs` 作为接口事实来源。
- 风险控制：通过“最小必填文档规则”降低接入摩擦，避免一开始过度约束。
