# RuyiSDK Examples — 设计文档

## 架构决策：独立项目，复用技术栈

**产品独立**：Examples 是一个 **独立部署的 Web 站点**，不在 matrix 路由内，不修改 support-matrix-frontend 的任何代码。

**技术复用**：基于 support-matrix-frontend 同套技术栈搭建（Astro + React + TypeScript + Tailwind CSS + shadcn/ui），保持视觉与开发体验一致。support-matrix-frontend 以 **submodule 形式引入本仓库**（`./support-matrix-frontend/`），作为开发时的 **只读参考**，不直接依赖其运行时代码。

| 考量 | 说明 |
| --- | --- |
| 不影响旧支持矩阵 | matrix 站点 **零改动** |
| 独立快速上线 | 自主发版；与 RuyiSDK 发布节奏可对齐，**工程上不耦合** |
| 演进 | 示例库独立发布与迭代 |

## 1. 这是什么？

一个 **独立的「示例教程」站点**，告诉开发者如何在 RISC-V 开发板上用 RuyiSDK 跑通示例程序。

与支持矩阵（[matrix.ruyisdk.org](https://matrix.ruyisdk.org/)）是 **并列产品**：数据上可互链，工程上不嵌套。

## 2. 用户是谁？

RISC-V 开发板用户，**手里已有一块板子**，想在板子上跑程序但不知道从哪下手。

## 3. 用户进来能看到什么？

### 术语（和表格列的对应关系）

- **SoC**（System on Chip，片上系统）：**一颗芯片**里集成了 CPU、总线、外设控制器等，是「芯片型号」这一层。表里 **Soc** 列（如 `TH1520`、`SG2000`）指的就是这一层；站点里用 frontmatter 的 **`cpu`**（或后续与内容仓库对齐的 SoC 字段）与之对应。
- **Silicon Vendor / 芯片厂商**（`soc_vendor`）：设计或销售这颗 SoC 的厂商（如 `XuanTie`、`Sophgo`）。**不等于**板卡品牌。
- **Board / 开发板**：一块可买的板子（如 `Lichee Pi 4A`），用 **`product`** + 目录名区分。
- **Board Vendor / 板厂**（`vendor`）：做这块板子的品牌（如 `Sipeed`、`Milk-V`）。与 `soc_vendor` **不是同一概念**：同一块 SoC 可以有多家板厂出不同的板。

**不等于关系**：`soc_vendor` ≠ 开发板；**SoC（芯片型号）** ≠ 开发板。开发板 = 板子硬件；SoC = 板子上的主芯片型号。

### 信息架构与 URL（已确认）

层级：**芯片厂商（soc_vendor）→ SoC（芯片型号）→ 开发板 → 示例文档**。

| 页面 | URL 形态 | 说明 |
| --- | --- | --- |
| 芯片厂商 | `/vendors/{vendorSlug}/` | 列出该厂商下有哪些 SoC（及链到各 SoC 页） |
| SoC | `/socs/{socSlug}/` | 列出该 SoC 下有哪些开发板 |
| 开发板 | `/boards/{boardSlug}/` | 板子介绍 + 属性 + 示例列表 |
| 示例 | `/boards/{boardSlug}/{exampleSlug}/` | Markdown 教程正文 |

首页：桌面端左侧侧栏**永久展示**，且支持**收起**（仅桌面；移动端不要求常驻侧栏）。侧栏导航树**第一层按 `soc_vendor` 分组**（不按板厂 `vendor`）。主区仍为搜索 + 板子卡片网格。线框见 §11。

**开发板详情页**同时展示 **`soc_vendor`（芯片厂商）与 `vendor`（板厂）** 等 frontmatter 属性，与协作方提供的表格（Silicon Vendor / Soc / Boards / Board Vendor）一致。

## 4. 内容仓库结构（目标与迁移说明）

### 目标目录约定（与 1.3 对齐）

内容仓库中每一层都有**固定入口文件名 `README.md`（首字母大写）**：

```text
test-doc/
  {SiliconVendorSlug}/           # 芯片厂商目录，如 XuanTie/
    README.md                    # 厂商介绍（可选）
    {SocSlug}/                   # SoC 目录，如 TH1520/
      README.md                  # SoC 介绍（可选）
      {BoardSlug}/               # 开发板目录，如 LicheePi4A/
        README.md
        README_zh.md
        HelloWorld/
          *.md
        ...
```

**当前仓库**可能仍为旧结构（**板子为顶层目录**），迁移时把板子目录挪到 `厂商/SoC/板子/` 下，并补齐各级 `README.md`。数据层以 `docs/plan.md` 中 Phase 为准实现 glob 与 slug 规则。

### 旧结构示意（迁移前参考）

曾以**板子为顶层目录**，每块板子下有多个示例子目录：

```text
test-doc/
  Duo_S/
    README.md
    README_zh.md
    HelloWorld/
      example_HelloWorld_DuoS.md
  LicheePi4A/
    README.md
    README_zh.md
    ...
```

### 板子 README.md frontmatter

```yaml
---
product: Milk-V Duo S
cpu: SG2000
cpu_core: XuanTie C906 + ARM Cortex-A53
ram: 512MB
vendor: Milk-V              # 板厂（Board Vendor）
soc_vendor: Sophgo          # 芯片厂商（Silicon Vendor），侧栏第一层分组用此字段
---
```

### 示例 .md frontmatter

```yaml
---
sys: buildroot
sys_ver: v1.1.4
sys_var: v1
status: basics          # basics | peripheral | benchmark | application
last_update: 2025-03-19
---
```

`status` 字段用作分类：`basics` = 基础示例，`peripheral` = 外设示例，`benchmark` = 性能评测（跑分、基准测试等），`application` = 应用与综合（系统、大模型、复杂案例等）。旧稿中的 `others` 在解析时视为 `benchmark`（兼容）。

### 示例文件名约定

- 通常为 `example_{ExampleName}_{BoardShort}.md`，但也有例外（如 `Licheepi4A_Dhrystone.md`）
- 数据层扫描时取**每个示例子目录下的第一个 `.md` 文件**（排除 README）

### 示例标题提取规则

示例正文里 `#` 常为通用名（如「RuyiSDK 基础示例」），多示例会撞名。**列表与面包屑标题优先用示例子目录名**（`HelloWorld`、`Coremark`）；无目录名时再取 Markdown `#`。

## 5. 示例怎么分类？

基于 frontmatter 中的 `status` 字段：

| status 值 | 分类名 | 含义 |
| --- | --- | --- |
| `basics` | 基础示例 | Hello World、环境跑通等入门程序 |
| `peripheral` | 外设示例 | GPIO、LED、ePaper 等硬件外设 |
| `benchmark` | 性能评测 | Coremark、Dhrystone 等基准与跑分 |
| `application` | 应用与综合 | 系统构建、大模型、复杂应用等（也作未知 frontmatter 的兜底） |

## 6. 与支持矩阵的关系

[matrix.ruyisdk.org](https://matrix.ruyisdk.org/) 已有（**本项目不改其代码**）：

| 已有板块 | 内容 |
| --- | --- |
| 首页板卡总览（`/`） | CPU / RAM / Core；Board / System 视图 |
| OS 支持矩阵（`/table`） | 板子 x 操作系统 |
| 测试报告（`/reports`） | 某板 + 某系统下的实测记录 |

Examples 站点与 matrix **无代码耦合**。若需导流，仅在 matrix 导航中加外链（可选，非必须）。

## 7. 仓库与技术栈

### 本仓库结构

```text
ruyisdk-examples-frontend/
  docs/
    design.md                    # 本文档
    plan.md                      # 实施计划
    learn.md                     # 前端学习计划
  test-doc/                      # 内容 submodule（板子→示例 Markdown）
  support-matrix-frontend/       # submodule，只读参考（不修改）
  src/
    lib/data.ts                  # 数据层：扫描 test-doc，解析板子和示例
    components/BoardCard.tsx     # 板子卡片
    components/BoardsHome.tsx    # 首页（搜索 + 卡片）
    layouts/Layout.astro         # 顶栏 + slot
    pages/index.astro            # 首页：板子卡片网格
    pages/boards/[board].astro   # 板子详情：示例列表
    pages/boards/[board]/[example].astro  # 示例详情：Markdown 渲染
  ...
```

### 仓库划分

| 仓库 | 职责 |
| --- | --- |
| **本仓库**（`ruyisdk-examples-frontend`） | 示例站点前端：页面、路由、构建与部署 |
| **示例内容仓库**（当前 `DuoQilai/test-doc`，日后可迁 `ruyisdk/*`） | Markdown、图、元数据；独立版本与 PR |
| **support-matrix-frontend**（submodule，只读参考） | 参照其组件、配置、样式写法；不运行、不修改 |

### 技术栈（复用 support-matrix-frontend）

| 技术 | 说明 |
| --- | --- |
| **Astro** | 静态站点框架，SSG 构建 |
| **React** | 交互组件 |
| **TypeScript** | 类型安全 |
| **Tailwind CSS v4** | 样式 |
| **shadcn/ui + Radix UI** | 组件库 |
| **pnpm** | 包管理 |

## 8. 双语支持

板子介绍：`README.md`（英文）+ `README_zh.md`（中文）。
示例正文：当前仅中文。后续增加英文版时，在同目录放 `*_en.md` 即可，数据层自动识别。

## 9. 开发与验收流程

Agent 在 Linux 上开发，用户在 Mac 上通过 SSH 隧道用 Chrome 人眼验收。

```bash
# Linux（仓库根目录，固定端口 3000；会先尝试释放 3000 上旧进程，避免 Vite 改到 3001/3002）
pnpm dev

# Mac 终端（SSH 本地转发）
ssh -L 3000:localhost:3000 fengde@100.90.186.53
# 然后 Chrome 打开 http://localhost:3000
```

**协作与 Git**（文档落盘、每 Phase 一次 commit 等）：见 **`.cursor/rules/ruyisdk-examples-workflow.mdc`**。

**Phase 里程碑与任务**（脚手架 → 数据层 → 首页 → 详情页 → 视觉打磨 → 收尾）：见 **`docs/plan.md`**，避免与本文重复。

---

## 10. 待定项

| 问题 | 状态 |
| --- | --- |
| 独立站点的域名 / 子域 | 待定 |
| `ruyisdk/` 下正式内容仓库名称 | 待定 |
| matrix 是否加「示例教程」外链 | 待定 |
| 示例是否关联上游代码仓库链接 | 待定 |

**已确定**：侧栏第一层分组用 **`soc_vendor`**；开发板详情展示 **`vendor`（板厂）与 `soc_vendor`（芯片厂商）**；厂商 / SoC / 开发板 URL 分别为 `/vendors/…`、`/socs/…`、`/boards/…`；各级入口文件名为 **`README.md`**。

## 10.1 仓库外协作流程（非本前端代码，仅供团队统一口径）

1. **示例验证与文档存放（`riscv-board-custom-dev`）**  
   开源 demo 的验证步骤仍用 **`git clone`** 拉代码；**验证说明文档**提交到 [DuoQilai/riscv-board-custom-dev](https://github.com/DuoQilai/riscv-board-custom-dev)。文档里写清命令与**终端 log** 作为运行结果，**不用截图代替 log**（便于复制、检索和 diff）。  
   这一条约束的是**文档写法与验证习惯**，不是本站点必须自动执行 `git clone`。

2. **包索引 issue 的提交位置**  
   暂停向 **packages-index** 提 issue；需要登记「包名 + 上游仓库地址」时，改到 [ruyisdk/ruyi issues](https://github.com/ruyisdk/ruyi/issues) 提交，内容保持精简即可。

## 11. 页面布局（线框）

信息层级：**芯片厂商（soc_vendor）→ SoC → 开发板 → 示例**。厂商页、SoC 页为独立路由（见 §3 URL 表）；开发板与示例为 `/boards/...`。细部样式见 §12。

### 首页：侧栏（厂商→芯片→板子树）+ 卡片网格

```text
┌──────────────┬─────────────────────────────────────────────┐
│ [搜索框]      │  RuyiSDK Examples                           │
│              │  在 RISC-V 开发板上运行你的第一个程序          │
│ ▼ Sophgo     │  [搜索框]                                    │
│   ▼ SG2000   │                                             │
│     Duo S  4 │  ┌──────────────┐  ┌──────────────┐        │
│ ▼ XuanTie    │  │ Milk-V Duo S │  │ Lichee Pi 4A │        │
│   ▼ TH1520   │  │ SG2000·Milk-V│  │ TH1520·Sipeed│        │
│     LPi4A  3 │  │ 4 个示例      │  │ 3 个示例      │        │
│              │  └──────────────┘  └──────────────┘        │
└──────────────┴─────────────────────────────────────────────┘
  （移动端：侧栏可不常驻；桌面端：侧栏常驻且可收起）
```

### 板子详情页：示例列表

```text
┌────────────────────────────────────────────────────────────┐
│  首页 / Milk-V / SG2000 / Milk-V Duo S                    │
│  SG2000 · 512MB · Milk-V                                   │
│  （README 简介区，prose）                                    │
│                                                            │
│  示例列表：                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ HelloWorld          基础示例    2025-03-19          │   │
│  │ Coremark            基础示例    2025-03-19          │   │
│  │ Pico-8SEG-LED       外设示例    2025-03-19          │   │
│  │ Pico-ePaper-2.13    外设示例    2025-03-19          │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

### 示例详情页：Markdown 渲染

```text
┌────────────────────────────────────────────────────────────┐
│  首页 / Milk-V / SG2000 / Milk-V Duo S / HelloWorld       │
│  （meta：分类 · 系统 · 日期）                               │
│                                                            │
│  ┌─ Markdown 正文 ──────────────────────────────────────┐ │
│  │ # RuyiSDK 基础示例   ← 正文内标题可与列表标题不同      │ │
│  │ ## Hello World (GCC)                                  │ │
│  │ 创建并激活 ruyi 虚拟环境...                             │ │
│  │ ```                                                   │ │
│  │ ruyi venv ...                                         │ │
│  │ ```                                                   │ │
│  │ [截图]                                                │ │
│  │ ...                                                   │ │
│  └───────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

## 12. 视觉规范

整体对标 [matrix.ruyisdk.org](https://matrix.ruyisdk.org/) 品质，在保持 shadcn/ui + Tailwind 语义色的基础上做如下细化。

### 全局

- 页面最大宽度 `max-w-6xl`（1152px），居中，两侧留 `px-4 sm:px-6`
- 首页左侧侧栏：**soc_vendor → SoC（cpu）→ 板子**可折叠树，带搜索框，`w-64`；**仅桌面端**常驻并支持收起；移动端可不显示侧栏
- 背景色 `bg-background`；卡片 `bg-card`；统一使用 CSS 变量色，不硬编码
- 字体：继承 matrix 的 `--font-sans`（Open Sans 或系统无衬线）

### 首页

- 顶部 hero 区：大标题 + 副标题 + 搜索框，垂直居中，`py-12 sm:py-16`
- 搜索框宽度 `max-w-lg`，居中，带 `Search` 图标前缀
- 板子卡片采用 `hover:shadow-md` + `hover:-translate-y-0.5` 微动效
- 卡片内部：product 名加粗 `text-lg font-semibold`；CPU 和 vendor 用 `text-muted-foreground text-sm`；右上角 Badge 显示「N 个示例」
- 无结果态：虚线边框 + 提示文案

### 板子详情页

- 面包屑：与 §3 URL 一致，含芯片厂商与 SoC（具体链到 `/vendors/…`、`/socs/…` 待实现时对齐），使用 `text-sm text-muted-foreground`
- 板子 header：product 名 `text-2xl font-semibold`；属性区展示 frontmatter：**含 `soc_vendor`、`vendor`（板厂）、`cpu`（SoC）、`cpu_core`、`ram` 等**，便于对照协作表格
- 板子 README 介绍：用 `prose` 排版，若内容第一个标题与 header 重复则**跳过不渲染**
- 示例列表用表格或分割线列表，每行显示：**目录名**（作为标题）+ 分类 Badge + 系统 + 日期；整行可点击，hover 高亮
- 若示例数为 0，显示空态提示

### 示例详情页

- 面包屑：`首页 / {vendor} / {cpu} / {board.product} / {example.slug}`
- 顶部 meta 区：板子名小字 + 示例目录名大标题 + 分类标签 + 系统 + 日期
- Markdown 正文区：`prose prose-slate dark:prose-invert max-w-none`
- 代码块：`rehype-pretty-code` + `github-dark` 主题，圆角 `rounded-lg`，带语言标签
- 图片：`max-w-full rounded-lg shadow-sm`；限宽不拉伸
- 正文区与 header 之间有分割线 `border-t` + `pt-8`
