---
title: "Stage 8 — Agent Interfaces · Computer Use · Browser Use · Code Sandbox"
description: "⏱ **時間估算**：2-3 週（約 12-20 小時）"
section: "Stage"
sourcePath: "stages/08-agent-interfaces.md"
sourceUrl: "https://github.com/BestDingSheng/awesome-agentic-ai-zh/blob/main/stages/08-agent-interfaces.md"
sourceRepo: "https://github.com/BestDingSheng/awesome-agentic-ai-zh"
syncedAt: "2026-05-15T03:49:13.732Z"
language: "zh-tw"
languageLabel: "繁體中文"
baseSlug: "08-agent-interfaces"
order: 8
---
# Stage 8 — Agent Interfaces · Computer Use · Browser Use · Code Sandbox

> **繁體中文** | (zh-Hans / en mirror defer 中)

⏱ **時間估算**：2-3 週（約 12-20 小時）

> 💡 用語密度高（Computer Use / DOM / microVM / Firecracker / Sandbox / Cold start⋯）→ **本章內部就地解釋**，不熟先讀過 §1 跟 §7 術語小辭典。

> 📋 **本章組成**：〔Agent Interfaces 是什麼（先定位）+ 三層 interface〕→ 學習目標 → 進入條件 → 必修閱讀 → 🖱 Computer Use（螢幕級）→ 🌐 Browser Use（web 級）→ 📦 Code Sandbox（隔離環境含**術語小辭典**）→ Track A 怎麼用 → Track B 怎麼 build → ⚠ 2026 Safety / Security → 動手練習 → 常用工具推薦 → 精選 Projects → 自我檢查 → 下一個 frontier（Voice / VLA forward note）

> 🔑 **關鍵名詞**：見本章內部解釋 + [`resources/glossary.md`](/zh-tw/resources/glossary/)

**兩 track 共用 hub**——跟 Stage 5（Claude Code 生態）一樣、Track A（CLI Power User）+ Track B（Agent Builder）兩條路徑都會用到。Stage 5 + Stage 8 是 curriculum 兩個 hub。

## 🎯 Agent Interfaces 是什麼（先定位）

**Agent Interfaces = agent 跟「非 API 世界」互動的 IO 邊界層**。Stage 0-7 教你「**怎麼建 agent 本身**」（LLM → prompt → tool → context → memory → multi-agent → harness）；本 stage 教「**agent 蓋好後、怎麼操作真實環境**」。

**3 層 interface**：

| Interface | 操作對象 | 工作原理 | 代表工具 |
|---|---|---|---|
| **🖱 Computer Use**（screen-level）| 任何桌面 app（Excel / SAP / Photoshop / 沒 API 的軟體）| screenshot → vision → 算座標 → 模擬鍵鼠 | Anthropic Claude Computer Use / OpenAI Codex desktop / Gemini in Chrome |
| **🌐 Browser Use**（web-level）| 任何網頁 | DOM-aware navigation + 必要時 vision fallback | Atlas / Comet / browser-use（OSS 86k stars）|
| **📦 Code Sandbox**（isolated exec）| agent 生成的 code 在隔離環境跑 | microVM / Container / 用戶空間 kernel | E2B / Daytona / Modal / Vercel Sandbox / OpenAI Agents SDK（April 2026 內建）|

### 跟前面 stage 的差別（避免概念混淆）

**Reader 第一個直覺問題**：這跟 Stage 3 Tool Use / Stage 5 MCP / Stage 7 Harness 有何不同？

| 比較對象 | 那邊管什麼 | 本 stage 管什麼 |
|---|---|---|
| **Stage 3 Tool Use** | agent **呼 API**（function calling、JSON schema）| agent **操作環境**（沒 API 的軟體 / 真實網頁 / 跑 code）|
| **Stage 5 MCP** | tool / data source 怎麼**標準化暴露**給 agent | agent 怎麼**實際 interact** 環境（MCP 是協定、Interface 是行為）|
| **Stage 7 Harness** | agent **runtime 控制流**（loop / retry / safety）| agent **IO 邊界**（runtime 內看不到的外界互動）|

→ **核心區分**：Tool 是 **API 呼叫**、Interface 是 **操作環境**——前者抽象 API、後者直接面對真實 GUI / web / OS。

### 為什麼 2024-2026 是 Agent Interface 的 breakthrough 年

