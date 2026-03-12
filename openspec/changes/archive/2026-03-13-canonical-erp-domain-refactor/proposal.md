## Why

miniERP 当前已经有较完整的页面与设计蓝图，但共享类型、Prisma schema、BFF route 和前端表单仍停留在多套并行的 demo 级模型，导致字段深度、状态语义和命名边界持续漂移。现在必须先冻结 canonical ERP contract，才能继续安全扩展主数据、交易、库存与财务能力。

## What Changes

- 建立 canonical ERP 域模型冻结文档，明确正式域名、公共字段、状态源和兼容窗口。
- 在 `packages/shared` 新增 `types/erp/*` canonical 类型目录，统一主数据、交易、库存、财务的共享契约。
- 将旧 `document.ts`、`documents.ts`、`entities.ts`、`masterdata.ts` 等类型文件降为兼容导出层。
- 修复当前 `apps/web` 的构建阻塞，恢复全量 build 验证基线。
- 将采购/销售新建表单的状态值切到 canonical code，移除中文状态直接入参。

## Capabilities

### New Capabilities
- `erp-canonical-contract-freeze`: 定义 miniERP 的 canonical 域命名、公共字段、状态和兼容边界。
- `erp-shared-canonical-types`: 提供主数据、交易、库存、财务的 canonical shared DTO 与兼容别名。
- `web-build-baseline`: 恢复 web 侧稳定构建基线，避免 UI 层阻塞后续域模型重构。

### Modified Capabilities
- `bff-fallback-policy`: 写接口与共享契约治理收紧，禁止继续通过 view fixture/meta 补充后端事实字段。

## Impact

- `packages/shared` 类型导出结构与文档状态源
- `apps/web` 组件导出、采购/销售表单与 BFF route payload
- 四文档、规则文档、memory 记录与新增 canonical contract freeze 文档
- 后续 Prisma / Server / BFF / Web 重构的接口基线
