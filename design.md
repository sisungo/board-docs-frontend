# RuyiSDK Examples — 设计文档

## 架构决策：独立项目，复用技术栈

**产品独立**：Examples 是一个 **独立部署的 Web 站点**，不在 matrix 路由内，不修改 support-matrix-frontend 的任何代码。

**技术复用**：基于 support-matrix-frontend 同套技术栈搭建（Astro + React + TypeScript + Tailwind CSS + shadcn/ui），保持视觉与开发体验一致。support-matrix-frontend 以 **submodule 形式引入本仓库**（`./support-matrix-frontend/`），作为开发时的 **只读参考**，不直接依赖其运行时代码。

| 考量 | 说明 |
| --- | --- |
| 不影响旧支持矩阵 | matrix 站点 **零改动** |
| 独立快速上线 | 自主发版，初期例子少即可展示；与 RuyiSDK 发布窗口对齐 |
| 「一起发版」≠ 架构耦合 | 版本号 / 发布节奏 / 对外口径一致即可，不要求同仓库 |
| 后续随意改 | 无需跨模块协调，不阻塞矩阵评审 |
| 长期演进 | 示例库偏展示与教程，未来可有独立发布周期 |

## 1. 这是什么？

一个 **独立的「示例教程」站点**，告诉开发者如何在 RISC-V 开发板上用 RuyiSDK 跑通示例程序。

