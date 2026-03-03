# G3 Frontend Group - Foundation Stream（执行者 D）

## 目标
搭建前端模板与数据编排底座，供页面并行装配。

## 前置依赖
- `DFP-READY`
- 建议并行依赖：`BE-CORE-READY` 接口草案

## 输入
- `specs/frontend-template-composition/spec.md`
- `designs/ui/minierp_page_spec.md`
- `designs/ui/miniERP_evidence_system.md`

## 输出
- T1/T2/T3/T4 模板契约
- EvidencePanel / LineEvidenceDrawer 组件契约
- SDK/BFF/hooks 数据编排骨架
- G3 底座流解锁标记：`FE-E-READY`

## 任务
- 完成模板组件与 slot 规范
- 建立 `lib/sdk`, `lib/bff`, `hooks` 分层
- 保证模板层不直接请求 API

## 完成定义（DoD）
- 页面装配团队可直接消费模板与 hooks
- 模板中无直接 fetch 逻辑
- 通过 `bun run --filter web lint`

## FE-E-READY 说明
- 当前状态：`READY`
- 完成项：
  - 已冻结 T1/T2/T3/T4 模板合同与 slot 规范
  - 已冻结单据级 / 行级 Evidence 组件合同
  - 已建立 `lib/sdk -> lib/bff -> hooks` 三层 typed skeleton
- 边界声明：
  - 模板层只消费 contract 与 slot，不直接发起 API 请求
  - SDK 默认保留 mock transport，等待 `BE-READY` 后切换真实接口实现
