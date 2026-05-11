# awesome-agentic-ai-site

一个基于 **Astro** 构建的学习型网站，用来把 [WenyuChiou/awesome-agentic-ai-zh](https://github.com/WenyuChiou/awesome-agentic-ai-zh) 网站化，并支持定期同步内容。

## 当前多语言策略

- **默认语言：简体中文（zh-CN）**
- 繁体中文：`/zh-tw/...`
- English：`/en/...`

这样可以避免不同语言页面混在同一套路由里。

## 已实现

- Astro 项目骨架
- 内容集合：`stages`、`tracks`、`branches`、`resources`、`walkthroughs`
- 首页、Roadmap、Updates、各内容列表页与详情页
- 语言切换器（简中 / 繁中 / English）
- 内容同步脚本：默认从你的 fork 拉取 Markdown 与 `resources/` 静态资源
- Markdown 相对链接重写为站内多语言路由
- GitHub Actions：
  - 网站仓库定时同步内容
  - fork 仓库同步 upstream 的工作流模板
- Vercel 部署配置

## 本地启动

```bash
cd awesome-agentic-ai-site
npm install
npm run sync:content
npm run dev
```

默认内容源：

- `https://github.com/BestDingSheng/awesome-agentic-ai-zh.git`
- 分支：`main`

如果你想临时改成别的仓库，也可以覆盖：

```bash
REPO_URL=https://github.com/<yourname>/awesome-agentic-ai-zh.git npm run sync:content
```

## 部署建议

### Vercel
- Build command: `npm run build`
- Output directory: `dist`

### Cloudflare Pages
- Build command: `npm run build`
- Output directory: `dist`

## 工作流说明

### 1. 网站仓库内容同步
工作流文件：[`.github/workflows/sync-content.yml`](./.github/workflows/sync-content.yml)

建议在 GitHub 仓库 Variables 中设置：
- `CONTENT_REPO_URL`：你的 fork 地址，推荐固定为 `https://github.com/BestDingSheng/awesome-agentic-ai-zh.git`
- `CONTENT_REPO_REF`：分支名，默认 `main`

### 2. fork 仓库同步上游
模板文件：`templates/fork-workflows/upstream-sync.yml`

把它复制到你的 fork 仓库的 `.github/workflows/upstream-sync.yml` 即可。

## 下一步建议

- 把首页换成品牌化设计
- 给资源页增加筛选/标签
- 接入站内搜索（Pagefind / Algolia）
- 增加 SEO（sitemap、OG、canonical）
- 为 Roadmap 增加图形化视图
