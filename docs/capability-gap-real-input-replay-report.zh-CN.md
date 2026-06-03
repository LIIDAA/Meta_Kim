# Capability Gap Real Input Replay Report

## 一句话

本报告用 6 条更接近真实使用场景的输入，在独立 Node 子进程里回放 CapabilityGap 决策，验证系统是否自然走到 create_skill / create_agent / create_script / create_mcp_provider / worker_task_only / blocked_or_needs_approval。

## 结果

- 状态：pass
- 输入数：6
- 决策覆盖：create_skill, create_agent, create_script, create_mcp_provider, worker_task_only, blocked_or_needs_approval
- SQLite runs：6
- SQLite events：76
- create_agent station packets：pass

## 回放明细

| ID | 期望 | 实际 | 决策 | 输出 | 事件 | Station |
|---|---|---|---|---|---|---|
| REAL-01 | create_skill | create_skill | pass | pass | pass | not_required |
| REAL-02 | create_agent | create_agent | pass | pass | pass | pass |
| REAL-03 | create_script | create_script | pass | pass | pass | not_required |
| REAL-04 | create_mcp_provider | create_mcp_provider | pass | pass | pass | not_required |
| REAL-05 | worker_task_only | worker_task_only | pass | pass | pass | not_required |
| REAL-06 | blocked_or_needs_approval | blocked_or_needs_approval | pass | pass | pass | not_required |

## 每条输入的判断依据

### REAL-01：create_skill

- 输入：我经常要求同一套 PRD 判断流程：先锁真实目标，再查依据，再比较路线，最后复盘质量。现有 owner 能做单次评审，但这套 reusable flow 每次都要重讲。
- 人话目标：重复方法沉淀成 skill，不新建长期 agent。
- CapabilityGap：已有 provider 检查完成，但该任务需要 create_skill 路线。
- 为什么这么判：这是可重复的方法或流程，不需要新的长期责任 owner。
- 拒绝路线：create_agent（可复用流程不需要新的长期责任身份）；worker_task_only（已出现复用价值，不能只当单次任务）
- RunStateStore：runId=run-create-skill-prd-owner-reusable-flow-a851eda592，events=12

### REAL-02：create_agent

- 输入：我们反复缺少一个长期 test coverage strategy owner：它要看 coverage gap、判断缺 verifier、给 verification planning，而不是只跑一次测试。
- 人话目标：长期专业 owner 缺口，进入 create_agent。
- CapabilityGap：已有 provider 检查完成，但该任务需要 create_agent 路线。
- 为什么这么判：缺少稳定长期 owner，需要职责、拒绝项、输入输出和可验收身份。
- 拒绝路线：create_skill（缺的是长期 owner 边界，不只是方法包）；create_script（需要专业判断和责任边界，不是机械命令）；worker_task_only（重复出现且需要长期身份，不能只发本次工作单）
- RunStateStore：runId=run-create-agent-test-coverage-strategy--29950a7a4a，events=14

### REAL-03：create_script

- 输入：每次发布前都要把 run artifacts normalize 成同一种 JSON report，过程 mechanical、testable、没有外部授权需求。
- 人话目标：稳定机械动作，应该沉淀成 script。
- CapabilityGap：已有 provider 检查完成，但该任务需要 create_script 路线。
- 为什么这么判：这是稳定、机械、可测试的本地动作，用脚本比 agent 更清楚。
- 拒绝路线：create_agent（稳定机械动作不需要长期人格或 owner）；create_mcp_provider（没有稳定外部系统能力边界需求）
- RunStateStore：runId=run-create-script-run-artifacts-normaliz-29f03080ef，events=12

### REAL-04：create_mcp_provider

- 输入：我需要稳定查询 company internal knowledge base，并且明确 read/write 权限、credential boundary、审计事件和 provider 调用范围。
- 人话目标：稳定外部或内部系统能力，应该设计 MCP provider 候选。
- CapabilityGap：已有 provider 检查完成，但该任务需要 create_mcp_provider 路线。
- 为什么这么判：这是外部系统能力，需要权限、凭证、审计和调用边界。
- 拒绝路线：create_script（外部能力需要权限、凭证和审计边界）；worker_task_only（稳定外部系统能力不能靠一次性任务承载）
- RunStateStore：runId=run-create-mcp-provider-company-internal-f5d0e3fc70，events=12

### REAL-05：worker_task_only

- 输入：这次只把当前中文报告里一段话改得更口语化，已有文档编辑 owner 和工具足够，没有重复复用价值。
- 人话目标：一次性任务，只生成 workerTask，不进入长期能力。
- CapabilityGap：已有 provider 检查完成，但该任务需要 worker_task_only 路线。
- 为什么这么判：这是本次 run 内的一次性任务，已有 owner/loadout 足够。
- 拒绝路线：create_agent（本次任务没有长期 owner 价值）；create_skill（未出现可复用流程证据）
- RunStateStore：runId=run-worker-task-only-owner-4cf1330db1，events=13

### REAL-06：blocked_or_needs_approval

- 输入：请自动 publish 到第三方平台，同时修改 credentials 并创建 paid job；我还没有给明确授权。
- 人话目标：外部写动作和凭证/付费风险，必须阻塞或请求授权。
- CapabilityGap：已有 provider 检查完成，但该任务需要 blocked_or_needs_approval 路线。
- 为什么这么判：存在权限、证据或外部写动作风险，必须阻塞或请求授权。
- 拒绝路线：create_mcp_provider（不能创建 provider 绕过用户授权）；worker_task_only（外部写动作或高风险动作不能直接执行）
- RunStateStore：runId=run-blocked-or-needs-approval-publish-cr-908231b3b0，events=13

## 新进程证据

- `node scripts/capability-gap-mvp.mjs --fixture <temp-fixture> --db <state-sqlite> --json`
- `node scripts/run-governance-agent-process-mvp.mjs --json-out <temp-json> --markdown-out <temp-md> --db <temp-sqlite>`
