# Frontend codemap
- Freshness: 2026-03-14T01:22:05.958Z
- Files: 212
## Key modules
- apps/web/src (212 files)
## Internal import edges
- apps/web/src/app/(dashboard)/reports/page.tsx -> apps/web/src/app/(dashboard)/reports/reports-page-view.tsx
- apps/web/src/app/(dashboard)/reports/page.tsx -> apps/web/src/app/(dashboard)/reports/reports-page.ts
- apps/web/src/app/(dashboard)/reports/reports-page-view.tsx -> apps/web/src/app/(dashboard)/reports/reports-page.ts
- apps/web/src/app/(dashboard)/workspace/page.tsx -> apps/web/src/app/(dashboard)/workspace/workspace-home-page-view.tsx
- apps/web/src/app/(dashboard)/workspace/page.tsx -> apps/web/src/app/(dashboard)/workspace/workspace-home-page.ts
- apps/web/src/app/(dashboard)/workspace/workspace-home-page-view.tsx -> apps/web/src/app/(dashboard)/workspace/workspace-home-page.ts
- apps/web/src/app/api/bff/_shared/trading-order-mappers.ts -> apps/web/src/app/api/bff/procure/purchase-orders/_store.ts
- apps/web/src/app/api/bff/_shared/trading-order-mappers.ts -> apps/web/src/app/api/bff/sales/orders/_store.ts
- apps/web/src/app/api/bff/customers/[id]/route.ts -> apps/web/src/app/api/bff/_shared/masterdata-detail-resolvers.ts
- apps/web/src/app/api/bff/customers/route.ts -> apps/web/src/app/api/bff/mdm/customers/route.ts
- apps/web/src/app/api/bff/inventory/balance/[id]/route.ts -> apps/web/src/app/api/bff/inventory/balance/_store.ts
- apps/web/src/app/api/bff/inventory/balance/route.ts -> apps/web/src/app/api/bff/_shared/list-route-utils.ts
- apps/web/src/app/api/bff/inventory/balance/route.ts -> apps/web/src/app/api/bff/inventory/balance/_store.ts
- apps/web/src/app/api/bff/inventory/balances/route.ts -> apps/web/src/app/api/bff/inventory/contract.ts
- apps/web/src/app/api/bff/inventory/inout/route.ts -> apps/web/src/app/api/bff/inventory/balance/_store.ts
- apps/web/src/app/api/bff/inventory/inout/route.ts -> apps/web/src/app/api/bff/inventory/inout/_idempotency-store.ts
- apps/web/src/app/api/bff/inventory/inout/route.ts -> apps/web/src/app/api/bff/inventory/ledger/_store.ts
- apps/web/src/app/api/bff/inventory/ledger/[id]/route.ts -> apps/web/src/app/api/bff/inventory/ledger/_store.ts
- apps/web/src/app/api/bff/inventory/ledger/route.ts -> apps/web/src/app/api/bff/_shared/list-route-utils.ts
- apps/web/src/app/api/bff/inventory/ledger/route.ts -> apps/web/src/app/api/bff/inventory/balance/_store.ts
- apps/web/src/app/api/bff/inventory/ledger/route.ts -> apps/web/src/app/api/bff/inventory/ledger/_store.ts
- apps/web/src/app/api/bff/items/[id]/route.ts -> apps/web/src/app/api/bff/_shared/masterdata-detail-resolvers.ts
- apps/web/src/app/api/bff/items/[id]/route.ts -> apps/web/src/app/api/bff/mdm/skus/[id]/route.ts
- apps/web/src/app/api/bff/items/route.ts -> apps/web/src/app/api/bff/mdm/skus/route.ts
- apps/web/src/app/api/bff/mdm/customers/[id]/route.ts -> apps/web/src/app/api/bff/customers/[id]/route.ts
- ...truncated (66 more)
## External dependencies
- @/
- @minierp/shared
- lucide-react
- next
- node:crypto
- react
