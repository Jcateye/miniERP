# 贡献指南

本文档基于以下单一事实源自动整理：
- `package.json` 的 scripts
- `.env.example`

## 开发流程

1. 安装依赖

```bash
bun install
```

2. 启动开发环境

```bash
bun run dev
```

按需启动单个应用：

```bash
bun run dev:web
bun run dev:server
```

3. 提交前执行质量检查

```bash
bun run build
bun run lint
bun run test
```

## 可用脚本

| 脚本 | 命令 | 说明 |
|---|---|---|
| `dev` | `turbo run dev` | 通过 Turborepo 启动所有 workspace 的开发任务。 |
| `dev:web` | `bun run --filter web dev` | 仅启动 Web 开发服务。 |
| `dev:server` | `bun run --filter server dev` | 仅启动 Server 开发服务。 |
| `build` | `turbo run build` | 构建所有 workspace。 |
| `test` | `turbo run test` | 运行所有 workspace 的测试任务。 |
| `lint` | `turbo run lint` | 运行所有 workspace 的代码检查任务。 |
| `db:generate` | `bun run --filter server db:generate` | 代理调用 server 的数据库生成脚本（当前为显式失败占位，提醒先接入 ORM 迁移工具，避免假成功）。 |
| `db:migrate` | `bun run --filter server db:migrate` | 代理调用 server 的数据库迁移脚本（当前为显式失败占位，提醒先接入 ORM 迁移工具，避免假成功）。 |
| `daily` | `./project.sh all start` | 日常一键启动：先探活外部 PostgreSQL/Redis，再启动 server/web。 |
| `project` | `./project.sh` | 生命周期脚本入口（推荐双参数：`<scope> <command>`，如 `infra health`、`server logs`）。 |

说明：
- `package.json` 中没有脚本注释，以上脚本说明由脚本名称与命令语义推导。
- 当前根脚本未提供“单测文件直跑”命令。
- 中间件采用外部共享模式，`project.sh infra *` 仅做探活，不执行启停。

## CI/CD 与容器化

- CI 工作流：`.github/workflows/ci.yml`
  - `bun install --frozen-lockfile`
  - `bun run lint`
  - `bun run build`
  - `bun run test`
  - `docker build -f apps/web/Dockerfile .`
  - `docker build -f apps/server/Dockerfile .`
- CD（staging）工作流：`.github/workflows/cd-staging.yml`
  - 监听 `CI` 在 `main` 分支成功后的运行（或手动触发）
  - 推送 web/server 镜像至 GHCR
  - 预留 staging 部署步骤 TODO（后续补云平台接入）
- 容器构建文件：`apps/web/Dockerfile`、`apps/server/Dockerfile`
- 构建上下文优化：`.dockerignore`

## 环境配置

复制 `.env.example` 为 `.env` 后再按环境修改：

```bash
cp .env.example .env
```

### 环境变量说明

| 变量名 | 示例值 | 用途 | 格式 |
|---|---|---|---|
| `NODE_ENV` | `development` | 运行环境模式。 | `development` \| `test` \| `production` |
| `PORT` | `3001` | Server 监听端口。 | 整数端口 |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:3001` | Web 调用后端 API 的基础地址（前端可见）。 | HTTP/HTTPS URL |
| `AUTH_CONTEXT_SECRET` | `dev-only-auth-context-secret` | 认证上下文签名/验签密钥。 | 非空字符串密钥 |
| `POSTGRES_HOST` | `localhost` | PostgreSQL 主机地址。 | 主机名/IP |
| `POSTGRES_PORT` | `5432` | PostgreSQL 端口。 | 整数端口 |
| `POSTGRES_DB` | `minierp` | PostgreSQL 数据库名。 | 字符串 |
| `POSTGRES_USER` | `minierp` | PostgreSQL 用户名。 | 字符串 |
| `POSTGRES_PASSWORD` | `change_me` | PostgreSQL 密码。 | 字符串 |
| `DATABASE_URL` | `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}` | PostgreSQL 连接串。 | `postgresql://...` DSN |
| `REDIS_HOST` | `localhost` | Redis 主机地址。 | 主机名/IP |
| `REDIS_PORT` | `6379` | Redis 端口。 | 整数端口 |
| `REDIS_URL` | `redis://${REDIS_HOST}:${REDIS_PORT}` | Redis 连接串。 | `redis://...` URL |
| `REDIS_KEY_PREFIX` | `erp_` | Redis 业务 key 前缀，避免与共享实例其他项目冲突。 | 字符串前缀 |

## 测试流程

使用根脚本：

```bash
bun run test
```

推荐在合并前执行：

```bash
bun run lint
bun run test
bun run build
```

当前基于事实源可确认的限制：
- 根脚本没有“运行单个测试文件”的命令。
- 根脚本没有覆盖率命令。
- 根脚本没有 E2E 测试命令。
- `apps/web` 当前无 `test` 脚本；web 侧新增断言暂未纳入根测试流水线。
