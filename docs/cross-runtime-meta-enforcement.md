# 跨运行时 Meta 治理强制力矩阵

> **任务来源**：Worker B 跨运行时审计发现治理强制力只在 Claude Code 一端有"机械拦截"层；其余三端只有 prompt 自律。
>
> **本文件目的**：明确每个运行时能做到的强制力上限，避免对"四端一致"产生不实承诺；同时记录已实施的投影源。
>
> **状态更新（capability-first v2，2026-05-23）**：Claude Code、Codex、Cursor v1.7+ 三端已经由同一份 `enforce-agent-dispatch.mjs` 投影出**真正的机械拦截**；OpenClaw 因无 PreToolUse 等价 hook，仍为声明性约束（HEARTBEAT.md + SOUL.md 硬性拒绝文案）。下表已按新事实重写。

## 一、能力评估表

| 运行时 | hook 配置文件 | PreToolUse-类事件 | 是否支持工具拦截 (deny) | 当前已用机制 | 投影方式 |
|--------|--------------|------------------|----------------------|-----------|----------|
| **Claude Code** | `.claude/settings.json` | `PreToolUse`（Claude schema 原生） | **是**：`{hookSpecificOutput.permissionDecision: "deny"}` 协议被 Host 强制解释 | `.claude/hooks/enforce-agent-dispatch.mjs`（canonical 源 `canonical/runtime-assets/claude/hooks/enforce-agent-dispatch.mjs`），含 capability-first gate 与 meta-readonly 拒绝 | hook 直投：canonical → `sync-runtimes.mjs` → `.claude/hooks/` |
| **Codex** | `.codex/hooks.json` | `PreToolUse`（Codex 现支持 deny 协议） | **是**（已落地）：同一份 `enforce-agent-dispatch.mjs` 通过 `META_KIM_HOOK_RUNTIME=codex` 切换 payload schema；matcher `"Bash\|apply_patch\|Edit\|Write\|MultiEdit\|NotebookEdit\|Agent"`，注册位置 `scripts/runtime-hook-mapping.mjs:213-219` | `.codex/hooks/enforce-agent-dispatch.mjs`（synced）+ frontmatter `executionBlock=true`（9 个 meta agent 全覆盖）双层 | hook 投影 + agent prompt 声明 |
| **Cursor** | `.cursor/hooks.json` | `preToolUse`（lowerCamel；Cursor v1.7+ 公开 deny 协议：exit code 2 + stderr 或 stdout JSON `{"permission":"deny",...}`） | **是**（已落地）：同一份 hook 通过 `META_KIM_HOOK_RUNTIME=cursor` 投影，`failClosed: true` 保证 hook 崩溃时默认拒绝；注册位置 `scripts/runtime-hook-mapping.mjs:269-280` | `.cursor/hooks/enforce-agent-dispatch.mjs`（synced）+ `.cursor/rules/meta-enforcement.mdc`（alwaysApply 声明性备份） | hook 投影 + MDC alwaysApply 双层 |
| **OpenClaw** | `openclaw/openclaw.template.json` + Plugin SDK hooks | **无** PreToolUse 等价事件 | **不支持**：OpenClaw hook 是 lifecycle events（`command:new`/`command:reset`/`command:stop`/`session:compact:after`），无工具级拦截 | workspace `HEARTBEAT.md` 硬性拒绝文案 + 9 个 SOUL.md 的 `executionBlock=true` | **仅声明性**：依赖 workspace prompt 注入 |

### 1.1 Capability-First (fetchRecord) Gate

