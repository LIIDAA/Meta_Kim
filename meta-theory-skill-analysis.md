# meta-theory Skill 渐进式精简方案

## 当前状态

- **总行数**: 972 行（远超推荐的 500 行）
- **冗余强调**: 32 次 FORBIDDEN/mandatory/MUST
- **重复模式**: 27 次 meta-* agent 名称重复

## 冗余分析

### 1. 结构性重复

| 位置 | 重复内容 | token 浪费 |
|------|----------|-----------|
| 第 20-37 行 | DISPATCH IS MANDATORY + 6 条规则解释 | ~800 |
| 第 440-469 行 | Dispatch Rules + DISPATCH SELF-CHECK（重复） | ~600 |
| 第 470-537 行 | User Interaction Policy（可独立） | ~1200 |
| 第 38-137 行 | Codex Runtime Adapter + Choice Gate（可独立） | ~1500 |
| 第 924-962 行 | Data Structure Contract（可独立） | ~600 |

**总计可移动内容**: ~4700 tokens

### 2. 语言冗余

**冗余表达示例**:
```
❌ "You are the dispatcher. The main thread does scope, delegation, review, and synthesis ONLY."
✅ "Main thread = dispatcher (scope/delegate/review/synthesize). No direct execution."
```

```
❌ "If you are about to produce >3 sentences of execution-layer analysis, review, or code yourself, STOP — that is a dispatcher violation; spawn the right agent instead."
✅ ">3 sentences execution work? → Dispatch. No self-execution."
```

## 渐进式精简计划

### Phase 1: 合并重复（保留核心逻辑）

**动作**: 合并以下重复章节

| 原章节 | 合并到 | 节省 |
|--------|--------|------|
| Dispatch Rules + DISPATCH SELF-CHECK | 统一 "Dispatch Triggers" | ~200 行 |
| 多个 FORBIDDEN 列表 | 单一 FORBIDDEN 章节 | ~100 行 |

**结果**: 972 行 → 670 行

### Phase 2: 移动可独立内容到 references/

**动作**: 创建以下 reference 文件

| 原 SKILL.md 内容 | 移动到 | 引用方式 |
|-----------------|---------|----------|
| Codex Runtime Adapter (完整) | `references/codex-adapter.md` | "See `references/codex-adapter.md` for Codex specifics" |
| User Interaction Policy | `references/user-interaction.md` | "See `references/user-interaction.md` for Decision/Notice rules" |
| Choice Surface Gate 表格 | `references/choice-gate.md` | "See `references/choice-gate.md` for state machine" |
| Data Structure Contract | `references/data-contracts.md` | "See `references/data-contracts.md` for schemas" |

**结果**: 670 行 → 350 行

### Phase 3: 语言压缩（保留语义）

**动作**: 用紧凑语法重写

**压缩模式**:
- 用符号代替文字: `→` 替代 "leads to", `✓` 替代 "completed"
- 表格代替段落: Gate 规则、Stage 定义
- 删除过度解释: "这是..." "为了..." 等说明性文字
- 合并相似项: 多个 meta-* 列表 → `meta-* agents (warden/conductor/prism/etc.)`

**结果**: 350 行 → 250 行

## 精简后的结构预览

```markdown
---
name: meta-theory
description: 8-stage governance spine for complex work. Use when task involves >1 file, >20 lines code, or multi-agent coordination.
---

## Core Rule

**Main thread = dispatcher.** No direct execution. All work via dispatched agents.

## Dispatch Triggers

| Condition | Action |
|-----------|--------|
| Read >3 files | Dispatch |
| Modify any file | Dispatch |
| >20 lines code | Dispatch |
| >1 module | Dispatch |

## 8-Stage Spine

| Stage | Required Agent | Output |
|-------|---------------|--------|
| Critical | meta-warden | taskClassification |
| Fetch | (none) | fetchRecord, contentEvidencePacket |
| Thinking | meta-conductor | preDecisionOptionFrame, workerTaskPackets |
| Execution | (any) | Work products |
| Review | meta-prism | reviewPacket |
| Meta-Review | meta-warden | metaReviewPacket |
| Verification | meta-warden | verificationResults |
| Evolution | (none) | evolutionWritebackPacket |

## Dispatch Format

```
Agent(
  subagent_type: "<ownerAgent from Thinking>",
  description: "3-5 word summary",
  prompt: "Complete with ALL context"
)
```

## Runtime Notes

- **Codex**: See `references/codex-adapter.md` for spawn_agent mapping
- **User Interaction**: See `references/user-interaction.md` for Decision/Notice rules
- **Data Contracts**: See `references/data-contracts.md` for packet schemas
```

## Token 对比

| 版本 | 行数 | 估计 tokens |
|------|------|-----------|
| 当前 | 972 | ~24,000 |
| Phase 1 | 670 | ~16,000 |
| Phase 2 | 350 | ~8,500 |
| Phase 3 | 250 | ~6,000 |

**节省**: ~18,000 tokens (75%)

## 下一步

选择执行方案：
- **A. 仅 Phase 1**：合并重复，快速见效，风险低
- **B. Phase 1 + 2**：合并+移动，中等风险，需要创建 reference 文件
- **C. 全部 Phase**：彻底重构，需要全面测试

推荐 **B. 先执行 Phase 1 + 2**，保留核心规则在 SKILL.md，细节移到 references/。
