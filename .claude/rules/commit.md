## Commit Message 规范（含执行者恢复信息）

### Subject
```text
<type>(<scope>): <summary>
```

### Body（固定结构）
```text
Why / 背景:
- ...

What / 改动:
- ...
- ...

Executor / 执行者:
- agent: <claude|codex|gemini>
- tmux_session: <session-name>
- resume_cmd: tmux attach -t <session-name>

Validation / 验证:
- tests: <passed|not run>
- ci: <link or pending>

Risk / 风险:
- ...
```

### Footer
```text
Refs: #123
Closes: #123
```

---

## 示例（你要的那种）

```text
fix(api): prevent duplicate order submission on retry

Why / 背景:
- 用户在网络抖动时重复提交，导致重复订单。

What / 改动:
- 在 OrderService 增加幂等键校验。
- 在 /orders 接口增加重复请求短路返回。

Executor / 执行者:
- agent: codex
- tmux_session: erp_dev1
- resume_cmd: tmux attach -t erp_dev1

Validation / 验证:
- tests: passed (unit + integration)
- ci: pending

Risk / 风险:
- 旧客户端未传幂等键时走兼容分支，需观察日志。

Refs: #342
```