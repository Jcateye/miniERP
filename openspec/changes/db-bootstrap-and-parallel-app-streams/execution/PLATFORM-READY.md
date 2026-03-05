# PLATFORM-READY

## Gate
- Marker: `PLATFORM-READY`
- Stream: A (platform)
- Date: 2026-03-05

## Completed Scope
- tenant context / auth context 中间件接入与环境策略已对齐。
- IAM guard 权限校验与跨租户控制可用。
- Audit 存储已支持 Prisma 持久化（测试环境保留 in-memory）。
- 运行时配置 `runtime-config` 已统一挂载中间件与全局校验。

## Validation
- `bun run --filter server test -- src/common/iam/auth-context.middleware.spec.ts`
- `bun run --filter server test -- src/common/tenant/tenant-context.middleware.spec.ts`
- `bun run --filter server test -- src/common/iam/iam.guard.spec.ts`
- `bun run --filter server test -- src/audit/application/audit.service.spec.ts`
