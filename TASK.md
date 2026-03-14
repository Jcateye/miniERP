# Task5: platform-iam + platform-policy (RBAC + authorize() + obligations framework)

## Background (already merged)
The following foundations are already in `main`:
- PR #49: platform packages skeletons + tenant context (AsyncLocalStorage) + resolver (JWT-ready; dev header fallback)
- PR #50: multi-schema tenant migrations runner + tenant init
- PR #51: platform-db `withTenantTx` + `SET LOCAL search_path` + `public.tenants` registry + integration test

Key paths to read (do NOT re-implement):
- `packages/platform-tenant/*` (tenant context / resolver)
- `packages/platform-db/*` + `apps/server/src/database/platform-db.service.ts`
- `docs/architecture/platform-db-tenant-tx.md`

This Task5 builds authorization on top of the above.

## Goal
Create a minimal, extensible authorization system split into:
1) **platform-iam**: tenant-scoped RBAC (roles, permissions, bindings)
2) **platform-policy**: `authorize(action, resource, ctx)` returning `decision + obligations`

Must be JWT-ready (tenantId/userId will ultimately come from JWT claims), but for now it can read from existing server context services.

## Non-goals (avoid over-design)
- No microservices split
- No UI / admin console yet
- Do not implement a full policy language; keep obligations as structured outputs

## Required concepts
### A) Resource & action naming
- Resource naming must be **app-owned** but platform-enforced.
- Convention: `<app>:<domain>[:<entity>]` e.g. `erp:order`, `erp:inventory-ledger`
- Action convention: `read | create | update | delete | approve | post | export | *`

### B) authorize() contract
Create a stable API:
```ts
export type Decision = 'allow' | 'deny';

export type Obligations = {
  data?: unknown;      // filter AST / prisma where
  fields?: { allow?: string[]; deny?: string[] };
  buttons?: { allow?: string[]; deny?: string[] };
  workflow?: { allowTransitions?: string[]; denyTransitions?: string[] };
};

export type AuthzResult = { decision: Decision; obligations: Obligations; reason?: string };

export async function authorize(input: {
  tenantId: string;
  userId: string;
  action: string;
  resource: string;
  context?: Record<string, unknown>;
}): Promise<AuthzResult>;
```

### C) RBAC minimal model (tenant scope)
Implement minimal entities (Prisma models + CRUD helpers):
- `IamRole`
- `IamPermission` (or store permissions as strings on role; choose one but justify)
- `IamRoleBinding` (userId + roleId + tenantId)

Permissions are strings like `erp:order:read` or wildcard `erp:*`.

### D) Obligations framework (extensible)
- For now: `authorize()` should produce `decision` via RBAC.
- Obligations can be empty today, but must have a defined structure and merge strategy.
- Future: data/field/button/workflow controls should be expressed via obligations, not by exploding RBAC tables.

### E) Enforcement points
- Backend must enforce `authorize()` at route/handler or service boundary.
- Provide at least one reference enforcement example in server (e.g. a guard/middleware) but keep it minimal.

## Deliverables
1) New packages:
- `packages/platform-iam` (RBAC types + helpers)
- `packages/platform-policy` (authorize + obligations types)

2) Prisma schema updates for IAM tables (tenant scoped)
3) Minimal seed/init for new tenant: create default `Admin` role and bind first user (optional placeholder)
4) Tests:
- Unit tests for permission matching (wildcards)
- Integration test: 2 users with different roles -> same authorize() returns allow/deny

5) Docs:
- `docs/architecture/platform-iam-policy.md` describing the split, naming conventions, and extension plan

## Acceptance criteria
- ✅ `authorize()` works for RBAC allow/deny and returns `{decision, obligations}`
- ✅ Admin role can allow `erp:*` within a tenant
- ✅ Non-admin is denied for a protected resource/action
- ✅ Enforcement example exists in server and cannot be bypassed by only hiding UI
- ✅ Clear naming convention documented to avoid permission chaos

## Suggested implementation order
1) Define types + permission matching algorithm (wildcard)
2) Add Prisma models + migration
3) Implement `authorize()` using IAM bindings
4) Add tests
5) Add minimal server guard example + docs
