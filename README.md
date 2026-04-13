# RuyiSDK Examples 前端

用网页呈现「在 RISC-V 开发板上怎么用 RuyiSDK 跑示例」的教程；与 [支持矩阵](https://matrix.ruyisdk.org/) 并列，数据可互链，代码仓库独立。

## 技术栈

Astro 6、React、TypeScript、Tailwind CSS v4、shadcn/ui（与 support-matrix-frontend 同栈）。

## 快速开始

需要：**Node.js ≥ 22.12.0**、**pnpm**（可用 `corepack enable`）、**git**（要拉子模块）。

```bash
git clone --recurse-submodules <你的仓库 URL>
cd ruyisdk-examples-frontend

# 若已克隆但没带子模块
git submodule update --init --recursive

pnpm install
pnpm dev          # 默认 http://localhost:3000；会先尝试释放 3000 端口（依赖 bash）
pnpm dev:only     # 不杀端口、不依赖 bash
PORT=3001 pnpm dev

pnpm build
pnpm preview
```

**Mac**：一般装好 Node、pnpm、git 后，按上面即可；`pnpm dev` 与 `pnpm dev:only` 都能用。

**Windows**：优先用 **`pnpm dev:only`** 起站点（`pnpm dev` 会调 bash，未装 Git for Windows / 未把 bash 加进 PATH 时会失败）。改端口：PowerShell 用 `$env:PORT=3001; pnpm dev:only`，CMD 用 `set PORT=3001&& pnpm dev:only`。

**Linux**：若缺 `fuser` 可装 `psmisc` 或改用 `pnpm dev:only`。端口被占用时不会自动换端口，可改 `PORT`。首页没有板子内容时，先确认已执行 submodule 命令。

## 目录结构（节选）

- `docs/` — 设计（`design.md`）、计划（`plan.md`）等  
- `src/` — 页面、组件、`lib/data.ts`（读 `test-doc`）  
- `test-doc/` — 板卡文档内容（git submodule，来自 `ruyisdk/board-docs`）  
- `support-matrix-frontend/` — 参考用 submodule，勿改其代码  

## 内容与路由

`test-doc/` 下按「板子 → 示例子目录 → .md」组织，例如：

`test-doc/LicheePi4A/Coremark/example_Coremark_LPi4A.md`

内容仓库里可能还会有 `templates/`（用于贡献者写文档的模板/PR 模板等），**站点不会展示它**（不会出现在侧栏/搜索，也不会生成 `/boards/templates/` 路由）。

路由：`/` → `/boards/{board}/` → `/boards/{board}/{example}/`（另有厂商 / SoC 聚合页，见 `docs/design.md`）。

## 更新内容子模块（test-doc）

站点内容来自 `test-doc/` 子模块（`ruyisdk/board-docs`）。**部署到 ruyisdk.org 前**，建议在构建前更新子模块（不要在运行时自动 `git pull`）。

```bash
cd test-doc
git fetch origin main
git pull --rebase origin main

cd ..
git add test-doc
git commit -m "chore: bump test-doc submodule"
```
