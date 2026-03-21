# Meta_Kim

> 基于 `meta/meta.md` 的跨运行时元架构仓库。

Meta_Kim 不是业务应用，而是一套可移植的 Agent 架构包。它把“元 = 最小可治理单元”这套理论，落成能在 Claude Code、OpenClaw、Codex 三个运行时中复用的资产。

## 一、这个仓库到底提供什么

### Claude Code 运行时包

- `CLAUDE.md`
- `.claude/agents/*.md`
- `.claude/skills/meta-theory/SKILL.md`
- `.claude/settings.json`
- `.mcp.json`

### OpenClaw 运行时包

- `openclaw/workspaces/*`
- `openclaw/skills/meta-theory.md`
- `openclaw/openclaw.template.json`

### Codex 运行时包

- `AGENTS.md`
- `.codex/agents/*.toml`
- `.agents/skills/meta-theory/SKILL.md`
- `.codex/skills/meta-theory.md`
- `codex/config.toml.example`

### 共享基础设施

- `scripts/sync-runtimes.mjs`
- `scripts/validate-project.mjs`
- `scripts/mcp/meta-runtime-server.mjs`
- `meta/runtime-capability-matrix.md`
- `meta/runtime-coverage-audit.md`
- `meta/repo-map.md`

## 二、哪些文件才是主源

- `meta/meta.md`：理论总源
- `.claude/agents/*.md`：Agent 定义总源
- `.claude/skills/meta-theory/SKILL.md`：Skill 定义总源

其他文件基本都属于两类：
- 从主源生成出来的派生产物
- 针对某个运行时的适配层

## 三、三套运行时的能力覆盖方式

| 能力 | Claude Code | OpenClaw | Codex |
| --- | --- | --- | --- |
| 多代理 / 子代理 | 原生 `.claude/agents/` | 原生独立 workspace | 原生 `.codex/agents/` + 仓库规则驱动 |
| Skill | 原生 `.claude/skills/` | 可安装 skill 文件 + workspace skill | `.agents/skills` + `.codex/skills` 兼容镜像 |
| MCP | 原生 `.mcp.json` | 官方主文档里没有稳定的同层项目级 MCP 接口 | 用户级 MCP 配置 |
| Hook / 守卫 | 原生 `.claude/settings.json` hooks | 原生 bundled hooks + `BOOT.md` | 宿主配置层的 sandbox / approval |
| 记忆 | `CLAUDE.md` + 文件 | `MEMORY.md` + session-memory hook | 仓库说明 + 宿主上下文 |

完整说明见 `meta/runtime-capability-matrix.md`。
覆盖审计见 `meta/runtime-coverage-audit.md`。
仓库结构说明见 `meta/repo-map.md`。

## 四、快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 生成派生产物

```bash
npm run sync:runtimes
```

### 3. 准备 OpenClaw 本地授权镜像

```bash
npm run prepare:openclaw-local
```

这一步会把你本机已经授权好的 `~/.openclaw/agents/main/agent/` 里的
`auth.json / auth-profiles.json / models.json`
同步到 Meta_Kim 的 8 个本地 meta agent 运行时目录。

### 4. 验证仓库状态

```bash
npm run validate
```

### 5. 全量检查

```bash
npm run check
```

### 6. 运行时验收

```bash
npm run eval:agents
```

这一步会做三件事：
- 验证 Claude Code 是否识别 8 个元 agent，并逐个跑角色边界自检
- 验证 Codex 是否识别仓库入口、custom agents、project skills、MCP、sandbox / approval 配置入口
- 验证 OpenClaw 本地配置、bundled hooks、workspace 注入是否可用，并对 8 个元 agent 做真实冒烟

## 五、怎么在不同运行时使用

### Claude Code

1. 用 Claude Code 打开仓库。
2. 8 个子代理从 `.claude/agents/` 自动加载。
3. `meta-theory` 从 `.claude/skills/meta-theory/SKILL.md` 加载。
4. 项目 Hook 从 `.claude/settings.json` 生效。
5. 项目 MCP 从 `.mcp.json` 生效。
6. 如需额外生态技能，可运行：

```bash
bash install-deps.sh
```

### Codex

1. 用 Codex 或 Codex CLI 打开仓库。
2. 仓库根目录 `AGENTS.md` 是主入口。
3. 如需接入本地 MCP，把 `codex/config.toml.example` 复制到 `~/.codex/config.toml`，并把 `REPLACE_WITH_REPO_ROOT` 改成你的真实路径。
4. 项目级 custom agents 在 `.codex/agents/`。
5. 项目级 skill 主入口在 `.agents/skills/meta-theory/SKILL.md`。
6. `.codex/skills/meta-theory.md` 是兼容镜像，`shared-skills/meta-theory.md` 是跨运行时共享镜像。

