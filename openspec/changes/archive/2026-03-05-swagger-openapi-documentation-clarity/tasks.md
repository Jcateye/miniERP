## 1. 基础接入（Swagger Bootstrap）

- [ ] 1.1 安装依赖：`@nestjs/swagger`、`swagger-ui-express`
- [ ] 1.2 在 `apps/server/src/main.ts` 接入 `DocumentBuilder` + `SwaggerModule.setup`
- [ ] 1.3 配置文档路径：`/api/docs`、`/api/docs-json`
- [ ] 1.4 定义文档元信息（title/version/description/bearer auth）

## 2. 接口解释清晰化（Endpoint Description）

- [ ] 2.1 为公开 controller 增加 `@ApiTags`
- [ ] 2.2 为每个 endpoint 增加 `@ApiOperation(summary + description)`
- [ ] 2.3 为关键响应补充 `@ApiOkResponse/@ApiBadRequestResponse/@ApiUnauthorizedResponse`（按实际）
- [ ] 2.4 对不对外接口增加排除策略（如 `@ApiExcludeEndpoint`）

## 3. 字段解释清晰化（DTO Description）

- [ ] 3.1 对请求 DTO 字段补齐 `@ApiProperty/@ApiPropertyOptional`
- [ ] 3.2 每个关键字段补充 description + example（中文）
- [ ] 3.3 对 enum/date/decimal/分页字段补充格式与约束说明
- [ ] 3.4 对响应 DTO 同步补充字段说明，避免“只有请求有文档”

## 4. 质量门禁（OpenAPI Quality Gates）

- [ ] 4.1 新增 OpenAPI 导出脚本（如 `bun run --filter server openapi:generate`）
- [ ] 4.2 新增最小质量检查脚本（operation summary 与关键 schema description）
- [ ] 4.3 在 CI 集成文档校验任务
- [ ] 4.4 失败时输出可读错误（定位到 endpoint/schema）

## 5. 验收

- [ ] 5.1 本地启动后可访问 `/api/docs` 并可浏览全部公开接口
- [ ] 5.2 字段解释覆盖率达到约定阈值（建议核心模块 100%，其余模块渐进）
- [ ] 5.3 前端/BFF 能基于 Swagger 文档完成一次无口头解释联调
- [ ] 5.4 变更完成后可进入 `/opsx:apply`
