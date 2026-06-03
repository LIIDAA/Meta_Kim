# Agent Design Quality Eval Report

## 一句话

本评测用固定标准判断治理层能不能设计出抽象但专业的 agent：好 agent 必须可复用、边界清楚、能验收；泛泛 agent、把本次任务写进身份的 agent、复制依赖项目架构的 agent 都必须失败。

## 结果

- 总体：pass
- Fixture：4/4 个符合预期
- 泛泛 agent 误通过：0
- 任务绑定身份误通过：0
- 依赖架构复制误通过：0
- 缺 verifier 误通过：0
- 长期身份污染：0

## 判断标准

| 维度 | 意思 |
|---|---|
| identity_clarity | 身份清楚：不看实现细节也知道什么时候该叫它 |
| domain_specificity | 专业具体：能力里有领域名词，不是万能好人 |
| flow_fit | 流程位置清楚：知道它在上游、下游、交付链里的位置 |
| tool_least_privilege | 工具最小权限：只写抽象能力槽，不把命令和文件塞进身份 |
| memory_fit | 记忆边界清楚：能记什么、不能记什么都明确 |
| gap_honesty | 缺口诚实：不会硬接，缺能力时回到 GapDecision |
| handoff_readiness | 交接可审：输入、输出、上下游不用口头解释 |
| verification_readiness | 可验证：至少有一个 fixture 或 replay 能让坏设计失败 |
| install_projection_readiness | 投影状态清楚：每个 runtime 是 eligible、needs_probe 或 reference_only |
| identity_cleanliness | 身份干净：长期身份里没有本次任务、路径、票据、验收步骤 |
| dependency_content_boundary | 依赖边界清楚：只吸收内容能力，不搬别人的架构 |

## 依赖项目边界

- 可以参考：内容、能力行为、专业标准、任务产物形态、判断模式。
- 不可以参考：Meta_Kim 架构、长期身份结构、runtime graph 形状、数据库 schema、owner 层级。
- 说人话：看别人怎么把专业能力写清楚，不能把别人的系统骨架搬进 Meta_Kim。

## Fixtures

| Fixture | 期望 | 实际 | 失败维度 |
|---|---|---|---|
| ADQ-01 professional-test-coverage-owner | pass | pass | none |
| ADQ-02 generic-excellence-agent | fail | fail | domain_specificity, tool_least_privilege, verification_readiness |
| ADQ-03 task-bound-agent | fail | fail | tool_least_privilege, memory_fit, gap_honesty, identity_cleanliness |
| ADQ-04 dependency-architecture-copy | fail | fail | dependency_content_boundary |

## AI 可识别验收

| 指标 | 期望 | 实际 | 结果 |
|---|---|---|---|
| fixture_pass_100 | 4 | 4 | pass |
| generic_agent_pass_count | 0 | 0 | pass |
| task_bound_identity_pass_count | 0 | 0 | pass |
| dependency_architecture_copy_pass_count | 0 | 0 | pass |
| missing_handoff_count | 0 | 0 | pass |
| missing_verifier_count | 0 | 0 | pass |
| long_term_identity_pollution_count | 0 | 0 | pass |

## 下一步

下一步不是先造 agent，而是把真实治理 agent 产出的 agent spec 丢进这套评测：先评 meta-genesis + meta-artisan + meta-prism 是否能稳定产出通过样例，再决定是否升级它们的提示、边界或 fixture。
