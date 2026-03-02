# DFP API 协议冻结（v1.1）

## 目标
冻结命令/查询协议与错误语义，支持前后端按协议并行开发。

## 1. API 分层
- 命令接口（REST）：create/update/confirm/post/cancel/upload/attach
- 查询接口（REST/GraphQL）：list/detail/aggregate/ledger

## 2. 响应包络（对齐 shared）
### 2.1 成功
```ts
interface ApiResponse<T> {
  data: T
  message: string
}
```

### 2.2 错误
```ts
interface ApiError {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}
```

### 2.3 分页
```ts
interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
```

## 3. 协议字段规范
- 金额/数量字段在 API 层统一传输为 decimal-string
- bigint ID 在 API 层统一传输为 string
- tenant-owned 接口必须由服务端注入 tenant 上下文
- 状态变更命令必须返回最新状态与审计锚点字段（至少含 `status`, `updated_at`）

## 4. 错误码分类
- `VALIDATION_*`: 入参/状态前置校验失败
- `AUTH_*`: 鉴权/授权失败
- `TENANT_*`: 租户隔离冲突
- `IDEMPOTENCY_*`: 幂等冲突或重放
- `INVENTORY_*`: 库存一致性失败（含负库存拦截）
- `EVIDENCE_*`: 证据上传/绑定/状态失败

## 5. 幂等协议（统一）
- 命令接口请求头必须支持 `Idempotency-Key`
- 记录模型：`idempotency_record`
- 唯一键：`(tenant_id, idempotency_key)`
- 冲突语义：
  - 同 key + 同 payload：返回首个成功结果
  - 同 key + 不同 payload：返回冲突错误

## 6. 并行开发规则
- 前端允许基于本协议 mock 开发
- 后端实现不得变更已冻结字段语义；若必须变更，走 DFP 变更流程并升级版本号