### OpenClaw

1. 先执行：

```bash
npm install
npm run sync:runtimes
npm run prepare:openclaw-local
```

2. 把 `openclaw/openclaw.template.json` 或本机生成的 `openclaw/openclaw.local.json` 合并到你的 OpenClaw 配置里。
   本机生成的 `openclaw/openclaw.local.json` 会优先跟随 `~/.openclaw/openclaw.json` 里的当前 primary model，而不是写死仓库默认值。
3. 安装 portable skill：

```bash
openclaw skill install ./openclaw/skills/meta-theory.md
```

4. 让 OpenClaw 的 agent workspace 指向 `openclaw/workspaces/<agent-id>/`。
5. 每个 workspace 内已经自动生成：
   - `BOOT.md`
   - `BOOTSTRAP.md`
   - `IDENTITY.md`
   - `MEMORY.md`
   - `USER.md`
   - `SOUL.md`
   - `AGENTS.md`
   - `TOOLS.md`
   - `HEARTBEAT.md`
   - `memory/README.md`
   - `skills/meta-theory/SKILL.md`
6. OpenClaw 配置模板已经预置并启用这三个 bundled hooks：
   - `session-memory`
   - `command-logger`
   - `boot-md`
7. 冒烟测试：

```bash
openclaw agent --local --agent meta-warden -m "Read your SOUL.md first, then introduce the team."
```

## 六、仓库命令

- `npm run sync:runtimes`：重新生成 OpenClaw workspace、共享 skill 镜像、OpenClaw 配置模板
- `npm run prepare:openclaw-local`：同步 OpenClaw 主 agent 的认证状态到 8 个 meta agent
- `npm run test:mcp`：测试本地 MCP 服务是否能启动
- `npm run eval:agents`：跑 Claude / Codex / OpenClaw 三端的真实验收
- `npm run validate`：校验主源、派生产物、Hook、MCP 配置是否一致
- `npm run check`：先检查派生产物是否最新，再执行完整校验
- `npm run verify:all`：串联静态检查与三端冒烟，得到完整验收结果

## 七、项目结构

```text
Meta_Kim/
├── .agents/
│   └── skills/
├── AGENTS.md
├── .codex/
│   ├── agents/
│   └── skills/
├── CLAUDE.md
├── .claude/
│   ├── agents/
│   ├── hooks/
│   ├── settings.json
│   └── skills/meta-theory/
├── .mcp.json
├── codex/config.toml.example
├── meta/
│   ├── meta.md
│   ├── runtime-capability-matrix.md
│   └── runtime-coverage-audit.md
├── openclaw/
│   ├── openclaw.template.json
│   ├── skills/
│   └── workspaces/
├── scripts/
│   ├── mcp/meta-runtime-server.mjs
│   ├── sync-runtimes.mjs
│   └── validate-project.mjs
└── shared-skills/
```

## 八、最重要的原则

Meta_Kim 的“跨运行时”不是假装三套系统完全一样。

真正的做法是：
- 一套理论主源
- 一套 Agent 主源
- 一套 Skill 主源
- 每个运行时各自有明确适配层
- 没有原生等价能力的地方，明确写出来，不硬编

这才是能长期维护的“元架构”。

## 九、GitHub 主仓对齐说明

我已按 2026-03-21 能从 GitHub 直接核对到的主仓结构收紧兼容方式：

- `anthropics/claude-code`：官方仓库明确存在插件与自定义 agent 扩展面。
- `openai/codex`：官方文档明确存在根级 `AGENTS.md`、项目级 `.codex/agents/`、项目级 `.agents/skills/`、MCP 与 sandbox / approval 配置面。
- `openclaw/openclaw`：官方仓库明确写明 workspace 注入文件为 `AGENTS.md / SOUL.md / TOOLS.md`，并支持 workspace skill 路径。

因此当前仓库也同步补上了：
- `.agents/skills/meta-theory/SKILL.md`
- `.codex/agents/*.toml`
- `.codex/skills/meta-theory.md`
- `openclaw/workspaces/*/BOOT.md`
- `openclaw/workspaces/*/BOOTSTRAP.md`
- `openclaw/workspaces/*/IDENTITY.md`
- `openclaw/workspaces/*/MEMORY.md`
- `openclaw/workspaces/*/USER.md`
- `openclaw/workspaces/*/TOOLS.md`
- `openclaw/workspaces/*/memory/README.md`
- `openclaw/workspaces/*/skills/meta-theory/SKILL.md`

## 十、许可证

MIT
