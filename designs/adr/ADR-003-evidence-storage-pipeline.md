# ADR-003: 证据系统存储与处理流水线（上传、校验、审计、保留策略）

## Title
证据系统存储与处理流水线（S3 对象存储 + 异步校验 + 全链路审计 + 生命周期保留）

## Status
Proposed（建议采纳并在 Beta 阶段完成）

## Date
2026-03-01

## Context
MiniERP 已定义“单据级 + 行级”双层证据模型，并在 GRN/OUT/盘点等流程中作为关键能力（见 `designs/ui/miniERP_evidence_system.md` 与 `designs/product/miniERP-PRD-V1.md`）。
ADR-001 也将证据留痕列为核心架构约束，并提出是否需要异步病毒扫描与内容审计。

当前必须解决的问题：
1. 上传链路缺乏统一安全校验（MIME、魔数、病毒、篡改）。
2. 缺乏“对象存储元数据”和“业务绑定关系”的清晰边界。
3. 过账后“不可删除、可追溯”尚未形成可执行保留策略。
4. 行级证据需与 SKU 行精确绑定，支持争议追溯。

## Decision
采用“预签名直传 + 服务端确认 + 异步处理流水线 + 不可变审计 + 生命周期保留”方案。

### 决策清单表

| 决策项 | 方案 | 结论 | 推荐级别 |
|---|---|---|---|
| 文件存储介质 | S3 兼容对象存储（MinIO/AWS S3） | 采纳 | 强制 |
| 上传模式 | 预签名 URL 直传（客户端直达对象存储） | 采纳 | 强制 |
| 元数据模型 | `evidence_asset`（对象）+ `evidence_link`（业务绑定）双表 | 采纳 | 强制 |
| 处理机制 | BullMQ 异步队列（校验/扫描/缩略图/审计） | 采纳 | 强制 |
| 安全校验 | MIME + magic number + hash + 病毒扫描 + 大小限制 | 采纳 | 强制 |
| 删除策略 | 逻辑删除优先，过账后禁止删除，仅可追加 | 采纳 | 强制 |
| 保留策略 | 按证据类型分级保留（默认 3 年，可配置） | 采纳 | 强制 |
| 审计要求 | 上传、校验、访问、下载、删除请求全量审计 | 采纳 | 强制 |

### 流水线设计（可工程化）

1. **创建上传会话**
   - `POST /evidence/upload-sessions`
   - 入参：`entity_type/entity_id/line_ref/tag/file_name/size/content_type`
   - 返回：`upload_url`、`object_key`、`session_id`、过期时间、限制条件

2. **客户端直传对象存储**
   - 通过预签名 URL 上传原始文件
   - 对象 key 规范：`tenant/{tenant_id}/{entity_type}/{yyyy}/{mm}/{uuid}-{safeName}`

3. **上传确认**
   - `POST /evidence/upload-sessions/{id}/complete`
   - 服务器校验对象存在、大小匹配、ETag/Checksum

4. **异步处理队列（BullMQ）**
   - Job1：文件头与 MIME 校验（防伪扩展名）
   - Job2：病毒扫描（ClamAV/商用引擎）
   - Job3：图片处理（缩略图、EXIF 清理、方向修正）
   - Job4：元数据提取（宽高、hash、页数、设备信息）
   - Job5：审计落库与状态流转

5. **状态机**
   - `PENDING_UPLOAD -> UPLOADED -> VALIDATING -> ACTIVE`
   - 异常状态：`REJECTED`（非法文件）、`QUARANTINED`（疑似风险）

6. **业务绑定（双层模型）**
   - 单据级：`scope=document`
   - 行级：`scope=line` + `line_ref`（如 `grn_item_id`、`out_item_id`）

7. **访问与下载控制**
   - 下载走短期签名 URL 或后端代理下载
   - 强制 tenant 校验 + 权限校验 + 水印（可选）+ 审计记录

### 参考实现片段（可直接落地）

目标文件建议：
- `apps/server/src/modules/evidence/evidence.controller.ts`
- `apps/server/src/modules/evidence/evidence.service.ts`
- `apps/server/src/modules/evidence/jobs/evidence-processing.processor.ts`
- `apps/server/prisma/schema.prisma`

```ts
// 证据元数据（示意）
type EvidenceStatus = 'PENDING_UPLOAD' | 'UPLOADED' | 'VALIDATING' | 'ACTIVE' | 'REJECTED' | 'QUARANTINED';

interface EvidenceAsset {
  id: string;
  tenantId: string;
  objectKey: string;
  contentType: string;
  sizeBytes: number;
  sha256: string;
  status: EvidenceStatus;
  uploadedBy: string;
  uploadedAt: string;
}
```

