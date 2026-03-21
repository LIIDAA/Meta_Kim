# Meta_Kim

> 目标不是“做一堆 agent”，而是让 `meta/meta.md` 所描述的 **意图放大** 在 Claude Code、Codex、OpenClaw 三个运行时里都成立。

## 这个项目到底是干嘛的

Meta_Kim 不是一个业务产品，也不是一个聊天 UI。

它是一个跨运行时的 **意图放大架构包**：

- 用户在任意一个支持的运行时里提出原始需求
- 系统先按 `meta/meta.md` 的方向理解这个需求
- 再把需求放大成更完整的目标、约束、风险、节奏、交付物
- 必要时调用不同的元 agent 做后台分工
- 最终输出更强、更完整、更可执行的结果

所以这个项目的外部目标很简单：

**用户用什么软件，就走那个软件的入口；但背后的意图放大逻辑尽量保持一致。**

## “元”到底是什么

这里的“元”，不是玄学词，也不是随便给 agent 起的酷名字。

在 Meta_Kim 里：

**元 = 为了完成意图放大而存在的最小可治理单元。**

它至少要满足这些条件：

- 有独立职责
- 有明确边界
- 能被编排
- 能被验证
- 能被替换

所以“元”不是一个随手加的功能点，也不是“看到什么都做一点”的万能 agent。

它更像复杂系统里的最小治理角色。

## `meta/meta.md` 是什么

`meta/meta.md` 是这个项目的 **整体目标参考** 和 **方法论参考**。

它不是：

- 运行时配置文件
- 自动生成源
- 要被逐字复制到每个 prompt 里的长稿

它真正的作用是：

- 说明这个项目为什么存在
- 说明“元”这套方法论的背景
- 说明组织镜像、节奏编排、意图放大这条主线
- 作为三端实现时的对齐参考

## 三端最终要成立成什么样

你可以把三端理解成三个不同的入口壳。

### Claude Code

- 入口文件：`CLAUDE.md`
- 运行时资产：`.claude/agents`、`.claude/skills`、`.mcp.json`
- 目标效果：在 Claude Code 里直接形成一套围绕“意图放大”工作的元 agent 体系

### Codex

- 入口文件：`AGENTS.md`
- 运行时资产：`.codex/agents`、`.agents/skills`、`codex/config.toml.example`
- 目标效果：在 Codex 里也能按同一套“元”职责做意图放大，而不是另起一套逻辑

### OpenClaw

- 入口目录：`openclaw/workspaces`
- 运行时资产：`openclaw/openclaw.template.json`、`openclaw/skills/meta-theory.md`
- 目标效果：在 OpenClaw 里，用户走本地 workspace agent，同样得到围绕意图放大的行为

## 8 个元 agent 是干嘛的

它们不是让用户逐个研究的“功能菜单”，而是后台分工。

- `meta-warden`：统一入口、统筹、仲裁、最终整合
- `meta-genesis`：人格、提示词、`SOUL.md`
- `meta-artisan`：skill、MCP、工具能力匹配
- `meta-sentinel`：hook、安全、权限、回滚
- `meta-librarian`：记忆、知识、连续性
- `meta-conductor`：工作流、节奏、编排
- `meta-prism`：质量审查、漂移检测、反 AI 套话
- `meta-scout`：外部工具发现与评估

外部应该看到的是：

**一个统一的意图放大入口。**

内部才是这些元 agent 的分工协作。

## 哪些文件才是主源

- `meta/meta.md`：整体目标与方法论参考
- `.claude/agents/*.md`：agent 定义主源
- `.claude/skills/meta-theory/SKILL.md`：skill 定义主源

其他多数文件都是：

- 运行时适配层
- 或由主源同步生成出来的派生产物

## 最简使用流程

在仓库根目录执行：

```bash
npm install
npm run sync:runtimes
npm run prepare:openclaw-local
npm run verify:all
```

这四步的意义：

- `npm install`：安装依赖
- `npm run sync:runtimes`：把三端需要的运行时文件同步出来
- `npm run prepare:openclaw-local`：把 OpenClaw 本机授权同步给 8 个 meta agent
- `npm run verify:all`：做完整检查和三端验收

## 如果你只是想知道“现在能不能用”

- Claude Code：直接打开仓库即可读取 `CLAUDE.md` 和 `.claude/agents/`
- Codex：直接打开仓库即可读取 `AGENTS.md` 和 `.codex/agents/`
- OpenClaw：先跑上面的 4 条命令，再让它使用 `openclaw/openclaw.local.json`

## 其他说明

- 仓库地图：`meta/repo-map.md`
- 能力矩阵：`meta/runtime-capability-matrix.md`
- 覆盖审计：`meta/runtime-coverage-audit.md`

## 一句最重要的话

Meta_Kim 最终不是要证明“我做了很多 agent”。

而是要证明：

**同一个 `meta/meta.md` 所代表的意图放大方向，可以在 Claude Code、Codex、OpenClaw 三端成立。**
