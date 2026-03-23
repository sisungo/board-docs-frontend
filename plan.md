# RuyiSDK Examples — Agent 开发计划

给 AI Agent 的可执行实施手册。**依据 `design.md`**，逐步构建独立站点。  
约束：不修改 `support-matrix-frontend` 源码（submodule 只读参考）。

**协作与 Git**：文档落盘、每个 Phase 结束一次 commit（成败皆提交）等约定见 **`.cursor/rules/ruyisdk-examples-workflow.mdc`**（Cursor 全局生效）；`design.md` §9 为人眼验收口径。

**进度快照**：Phase 1 已交付。内容模型为 **板子 → 示例**（见 `design.md` §4）。**Phase 4（板子详情 + 示例 Markdown 详情）已实现**：路由 `/`、`/boards/[board]/`、`/boards/[board]/[example]/`；`src/lib/data.ts` 扫描 `test-doc/*/*/*.md`；`public/test-doc` 指向内容目录以提供图片；`renderMarkdown.ts`（remark-gfm + rehype-pretty-code）。首页为板子卡片（非「每板一条示例」的旧 UI）。

---

## 核心数据模型（板子优先）

内容仓库 `test-doc/` 以**板子为顶层目录**，每块板子下嵌套多个示例子目录。数据层需反映这一层级关系。

### Board（板子）

从 `test-doc/{BoardDir}/README.md` frontmatter 解析：

```typescript
type BoardMeta = {
  slug: string;       // 目录名，如 "Duo_S"
  product: string;    // "Milk-V Duo S"
  cpu: string;        // "SG2000"
  cpuCore: string;    // "XuanTie C906 + ARM Cortex-A53"
  ram: string;        // "512MB"
  vendor: string;     // "Milk-V"
  examples: ExampleMeta[];
};
```

### Example（示例）

从 `test-doc/{BoardDir}/{ExampleDir}/*.md`（排除 README）的 frontmatter 解析：

```typescript
type ExampleStatus = "basics" | "peripheral" | "others";

type ExampleMeta = {
  boardSlug: string;     // 所属板子 slug
  slug: string;          // 示例目录名，如 "HelloWorld"
  title: string;         // 从 Markdown 第一个 # 标题提取
  status: ExampleStatus; // basics / peripheral / others
  sys: string;           // "buildroot" / "revyos" 等
  lastUpdate?: string;   // "2025-03-19"
  mdFile: string;        // 相对路径，用于读取正文
};
```

### 内容集成

```typescript
// 板子 README
const boardReadmes = import.meta.glob("../../test-doc/*/README.md", { query: "?raw", import: "default", eager: true });
const boardReadmesZh = import.meta.glob("../../test-doc/*/README_zh.md", { query: "?raw", import: "default", eager: true });

// 示例 Markdown（排除 README，扫两层深度）
const exampleMds = import.meta.glob("../../test-doc/*/*/*.md", { query: "?raw", import: "default", eager: true });
```

从路径提取：`test-doc/Duo_S/HelloWorld/example_HelloWorld_DuoS.md` → board=`Duo_S`, example=`HelloWorld`。

---

## 路由

| 路由 | 页面 |
| --- | --- |
| `/` | 首页：板子卡片网格 + 搜索 |
| `/boards/[board]/` | 板子详情：板子信息 + 示例列表 |
| `/boards/[board]/[example]/` | 示例详情：Markdown 渲染（含图片、代码高亮） |

---

## 环境

| 角色 | 机器 | IP |
| --- | --- | --- |
| Agent + dev server | Linux, user `fengde` | `100.90.186.53` |
| 人眼验收 (Chrome) | Mac | `100.114.70.79` |

```bash
# Agent 启动 dev server（Linux）— 固定 3000
pnpm dev

# 用户建 SSH 隧道（Mac）
ssh -L 3000:localhost:3000 fengde@100.90.186.53
# Mac Chrome → http://localhost:3000
```

`astro.config.mjs` 中 `vite.server` 已设 `port: 3000`、`strictPort: true`。端口被占用时 `pnpm dev` 会先释放 3000。

构建与测试在 Linux：`pnpm build`、`pnpm exec playwright test`。

---

## Phase 1: 脚手架 (已完成)

**目标**：空 Astro 站点在 `localhost:3000` 跑起来。

