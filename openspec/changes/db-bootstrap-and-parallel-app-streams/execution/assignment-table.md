# 并行分工与依赖表（6 Streams）

## 执行顺序摘要
1. `DB 初始化` + `Stream A(platform)` 先行。
2. `Stream B(masterdata)`、`Stream E(inventory)`、`Stream F(evidence)` 并行。
3. `Stream C(purchase+inbound)` 与 `Stream D(sales+outbound)` 在 B+E 完成后并行。
4. 最后统一 FE 切真接口并联调验收。

## 当前门禁状态（2026-03-05）
- `DB-BASELINE-READY` ✅
- `PLATFORM-READY` ✅
- `MASTERDATA-READY` ✅
- `INV-READY` ✅
- `EVIDENCE-READY` ✅
- `PUR-IN-READY` ✅
- `SAL-OUT-READY` ✅
- `READY-FOR-PARALLEL-DEV` ✅

## 分工表

| 执行者 | Stream | 开工条件 | 依赖 | 交付标记 |
|---|---|---|---|---|
| Owner-DB | DB 初始化 | 立即 | 无 | `DB-BASELINE-READY` |
| Owner-A | A platform | 立即 | 无 | `PLATFORM-READY` |
| Owner-B | B masterdata | DB + A 完成 | `DB-BASELINE-READY`,`PLATFORM-READY` | `MASTERDATA-READY` |
| Owner-E | E inventory | DB + A 完成 | `DB-BASELINE-READY`,`PLATFORM-READY` | `INV-READY` |
| Owner-F | F evidence | DB + A 完成 | `DB-BASELINE-READY`,`PLATFORM-READY` | `EVIDENCE-READY` |
| Owner-C | C purchase+inbound | B+E 完成 | `MASTERDATA-READY`,`INV-READY`,`PLATFORM-READY` | `PUR-IN-READY` |
| Owner-D | D sales+outbound | B+E 完成 | `MASTERDATA-READY`,`INV-READY`,`PLATFORM-READY` | `SAL-OUT-READY` |
| Owner-FE | FE 全量联调 | C+D+F 完成 | `PUR-IN-READY`,`SAL-OUT-READY`,`EVIDENCE-READY` | `READY-FOR-PARALLEL-DEV` |

## 可并行清单
- 可并行组 1：`DB 初始化` 与 `A platform`（建议双人同步）。
- 可并行组 2：`B masterdata`、`E inventory`、`F evidence`。
- 可并行组 3：`C purchase+inbound` 与 `D sales+outbound`。

## 串行/阻塞点
- `C/D` 被 `B + E` 阻塞。
- FE 真联通被 `C + D + F` 阻塞。
