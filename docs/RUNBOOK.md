# 运维 Runbook

本文档基于以下单一事实源自动整理：
- `package.json` 的 scripts
- `.env.example`

## 部署流程

当前仓库已新增基础 CI/CD 与容器化资产：
- CI：`.github/workflows/ci.yml`
- CD（staging）：`.github/workflows/cd-staging.yml`
- 镜像构建：`apps/web/Dockerfile`、`apps/server/Dockerfile`
- 构建上下文忽略：`.dockerignore`

标准执行顺序（与 CI 一致）：

1. 质量校验：

```bash
bun run lint
bun run test
bun run build
```

2. 容器构建校验：

```bash
docker build -f apps/web/Dockerfile .
docker build -f apps/server/Dockerfile .
```

3. staging 镜像发布：
- `cd-staging.yml` 在 `CI` 对 `main` 分支成功后触发（或手动触发）
- 将 web/server 镜像推送至 GHCR
- 当前部署步骤为 TODO（需补云平台 rollout 与健康检查）

## 监控与告警

`package.json` 未定义专门的监控/告警脚本。

当前可用的运维可观测命令：

```bash
# 本项目（web/server）日志
./project.sh server logs
./project.sh web logs

# 外部共享中间件（PostgreSQL/Redis）日志：需要到 infra 仓库执行
# 参考：docs/Macmini-infra.md
```

说明：本仓库的 `./project.sh` 采用“外部 infra 模式”，只负责探活，不负责在本仓库内启停/聚合 Docker Compose 日志。

## 常见问题与处理

### 1）基础设施服务未启动
现象：
- 应用无法连接 PostgreSQL 或 Redis。

检查与处理：

```bash
# 本项目只支持探活（不负责启动 infra）
./project.sh infra health
./project.sh infra doctor

# 启动/停止共享中间件请参考：docs/Macmini-infra.md
```

### 2）Web 无法访问后端 API
现象：
- 前端接口请求失败。

检查项：
- `.env` 中 `NEXT_PUBLIC_API_BASE_URL` 是否正确。
- `PORT` 与实际后端监听端口是否一致。

### 3）数据库或 Redis 连接错误
现象：
- 启动时报 DB/缓存连接异常。

检查项：
- `POSTGRES_*` 与 `DATABASE_URL` 是否正确。
- `REDIS_*` 与 `REDIS_URL` 是否正确。
- 对应服务是否已启动且端口可达。

### 4）db 脚本执行失败
现象：
- `bun run db:generate` 或 `bun run db:migrate` 失败。

原因：
- 根脚本会代理到 server 脚本；若 server 未定义对应脚本会失败。

处理：
- 在 server 包中补齐对应脚本，或改用已存在的 server 侧命令。

## 回滚流程

`package.json` 当前没有专门的回滚脚本。

基于现有脚本的回滚操作建议：
1. 回退到已验证的稳定代码版本。
2. 重新执行校验与构建：

```bash
bun run lint
bun run test
bun run build
```

3. 重新初始化依赖基础设施（必要时）：

- 本仓库默认采用“外部 infra 模式”，不在本仓库内执行 `docker compose up/down`。
- 若你使用 Mac mini 共享中间件，请参考 `docs/Macmini-infra.md` 在基础设施仓库内执行 `docker compose down/up`。

4. 使用日志确认恢复情况：

- 本项目日志：

```bash
./project.sh server logs
./project.sh web logs
```