| 运行时 | 强制层 | hook 文件 | 行为 | env 覆盖 |
|--------|--------|----------|------|---------|
| Claude Code | **real hook deny** | `.claude/hooks/enforce-agent-dispatch.mjs` | stages `execution / review / meta_review / verification / evolution` 内若 `fetchRecord.capabilitySearchPerformed !== true` → deny；`critical / fetch / thinking` 豁免 | `META_KIM_CAPABILITY_GATE=progressive\|block\|warn\|off`（默认 `progressive`；可设 `block` 立即硬拒绝） |
| Codex CLI | **real hook deny** | `.codex/hooks/enforce-agent-dispatch.mjs`（同源投影） | 同上，`META_KIM_HOOK_RUNTIME=codex` 切换 deny payload schema | 同上 |
| Cursor v1.7+ | **real hook deny** | `.cursor/hooks/enforce-agent-dispatch.mjs`（同源投影） | 同上，`failClosed: true` + exit code 2 + JSON | 同上 |
| OpenClaw | **hard prose only** | 无 hook | workspace `HEARTBEAT.md` + 9 个 SOUL.md 中的强制拒绝文案，依赖 agent 自律 | env 不适用；可通过 `npm run meta:eval:agents:live` 抽样审计 |

## 二、本任务实际落地的投影源

| 文件 | 类型 | 作用 | 是否新增 |
|------|------|------|--------|
| `canonical/runtime-assets/claude/hooks/enforce-agent-dispatch.mjs` | Hook 实施 | Claude/Codex/Cursor 共用机械拦截源；含 capability-first gate、node-binding gate 与 meta-readonly 拒绝 | 已存在；capability-first 段为 v2 新增 |
| `canonical/runtime-assets/cursor/rules/meta-enforcement.mdc` | Cursor MDC 规则 | Cursor 端 alwaysApply 声明性备份，hook 失效时仍能引导 | 已存在；声明文案已更新为"hook-first, MDC-as-safety-net" |
| `.codex/hooks/enforce-agent-dispatch.mjs` | Hook 投影 | Codex 端机械拦截（同源 sync） | v2 新增（由 `sync-runtimes.mjs` 维护） |
| `.cursor/hooks/enforce-agent-dispatch.mjs` | Hook 投影 | Cursor 端机械拦截（同源 sync） | v2 新增 |
| `scripts/runtime-hook-mapping.mjs` | hook 注册 | 把同一份 hook 映射到三个 runtime 的 PreToolUse 槽位 | `:213-219`（Codex）、`:269-280`（Cursor） |
| `.codex/agents/meta-*.toml` 中的 `> GOVERNANCE LAYER AGENT — NOT FOR DIRECT EXECUTION` block | TOML prompt 段 | Codex 端声明性约束 | 已存在（9 agent 全覆盖，frontmatter `executionBlock=true`） |
| `openclaw/workspaces/meta-*/SOUL.md` + `HEARTBEAT.md` | SOUL/Heartbeat prompt | OpenClaw 端唯一可用约束 | 已存在；HEARTBEAT.md 在 v2 中加固硬性拒绝文案 |

## 三、强制力分层（按能力上限）

```
┌────────────────────────────────────────────────────────────┐
│  L1 机械拦截 (Mechanical Block) — 三端已统一                  │
│  - Claude Code: PreToolUse → permissionDecision: "deny"     │
│  - Codex CLI: PreToolUse → 同源 hook（runtime payload 切换）   │
│  - Cursor v1.7+: preToolUse → exit 2 + JSON，failClosed:true │
│  共享：capability-first gate + meta-readonly 拒绝            │
│  共享 env 覆盖：META_KIM_CAPABILITY_GATE / *_META_ENFORCEMENT_MODE │
├────────────────────────────────────────────────────────────┤
│  L2 声明 + alwaysApply 规则 (Declarative + Always-Apply)     │
│  - Cursor:                                                  │
│    .cursor/rules/meta-enforcement.mdc with alwaysApply:true │
│    作为 hook 失效时的声明性备份（hook-first, MDC-as-safety-net） │
├────────────────────────────────────────────────────────────┤
│  L3 仅声明 (Declarative Only)                                │
│  - OpenClaw: workspace HEARTBEAT.md + SOUL.md prompt 段      │
│  - 依赖 agent 自律：读到声明 → 拒绝违规 → 提示 dispatch        │
│  - **无机械保障**：若模型选择忽略，本运行时**无法拦截**           │
│  - Codex/Cursor agent prompt 段（executionBlock=true）        │
│    现在退化为 hook 失效时的备份                                │
└────────────────────────────────────────────────────────────┘
```

## 四、用户预期管理（必须明示）

