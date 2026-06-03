#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

const CONTRACT_PATH = path.join(
  REPO_ROOT,
  "config",
  "contracts",
  "agent-design-quality-contract.json"
);
const FIXTURE_PATH = path.join(
  REPO_ROOT,
  "tests",
  "meta-theory",
  "scenarios",
  "agent-design-quality-fixtures.json"
);
const JSON_REPORT_PATH = path.join(
  REPO_ROOT,
  ".meta-kim",
  "state",
  "default",
  "agent-design-quality-report.json"
);
const MARKDOWN_REPORT_PATH = path.join(
  REPO_ROOT,
  "docs",
  "agent-design-quality-eval-report.zh-CN.md"
);

const GENERIC_TERMS = [
  "analysis",
  "quality improvement",
  "collaboration",
  "problem solving",
  "excellent",
  "intelligent",
  "any task",
  "better result",
  "anyone",
];

const CONCRETE_IDENTITY_PATTERNS = [
  /\btodayTask\b/i,
  /\bscopeFiles\b/i,
  /\bdeliverableLink\b/i,
  /\bverifySteps\b/i,
  /\brepoPath\b/i,
  /\bfileList\b/i,
  /\bticket\b/i,
  /\bnpm\s+run\b/i,
  /\bgit\s+commit\b/i,
  /\bdocs\/[^\s"]+/i,
  /\b[A-Z]:\//i,
  /\.[cm]?js\b/i,
  /\.[a-z]{2}-[A-Z]{2}\.md\b/i,
];

const ARCHITECTURE_COPY_PATTERNS = [
  /architecture/i,
  /schema/i,
  /graph/i,
  /database/i,
  /provider packaging/i,
  /skill catalog/i,
  /workflow architecture/i,
  /agent hierarchy/i,
];

const ALLOWED_MEMORY_SCOPES = new Set([
  "none",
  "run_scoped",
  "project_scoped",
  "cross_project_readonly",
]);

const ALLOWED_PROJECTION_STATES = new Set([
  "eligible",
  "needs_probe",
  "reference_only",
]);

const DIMENSION_LABELS = {
  identity_clarity: "身份清楚：不看实现细节也知道什么时候该叫它",
  domain_specificity: "专业具体：能力里有领域名词，不是万能好人",
  flow_fit: "流程位置清楚：知道它在上游、下游、交付链里的位置",
  tool_least_privilege: "工具最小权限：只写抽象能力槽，不把命令和文件塞进身份",
  memory_fit: "记忆边界清楚：能记什么、不能记什么都明确",
  gap_honesty: "缺口诚实：不会硬接，缺能力时回到 GapDecision",
  handoff_readiness: "交接可审：输入、输出、上下游不用口头解释",
  verification_readiness: "可验证：至少有一个 fixture 或 replay 能让坏设计失败",
  install_projection_readiness: "投影状态清楚：每个 runtime 是 eligible、needs_probe 或 reference_only",
  identity_cleanliness: "身份干净：长期身份里没有本次任务、路径、票据、验收步骤",
  dependency_content_boundary: "依赖边界清楚：只吸收内容能力，不搬别人的架构",
};

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function joinForScan(value) {
  return JSON.stringify(value ?? "", null, 0);
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

function includesAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function hasConcreteIdentityLeak(spec) {
  const durableIdentitySurface = {
    name: spec.name,
    description: spec.description,
    purpose: spec.purpose,
    capabilities: spec.capabilities,
    loadoutSlots: spec.loadoutSlots,
    inputs: spec.inputs,
    outputs: spec.outputs,
    handoff: spec.handoff,
    memoryAllowed: spec.memoryPolicy?.allowed,
    gapPolicy: spec.gapPolicy,
    verificationFixtures: spec.verificationPolicy?.fixtures,
  };
  return includesAny(joinForScan(durableIdentitySurface), CONCRETE_IDENTITY_PATTERNS);
}

function countGenericCapabilityTerms(spec) {
  const text = [
    spec.name,
    spec.description,
    spec.purpose,
    ...asArray(spec.capabilities),
    ...asArray(spec.inputs),
    ...asArray(spec.outputs),
  ]
    .join(" ")
    .toLowerCase();
  return GENERIC_TERMS.filter((term) => text.includes(term)).length;
}

function dimensionChecks(spec, contract) {
  const capabilities = asArray(spec.capabilities);
  const nonCapabilities = asArray(spec.nonCapabilities);
  const loadoutSlots = asArray(spec.loadoutSlots);
  const inputs = asArray(spec.inputs);
  const outputs = asArray(spec.outputs);
  const gapPolicy = asArray(spec.gapPolicy);
  const fixtures = asArray(spec.verificationPolicy?.fixtures);
  const installProjection = spec.installProjection ?? {};
  const referenceAbsorption = spec.referenceAbsorption ?? {};

  const loadoutText = joinForScan(loadoutSlots);
  const memoryAllowedText = joinForScan(spec.memoryPolicy?.allowed);
  const dependencyUseText = joinForScan(referenceAbsorption.usedFor);

  const checks = {
    identity_clarity:
      typeof spec.name === "string" &&
      /^[a-z][a-z0-9-]+$/.test(spec.name) &&
      typeof spec.description === "string" &&
      spec.description.length >= 30,
    domain_specificity:
      capabilities.length >= 4 &&
      countGenericCapabilityTerms(spec) <= 3 &&
      !/any task/i.test(`${spec.purpose} ${spec.description}`),
    flow_fit:
      typeof spec.flowPosition === "string" &&
      spec.flowPosition.length > 0 &&
      typeof spec.handoff?.upstream === "string" &&
      typeof spec.handoff?.downstream === "string",
    tool_least_privilege:
      loadoutSlots.length >= 2 &&
      loadoutSlots.length <= 8 &&
      !includesAny(loadoutText, CONCRETE_IDENTITY_PATTERNS),
    memory_fit:
      ALLOWED_MEMORY_SCOPES.has(spec.memoryPolicy?.scope) &&
      asArray(spec.memoryPolicy?.forbidden).length > 0 &&
      !asArray(spec.memoryPolicy?.forbidden).some((item) => /^none$/i.test(String(item))) &&
      !includesAny(memoryAllowedText, CONCRETE_IDENTITY_PATTERNS),
    gap_honesty:
      gapPolicy.length >= 1 &&
      nonCapabilities.length >= 1 &&
      !gapPolicy.some((entry) => /fallback owner|万能|hard.?do/i.test(String(entry))),
    handoff_readiness:
      inputs.length >= 1 &&
      outputs.length >= 1 &&
      typeof spec.handoff?.upstream === "string" &&
      spec.handoff.upstream.length > 0 &&
      typeof spec.handoff?.downstream === "string" &&
      spec.handoff.downstream.length > 0,
    verification_readiness:
      typeof spec.verificationPolicy?.owner === "string" &&
      spec.verificationPolicy.owner.length > 0 &&
      fixtures.length >= 1,
    install_projection_readiness:
      Object.keys(installProjection).length >= 2 &&
      Object.values(installProjection).every((state) =>
        ALLOWED_PROJECTION_STATES.has(state)
      ),
    identity_cleanliness:
      spec.identityCleanliness?.status === "pass" && !hasConcreteIdentityLeak(spec),
    dependency_content_boundary:
      referenceAbsorption.contentEvidenceOnly === true &&
      referenceAbsorption.architectureCopied === false &&
      !includesAny(dependencyUseText, ARCHITECTURE_COPY_PATTERNS) &&
      asArray(referenceAbsorption.sourceIds).every((sourceId) =>
        contract.dependencyContentEvidence?.some((source) => source.sourceId === sourceId)
      ),
  };

  return Object.fromEntries(
    contract.scorecardDimensions.map((dimension) => [
      dimension.id,
      {
        status: checks[dimension.id] ? "pass" : "fail",
        passCondition: dimension.passCondition,
      },
    ])
  );
}

export function evaluateSpec(spec, contract) {
  const missingRequiredFields = contract.requiredSpecFields.filter(
    (field) => !Object.hasOwn(spec, field)
  );
  const dimensions = dimensionChecks(spec, contract);
  const failedDimensions = Object.entries(dimensions)
    .filter(([, result]) => result.status !== "pass")
    .map(([dimension]) => dimension);
  const hardBlocks = failedDimensions.filter((dimension) =>
    contract.hardBlockDimensions.includes(dimension)
  );

  return {
    status:
      missingRequiredFields.length === 0 && failedDimensions.length === 0
        ? "pass"
        : "fail",
    missingRequiredFields,
    failedDimensions,
    hardBlocks,
    dimensions,
  };
}

function summarize(results) {
  return {
    totalFixtures: results.length,
    passCount: results.filter((result) => result.status === "pass").length,
    failCount: results.filter((result) => result.status === "fail").length,
    expectedMatchedCount: results.filter(
      (result) => result.status === result.expectedStatus
    ).length,
    genericAgentPassCount: results.filter(
      (result) => /generic/i.test(result.name) && result.status === "pass"
    ).length,
    taskBoundIdentityPassCount: results.filter(
      (result) => /task-bound/i.test(result.name) && result.status === "pass"
    ).length,
    dependencyArchitectureCopyPassCount: results.filter(
      (result) => /architecture-copy/i.test(result.name) && result.status === "pass"
    ).length,
    missingVerifierCount: results.filter((result) =>
      result.status === "pass" && result.failedDimensions.includes("verification_readiness")
    ).length,
    missingHandoffCount: results.filter((result) =>
      result.status === "pass" && result.failedDimensions.includes("handoff_readiness")
    ).length,
    longTermIdentityPollutionCount: results.filter((result) =>
      result.status === "pass" && result.failedDimensions.includes("identity_cleanliness")
    ).length,
  };
}

function acceptanceFromSummary(summary, contract) {
  const expected = contract.quantitativeAcceptance;
  const checks = [
    {
      id: "fixture_pass_100",
      expected: summary.totalFixtures,
      actual: summary.expectedMatchedCount,
      passed: summary.expectedMatchedCount === summary.totalFixtures,
    },
    {
      id: "generic_agent_pass_count",
      expected: expected.genericAgentPassCount,
      actual: summary.genericAgentPassCount,
      passed: summary.genericAgentPassCount === expected.genericAgentPassCount,
    },
    {
      id: "task_bound_identity_pass_count",
      expected: expected.taskBoundIdentityPassCount,
      actual: summary.taskBoundIdentityPassCount,
      passed:
        summary.taskBoundIdentityPassCount === expected.taskBoundIdentityPassCount,
    },
    {
      id: "dependency_architecture_copy_pass_count",
      expected: expected.dependencyArchitectureCopyPassCount,
      actual: summary.dependencyArchitectureCopyPassCount,
      passed:
        summary.dependencyArchitectureCopyPassCount ===
        expected.dependencyArchitectureCopyPassCount,
    },
    {
      id: "missing_handoff_count",
      expected: expected.missingHandoffCount,
      actual: summary.missingHandoffCount,
      passed: summary.missingHandoffCount === expected.missingHandoffCount,
    },
    {
      id: "missing_verifier_count",
      expected: expected.missingVerifierCount,
      actual: summary.missingVerifierCount,
      passed: summary.missingVerifierCount === expected.missingVerifierCount,
    },
    {
      id: "long_term_identity_pollution_count",
      expected: expected.longTermIdentityPollutionCount,
      actual: summary.longTermIdentityPollutionCount,
      passed:
        summary.longTermIdentityPollutionCount ===
        expected.longTermIdentityPollutionCount,
    },
  ];

  return {
    status: checks.every((check) => check.passed) ? "pass" : "fail",
    checks,
  };
}

function escapeCell(value) {
  return String(value ?? "")
    .replace(/\r?\n/g, " ")
    .replace(/\|/g, "\\|");
}

function markdownReport(report) {
  const lines = [
    "# Agent Design Quality Eval Report",
    "",
    "## 一句话",
    "",
    "本评测用固定标准判断治理层能不能设计出抽象但专业的 agent：好 agent 必须可复用、边界清楚、能验收；泛泛 agent、把本次任务写进身份的 agent、复制依赖项目架构的 agent 都必须失败。",
    "",
    "## 结果",
    "",
    `- 总体：${report.acceptance.status}`,
    `- Fixture：${report.summary.expectedMatchedCount}/${report.summary.totalFixtures} 个符合预期`,
    `- 泛泛 agent 误通过：${report.summary.genericAgentPassCount}`,
    `- 任务绑定身份误通过：${report.summary.taskBoundIdentityPassCount}`,
    `- 依赖架构复制误通过：${report.summary.dependencyArchitectureCopyPassCount}`,
    `- 缺 verifier 误通过：${report.summary.missingVerifierCount}`,
    `- 长期身份污染：${report.summary.longTermIdentityPollutionCount}`,
    "",
    "## 判断标准",
    "",
    "| 维度 | 意思 |",
    "|---|---|",
    ...report.contract.scorecardDimensions.map(
      (dimension) =>
        `| ${dimension.id} | ${escapeCell(DIMENSION_LABELS[dimension.id] ?? dimension.passCondition)} |`
    ),
    "",
    "## 依赖项目边界",
    "",
    "- 可以参考：内容、能力行为、专业标准、任务产物形态、判断模式。",
    "- 不可以参考：Meta_Kim 架构、长期身份结构、runtime graph 形状、数据库 schema、owner 层级。",
    "- 说人话：看别人怎么把专业能力写清楚，不能把别人的系统骨架搬进 Meta_Kim。",
    "",
    "## Fixtures",
    "",
    "| Fixture | 期望 | 实际 | 失败维度 |",
    "|---|---|---|---|",
    ...report.results.map(
      (result) =>
        `| ${result.id} ${escapeCell(result.name)} | ${result.expectedStatus} | ${result.status} | ${escapeCell(result.failedDimensions.join(", ") || "none")} |`
    ),
    "",
    "## AI 可识别验收",
    "",
    "| 指标 | 期望 | 实际 | 结果 |",
    "|---|---|---|---|",
    ...report.acceptance.checks.map(
      (check) =>
        `| ${check.id} | ${check.expected} | ${check.actual} | ${check.passed ? "pass" : "fail"} |`
    ),
    "",
    "## 下一步",
    "",
    "下一步不是先造 agent，而是把真实治理 agent 产出的 agent spec 丢进这套评测：先评 meta-genesis + meta-artisan + meta-prism 是否能稳定产出通过样例，再决定是否升级它们的提示、边界或 fixture。",
    "",
  ];
  return `${lines.join("\n")}`;
}

export async function runEvaluation({
  contractPath = CONTRACT_PATH,
  fixturePath = FIXTURE_PATH,
} = {}) {
  const contract = await readJson(contractPath);
  const fixtures = await readJson(fixturePath);
  const results = fixtures.map((fixture) => {
    const evaluation = evaluateSpec(fixture.spec, contract);
    return {
      id: fixture.id,
      name: fixture.name,
      expectedStatus: fixture.expectedStatus,
      expectedFailDimensions: fixture.expectedFailDimensions ?? [],
      ...evaluation,
    };
  });
  const summary = summarize(results);
  const acceptance = acceptanceFromSummary(summary, contract);
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    contractId: contract.contractId,
    contract,
    summary,
    acceptance,
    results,
  };
}

async function main() {
  const report = await runEvaluation();
  await fs.mkdir(path.dirname(JSON_REPORT_PATH), { recursive: true });
  await fs.writeFile(JSON_REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
  await fs.writeFile(MARKDOWN_REPORT_PATH, markdownReport(report));

  process.stdout.write(`${JSON.stringify({
    status: report.acceptance.status,
    summary: report.summary,
    report: path.relative(REPO_ROOT, MARKDOWN_REPORT_PATH).replaceAll("\\", "/"),
  }, null, 2)}\n`);

  if (report.acceptance.status !== "pass") {
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error.stack || error.message}\n`);
    process.exit(1);
  });
}
