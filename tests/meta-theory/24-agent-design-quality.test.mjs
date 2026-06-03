import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readJson } from "./_helpers.mjs";
import { evaluateSpec, runEvaluation } from "../../scripts/evaluate-agent-design-quality.mjs";

const REQUIRED_DIMENSIONS = [
  "identity_clarity",
  "domain_specificity",
  "flow_fit",
  "tool_least_privilege",
  "memory_fit",
  "gap_honesty",
  "handoff_readiness",
  "verification_readiness",
  "install_projection_readiness",
  "identity_cleanliness",
  "dependency_content_boundary",
];

describe("24 — Agent design quality evaluation", async () => {
  const contract = await readJson("config/contracts/agent-design-quality-contract.json");
  const fixtures = await readJson(
    "tests/meta-theory/scenarios/agent-design-quality-fixtures.json"
  );

  test("contract separates dependency content evidence from architecture adoption", () => {
    assert.equal(contract.contractId, "agent-design-quality-contract");
    assert.ok(
      contract.sourceBoundary.dependencyProjectsMayInform.includes("content"),
      "dependency content can inform standards"
    );
    assert.ok(
      contract.sourceBoundary.dependencyProjectsMustNotInform.includes(
        "meta_kim_architecture"
      ),
      "dependency architecture must not become Meta_Kim architecture"
    );
    assert.ok(
      contract.sourceBoundary.architectureDecisionSource.includes(
        "skill agent script MCP provider separation"
      ),
      "Meta_Kim architecture source must stay internal"
    );
  });

  test("contract covers professional, boundary, verification, and dependency dimensions", () => {
    assert.deepEqual(
      contract.scorecardDimensions.map((dimension) => dimension.id),
      REQUIRED_DIMENSIONS
    );
    for (const hardBlock of [
      "identity_cleanliness",
      "gap_honesty",
      "tool_least_privilege",
      "memory_fit",
      "dependency_content_boundary",
    ]) {
      assert.ok(
        contract.hardBlockDimensions.includes(hardBlock),
        `${hardBlock} must be a hard block`
      );
    }
  });

  test("fixtures include good agent, generic agent, task-bound identity, and dependency architecture copy", () => {
    assert.deepEqual(
      fixtures.map((fixture) => fixture.id),
      ["ADQ-01", "ADQ-02", "ADQ-03", "ADQ-04"]
    );
    assert.deepEqual(
      fixtures.map((fixture) => fixture.expectedStatus),
      ["pass", "fail", "fail", "fail"]
    );
  });

  test("professional fixture passes every dimension", () => {
    const fixture = fixtures.find((item) => item.id === "ADQ-01");
    const result = evaluateSpec(fixture.spec, contract);
    assert.equal(result.status, "pass");
    assert.deepEqual(result.failedDimensions, []);
  });

  test("bad fixtures fail for the intended reasons", () => {
    for (const fixture of fixtures.filter((item) => item.expectedStatus === "fail")) {
      const result = evaluateSpec(fixture.spec, contract);
      assert.equal(result.status, "fail", `${fixture.id} must fail`);
      for (const expectedDimension of fixture.expectedFailDimensions) {
        assert.ok(
          result.failedDimensions.includes(expectedDimension),
          `${fixture.id} must fail ${expectedDimension}`
        );
      }
    }
  });

  test("full evaluation meets quantitative acceptance", async () => {
    const report = await runEvaluation();
    assert.equal(report.acceptance.status, "pass");
    assert.equal(report.summary.expectedMatchedCount, report.summary.totalFixtures);
    assert.equal(report.summary.genericAgentPassCount, 0);
    assert.equal(report.summary.taskBoundIdentityPassCount, 0);
    assert.equal(report.summary.dependencyArchitectureCopyPassCount, 0);
    assert.equal(report.summary.longTermIdentityPollutionCount, 0);
  });
});
