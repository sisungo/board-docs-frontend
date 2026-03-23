# RuyiSDK Examples — 技术实现方案

> 写给 AI Agent 看的技术实现计划，基于 2026-03-22 与躲起来的讨论
> 工作目录：`/home/fengde/support-matrix-frontend`

---

## 1. 现有代码库分析

### 1.1 技术栈

- **框架**：Astro 5.12.3（SSR/静态混合）
- **UI 组件**：React 19（交互部分）+ Astro（静态部分）
- **样式**：Tailwind CSS 4 + shadcn/ui 组件库
- **i18n**：Astro 内置 i18n，URL 路由 `/` 和 `/zh-CN/`
- **内容读取**：`import.meta.glob` 在 build 时读取 submodule 中的 Markdown
- **Markdown 处理**：remark-gfm + rehype-autolink-headings + rehype-github-alert + shiki 代码高亮
- **包管理**：pnpm 10.12.4

### 1.2 现有 Submodule

```
support-matrix/    → ruyisdk/support-matrix（Board × OS 内容）
packages-index/     → ruyisdk/packages-index（SDK 包索引）
```

Submodule 在 `.gitmodules` 中注册，通过 `git submodule update --init --recursive` 拉取。

### 1.3 现有数据读取模式（参考 `src/lib/data.ts`）

```typescript
// glob 读取 submodule 里的 Markdown
const readmeFiles = import.meta.glob("/support-matrix/*/README.md", {
  query: "?raw",
  import: "default",
});

// 从路径提取目录名
const boards = Object.keys(readmeFiles)
  .map(path => path.match(/\/support-matrix\/([^\/]+)\/README\.md$/)?.[1])
  .filter(name => name !== ".github" && name !== "assets");

// frontmatter 解析：正则提取 --- 块，YAML.parse
```

### 1.4 现有路由结构

```
src/pages/
  index.astro              → /
  table.astro              → /table
  reports/
    index.astro            → /reports
    [board]-[system]-[file].astro  → /reports/xxx
  boards/
    [board].astro          → /boards/[board]
  zh-CN/                   → /zh-CN/*（双语）
```

### 1.5 现有导航配置

导航定义在 `src/layouts/Layout.astro` 的 Header 组件 props 中：

```astro
<Header
  navigation={[
    { label: "nav.table", href: "/table/" },
    { label: "nav.list", href: "/reports/" },
  ]}
/>
```

SidebarToggle 共用同一 `navigation` prop。

**实际页面结构**：
- `/`（首页）— Board/System 切换按钮（Overview.tsx 内）
- `/table` — OS Support Sheet（矩阵表）
- `/reports` — Test Reports List（测试报告列表）
- `/boards/[board]` — 板子详情页（目前有 OS 列表，无 Examples）

---

## 2. 示例内容结构（待创建）

### 2.1 内容仓库结构

```
sdk-examples/                    # 未来新建仓库，作为 submodule
  hello-world/
    README.md                   # 中文
    README_en.md                # 英文
  coremark/
    README.md
    README_en.md
  gpio-demo/
    README.md
    README_en.md
  dhrystone/
    README.md
    README_en.md
```

### 2.2 Frontmatter 字段

```yaml
---
title: Hello World
category: Getting Started
boards:
  - Milk-V Duo
  - VisionFive 2
  - LicheePi4A
date: 2026-03-20
---
```

### 2.3 预定义分类

`Getting Started` | `Benchmark` | `Hardware` | `Network` | `Graphics` | `Multimedia`

---

## 3. 新增文件清单

### 3.1 数据层

**`src/lib/examples.ts`**（新建）
- `ExampleMetaData` 接口
- `getAllExamples()` — 返回所有示例目录名
- `getExampleData(slug)` — 返回 frontmatter 元数据
- `getExampleContent(slug, lang)` — 返回 Markdown 正文（根据语言返回 README.md 或 README_en.md）
- 参考 `src/lib/data.ts` 的 extractFrontmatter 模式

### 3.2 页面

| 文件 | 路由 |
|---|---|
| `src/pages/examples/index.astro` | `/examples` |
| `src/pages/examples/[example].astro` | `/examples/[example]` |
| `src/pages/zh-CN/examples/index.astro` | `/zh-CN/examples` |
| `src/pages/zh-CN/examples/[example].astro` | `/zh-CN/examples/[example]` |

