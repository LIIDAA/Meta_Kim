# Meta_Kim

![Runtime](https://img.shields.io/badge/runtime-Claude%20Code%20%7C%20Codex%20%7C%20OpenClaw-111827)
![Method](https://img.shields.io/badge/method-%E6%84%8F%E5%9B%BE%E6%94%BE%E5%A4%A7-0f766e)
![License](https://img.shields.io/badge/license-CC%20BY%204.0-f59e0b)

AI 元架构 · 意图放大 · 三端同构

> 同一套“基于元的意图放大”方法，同时落到 Claude Code、Codex、OpenClaw。

> 用户用哪个软件，就走哪个软件的入口；但背后的放大逻辑、治理逻辑、协作逻辑保持一致。

* * *

## 项目简介

Meta_Kim 不是聊天产品，不是网页，不是 SaaS，也不是单个 prompt。

它是一个给 AI 助手运行时使用的元架构仓库，核心目标只有一个：

**让用户的原始意图先被放大，再被执行。**

这里的“放大”不是把话说得更长，而是把原始需求里本来缺失的关键部分补出来，例如：

- 真实目标是什么
- 范围边界是什么
- 风险与约束是什么
- 交付物应该长成什么样
- 先做什么，后做什么
- 需要哪些能力协同完成

所以 Meta_Kim 追求的不是“更会聊天”，而是：

**把一句模糊需求，稳定转成一个更完整、更清楚、更可落地的任务。**

## 为什么要做这个项目

Claude Code、Codex、OpenClaw 都能做事，但它们的入口形态、配置方式、运行时约束并不一样。

如果每个软件都各写一套 prompt、各做一套 agent、各养一套 skill，最后一定会出现三种问题：

- 同一个需求在三端表现不一致
- 一个地方修了，另外两个地方漏改
- 结构越来越散，最后只剩“能跑”，没有治理

Meta_Kim 想解决的正是这个问题：

**把方法论放在中间，把运行时适配放在外层。**

这样最终效果是：

- Claude Code 有 Claude Code 的入口
- Codex 有 Codex 的入口
- OpenClaw 有 OpenClaw 的入口

但三端都遵循同一套元职责和意图放大标准。

## “元”是什么

这个项目里的“元”，不是装饰词，也不是玄学名词。

在 Meta_Kim 里：

**元 = 为了完成意图放大而存在的最小可治理单元。**

“最小可治理单元”有四个关键特征：

- 有独立职责，不跟别的角色混成一团
- 有明确边界，知道自己负责什么、不负责什么
- 可以被单独调用、单独验证、单独替换
- 可以进入协作关系，但不会失去自身角色定义

这意味着 Meta_Kim 不是追求“一个万能 agent 包打天下”，而是追求：

**把复杂能力拆成可治理、可验证、可协作的一组元。**

## 最终会做成什么样

最终成品不是一个大而全的说明文档，也不是只会展示概念的 agent 清单。

最终成品应该呈现成这样：

1. 用户提出原始意图
2. 系统先判断这个意图缺什么
3. 先做意图放大，再决定要不要分工
4. 必要时把不同部分交给不同元 agent
5. 收回结果，统一整理成可执行输出

所以用户真正感受到的，不应该是“这里有很多 agent”。

用户真正感受到的，应该是：

**这个系统比普通助手更会理解问题、更会拆问题，也更会把事情做完整。**

## 核心能力

- 跨运行时适配：同一套方法论同时落到 Claude Code、Codex、OpenClaw
- 元职责治理：把能力拆成清楚、稳定、可替换的治理单元
- 统一入口思路：外部入口不同，内部方法一致
- 多层能力编排：agent、skill、MCP、hook、memory、workspace 联动
- 同步与校验：主源改动后可以自动同步并验证三端产物

## 8 个元 agent 分工

它们是后台分工，不是面向用户的菜单。

- `meta-warden`：统一入口、统筹、仲裁、最终整合
- `meta-genesis`：人格、提示词、`SOUL.md`
- `meta-artisan`：skill、MCP、工具能力匹配
- `meta-sentinel`：hook、安全、权限、回滚
- `meta-librarian`：记忆、知识、连续性
- `meta-conductor`：工作流、节奏、编排
- `meta-prism`：质量审查、漂移检测、反 AI 套话
- `meta-scout`：外部工具发现与评估

默认对外入口优先理解成 `meta-warden`，其余元 agent 更像后台专员。

## 三端是怎么落地的

| 运行时 | 入口文件 | 主要资产 | 目标 |
| --- | --- | --- | --- |
| Claude Code | `CLAUDE.md` | `.claude/agents/`、`.claude/skills/`、`.mcp.json` | 让 Claude Code 直接承载这套意图放大元架构 |
| Codex | `AGENTS.md` | `.codex/agents/`、`.agents/skills/`、`codex/config.toml.example` | 让 Codex 按同一套元职责和规则运行 |
| OpenClaw | `openclaw/workspaces/` | `openclaw/openclaw.template.json`、`openclaw/skills/` | 让 OpenClaw 本地 workspace agent 同样围绕意图放大工作 |

## 仓库结构

```text
Meta_Kim/
├─ .claude/        Claude Code 主源，包括 agents、skills、hooks、settings
├─ .codex/         Codex 直接读取的仓库内 agents 与 skills
├─ .agents/        Codex 项目级 skills 目录
├─ codex/          只是给用户复制到 ~/.codex/config.toml 的配置示例
├─ openclaw/       OpenClaw workspace、模板配置、运行时镜像
├─ scripts/        同步、校验、MCP、自检、OpenClaw 本地准备脚本
├─ shared-skills/  跨运行时共享的技能镜像
├─ AGENTS.md       Codex / 通用运行时入口说明
├─ CLAUDE.md       Claude Code 入口说明
├─ .mcp.json       Claude Code 项目级 MCP 配置
└─ README.md       项目总说明
```

## 最容易看不懂的两个点

### 1. 为什么有 `codex/`，但 Claude 和 OpenClaw 没有对应同名目录

因为三家的配置读取方式不一样。

- Claude Code 直接读仓库里的 `CLAUDE.md`、`.claude/`、`.mcp.json`
- OpenClaw 直接读仓库里的 `openclaw/`
- Codex 一部分读仓库内的 `.codex/`、`.agents/`，另一部分还需要用户目录下的全局配置 `~/.codex/config.toml`

所以这里会看到两个和 Codex 相关的目录：

- `.codex/`：这是 Codex 真正会直接读取的仓库内运行时资产
- `codex/`：这里只放一个配置示例，作用是告诉用户怎么写自己的 `~/.codex/config.toml`

也就是说，`codex/` 不是多出来的一套运行时，也不是和 `.codex/` 重复。

它只是一个“示例说明目录”。

### 2. `npm` 那几条命令到底是干嘛的

如果你第一次看这个仓库，很容易以为每条命令都得跑。其实不是。

它们分别是：

- `npm install`：安装这个仓库用到的 Node 依赖。第一次下载项目后跑一次即可。
- `npm run sync:runtimes`：把主源同步成 Claude Code、Codex、OpenClaw 三端实际要用的文件。只有你改了 agent、skill、运行时资产之后才需要跑。
- `npm run prepare:openclaw-local`：给 OpenClaw 做本机准备。因为 OpenClaw 不只读仓库文件，还会用到你电脑用户目录下的本地授权和 agent 状态，所以只有你要在本机跑 OpenClaw 时才需要。
- `npm run verify:all`：做总验收。它会统一检查三端资产有没有漏、有没有坏、能不能对上。适合在发布、提交、开源前使用。

你可以按场景理解：

- 只想看项目、看文档：什么都可以不跑
- 第一次下载后想把环境装好：跑 `npm install`
- 改了 agent / skill / 配置后想同步三端：跑 `npm run sync:runtimes`
- 想在本机真正跑 OpenClaw：再跑 `npm run prepare:openclaw-local`
- 想确认整个仓库现在可发布、可验收：跑 `npm run verify:all`

## 快速开始

如果你是第一次下载项目，并且想把三端都准备好，在仓库根目录执行：

```bash
npm install
npm run sync:runtimes
npm run prepare:openclaw-local
npm run verify:all
```

更直白地说：

- `npm install`
  作用：装依赖
  什么时候需要：第一次下载项目后

- `npm run sync:runtimes`
  作用：重新生成三端运行时文件
  什么时候需要：你改了 agent、skill、运行时配置后

- `npm run prepare:openclaw-local`
  作用：补 OpenClaw 本机授权和本地 agent 状态
  什么时候需要：你要在自己电脑上真正跑 OpenClaw

- `npm run verify:all`
  作用：做完整检查和三端验收
  什么时候需要：你准备发布、提交，或者怀疑哪里配坏了

如果你只是普通阅读者，通常只需要知道：

- 读文档不需要跑任何命令
- 改文档通常也不需要跑 `prepare:openclaw-local`
- 只有动到运行时资产，才需要 `sync:runtimes`
- 只有准备总验收，才需要 `verify:all`

## 方法依据与论文

这个仓库的核心方法依据，是作者关于“基于元的意图放大”的详细评测。

- 论文页面：<https://zenodo.org/records/18957649>
- DOI：`10.5281/zenodo.18957649`

这篇论文提供的是方法论背景、评测依据和理论支撑；仓库提供的是可运行的运行时资产与工程落地。

## 适用场景

- 想把一套 agent 方法同时落到多个 AI 运行时
- 不满足于“堆 prompt”，而是要做可治理的 agent 架构
- 需要把 skill、MCP、hook、memory、workspace 一起纳入治理
- 希望不同软件入口下，得到一致的意图放大效果

## License

本项目采用 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可协议。

你可以分享、改编、再发布，但需要保留署名并标注修改。

## 一句话总结

**Meta_Kim 不是一个“展示很多 agent 的仓库”，而是一套让“基于元的意图放大”在 Claude Code、Codex、OpenClaw 三端稳定成立的元架构工程。**
