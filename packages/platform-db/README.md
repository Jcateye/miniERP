# @minierp/platform-db

## 目的

提供 platform 层的数据库相关能力骨架（当前仅用于占位与依赖边界约束）。

> 注意：本仓库当前的 Prisma client / NestJS DatabaseModule 仍在 `apps/server` 内；后续会逐步收敛到 platform-db。

## 使用

```ts
import {} from '@minierp/platform-db'
```

## 验证

- 构建：`bun run --filter @minierp/platform-db build`
- Lint：`bun run --filter @minierp/platform-db lint`