### 3.3 组件

| 文件 | 说明 |
|---|---|
| `src/components/examples/ExampleSidebar.tsx` | **左侧树形筛选导航**（参照 Fedora BoardList.js：板子名树形折叠，Accordion 交互） |
| `src/components/examples/ExampleCard.tsx` | 示例卡片（React 交互） |

### 3.4 配置改动

| 文件 | 改动 |
|---|---|
| `src/layouts/Layout.astro` | navigation prop 新增 `{ label: "nav.examples", href: "/examples/" }` |
| `src/i18n/ui.ts` | 新增 `nav.examples`、`examples.*` 等翻译字段 |
| `.gitmodules` | 新增 `[submodule "test-doc"]` |
| `astro.config.mjs` | 预计不需要改动 |

**入口说明**：Examples 仅通过导航栏新增入口，不改动 `/boards/[board]` 等现有页面。

---

## 4. 页面详细设计

### 4.1 `/examples` 首页

**参考**：Fedora 的 BoardList.js 布局（左导航 + 右内容区）

**组件**：`ExampleSidebar.tsx`（React，Accordion 树形筛选）+ `ExampleCard.tsx`（React 卡片）

**布局**：左侧固定宽度筛选栏 + 右侧弹性卡片网格

**逻辑**：
1. `getAllExamples()` 读取所有示例
2. `getAllBoards()` 读取所有板子
3. 左侧显示板子树（按名称字母排序折叠）
4. 右侧按当前筛选条件展示示例卡片
5. 搜索框过滤（板子名 + 示例名双重搜索）

**参考 Fedora BoardList.js 交互模式**：
```typescript
// 搜索过滤逻辑
const filtered = examples.filter(ex =>
  ex.name.includes(search) ||
  ex.boards.some(b => b.includes(search))
);

// Accordion 折叠（按板子分组）
{boardsByVendor.map(vendor => (
  <Accordion allowToggle>
    <AccordionButton>{vendor.name}</AccordionButton>
    <AccordionPanel>
      {vendor.boards.map(board => (
        <Button onClick={() => filterByBoard(board)}>{board}</Button>
      ))}
    </AccordionPanel>
  </Accordion>
))}
```

### 4.2 `/examples/[example]` 详情页

**动态路由**：`getStaticPaths()` 调用 `getAllExamples()`

**逻辑**：
1. `getExampleData(slug)` 读取 frontmatter
2. `getExampleContent(slug, lang)` 读取 Markdown 正文
3. 渲染 Markdown（用现有 remark-gfm 配置）
4. 展示支持的板子列表（从 boards frontmatter 字段读取）

---

## 5. 实现顺序

### Phase 1: 数据层 + Mock 数据
1. 新增 `src/lib/examples.ts`
2. 本地创建 mock 数据 `src/data/mock-examples.ts`（3 个示例：HelloWorld, CoreMark, GPIO）
3. 验证数据读取正确（Playwright headless 验证）

### Phase 2: 导航
4. `src/layouts/Layout.astro` — Header 导航新增 Examples 项
5. `src/i18n/ui.ts` — 新增翻译字段

### Phase 3: 页面
6. `src/pages/examples/index.astro` — 示例首页（含 ExampleSidebar + ExampleCard，参考 Fedora 布局）
7. `src/pages/examples/[example].astro` — 示例详情页
8. `src/pages/zh-CN/examples/` — 双语路由

### Phase 4: 收尾
9. 全局样式检查，与现有风格一致
10. Playwright e2e 测试文件编写 + headless 跑通
11. 构建验证：`pnpm build`

---

## 6. 内容仓库集成

### 6.1 Submodule（当前）

`DuoQilai/test-doc` 就是示例文档仓库，添加为 submodule：

```bash
git submodule add https://github.com/DuoQilai/test-doc.git test-doc
```

### 6.2 读取路径

```
/test-doc/Duo_S/README.md       → 中文
/test-doc/Duo_S/README_en.md  → 英文
/test-doc/LicheePi4A/README.md
...
```