```sql
-- 绑定关系（示意）
-- scope=document | line
CREATE TABLE evidence_link (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  asset_id uuid NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  scope text NOT NULL,
  line_ref uuid NULL,
  tag text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

## Alternatives

### 替代方案对比表

| 方案 | 描述 | 优点 | 缺点 | 结论 |
|---|---|---|---|---|
| A. 数据库存 BLOB | 文件直接存 PostgreSQL | 一体化事务简单 | DB 膨胀快、备份慢、成本高、CDN 不友好 | 不推荐 |
| B. 服务端中转上传 | 客户端先传业务服务，再落对象存储 | 安全校验点集中 | 带宽与 CPU 压力大，扩展性差 | 不推荐（作为默认） |
| C. 预签名直传 + 异步流水线 | 客户端直传，服务端控制会话与后处理 | 可扩展、成本低、可审计、吞吐高 | 架构复杂度更高 | 推荐 |
| D. 同步扫描后返回 | 上传时同步完成全部校验 | 结果即时 | 大文件/高并发时超时风险高 | 不推荐（可用于小文件场景） |

### 明确推荐与不推荐
- **推荐**：方案 C（预签名直传 + 异步流水线）。
- **不推荐**：方案 A（DB BLOB）、方案 B（全量中转）、方案 D（全同步处理）。

## Consequences

### Positive
1. 大文件与高并发上传可水平扩展，避免应用服务成为瓶颈。
2. 文件安全与合规能力提升（病毒扫描、格式校验、审计链完整）。
3. 双层证据（单据级/行级）可精准追溯，支持争议处理与质检追责。
4. 生命周期策略可控，降低长期存储成本。

### Negative
1. 引入对象存储 + 队列 + 扫描服务，运维复杂度提升。
2. 异步处理存在“最终一致性窗口”（上传后短时间不可见或状态未就绪）。
3. 需要完善失败重试、死信队列、人工复核流程。

## Implementation Plan

### Phase 1（MVP 最小闭环）
1. 落地上传会话 API、预签名直传、上传确认。
2. 建立 `evidence_asset` 与 `evidence_link` 数据模型。
3. 支持单据级与行级绑定、基础下载鉴权与审计。

### Phase 2（Beta 完整流水线）
1. 引入 BullMQ 异步处理（格式校验、hash、缩略图）。
2. 接入病毒扫描与隔离状态（`QUARANTINED`）。
3. 前端接入状态提示（处理中/可用/拒绝）。

### Phase 3（GA 治理与优化）
1. 生命周期策略：自动归档、保留到期清理任务。
2. 审计报表：上传成功率、拒绝率、下载热点、异常访问。
3. 容灾：跨可用区复制、定期恢复演练。

## Validation

1. **功能验证**
   - GRN/OUT/盘点流程可成功绑定单据级与行级证据。
   - 行级证据能精确定位到 `line_ref`。

2. **安全验证**
   - 非法扩展名与魔数不匹配文件必须被拒绝。
   - 病毒样本文件必须进入 `QUARANTINED`，不可下载。
   - 跨租户下载必须 100% 拒绝。

3. **性能验证（建议门槛）**
   - 获取上传会话 API P95 < 150ms。
   - 20MB 图片上传链路成功率 > 99.9%。
   - 上传确认到 `ACTIVE` 的 P95 < 10s（常规图片）。

4. **审计验证**
   - 上传、确认、处理、下载、删除请求全部有审计事件。
   - 审计事件包含 `tenant_id`、`asset_id`、`actor_id`、`ip`、`user_agent`、`request_id`。

## Risks
1. **恶意文件绕过风险**
   - 缓解：多引擎校验（MIME + 魔数 + 扫描）与隔离下载策略。
2. **对象存储成本增长风险**
   - 缓解：分层存储、缩略图策略、保留策略自动清理。
3. **异步队列积压风险**
   - 缓解：队列监控、并发配额、死信队列与自动重试上限。
4. **证据误删或误操作风险**
   - 缓解：过账后禁止删除、软删除 + 冷静期 + 审批流（可选）。

## Open Questions
1. 默认保留期是否按实体类型区分（如报价/库存争议/质检）还是统一 3 年。
2. 是否需要开启“法律冻结（Legal Hold）”以暂停到期清理。
3. 是否对下载图片增加动态水印（用户、时间、IP）以降低外泄风险。
4. 是否引入 OCR/AI 标签提取作为后续可选增强能力。