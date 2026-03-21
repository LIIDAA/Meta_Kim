# Meta_Kim 运行时能力矩阵

Meta_Kim 同时对接 Claude Code、Codex、OpenClaw，但三者不是同一种产品，不能假装完全同构。

正确做法不是硬说“三端完全一样”，而是：

- 一个理论总源
- 一个 agent 总源
- 一个 skill 总源
- 每个运行时各自走原生入口
- 没有 1:1 对应项时明确标注

## 一、核心能力映射

| 能力 | Claude Code | Codex | OpenClaw | Meta_Kim 落地 |
| --- | --- | --- | --- | --- |
| 理论总源 | 可读仓库文档 | 可读仓库文档 | 可读 workspace 文档 | `meta/meta.md` |
| 角色 / 代理入口 | `.claude/agents/*.md` | `.codex/agents/*.toml` + `AGENTS.md` | `openclaw/workspaces/<agent>/` | Claude agent 为主源，其他运行时镜像生成 |
| 子代理 / 多代理 | 原生 subagents | 原生 custom agents / subagents | 原生多 agent + agent-to-agent | 8 个 meta agent 三端全映射 |
| Skill | `.claude/skills/<name>/SKILL.md` | `.agents/skills/<name>/SKILL.md` | workspace skill + installable skill | Claude skill 为主源，镜像到其他运行时 |
| Skill 兼容镜像 | 无需额外镜像 | `.codex/skills/meta-theory.md` | `openclaw/skills/meta-theory.md` | 兼容保留 |
| MCP | `.mcp.json` | `config.toml` 例子 | 同一 MCP server 可复用 | `scripts/mcp/meta-runtime-server.mjs` |
| Hook / 守卫 | `.claude/settings.json` hooks | 无仓库级原生 hook 文件面 | bundled hooks + `BOOT.md` | Claude 真 hook，OpenClaw 原生 hook 适配，Codex 走宿主配置 |
| 记忆 | 文档与会话上下文 | 宿主状态 / SQLite | `MEMORY.md` + `session-memory` hook | 元记忆策略主源写在 agent / skill 中 |
| 启动注入 | `CLAUDE.md` + agent prompt | `AGENTS.md` + custom agent prompt | `BOOT.md` / `BOOTSTRAP.md` / `IDENTITY.md` | 已覆盖 |
| Sandbox / Approval | Claude permission / tool fields | `sandbox_mode` / `approval_policy` | 宿主工具与网关约束 | Meta_Kim 提供配置入口与说明 |
| 本地验收 | `claude agents` + schema eval | `codex exec --json` smoke | `openclaw config validate` + local smoke | `npm run eval:agents` |

## 二、主源位置

- 理论主源：`meta/meta.md`
- Claude agent 主源：`.claude/agents/*.md`
- Claude skill 主源：`.claude/skills/meta-theory/SKILL.md`

## 三、派生产物

- Codex custom agents：`.codex/agents/*.toml`
- Codex project skill：`.agents/skills/meta-theory/SKILL.md`
- Codex 兼容 skill：`.codex/skills/meta-theory.md`
- OpenClaw workspaces：`openclaw/workspaces/*`
- OpenClaw installable skill：`openclaw/skills/meta-theory.md`
- OpenClaw config：`openclaw/openclaw.template.json`

## 四、标准流程

每次修改 agent prompt 或共享 skill 后：

1. 先改主源文件。
2. 运行 `npm run sync:runtimes`。
3. 运行 `npm run validate`。
4. 运行 `npm run eval:agents`。
5. 如果运行时契约变化，再更新 `README.md`、`CLAUDE.md`、`AGENTS.md`。
