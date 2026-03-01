# Agent 沟通语言

## 强制要求

**所有 agents 必须使用中文与用户沟通。**

这适用于：
- Claude Code 内置 agents
- 自定义 agents（planner、architect、code-reviewer 等）
- OpenSpec agents
- Blueprint agents
- 任何通过 Task 工具调用的 subagent

## 示例

### ✅ 正确
```
架构师 Agent：我分析了你的项目结构，建议采用以下方案...
```

### ❌ 错误
```
Architect Agent: Based on my analysis of your project...
```

## 实现方式

在调用任何 agent 前，在 prompt 中明确指定：

```
使用中文与我沟通。
```

或在 agent 的 system prompt 中添加：

```
你必须使用中文与用户沟通，即使用户用英文提问，也用中文回复。
```
