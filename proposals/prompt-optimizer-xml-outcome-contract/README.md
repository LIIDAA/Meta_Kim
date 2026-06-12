# Proposal: XML + Outcome-Contract Prompt Optimizer

## 背景 / Background

现有提示词优化方法论多基于 CTF 公式 / 多任务流程，面向较弱模型，强调把指令写长、写满、写死。在现代强模型（Claude / GPT / Gemini 新版）下，这种风格反而引入噪声、降低可控性。

Existing prompt-optimizer methodologies (CTF formula, multi-task flows) were designed for weaker models and tend to over-specify. On modern strong models this adds noise and reduces controllability.

## 提议 / Proposal

将 prompt-optimizer 的范式升级为：

1. **Outcome-contract（结果契约）** — 描述要什么结果、什么验收标准，而非规定模型怎么思考。
2. **Official-XML 标签** — 用 `<role>` / `<goal>` / `<constraints>` 等结构化标签组织提示词，比 Markdown 散文更易被现代模型解析（参考主流厂商对 XML 结构化输入的推荐）。
3. **两段式触发门控** — 确定性 gate 先判断是否需要优化，避免每条消息都注入。
4. **角色优先 + 模糊输入处理** — role-first；把"这个不行 / 报错了"这类口语反馈转成诊断任务，而不是退回追问。

完整方法论见同目录 [`prompt-optimizer-meta.md`](./prompt-optimizer-meta.md)。

## 说明 / Note

本提案的方法论文件是**通用版**，可直接作为 prompt-optimizer 的元提示词，零外部依赖、无个人业务上下文。

> 📌 此改进同样（甚至更）适用于作者的 [HookPrompt](https://github.com/KimYx0207/HookPrompt) 项目 —— 该 repo 是 prompt-optimizer 的专门实现。作者可自行决定合入 Meta_Kim、HookPrompt 或两者。
>
> This improvement applies equally (or better) to the author's [HookPrompt](https://github.com/KimYx0207/HookPrompt) project, which is the dedicated prompt-optimizer implementation. The author can decide where to merge.

## 来源 / Origin

源自一个基于 HookPrompt 改造的生产实践版本，已**去除全部个人业务上下文与人设**，仅保留通用方法论。

Derived from a production-tested fork of HookPrompt, with all personal business context and persona removed — only the general methodology is kept.
