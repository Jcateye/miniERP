## 0. 归档与基线治理

- [ ] 0.1 归档历史 active changes，建立单一执行入口。
- [ ] 0.2 创建本 change 全套 artifacts（proposal/design/specs/tasks）。
- [ ] 0.3 发布执行门禁标记：`DB-BASELINE-READY`、`PLATFORM-READY`、`MASTERDATA-READY`、`INV-READY`、`EVIDENCE-READY`、`PUR-IN-READY`、`SAL-OUT-READY`、`READY-FOR-PARALLEL-DEV`。

## 1. DB 初始化（先完成）

- [ ] 1.1 新建 `apps/server/prisma/schema.prisma`，覆盖首批全核心表。
- [ ] 1.2 新建首批 migration（DDL + constraints + indexes）。
- [ ] 1.3 新建 `apps/server/prisma/seed.ts`（tenant/user/masterdata/PO/GRN/SO/OUT/ledger/evidence）。
- [ ] 1.4 新建 `apps/server/src/database/prisma.service.ts`。
- [ ] 1.5 更新 `apps/server/src/database/database.module.ts` 注入 PrismaService。
- [ ] 1.6 更新 `apps/server/package.json`：`db:generate`、`db:migrate`、`db:seed` 为真实脚本。
- [ ] 1.7 执行并记录验证：`db:generate`、`db:migrate`、`db:seed`。
- [ ] 1.8 发布门禁：`DB-BASELINE-READY`。

## 2. Stream A - platform

- [ ] 2.1 对齐 tenant context、auth context、中间件入口。
- [ ] 2.2 对齐 IAM 权限校验与 audit 记录最小字段。
- [ ] 2.3 输出交付：`PLATFORM-READY`。

## 3. Stream B - masterdata

- [ ] 3.1 将 sku/warehouse/supplier/customer repository 切换为 Prisma 持久化实现。
- [ ] 3.2 保持 CRUD + 查询与 shared contract 对齐。
- [ ] 3.3 输出交付：`MASTERDATA-READY`。

## 4. Stream E - inventory

- [ ] 4.1 落地 ledger append-only 与 reversal 约束。
- [ ] 4.2 落地幂等记录持久化与 payload hash 冲突校验。
- [ ] 4.3 落地防负库存事务校验。
- [ ] 4.4 输出交付：`INV-READY`。

## 5. Stream F - evidence

- [ ] 5.1 落地 evidence_asset + evidence_link 持久化与 scope 约束。
- [ ] 5.2 完成 upload-intent/links 的最小真实链路。
- [ ] 5.3 对齐 document/line 查询与审计。
- [ ] 5.4 输出交付：`EVIDENCE-READY`。

## 6. Stream C - purchase+inbound（依赖 B+E）

- [ ] 6.1 落地 PO/GRN 状态机持久化与错误语义。
- [ ] 6.2 落地 GRN 过账前校验与库存调用契约。
- [ ] 6.3 输出交付：`PUR-IN-READY`。

## 7. Stream D - sales+outbound（依赖 B+E）

- [x] 7.1 落地 SO/OUT 状态机持久化与错误语义。
- [x] 7.2 落地 OUT 库存校验与过账契约。
- [x] 7.3 输出交付：`SAL-OUT-READY`。

## 8. Shared + BFF 策略收口

- [ ] 8.1 `packages/shared` 收敛 `ApiEnvelope<T>`、`PageResult<T>`、Document/Evidence 全域枚举。
- [ ] 8.2 BFF fallback 策略改为默认禁用，仅 development 显式开关可启用。
- [ ] 8.3 所有 fallback 分支返回明确错误与可追踪 header。

## 9. 并行开发启动门禁

- [ ] 9.1 验证并行依赖图满足：A+DB 先行，B/E/F 并行，C/D 后置。
- [ ] 9.2 输出分工表与执行顺序，标记 `READY-FOR-PARALLEL-DEV`。
- [ ] 9.3 提交 OpenSpec 任务变更并进入并行开发阶段。