glob pattern：
```typescript
const exampleFiles = import.meta.glob("/test-doc/*/README.md", {
  query: "?raw",
  import: "default",
});
const exampleFilesEn = import.meta.glob("/test-doc/*/README_en.md", {
  query: "?raw",
  import: "default",
});
```

### 6.3 未来迁移

`ruyisdk/` 下正式仓库建立后，修改 `.gitmodules` 指向新地址：

```bash
git submodule deinit -f test-doc
git rm test-doc
git submodule add https://github.com/ruyisdk/sdk-examples.git test-doc
```

---

## 7. 阻塞项（BLOCKING）

| # | 阻塞项 | 状态 | 解决方案 |
|---|---|---|---|
| 1 | submodule 网络慢/超时 | ⚠️ 后台重试中 | 不阻塞 mock 数据方案 |
| 2 | 第一个示例的标题/内容未定 | ❌ 待确认 | 参考 test-doc 现有内容创建 |

**当前方案**：Phase 1 先用本地 mock 数据开发，等 submodule 拉好后接入 `DuoQilai/test-doc` 真实内容。

---

## 8. 开发与验收流程

### 8.1 环境信息

| 角色 | IP | 说明 |
|---|---|---|
| 开发/测试 | 100.90.186.53 | Agent 工作在 Linux，dev server 跑在这里 |
| 验收 | 100.114.70.79 | 用户在 Mac 上用浏览器验收 |
| SSH 用户 | fengde | Linux 登录用户 |
| Dev Server 端口 | 3000 | 自定义约定端口 |

### 8.2 Agent 开发流程（Linux 端）

```bash
# 1. 启动 dev server
cd /home/fengde/support-matrix-frontend
pnpm dev --host 0.0.0.0 --port 3000

# 2. 用 Playwright headless 测试（无头浏览器自动化验证）
npx playwright test
# 或单个文件
npx playwright test src/test/examples.spec.ts

# 3. 截图对比（如需要）
npx playwright screenshot http://localhost:3000/examples/ /tmp/examples-home.png
npx playwright screenshot http://localhost:3000/examples/hello-world/ /tmp/example-detail.png

# 4. 构建验证
pnpm build
```

### 8.3 用户验收流程（Mac 端）

```bash
# 用户在 Mac 终端执行，建立 SSH 隧道
ssh -L 3000:localhost:3000 fengde@100.90.186.53

# 然后 Mac 浏览器打开
http://localhost:3000
```

### 8.4 Agent 测试要求（无头浏览器验证）

**每个阶段完成后，必须用 Playwright headless 跑自动化验证，不依赖人工点击检查：**

| 阶段 | 验证内容 | Playwright 测试点 |
|---|---|---|
| Phase 1 | 数据层 | 数据读取正确，mock 数据能正常解析 |
| Phase 2 | 导航 | Header 显示 Examples 链接，Sidebar 能打开 |
| Phase 3 | 示例首页 | 页面加载、左侧筛选栏渲染、示例卡片网格显示 |
| Phase 3 | 示例详情页 | Markdown 渲染、支持板子列表、路由跳转 |
| Phase 3 | 双语 | /zh-CN/examples 加载正常 |
| 全局 | 构建 | `pnpm build` 退出码 0，无 console.error |

**自动化测试命令**（每次 commit 前必跑）：
```bash
pnpm build && npx playwright test
```

### 8.5 Playwright 测试文件位置

```
support-matrix-frontend/
  e2e/
    examples.spec.ts      # 示例板块端到端测试
    navigation.spec.ts    # 导航测试
    build.spec.ts         # 构建测试
  screenshots/
    examples-home.png      # 首页截图（留存对比）
    example-detail.png     # 详情页截图
```

---

## 9. 验收标准

- [ ] Agent 用 Playwright headless 跑通所有 e2e 测试，无报错
- [ ] `pnpm build` 通过，退出码 0
- [ ] 用户在 Mac 浏览器 `http://localhost:3000` 能看到 `/examples` 页面
- [ ] Header 导航显示 Examples 入口
- [ ] `/examples` 页面正常加载，Fedora 风格左侧筛选 + 右侧卡片网格
- [ ] 点击示例进入详情页，Markdown 渲染正确
- [ ] "支持的板子"列表正确
- [ ] 中英文切换正常
- [ ] 与现有风格视觉一致