### 4.1 Claude Code 上的承诺
- meta agent 被错误派去做执行工作时，hook **强制** deny，事故无法静默发生
- 如果 spine state 已激活，未派 agent 直接 Write/Edit/Bash 也会被 deny
- 在 stages `execution/review/meta_review/verification/evolution`，若 `fetchRecord.capabilitySearchPerformed !== true` 直接派 `Agent` 也会被 deny（capability-first gate）

### 4.2 Codex 上的承诺与限制
- **承诺**：Codex 现版本 PreToolUse 支持 deny 协议，同一份 `enforce-agent-dispatch.mjs` 已通过 `sync-runtimes.mjs` 投影到 `.codex/hooks/`；matcher 覆盖 `Bash|apply_patch|Edit|Write|MultiEdit|NotebookEdit|Agent`，capability-first 与 meta-readonly 双 gate 均生效
- **承诺（次级）**：每个 meta agent TOML 显式声明 `executionBlock=true`，作为 hook 配置失效时的声明性备份
- **限制**：Codex `apply_patch` 在某些版本上有上游 issue（参见 `#16732`），可能导致 deny payload 在该单一工具下被绕过。建议用户运行 `npm run meta:eval:agents:live` 抽样验证
- **环境变量**：`META_KIM_HOOK_RUNTIME` 是**可选覆盖**，并非由 sync 自动注入。hook 在加载时根据 `process.argv[1]` 路径段（`.codex` / `.cursor` / `.claude`）自动检测当前 host runtime，仅在需要强制覆盖时设置此变量。`META_KIM_CAPABILITY_GATE` 默认 `progressive`，可设 `META_KIM_CAPABILITY_GATE=block` 立即硬拒绝。

### 4.3 Cursor 上的承诺与限制
- **承诺**：Cursor v1.7+ 原生支持 preToolUse deny 协议（exit code 2 + stderr 或 stdout JSON）；同源 hook 已投影；`failClosed: true` 确保 hook 崩溃时默认拒绝
- **承诺（次级）**：`.cursor/rules/meta-theory-dispatch.mdc` + `.cursor/rules/meta-enforcement.mdc` 双 alwaysApply 声明性备份；MDC 文案已更新为 "hook-first, MDC-as-safety-net"
- **限制**：Cursor v1.7 以下版本不支持 preToolUse deny 协议，只剩 MDC 声明性约束。请确认 Cursor 版本 ≥ v1.7
- **环境变量**：`META_KIM_HOOK_RUNTIME` 是**可选覆盖**，并非由 sync 自动注入。`enforce-agent-dispatch.mjs:115-137` 在加载时根据 `process.argv[1]` 路径段（`.codex` / `.cursor` / `.claude`）自动检测当前 host runtime，仅在需要强制覆盖时设置此变量

### 4.4 OpenClaw 上的承诺与限制
- **承诺**：9 个 workspace 的 SOUL.md 全部声明 `executionBlock=true`；HEARTBEAT.md 中含硬性拒绝文案
- **限制**：OpenClaw 完全无工具级拦截机制；事故可能复发；建议结合 `agent-to-agent` 派发链 + `MEMORY.md` 审计弥补
- **缓解**：当 OpenClaw 引入 PreToolUse 等价 hook 时，同一份 `enforce-agent-dispatch.mjs` 可直接投影过去（已设计为 runtime-agnostic）

## 五、环境变量与运行时切换

三端共享的运行时控制开关：

