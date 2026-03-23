# RuyiSDK Examples — Agent 开发计划

给 AI Agent 的可执行实施手册。**依据 `design.md`**，逐步构建独立站点。  
约束：不修改 `support-matrix-frontend` 源码（submodule 只读参考）。

**协作与 Git**：文档落盘、每个 Phase 结束一次 commit（成败皆提交）等约定见 **`.cursor/rules/ruyisdk-examples-workflow.mdc`**（Cursor 全局生效）；`design.md` §9 为人眼验收口径。

**进度快照**：Phase 1–2 已交付；**Phase 3 已完成** — `src/layouts/Layout.astro`（HTML 壳 + 全局样式）、`ExamplesHome`（顶栏标题与搜索）、`ExampleSidebar`（Accordion「按板子」+ 全部/单板筛选）、`ExampleCard`（分类标签 + 板子摘要，链到 `/examples/[slug]/`）；`pnpm build` 通过。下一步为 Phase 4（详情页与双语）。

---

## 环境

| 角色 | 机器 | IP |
| --- | --- | --- |
| Agent + dev server | Linux, user `fengde` | `100.90.186.53` |
| 人眼验收 (Chrome) | Mac | `100.114.70.79` |

```bash
# Agent 启动 dev server（Linux）— 固定 3000：`pnpm dev` 会先尝试释放 3000 再启动；若不想杀进程用 `pnpm dev:only`
pnpm dev

# 用户建 SSH 隧道（Mac）
ssh -L 3000:localhost:3000 fengde@100.90.186.53
# Mac Chrome → http://localhost:3000
```

`astro.config.mjs` 中 `vite.server` 已设 `port: 3000`、`strictPort: true`，避免静默改端口；端口仍被占用时先执行 `pnpm dev`（会 `fuser`/`lsof` 释放 3000）或手动：`fuser -k 3000/tcp`。

构建与测试在 Linux：`pnpm build`、`pnpm exec playwright test`。

---

## 目标结构

```text
ruyisdk-examples-frontend/
  design.md  plan.md  learn.md
  support-matrix-frontend/       # submodule，只读参考
  <content>/                     # test-doc 或 mock/，示例 Markdown
  src/
    lib/examples.ts              # 数据层：glob + frontmatter 解析
    lib/boards.ts                # 可选：从 examples 聚合板子列表，供 Sidebar
    components/ExampleCard.tsx
    components/ExampleSidebar.tsx
    layouts/Layout.astro         # 顶栏 + 搜索 + slot
    pages/index.astro            # 首页
    pages/examples/[slug].astro  # 详情
    pages/zh-CN/...              # 双语
  astro.config.mjs
  package.json
```

## 路由

| 路由 | 页面 |
| --- | --- |
| `/` | 首页：搜索 + 左树筛选 + 右卡片网格 |
| `/examples/[slug]/` | 详情：元信息 + Markdown + 支持的板子 |
| `/zh-CN/` | 中文首页 |
| `/zh-CN/examples/[slug]/` | 中文详情 |

## Frontmatter 规范

内容仓库里的示例 Markdown 使用中文键，数据层解析时映射为英文字段：

```yaml
---
标题: Hello World          # → title
分类: 入门                  # → category (slug: getting-started)
支持的板子:                 # → boards: string[]
  - Milk-V Duo
  - VisionFive 2
  - LicheePi4A
更新日期: 2026-03-20        # → date
---
```

分类 slug 映射：`入门→getting-started` `跑分→benchmark` `硬件→hardware` `网络→network` `图形→graphics` `音视频→multimedia`

## 内容集成

glob 读 submodule（或 mock 目录）：

```typescript
const zhFiles = import.meta.glob("/<content>/*/README.md", {
  query: "?raw", import: "default",
});
const enFiles = import.meta.glob("/<content>/*/README_en.md", {
  query: "?raw", import: "default",
});
```

从路径提取 slug：`/<content>/hello-world/README.md` → `hello-world`。  
日后内容仓库迁移到 `ruyisdk/*` 时，只需改 submodule URL 和 glob 路径常量。  
网络不通时用本地 `mock/` 目录跑通全部 UI。

**当前 `test-doc` 实际约定**：顶层为板卡目录（如 `Duo_S`、`LicheePi4A`），正文为 `README.md` + `README_zh.md`（无 `README_en.md` 时英文用 `README.md`）。数据层已兼容 `README_zh` / `README_en` 命名。

---

## Phase 1: 脚手架

**目标**：空 Astro 站点在 `localhost:3000` 跑起来。

