# 分工表（并行执行版）

## 总原则
- 有依赖就等依赖完成再继续执行。
- 联调验收组不抢跑，必须 `BE-READY + FE-READY` 后执行。

## 执行顺序（一句话版）
1. A 维护 DFP 门禁（已就绪）
2. B/C/D + E 并行
3. F 在 `FE-E-READY` 后推进装配，真接口切换等 `BE-READY`
4. 验收组最后收口

---

## 分工表

| 执行者 | 任务流 | 开工条件 | 交付标记 | 必读文档 |
|---|---|---|---|---|
| A（Freeze） | G1 协议冻结组（维护 DFP） | 已满足 | `DFP-READY`（已发布，后续负责变更门禁） | `freeze/dfp-field-dictionary.md`、`freeze/dfp-api-contract.md`、`freeze/dfp-state-machines.md`、`freeze/dfp-common-rules.md`、`freeze/dfp-db-model-baseline.md`、`freeze/DFP-READY.md`、`freeze/dfp-change-request-template.md` |
| B（Backend-Core） | 后端核心单据流 | `DFP-READY` | `BE-B-READY` | `tasks.md`、`execution/l1-core-backend.md`、`specs/backend-module-boundaries/spec.md`、`specs/database-logical-model/spec.md`、`freeze/dfp-api-contract.md`、`freeze/dfp-state-machines.md` |
| C（Backend-Inventory） | 后端库存一致性流 | `DFP-READY` | `BE-C-READY` | `tasks.md`、`execution/l1-core-backend.md`、`specs/inventory-posting-integrity/spec.md`、`freeze/dfp-db-model-baseline.md`、`freeze/dfp-common-rules.md` |
| D（Backend-Support） | 后端支撑能力流（tenant/iam/audit/evidence/platform） | `DFP-READY` | `BE-D-READY` | `tasks.md`、`execution/l1-support-backend.md`、`specs/evidence-dual-layer-workflow/spec.md`、`freeze/dfp-common-rules.md`、`freeze/dfp-field-dictionary.md` |
| E（Frontend-Foundation） | 前端底座流（模板+SDK+BFF+hooks） | `DFP-READY` | `FE-E-READY` | `tasks.md`、`execution/l2-frontend-foundation.md`、`specs/frontend-template-composition/spec.md`、`freeze/dfp-api-contract.md`、`freeze/dfp-field-dictionary.md` |
| F（Frontend-Integration） | 前端页面装配流（先 mock，后切真实接口） | `DFP-READY + FE-E-READY`，切真接口等 `BE-READY` | `FE-F-READY` | `tasks.md`、`execution/l2-frontend-integration.md`、`specs/frontend-template-composition/spec.md`、`freeze/dfp-api-contract.md`、`freeze/DFP-READY.md` |
| 验收组（QA/Lead） | G4 联调验收组 | `BE-READY + FE-READY` | `READY-FOR-APPLY` | `tasks.md`、`execution/e2e-closure.md`、全部 `freeze/*.md` |

---

## 后端并行规则（3人）
- 后端-B：核心单据流
- 后端-C：库存一致性流
- 后端-D：支撑能力流
- 全部完成后再汇总发布 `BE-READY`

## 前端并行规则（2人）
- 前端-E：底座流（模板+SDK+BFF+hooks）
- 前端-F：页面装配流（先 mock，后切真实接口）
- 全部完成后再汇总发布 `FE-READY`
