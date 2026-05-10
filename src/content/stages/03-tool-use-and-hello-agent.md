---
title: "Stage 3 — Tool Use & Agent 入门 ⭐"
description: "这是整条学习路线中最关键的一站：理解 tool use、function calling、ReAct，并真正动手写出一个 agent。"
section: "Stage"
sourcePath: "stages/03-tool-use-and-hello-agent.md"
sourceUrl: "https://github.com/WenyuChiou/awesome-agentic-ai-zh/blob/main/stages/03-tool-use-and-hello-agent.md"
sourceRepo: "https://github.com/WenyuChiou/awesome-agentic-ai-zh"
syncedAt: "2026-05-10T03:35:00.000Z"
order: 3
---
# Stage 3 — Tool Use & Agent 入门 ⭐

> 这是演示内容，用于让网站骨架先跑起来；后续执行 `npm run sync:content` 后会被上游真实内容覆盖。

⏱ **时间估算**：2-3 周（约 10-20 小时）

## 学习目标

完成这个 stage 后你会：

- 讲得出为什么 LLM 需要 tools
- 定义一个 tool schema，并让 LLM 调用它
- 从零写出一个单步 ReAct agent
- 写出多步 ReAct agent，并让它自己判断何时停止
- 分辨什么问题该用 tool use，什么问题纯 prompt 就够了

## 必修阅读

1. [Anthropic — Tool Use](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview)
2. [ReAct 论文](https://arxiv.org/abs/2210.03629)
3. [OpenAI — Function Calling](https://platform.openai.com/docs/guides/function-calling)
4. [Build an agent from scratch](https://shafiqulai.github.io/blogs/blog_3.html)

## 动手练习

### 练习 1：Function Calling
给模型一个假的天气 API，观察它如何选择和调用工具。

### 练习 2：多工具选择
提供搜索、计算机、行事历三个工具，观察模型如何选择。

### 练习 3：从零实现 ReAct
用 50-80 行 Python 自己写出 `Thought → Action → Observation` 循环。

### 练习 4：多步骤推理
设计一个需要连续调用 3-5 次工具的问题。

### 练习 5：错误处理
故意让工具失败，测试 agent 是否能恢复。

## 进入下一阶段前的自检

- [ ] 能定义一个清晰的 tool schema
- [ ] 能不依赖框架写出 ReAct 循环
- [ ] 能解释 agent 为什么需要退出条件
- [ ] 能比较 CodeAct 与 JSON-tool 的差异
- [ ] 能识别哪些问题其实不需要 agent
