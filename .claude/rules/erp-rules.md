---
paths:
  - "src/**/*.{ts,tsx}"
---

# miniERP 开发规则

## 业务逻辑

### 单据编号
- 格式：`DOC-{type}-{YYYYMMDD}-{seq}`
- 示例：`DOC-PO-20260301-001`
- 类型码：PO(采购)、SO(销售)、GRN(入库)、OUT(出库)、ADJ(调整)

### 金额计算
- **必须**使用 `decimal.js` 进行金额计算
- 禁止直接使用 JavaScript 浮点数
- 所有金额字段使用 `Decimal` 类型

### 状态机
- 所有单据必须有明确的状态流转
- 使用 TypeScript 联合类型定义状态
- 状态变更记录到审计日志

## 模板系统

### 四种页面模板（参考 designs/ui/minierp_page_spec.md）
1. **T1 OverviewLayout** - 仪表盘/概览页
2. **T2 WorkbenchLayout** - 列表/表格操作页
3. **T3 DetailLayout** - 详情页（带 tabs）
4. **T4 WizardLayout** - 向导/流程页

### 组件组织
```
src/components/
├── shared/          # 通用组件
├── layouts/         # T1-T4 模板
├── business/        # 业务组件
└── evidence/        # 凭证相关
```

## 凭证系统

### 参考
- `designs/ui/miniERP_evidence_system.md`

### 两层凭证模型
1. **单据级凭证** - 全局附件面板
2. **行级凭证** - SKU 行的 camera-count entry + drawer

### 实现要点
- 凭证与业务数据分离存储
- 支持图片、PDF、签名
- 凭证删除只标记，不物理删除

## API 规范

### RESTful 设计
- 版本化：`/api/v1/`
- 资源命名：复数形式 `/api/v1/purchase-orders`
- 操作命名：`/api/v1/purchase-orders/{id}/approve`

### 响应格式
```typescript
// 成功
{ "data": {...}, "message": "操作成功" }

// 失败
{ "error": { "code": "VALIDATION_ERROR", "message": "..." } }
```

### 错误码
- `VALIDATION_ERROR` - 输入验证失败
- `NOT_FOUND` - 资源不存在
- `PERMISSION_DENIED` - 权限不足
- `BUSINESS_ERROR` - 业务逻辑错误

## 数据库

### 表命名
- 小写 + 下划线：`purchase_orders`, `goods_receipt_notes`
- 关联表：`order_items`, `grn_lines`

### 审计字段（必须）
- `created_at`, `created_by`
- `updated_at`, `updated_by`
- `deleted_at` (软删除)

---

## Agent 沟通

### 语言要求

**所有 agents 必须使用中文与用户沟通。**

调用任何 agent 时，在 prompt 中添加：

```
使用中文与我沟通。
```

### 常用 agents 调用示例

```
use the architect agent (使用中文沟通) to analyze...
use the code-reviewer agent (使用中文沟通) to review...
use the planner agent (使用中文沟通) to create...
```