1. `pnpm create astro@latest` 初始化（选 empty 模板，TS strict）
2. 加依赖：`@astrojs/react` `react` `react-dom` `tailwindcss@4` `typescript`
3. `astro.config.mjs`：集成 React + Tailwind
4. 安装 shadcn/ui + Radix UI（参照 `./support-matrix-frontend/` 的版本和配置）
5. `git submodule add` `support-matrix-frontend`（只读，不改其代码）
6. `git submodule add https://github.com/DuoQilai/test-doc.git test-doc`
7. 创建 `src/pages/index.astro`，写一行占位文本
8. `pnpm dev --host 0.0.0.0 --port 3000` 确认能跑

**验证**：浏览器访问 `localhost:3000` 看到占位页。

---

## Phase 2: 数据层（板子优先）

**目标**：能列出全部板子及其下属示例，解析 frontmatter。

1. 重写 `src/lib/data.ts`：
   - 类型 `BoardMeta`、`ExampleMeta`（见上面数据模型）
   - `getAllBoards()` — glob 扫描 `test-doc/*/README.md`，解析 frontmatter，同时扫描子目录下的示例 .md
   - `getBoardBySlug(slug)` — 返回单个 `BoardMeta`（含 examples）
   - `getExampleMarkdown(boardSlug, exampleSlug)` — 返回示例正文（去掉 frontmatter）
   - `getBoardReadme(boardSlug, lang)` — 返回板子介绍正文
2. 在 `src/pages/index.astro` 中调用 `getAllBoards()` 并 `console.log` 验证

**验证**：`pnpm dev` 控制台输出板子列表及其示例，字段齐全。

---

## Phase 3: 首页（板子卡片网格）

**目标**：首页渲染板子卡片 + 搜索框。参照 `design.md` §3 §11。

1. 布局壳 `src/layouts/Layout.astro`：HTML head + 全局样式 + `<slot/>`
2. `src/components/BoardCard.tsx`（React）：product 名、CPU、vendor、示例数量；点击跳转 `/boards/[slug]/`
3. `src/pages/index.astro`：顶栏标题 + 搜索框 + 板子卡片网格；搜索过滤板子名和 CPU
4. 样式参照 `./support-matrix-frontend/src/` 的 Tailwind 用法和 shadcn 组件，保持视觉一致

**验证**：首页渲染板子卡片、搜索能过滤、点击卡片跳转到板子详情页（此时可 404，Phase 4 实现）。

---

## Phase 4: 板子详情页 + 示例详情页

**目标**：点击板子卡片 → 看到示例列表 → 点击示例 → 看到 Markdown 渲染。

1. `src/pages/boards/[board].astro`：
   - `getStaticPaths()` 调用 `getAllBoards()` 生成路径
   - 顶部：板子名、CPU、RAM、vendor（返回首页链接）
   - 主体：示例列表（标题、分类标签、日期），点击跳转 `/boards/[board]/[example]/`
2. `src/pages/boards/[board]/[example].astro`：
   - `getStaticPaths()` 遍历所有板子的所有示例
   - 顶部：返回板子详情链接 + 示例标题
   - 正文：`getExampleMarkdown(board, example)` → Markdown 渲染（remark-gfm + shiki 代码高亮）
   - 图片：示例 .md 中的相对路径图片需正确解析显示
3. 图片静态服务：将 `test-doc/` 下的图片目录通过 Astro public 或 Vite 静态资源配置使其可访问

**验证**：板子详情页列出所有示例；示例详情页 Markdown 渲染正确，图片显示，代码高亮。

---

## Phase 5: 质量收尾 + 双语

**目标**：构建通过、视觉一致、可部署。

1. `pnpm build` 无报错
2. 全局样式检查：与 matrix 风格一致（字体、间距、配色）
3. 双语：板子介绍 README / README_zh 切换；示例正文当前仅中文，预留英文接口
4. 按需写 Playwright e2e：首页加载、搜索、板子详情、示例详情
5. 可选 CI：GitHub Actions `pnpm install && pnpm build`

**验证**：`pnpm build` 退出码 0；Mac Chrome 通过 SSH 隧道人眼确认首页、板子详情、示例详情。

---

## 待定项（见 `design.md` §10）

域名/子域、正式内容仓库名、matrix 外链、Vendor 分组数据源。

---

## 验收清单

- [x] `pnpm build` 通过
- [ ] Mac SSH 隧道 + Chrome `http://localhost:3000`：首页加载正常
- [ ] 首页：板子卡片网格 + 搜索过滤（`design.md` §3 §11）
- [ ] 点击板子卡片 → 板子详情页：显示示例列表
- [ ] 点击示例 → 示例详情页：Markdown 正文渲染 + 图片 + 代码高亮
- [ ] 未修改 `support-matrix-frontend` 源码
