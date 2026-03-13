# Proposal: documents-facade-compatibility-shrink

## Why

`DocumentsService` 已经把 persisted `create/action` 和 `list/getDetail` 委托给 trading write/read services，但文件里仍残留大量历史 persisted 私有实现。这会让兼容 façade 的边界再次模糊，也增加后续继续抽离时的判断成本。

## What Changes

- 删除 `DocumentsService` 中已不再被调用的 persisted 私有 helper 与实现。
- 保留 `DocumentsService` 作为 `/documents` 兼容 façade、幂等缓存、in-flight dedup、demo/in-memory `ADJ` 路径。
- 增加 focused test，确认 `ADJ` / demo fallback 仍由 façade 自己处理，不委托 trading read service。

## Impact

- 影响模块：`apps/server/src/modules/documents`、`apps/server/src/modules/trading`
- 不改 controller/BFF/API 形状
- 不改 Prisma schema