**Why 現在才補這課**：

- **2024-10 之前**：agent 只能跟有 API 的世界互動（呼叫 OpenAI / GitHub / Slack API、回文字）
- **2024-10**：Anthropic Computer Use beta → **agent 第一次能操作真實螢幕**
- **2025-2026**：OpenAI（Atlas + Codex desktop）/ Google（Gemini in Chrome）全進場 → 主流化
- **2026-05**：OSWorld benchmark 達 **76.26%**（superhuman vs 72% human baseline）→ 從研究 curiosity 變 production reality

**沒這個 stage 的 curriculum gap**：學完 Stage 7 你以為 done、實際上 agent 只能跟 API 對話、**不能操作沒 API 的軟體 / 真實網頁 / 跑 code**——遇 safety issue（Comet 注入 / Amazon injunction、見 §10）也沒警告過。

### 為什麼兩 track 共用

跟 Stage 5（Claude Code 生態）一樣、本 stage 是 **hub** 而非 track-specific：

- **Track A（CLI Power User）**：用 Claude Computer Use 委派桌面任務、用 Codex background mode、在 Claude Code 接 browser MCP
- **Track B（Agent Builder）**：embed browser-use 進自己 agent、用 E2B / Daytona 跑 agent-generated code、用 OpenAI Agents SDK 內建 sandbox

**兩個 track 都繞不開這 3 層 interface**——所以放 hub 位置。

## 📌 學習目標

學完本 stage 你能：

- 區分 3 層 agent interface（Computer Use / Browser Use / Sandbox）+ 跟 Tool / MCP / Harness 的關係
- 講出 Computer Use / Browser Use **mental model**（screenshot → vision → coords vs DOM-aware）
- 講出 microVM / Container / Firecracker / gVisor / Cold start 等隔離技術術語
- 知道 2026-05 OSWorld / WebArena SOTA 數字 + 解讀 reward-hacking 警告
- **Track A**：在 daily CLI 工作流接 Computer Use + browser MCP + Codex background mode
- **Track B**：用 browser-use / E2B 在自己 agent 內 embed 環境互動 + sandbox 隔離
- 設計 4 個 safety pattern（approval gate / sandbox / human-in-loop / output filter）防注入攻擊

## 🚪 進入條件

你應該已經：

- 完成 [Stage 5](/zh-tw/stages/05-claude-code-ecosystem/)（懂 MCP / Skills / Plugins、Claude Code 用過 daily）
- 完成 [Stage 7](/zh-tw/stages/07-multi-agent-production/)（懂 harness engineering、knows what reward-hacking warning is about）
- 對 Docker / VM 概念基礎熟悉（本章會解釋 microVM / Container 差異、但完全沒接觸過 Docker 會卡）
- **若只 Track A**：Stage 5 完成就夠，Stage 7 可選；本章 Track A 部分不依賴 build 經驗
- **若 Track B**：Stage 7 必修，否則 §9 build 範例會卡

沒到 → 回前面補。

## 📚 必修閱讀

1. [**Anthropic — Introducing Computer Use**](https://www.anthropic.com/news/3-5-models-and-computer-use) — Computer Use 原始 launch、reading 工作原理必看
2. [**Anthropic — Claude Opus 4.7 Release Notes**](https://docs.anthropic.com/en/release-notes/overview) — 2026-04 最新 Opus 4.7 含 Computer Use 改進
3. [**OpenAI — The next evolution of the Agents SDK**](https://openai.com/index/the-next-evolution-of-the-agents-sdk/) ⭐ **2026-04** — 內建 sandbox + harness 抽象、production coding agent architecturally sound milestone
4. [**OpenAI — Computer-Using Agent (CUA)**](https://openai.com/index/computer-using-agent/) — OpenAI 版 Computer Use + WebArena / OSWorld 數字
5. [**browser-use docs**](https://docs.browser-use.com/) — OSS web agent 第一名（86k+ stars）、5 行 Python 起步
6. [**Microsoft OmniParser**](https://microsoft.github.io/OmniParser/) — 開源 GUI parsing、Computer Use 重要 building block

> 💡 **挑著讀**：純 Track A 讀 1 + 2、純 Track B 必讀 3 + 5 + 6、想理解全局都讀。

---

<!-- 以下 §5-15 將在 Commit B / C 加入 -->