| 变量 | 取值 | 默认 | 作用 |
|------|------|------|------|
| `META_KIM_META_ENFORCEMENT_MODE` | `warn` / `block` / `progressive` | `progressive` | 控制 meta-* agent readonly 边界的拒绝强度。`warn`：仅写 stderr，放行；`block`：硬 deny；`progressive`：自 `runStartTimestamp` 起 `META_KIM_META_ENFORCEMENT_GRACE_DAYS`（默认 7 天）内表现为 `warn`，宽限期满后切换为 `block` |
| `META_KIM_META_ENFORCEMENT_GRACE_DAYS` | 非负整数 | `7` | `progressive` 模式下的宽限天数。无效或缺失时回退为 7 |
| `META_KIM_CAPABILITY_GATE` | `progressive` / `block` / `warn` / `off` | `progressive` | 控制 capability-first gate。`progressive`：宽限期内 warn，之后 hard deny；`block`：硬 deny；`warn`：仅 stderr 警告；`off`：禁用 |
| `META_KIM_HOOK_RUNTIME` | `claude` / `codex` / `cursor` | 自动（由 hook 运行时检测 `process.argv[1]` 路径段 `.codex` / `.cursor` / `.claude` 推断；缺失时回退 `claude`） | 显式覆盖 runtime 检测，影响 deny payload 输出 schema。Claude 用 `hookSpecificOutput.permissionDecision`，Codex 用兼容 schema，Cursor 用 `permission: "deny"` JSON + exit code 2 |

新装和常规场景使用默认 `progressive`；CI 或严格强制场景设 `META_KIM_CAPABILITY_GATE=block`。`META_KIM_META_ENFORCEMENT_MODE=warn` 与 `META_KIM_CAPABILITY_GATE=warn` 仅用于灰度上线或调试；`off` 仅用于排障，不应长期启用。

## 六、跨 OS 兼容性

本任务在以下平台验证通过：

- Windows 10/11（Git Bash + native `node`）
- macOS（zsh + Homebrew node）
- Linux（Ubuntu 22.04 LTS + bash）

hook 脚本统一使用 ES module + Node 内置 API，未引入跨平台不一致依赖。`sync-runtimes.mjs` 在三平台上行为一致。

## 七、已知缺口

1. **OpenClaw 机械拦截缺口**：OpenClaw lifecycle hook 模型不暴露 PreToolUse 等价事件。在 OpenClaw 引入工具级 hook 之前，本端仍为声明性约束。
2. **Codex `apply_patch` 上游 issue #16732**：某些 Codex 版本下 `apply_patch` 不严格遵守 PreToolUse deny payload。已通过同时覆盖 `Edit|Write|MultiEdit|NotebookEdit` 多个 matcher 缓解，但 `apply_patch` 单独走通的情况仍可能存在。需要持续跟进 Codex 上游修复。
3. **Cursor v1.7 以下版本**：preToolUse deny 协议未公开。在这些版本上 Cursor 退化为 L2 alwaysApply 声明性约束。

## 八、若未来需要"四端完全一致机械拦截"

需要等以下外部条件成立：
1. **OpenClaw 引入** 工具级 PreToolUse hook（lifecycle 模型当前不支持）
2. **Codex 修复** `apply_patch` PreToolUse 严格遵守问题（issue #16732）

在那之前，本仓库的承诺为 "Claude / Codex / Cursor v1.7+ 三端机械拦截 + OpenClaw 声明性约束"，**禁止**在 README 或 CLAUDE.md 中宣称"四端完全等价"。

## 九、维护清单

修改本矩阵或任一运行时的治理强制力后：

1. 改 canonical 源（`canonical/runtime-assets/<runtime>/...`）
2. 运行 `npm run meta:sync`，确保投影到所有 runtime mirror
3. 运行 `npm run meta:validate`
4. 在 PR 描述中明示"是否改变强制力分层"
5. 如分层变化，本文件第三节图必须同步更新
6. 如新增 env 变量或运行时枚举，第五节表必须同步更新

## 十、参考

- `docs/runtime-capability-matrix.md` —— 全运行时能力对比（hook parity 行已说明事件名不同构）
- `docs/runtime-coverage-audit.md` —— Worker B 的全栈审计
- `canonical/runtime-assets/claude/hooks/enforce-agent-dispatch.mjs` —— capability-first gate、node-binding gate 与 meta-readonly gate 实施位置
- `scripts/runtime-hook-mapping.mjs:213-219` —— Codex PreToolUse 注册
- `scripts/runtime-hook-mapping.mjs:269-280` —— Cursor preToolUse 注册（`failClosed: true`）
- `canonical/runtime-assets/cursor/rules/meta-enforcement.mdc` —— Cursor 声明性备份
- `canonical/agents/meta-*.md` —— 9 个 meta agent 主源，frontmatter `executionBlock=true` 同步到四端