与支持矩阵（[matrix.ruyisdk.org](https://matrix.ruyisdk.org/)）是 **并列产品**：数据上可互链，工程上不嵌套。

## 2. 用户是谁？

RISC-V 开发板用户，想在板子上跑程序但不知道从哪下手。

## 3. 用户进来能看到什么？

```text
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   RuyiSDK Examples                                         │
│   在 RISC-V 开发板上运行你的第一个程序                         │
│                                                             │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│   │ Hello    │  │ CoreMark │  │ GPIO 控制 │  ...           │
│   │ World    │  │ 跑分测试  │  │           │                 │
│   │ 入门必备  │  │ 性能评估  │  │ 硬件操作   │                 │
│   └──────────┘  └──────────┘  └──────────┘                 │
│                                                             │
│   ─────────────────────────────────────────────────────    │
│                                                             │
│   按板子找：                                                │
│   [Milk-V Duo] [VisionFive 2] [LicheePi4A] [Milk-V Mars] │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**两种找法：**

1. **看示例卡片** → 点进去 → 看这个示例支持哪些板子
2. **按板子找** → 点板子 → 看这个板子上能跑哪些示例

## 4. 示例是什么格式？

每个示例是一个 **文件夹**，内为 Markdown，可配图。

```text
sdk-examples/
  hello-world/
    README.md        # 中文说明
    README_en.md     # 英文说明
  coremark/
    README.md
    README_en.md
  gpio-demo/
    README.md
    README_en.md
```

每篇示例 Markdown 可带 frontmatter：

```yaml
---
标题: Hello World
分类: 入门
支持的板子:
  - Milk-V Duo
  - VisionFive 2
  - LicheePi4A
更新日期: 2026-03-20
---
正文：怎么在板子上跑第一个程序...
```

## 5. 示例怎么分类？

| 分类 | 什么意思 |
| --- | --- |
| 入门（Getting Started） | 第一个程序，从哪开始 |
| 跑分（Benchmark） | 测性能（Coremark、Dhrystone） |
| 硬件（Hardware） | 控制 GPIO、I2C 等 |
| 网络（Network） | 网络相关 |
| 图形（Graphics） | 屏幕、显示 |
| 音视频（Multimedia） | 音频、视频 |

## 6. 与支持矩阵的关系

[matrix.ruyisdk.org](https://matrix.ruyisdk.org/) 已有（**本项目不改其代码**）：

| 已有板块 | 内容 |
| --- | --- |
| 首页板卡总览（`/`） | CPU / RAM / Core；Board / System 视图 |
| OS 支持矩阵（`/table`） | 板子 × 操作系统 |
| 测试报告（`/reports`） | 某板 + 某系统下的实测记录 |

Examples 站点与 matrix **无代码耦合**。若需导流，仅在 matrix 导航中加外链（可选，非必须）。

## 7. 仓库与技术栈

### 本仓库结构

```text
ruyisdk-examples-frontend/
  design.md                      # 本文档
  plan.md                        # 实施计划
  support-matrix-frontend/       # submodule，只读参考（不修改）
  src/                           # 示例站点源码（待建）
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

开发时可直接查看 `./support-matrix-frontend/src/` 下的组件、布局、i18n 写法作为参照。

## 8. 双语支持

所有示例同时提供中英文版本（`README.md` / `README_en.md`）。

## 9. 开发与验收流程

Agent 在 Linux 上开发，用户在 Mac 上通过 SSH 隧道用 Chrome 人眼验收。

```bash
# Mac 终端
ssh -L 3000:localhost:3000 fengde@100.90.186.53
# 然后 Chrome 打开 http://localhost:3000
```

按 Phase 划分，每个 Phase 完成后 Agent 通知用户验收：

### Phase 1：脚手架

| | |
| --- | --- |
| **Agent 做什么** | 初始化 Astro 工程（React + Tailwind + TS + shadcn），添加 submodule，准备示例内容（submodule 或 mock），启动 dev server |
| **是否需要人眼验收** | 是（快速确认） |
| **你应该看到** | Chrome 打开 `http://localhost:3000`，页面能加载，显示一个占位标题。不白屏、不报错即可 |

### Phase 2：数据层

| | |
| --- | --- |
| **Agent 做什么** | 实现 `examples.ts`（glob 扫描、frontmatter 解析、中英文读取），在页面上输出示例列表验证 |
| **是否需要人眼验收** | 否 |
| **说明** | 纯后端逻辑，Agent 自己在控制台验证数据正确即可。你无需操作 |

### Phase 3：首页

| | |
| --- | --- |
| **Agent 做什么** | 搭建 Fedora 式布局：顶栏搜索框 + 左侧板子树形筛选 + 右侧示例卡片网格 |
| **是否需要人眼验收** | **是（重点验收）** |
| **你应该看到** | 打开 `http://localhost:3000`，对照下面 §10 的线框图检查：(1) 左侧有板子筛选栏，点击某个板子后右侧卡片会过滤；(2) 右侧有示例卡片网格（至少 3 张：Hello World / CoreMark / GPIO 之类）；(3) 顶栏搜索框能输入文字，卡片随之过滤；(4) 整体视觉与 [matrix.ruyisdk.org](https://matrix.ruyisdk.org/) 风格一致（字体、配色、间距） |

### Phase 4：详情页 + 双语

| | |
| --- | --- |
| **Agent 做什么** | 实现详情页（Markdown 渲染 + 支持的板子列表）；实现 `/zh-CN/` 路由和语言切换 |
| **是否需要人眼验收** | **是（重点验收）** |
| **你应该看到** | (1) 在首页点击任意卡片 → 跳转到详情页，看到标题、分类、日期、Markdown 正文（代码块有语法高亮）、底部「支持的板子」列表；(2) 顶栏有语言切换按钮，点击后 URL 变为 `/zh-CN/...`，页面内容切换为中文（或反之英文）；(3) 直接访问 `/zh-CN/` 能正常加载中文首页 |

### Phase 5：质量收尾

| | |
| --- | --- |
| **Agent 做什么** | `pnpm build` 确认构建通过，样式全局检查，按需写 e2e 测试 |
| **是否需要人眼验收** | 是（最终验收） |
| **你应该看到** | 完整走一遍：首页浏览 → 搜索 → 筛选 → 点卡片进详情 → 切语言 → 返回首页。所有环节无白屏、无错位、无 404。Agent 同时报告 `pnpm build` 退出码 0 |

---

## 10. 待定项

| 问题 | 状态 |
| --- | --- |
| 独立站点的域名 / 子域 | 待定 |
| `ruyisdk/` 下正式内容仓库名称 | 待定 |
| matrix 是否加「示例教程」外链 | 待定 |
| 第一个示例内容 | 待定 |
| 示例是否关联上游代码仓库链接 | 待定 |

## 11. 页面布局（参考 Fedora）

Fedora 镜像站式：左侧树形筛选 + 右侧卡片网格 + 顶栏搜索。

```text
┌────────────────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌────────────────────────────────────┐ │
│  │ 搜索框        │  │                                     │ │
│  ├──────────────┤  │  示例卡片网格                          │ │
│  │              │  │  ┌────────┐┌────────┐┌────────┐ │ │
│  │ 按板子筛选    │  │  │Hello   ││CoreMark││GPIO    │ │ │
│  │              │  │  │入门    ││跑分    ││硬件    │ │ │
│  │ ▶ Milk-V     │  │  └────────┘└────────┘└────────┘ │ │
│  │   ▶ Duo      │  │                                     │ │
│  │   ▶ Duo S    │  │  ┌────────┐┌────────┐           │ │
│  │   ▶ Mars     │  │  │Dhrystone││...     │           │ │
│  │ ▶ Sophgo     │  │  └────────┘└────────┘           │ │
│  │ ▶ StarFive   │  │                                     │ │
│  │ ▶ ...        │  │                                     │ │
│  └──────────────┘  └────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

**左侧**：按板子树形筛选（Vendor → SoC → Board）  
**右侧**：示例卡片网格  
**顶部**：搜索框

### 示例详情页

顶部元信息 + Markdown 正文渲染 + 底部「支持的板子」列表。