1. `pnpm create astro@latest` 初始化（选 empty 模板，TS strict）
2. 加依赖：`@astrojs/react` `@astrojs/tailwind` `react` `react-dom` `tailwindcss@4` `typescript`
3. `astro.config.mjs`：集成 React + Tailwind
4. 安装 shadcn/ui + Radix UI（参照 `./support-matrix-frontend/` 的版本和配置）
5. `git submodule add` `support-matrix-frontend`（只读，不改其代码）
6. 内容 submodule：尝试 `git submodule add https://github.com/DuoQilai/test-doc.git test-doc`；若网络不通，创建 `mock/` 目录，放 3 个示例（hello-world、coremark、gpio-demo），每个含 `README.md` + `README_en.md`，frontmatter 格式见 `design.md` §4
7. 创建 `src/pages/index.astro`，写一行占位文本
8. `pnpm dev --host 0.0.0.0 --port 3000` 确认能跑

**验证**：浏览器访问 `localhost:3000` 看到占位页。

---

## Phase 2: 数据层

**目标**：能列出全部示例、解析 frontmatter、按语言读正文。

1. 创建 `src/lib/examples.ts`：
   - 类型 `ExampleMeta { slug, title, category, boards: string[], date }`
   - `getAllExamples()` — 用上面的 glob pattern 扫描，提取目录名为 slug，正则取 `---` 块 YAML 解析，中文键→英文字段映射见上面 Frontmatter 规范
   - `getExampleBySlug(slug)` — 返回单条 `ExampleMeta`
   - `getExampleMarkdown(slug, lang)` — `zh` → `README.md`，`en` → `README_en.md`
2. 可选 `src/lib/boards.ts`：从全部 `ExampleMeta.boards` 聚合去重，生成板子列表供 `ExampleSidebar` 使用；若有 Vendor→SoC→Board 层级数据（JSON 或 frontmatter 扩展字段），在此处理
3. 在 `src/pages/index.astro` 中调用 `getAllExamples()` 并 `console.log` 验证

**验证**：`pnpm dev` 控制台输出示例列表，字段齐全。

---

## Phase 3: 首页 (Fedora 式布局)

**目标**：左侧板子树形筛选 + 右侧示例卡片网格 + 顶栏搜索。参照 `design.md` §3 §11 的 ASCII 线框。

1. 布局壳 `src/layouts/Layout.astro`：顶栏标题「RuyiSDK Examples」+ 搜索框 + `<slot/>`
2. `src/components/ExampleCard.tsx`（React）：标题、分类标签、支持的板子摘要；点击跳转 `/examples/[slug]`
3. `src/components/ExampleSidebar.tsx`（React）：从 `boards` 聚合板子列表，Accordion 折叠（如果有 Vendor 分组数据就按 Vendor → Board，否则先平铺板子名）；选中板子 → 筛选右侧卡片
4. `src/pages/index.astro`：两栏布局——左 Sidebar 固定宽、右卡片网格弹性；搜索同时过滤示例名和板子名
5. 样式参照 `./support-matrix-frontend/src/` 的 Tailwind 用法和 shadcn 组件，保持视觉一致

**验证**：首页渲染卡片、搜索能过滤、点板子能筛选。

---

## Phase 4: 详情页 + 双语

**目标**：点击卡片进入详情；中英文可切换。

1. `src/pages/examples/[slug].astro`：
   - `getStaticPaths()` 调用 `getAllExamples()` 生成路径
   - 顶部：标题、分类、日期
   - 正文：`getExampleMarkdown(slug, lang)` → Markdown 渲染（remark-gfm + shiki 代码高亮，参照 matrix 配置）
   - 底部：「支持的板子」列表
2. `/zh-CN/` 路由：`src/pages/zh-CN/index.astro` + `src/pages/zh-CN/examples/[slug].astro`（或用 Astro i18n 路由配置实现）
3. i18n：导航/UI 文案中英文切换（至少顶栏标题、搜索占位符、分类名）
4. 语言切换入口：顶栏按钮或链接

**验证**：详情页 Markdown 渲染正确；中英文路由与内容切换正常。

---

## Phase 5: 质量收尾

**目标**：构建通过、视觉一致、可部署。

1. `pnpm build` 无报错
2. 全局样式检查：与 matrix 风格一致（字体、间距、配色）
3. 按需写 Playwright e2e：首页加载、搜索、筛选、详情跳转、双语
4. 可选 CI：GitHub Actions `pnpm install && pnpm build`

**验证**：`pnpm build` 退出码 0；Mac Chrome 通过 SSH 隧道人眼确认首页、详情、双语。

---

## 待定项（见 `design.md` §9）

域名/子域、正式内容仓库名、matrix 外链、首条示例定稿、板子树 Vendor/SoC 层级数据源。

---

## 验收清单

- [ ] `pnpm build` 通过
- [ ] Mac SSH 隧道 + Chrome `http://localhost:3000`：首页加载正常
- [ ] 首页：搜索 + 左侧板子筛选 + 右侧卡片网格（`design.md` §3 §11）
- [ ] 卡片点击 → 详情页：Markdown 渲染 + 支持的板子列表
- [ ] 中英文切换可用
- [ ] 未修改 `support-matrix-frontend` 源码
