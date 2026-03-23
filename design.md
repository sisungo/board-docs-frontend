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

## 9. 待定项

| 问题 | 状态 |
| --- | --- |
| 独立站点的域名 / 子域 | 待定 |
| `ruyisdk/` 下正式内容仓库名称 | 待定 |
| matrix 是否加「示例教程」外链 | 待定 |
| 第一个示例内容 | 待定 |
| 示例是否关联上游代码仓库链接 | 待定 |

## 10. 页面布局（参考 Fedora）

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
