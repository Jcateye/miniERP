# EVIDENCE-READY

## Gate
- Marker: `EVIDENCE-READY`
- Stream: F (evidence)
- Date: 2026-03-05

## Completed Scope
- 5.1 落地 evidence_asset + evidence_link 持久化与 scope 约束。
- 5.2 完成 upload-intent/links 的最小真实链路。
- 5.3 对齐 document/line 查询与审计。
- 5.4 输出交付：`EVIDENCE-READY`。

## Implementation Notes
- Evidence module provider 切换：`apps/server/src/modules/evidence/evidence.module.ts`
  - `NODE_ENV=test` 使用 in-memory evidence repository。
  - 其他环境使用 Prisma evidence repository。
- evidence domain/schema 重构：`apps/server/src/evidence/domain/evidence-binding.schema.ts`
  - 统一 `scope + lineRef` 主契约。
  - 保留 `lineRef` 约束（line 必填、document 为空）。
- evidence 持久化仓储：`apps/server/src/evidence/infrastructure/evidence-binding.repository.ts`
  - upload-intent 持久化到 `evidence_asset`。
  - links 持久化到 `evidence_link`，并保证同键幂等。
  - 查询按 `entityType + entityId + scope + lineRef + tag` 过滤。
- evidence service/审计：`apps/server/src/evidence/application/evidence-binding.service.ts`
  - `evidence.query` / `evidence.upload_intent` / `evidence.bind` 审计记录。
- evidence controller：`apps/server/src/modules/evidence/controllers/evidence.controller.ts`
  - `GET /evidence/links`：真实 document/line 查询回路。
  - `POST /evidence/upload-intents`：返回 `assetId + uploadUrl + objectKey + expiresAt`。
  - `POST /evidence/links`：兼容 `evidenceId|assetId`、`scope|bindingLevel`、`lineRef|lineId`。

## Validation
- `bun run --filter server db:generate`
- `bun run --filter server test -- src/evidence/application/evidence-binding.service.spec.ts src/modules/evidence/controllers/evidence.controller.spec.ts`
- `bun run --filter server build`
