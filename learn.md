# 前端学习计划

> 目标：成为合格的前端工程师——能独立读写 Astro + React + TypeScript + Tailwind 代码，能构建、测试、部署、定位问题、做产品验收。  
> 背景：系统 / C / C++ / Rust 扎实，无前端经验。  
> 标准：以严肃工程师水准要求自己，不是外行看个热闹。

---

## 课程资源

| 缩写 | 课程 | 性质 |
|------|------|------|
| **FSO** | [Helsinki Full Stack Open](https://fullstackopen.com/) | 免费、自定进度、每 Part 附带练习；React + TS + Node + 测试 + CI/CD + 容器 |
| **CS142** | [Stanford CS142: Web Applications](https://web.stanford.edu/class/cs142/) | 讲义 + 8 个 Project（公开，可独立完成，无需校内资源） |
| **CS571** | [UW-Madison CS571: Building UI](https://cs571.org/) | React + React Native + 设计思维 + 可用性评估；设计/评估讲座独一无二 |
| **17-313** | [CMU 17-313: Foundations of Software Engineering](https://cmu-313.github.io/) | 软件工程过程 / 需求 / 架构 / 质量 / 开源贡献 |

### 关于 CS142 Project

CS142 的 8 个 Project 规格公开、自包含，不依赖 Stanford 提交系统或校内测试基础设施。你只需要浏览器 + 编辑器 + Node.js。每个 Project 有明确的 spec、分值和交付物——这是真正的工程练习，不是看完讲义就算学过。

---

## 学习顺序

### 第一阶段：Web 基础 — 建立心智模型

**目标**：理解浏览器拿到什么、渲染什么、JS 怎么参与。

**学**

| 顺序 | 内容 | 来源 |
|------|------|------|
| 1 | Fundamentals of Web apps | FSO Part 0 |
| 2 | HTML, CSS, JS Basics | CS142 Week 1–2（Intro → HTML → CSS → URLs → JS Basics → JS Programming） |
| 3 | DOM, Events, Intro to Front End | CS142 Week 3 |

**做**

| 顺序 | 练习 | 来源 | 练什么 |
|------|------|------|--------|
| 4 | **Project 1: HTML and CSS** | CS142 | 纯 HTML/CSS 布局：Flexbox 定位、hover 交互、样式切换。写完后用 [W3C Validator](http://validator.w3.org) 验证 XHTML 合规——这就是工程标准 |
| 5 | **Project 2: JavaScript Calisthenics** | CS142 | JS 基本功：数组、对象、闭包、高阶函数。相当于你学 Rust 时做的 rustlings |
| 6 | **Project 3: JavaScript and the DOM** | CS142 | 用原生 JS 操作 DOM。理解 React 之前必须知道 React 在替你做什么 |

你有 C/Rust 底子，JS 语法本身不难；重点是理解 **DOM 是什么、事件怎么绑定、浏览器怎么跑 JS**。FSO Part 0 建立「浏览器 ↔ 服务器」全景，CS142 Week 1–3 讲义精炼，三个 Project 把手感练出来。

---

### 第二阶段：React — 你的项目的核心 UI 层

**目标**：能读写 React 组件、理解 props/state/hooks/lifecycle。

**学**

| 顺序 | 内容 | 来源 |
|------|------|------|
| 7 | Introduction to React | FSO Part 1（含练习） |
| 8 | Communicating with server（fetch / effect） | FSO Part 2（含练习） |
| 9 | React Basics → SPA → Responsive Web Design | CS142 Week 4（讲义补充） |
| 10 | Building Web Apps + Browser/Server Communication | CS142 Week 5（讲义补充） |

**做**

| 顺序 | 练习 | 来源 | 练什么 |
|------|------|------|--------|
| 11 | **Project 4: Page Generation with ReactJS** | CS142 | 第一次用 React 生成页面，组件拆分、props 传递 |
| 12 | **Project 5: Single Page Applications** | CS142 | SPA 路由、状态管理、组件间通信。这是前半程最重的一个 Project（65 分 + 5 extra credit），做完对 React 的理解会质变 |

FSO Part 1–2 是主线（每 Part 都有练习要做），CS142 讲义作为补充视角，两个 Project 是综合验证。

做完这一阶段，你就能看懂并修改 `ExampleCard.tsx`、`ExampleSidebar.tsx` 这类 React 组件了。

---

### 第三阶段：TypeScript — 读代码的关键能力

**目标**：能读写类型标注、接口定义、泛型签名。

| 顺序 | 内容 | 来源 |
|------|------|------|
| 13 | TypeScript | FSO Part 9（含练习） |

你写过 Rust trait + C++ template，TypeScript 的类型系统对你来说不陌生。FSO Part 9 直接在 React 项目里教 TS，刚好衔接上一阶段。

做完后，`src/lib/examples.ts` 里的 `ExampleMeta` 接口、泛型工具类型等，你都能直接读写。

---

### 第四阶段：路由、样式、状态管理 — 把页面组织起来

**目标**：理解多页面路由、CSS 框架思路、全局状态方案。

| 顺序 | 内容 | 来源 |
|------|------|------|
| 14 | React router, custom hooks, styling app with CSS and webpack | FSO Part 7（含练习） |
| 15 | Advanced state management | FSO Part 6（含练习） |

Astro 的路由是文件系统式的（`src/pages/`），比 React Router 更简单，但理解 SPA 路由的概念仍然必要。FSO Part 7 还涉及 CSS 方案选型（Tailwind 属于其中一种思路）和 webpack/Vite 构建，帮你理解 `pnpm build` 背后在做什么。

---

### 第五阶段：设计思维与验收能力 — 你的核心角色

**目标**：建立「这个界面好不好」的评判框架，而不只是「能不能跑」。

| 顺序 | 内容 | 来源 |
|------|------|------|
| 16 | Design Thinking | CS571 Lecture 4 |
| 17 | Visual Design | CS571 Lecture 6 |
| 18 | Web Design（WIMP & Page Structure） | CS571 Lecture 8 |
| 19 | Interaction Design | CS571 Lecture 10 |
| 20 | Expert Evaluation（Cognitive Walkthrough + Heuristic Evaluation） | CS571 Lecture 12 |
| 21 | Accessibility | CS571 Lecture 14 |
| 22 | Usability Evaluation（Usability Testing） | CS571 Lecture 24 |

你的角色是「提需求 + 验收」，CS571 的设计与评估系列讲的是 **怎么系统地判断界面好不好用、怎么发现问题**。这些方法论 Agent 不会替你做——它写代码，你判断产品。

---

### 第六阶段：测试 + 构建 + 部署 — 质量保障闭环

**目标**：能看懂测试、能跑 CI、能排查构建失败。

| 顺序 | 内容 | 来源 |
|------|------|------|
| 23 | Testing React apps | FSO Part 5（含练习） |
| 24 | CI/CD | FSO Part 11（含练习） |
| 25 | Containers | FSO Part 12（含练习） |

你有 QEMU/GDB/Makefile 经验，Docker 和 CI 对你来说成本很低。FSO Part 11–12 讲 GitHub Actions + Docker，与 RuyiSDK 项目的部署流程直接相关。

---

### 第七阶段：服务端 + 数据库 + 安全 — 全栈闭环

**目标**：补齐后端视角；如果项目日后需要 API / 用户系统，可独立搭建。

**学**

| 顺序 | 内容 | 来源 |
|------|------|------|
| 26 | Programming a server with Node.js and Express | FSO Part 3（含练习） |
| 27 | Testing Express servers, user administration | FSO Part 4（含练习） |
| 28 | GraphQL | FSO Part 8（含练习） |
| 29 | Using relational databases | FSO Part 13（含练习） |
| 30 | Node.js + Express + Database | CS142 Week 6（讲义） |
| 31 | Sessions, Input, State Management | CS142 Week 7（讲义） |
| 32 | Web App Security | CS142 Week 8（讲义） |

**做**

| 顺序 | 练习 | 来源 | 练什么 |
|------|------|------|--------|
| 33 | **Project 6: Appserver and Database** | CS142 | Node.js + MongoDB，第一次写后端 API 对接前端 |
| 34 | **Project 7: Sessions and Input** | CS142 | 认证、表单验证、会话管理——Web 安全的实操入口 |
| 35 | **Project 8: Photo App Sprint** | CS142 | 全栈毕业设计（80 分 + 20 extra credit）。前后端联调、完整功能闭环。做完这个，你就是一个能独立交付全栈项目的工程师 |

当前 Examples 是纯静态站点，这个阶段不阻塞项目。但你做过 CppAIService 和用户态 TCP/IP 协议栈，Node.js/Express 对你来说上手极快。CS142 P6–P8 是后半程最重的三个 Project，做完就是完整的全栈工程能力。

---

### 第八阶段：软件工程方法论

**目标**：开源协作、需求管理、架构决策。

| 顺序 | 内容 | 来源 |
|------|------|------|
| 36 | CMU 17-313 全课程 | 17-313 |

你已经在做开源贡献（RuyiSDK support-matrix PR），17-313 的开源项目贡献 + 需求分析 + 架构评审能让你从工程管理角度理解整个流程。与前端技能无关，但与你的职业方向（系统 + 开源 + Agent 协作）高度相关，可作为独立学习线与前面的阶段**并行推进**。

---

## 总结

| 阶段 | 关键词 | 与项目的关系 | 交付物 |
|------|--------|-------------|--------|
| 1 | HTML / CSS / JS / DOM | 看懂页面结构 | CS142 P1–P3 |
| 2 | React | 读写组件代码 | FSO 练习 + CS142 P4–P5 |
| 3 | TypeScript | 读写类型与接口 | FSO Part 9 练习 |
| 4 | 路由 / 样式 / 状态 | 理解页面组织和构建 | FSO Part 6–7 练习 |
| **5** | **设计思维 / 可用性评估** | **验收核心能力** | CS571 设计讲座笔记 |
| 6 | 测试 / CI / 容器 | 质量保障 | FSO Part 5, 11–12 练习 |
| 7 | Node / Express / DB / 安全 | 全栈闭环 | FSO 练习 + CS142 P6–P8 |
| 8 | 软件工程 | 工程管理视角 | 17-313（可并行） |

**主线是 Full Stack Open**：每个 Part 都有必做练习，覆盖阶段 1–4、6–7。  
**CS142 的 8 个 Project 是硬核验证**：讲义快速过，Project 认真做——它们有明确 spec 和分值，是衡量你是否真学会的标尺。  
**CS571 设计评估讲座**是独特补充，其他课不教。  
**17-313** 独立于前端，与前面各阶段并行。
