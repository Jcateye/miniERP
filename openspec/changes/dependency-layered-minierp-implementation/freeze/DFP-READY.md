# DFP-READY 冻结签字记录（v1.0）

## 状态
- 当前状态：`READY`
- 生效范围：`dependency-layered-minierp-implementation`
- 生效对象：后端实现组（G2）、前端实现组（G3）

## 冻结清单
- `freeze/dfp-field-dictionary.md`
- `freeze/dfp-api-contract.md`
- `freeze/dfp-state-machines.md`
- `freeze/dfp-common-rules.md`
- `freeze/dfp-db-model-baseline.md`

## 门禁规则
1. G2/G3 开工前必须读取全部冻结文档
2. 实现阶段如需改字段/协议/规则，必须提交 DFP 变更申请
3. 未完成 DFP 变更评审前，不允许修改冻结语义并推进实现

## 解锁标记
- `DFP-READY` 已发布
- 允许并行启动：
  - Backend Group（G2）
  - Frontend Group（G3）

## 备注
- 前端可先按冻结协议 mock 开发
- 切换真实接口门槛：`BE-READY`