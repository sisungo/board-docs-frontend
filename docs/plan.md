# RuyiSDK Examples — Agent 开发计划

给 AI Agent 的可执行实施手册。**依据 `docs/design.md`**，逐步构建独立站点。  
约束：不修改 `support-matrix-frontend` 源码（submodule 只读参考）。

**协作与 Git**：文档落盘、每个 Phase 结束一次 commit（成败皆提交）等约定见 **`.cursor/rules/ruyisdk-examples-workflow.mdc`**（Cursor 全局生效）；`docs/design.md` §9 为开发/SSH 验收方式；各 Phase 细节以本文为准。

**进度快照**：Phase 1–4 已完成。**已实现（与 `docs/design.md` 对齐）**：`BoardMeta.socVendor`（`soc_vendor`）、侧栏 **桌面端** 可收起、第一层按 **芯片厂商** 分组；首页搜索含 `cpu_core`/`ram`/`soc_vendor` 等；板子详情 **dl 展示属性**；路由 **`/vendors/`、`/vendors/[vendor]/`、`/socs/`、`/socs/[soc]/`**（由 frontmatter 推导，不依赖三级目录）；面包屑链到厂商页与 SoC 页。**未做**：`test-doc` 三级目录与各级 `README.md` 的 glob 迁移（仍兼容当前「板子顶层」结构）。

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
type ExampleStatus = "basics" | "peripheral" | "benchmark" | "application";

type ExampleMeta = {
  boardSlug: string;     // 所属板子 slug
  slug: string;          // 示例目录名，如 "HelloWorld"
  title: string;         // 优先用目录名（见 docs/design.md §4 标题规则），fallback 到 # 标题
  status: ExampleStatus; // basics | peripheral | benchmark | application
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

**目标**：首页渲染板子卡片 + 搜索框。参照 `docs/design.md` §3 §11。

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

## Phase 5: 视觉打磨 + Bug 修复

**目标**：修复已知问题，全面美化 UI，达到 matrix 站点同等品质。参照 `docs/design.md` §12 视觉规范。

### 已知问题（必修）

1. **示例标题撞名**：板子详情页示例列表全显示「RuyiSDK 基础示例」，无法区分 HelloWorld vs Coremark。修复：`data.ts` 中 `title` 优先用**目录名**（`ex.slug`），不再从 Markdown `#` 提取
2. **板子详情 README 标题重复**：header 已显示 `board.product`，README 正文第一行又是同名 `#` 标题。修复：渲染 README body 时若第一个 `#` 与 product 相同则跳过

### 视觉打磨（必做）

3. **首页侧栏改为厂商→芯片→板子可折叠树**：参照 matrix 站点侧栏风格，桌面端显示，移动端隐藏（`docs/design.md` §12）
4. **首页 hero 区**：大标题 + 副标题 + 居中搜索框，`py-10 sm:py-14`
5. **板子卡片微动效**：`hover:shadow-md` + `hover:-translate-y-0.5 transition`
6. **板子详情页**：面包屑（首页/厂商/芯片/板子）+ header + 分割线 + 示例表格（目录名 + Badge + 日期），全行可点击
7. **示例详情页**：面包屑（首页/厂商/芯片/板子/示例）+ meta 区 + 分割线 + prose 排版；图片 `rounded-lg shadow-sm max-w-full`；代码块圆角 + 语言标签
8. **全局**：页面 `max-w-6xl` 居中，统一间距 `px-4 sm:px-6`

**验证**：`pnpm build` 通过；Mac Chrome 人眼确认首页板子卡片美观可辨、板子详情示例名正确、示例详情 Markdown 排版舒适。

---

## Phase 6: 质量收尾 + 双语

**目标**：构建通过、视觉一致、可部署。

1. `pnpm build` 无报错
2. 双语：板子介绍 README / README_zh 切换；示例正文当前仅中文，预留英文接口
3. 按需写 Playwright e2e：首页加载、搜索、板子详情、示例详情
4. 可选 CI：GitHub Actions `pnpm install && pnpm build`

**验证**：`pnpm build` 退出码 0；Mac Chrome 通过 SSH 隧道人眼确认首页、板子详情、示例详情。

---

## 待定项（见 `docs/design.md` §10）

域名/子域、正式内容仓库名、matrix 外链、Vendor 分组数据源。

---

## 验收清单

- [x] `pnpm build` 通过
- [ ] Mac SSH 隧道 + Chrome `http://localhost:3000`：首页加载正常
- [ ] 首页：板子卡片网格 + 搜索过滤（`docs/design.md` §3 §11）
- [ ] 点击板子卡片 → 板子详情页：显示示例列表
- [ ] 点击示例 → 示例详情页：Markdown 正文渲染 + 图片 + 代码高亮
- [ ] 未修改 `support-matrix-frontend` 源码
