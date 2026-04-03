import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  readJson,
  readFile,
  SCAR_TYPES,
  SCAR_IMPACT_LEVELS,
  EIGHT_STAGES,
} from "./_helpers.mjs";

describe("workflow-contract.json — schema compliance", async () => {
  const contract = await readJson("contracts/workflow-contract.json");

  test("schemaVersion exists", () => {
    assert.notEqual(contract.schemaVersion, undefined);
    assert.ok(contract.schemaVersion >= 2, "schemaVersion should be >= 2 after governance hardening");
  });

  test('owner is "Meta_Kim"', () => {
    assert.equal(contract.owner, "Meta_Kim");
  });

  test('businessWorkflow has id "business"', () => {
    assert.equal(contract.businessWorkflow?.id, "business");
  });

  test("canonicalExecutionSpineStages has all 8 stages", () => {
    const stages = contract.businessWorkflow?.canonicalExecutionSpineStages;
    assert.ok(Array.isArray(stages), "canonicalExecutionSpineStages should be an array");
    const expected = [
      "critical",
      "fetch",
      "thinking",
      "execution",
      "review",
      "meta_review",
      "verification",
      "evolution",
    ];
    for (const stage of expected) {
      assert.ok(stages.includes(stage), `missing stage: ${stage}`);
    }
    assert.equal(stages.length, 8);
  });

  test("businessWorkflow.phases has 10 entries", () => {
    const phases = contract.businessWorkflow?.phases;
    assert.ok(Array.isArray(phases), "phases should be an array");
    assert.equal(phases.length, 10);
  });

  test("all 10 phase names present", () => {
    const phases = contract.businessWorkflow?.phases;
    const expected = [
      "direction",
      "planning",
      "execution",
      "review",
      "meta_review",
      "revision",
      "verify",
      "summary",
      "feedback",
      "evolve",
    ];
    for (const name of expected) {
      assert.ok(phases.includes(name), `missing phase: ${name}`);
    }
  });

  test('gates.planning.owner includes "meta-conductor"', () => {
    const owner = contract.gates?.planning?.owner;
    assert.ok(
      typeof owner === "string" && owner.includes("meta-conductor"),
      `planning gate owner should include "meta-conductor", got: ${owner}`
    );
  });

  test('gates.metaReview.owners includes both "meta-warden" and "meta-prism"', () => {
    const owners = contract.gates?.metaReview?.owners;
    assert.ok(Array.isArray(owners), "metaReview owners should be an array");
    assert.ok(owners.includes("meta-warden"), 'missing "meta-warden"');
    assert.ok(owners.includes("meta-prism"), 'missing "meta-prism"');
  });

  test('gates.verify.owners includes both "meta-warden" and "meta-prism"', () => {
    const owners = contract.gates?.verify?.owners;
    assert.ok(Array.isArray(owners), "verify owners should be an array");
    assert.ok(owners.includes("meta-warden"), 'missing "meta-warden"');
    assert.ok(owners.includes("meta-prism"), 'missing "meta-prism"');
  });

  test("runDiscipline.singleDepartmentPerRun is true", () => {
    assert.equal(contract.runDiscipline?.singleDepartmentPerRun, true);
  });

  test("runDiscipline.singlePrimaryDeliverable is true", () => {
    assert.equal(contract.runDiscipline?.singlePrimaryDeliverable, true);
  });

  test("runDiscipline.rejectMultiTopicRuns is true", () => {
    assert.equal(contract.runDiscipline?.rejectMultiTopicRuns, true);
  });

  test("runDiscipline.requireClosedDeliverableChain is true", () => {
    assert.equal(contract.runDiscipline?.requireClosedDeliverableChain, true);
  });

  test("runDiscipline.executionOwnership.anonymousExecutionForbidden is true", () => {
    assert.equal(
      contract.runDiscipline?.executionOwnership?.anonymousExecutionForbidden,
      true
    );
  });

  test("protocols has runHeader key", () => {
    assert.ok(
      contract.protocols?.runHeader !== undefined,
      "protocols should have runHeader"
    );
  });

  test("protocols has workerTaskPacket key", () => {
    assert.ok(
      contract.protocols?.workerTaskPacket !== undefined,
      "protocols should have workerTaskPacket"
    );
  });

  test("protocols has all 8 packet types", () => {
    const expected = [
      "runHeader",
      "taskClassification",
      "dispatchBoard",
      "workerTaskPacket",
      "workerResultPacket",
      "reviewPacket",
      "verificationPacket",
      "evolutionWritebackPacket",
    ];
    const keys = Object.keys(contract.protocols ?? {});
    for (const packet of expected) {
      assert.ok(keys.includes(packet), `missing protocol packet: ${packet}`);
    }
    assert.equal(expected.length, 8);
  });

  test("publicDisplayRequires has all 5 conditions", () => {
    const conditions = contract.runDiscipline?.publicDisplayRequires;
    assert.ok(Array.isArray(conditions), "publicDisplayRequires should be an array");
    const expected = [
      "verifyPassed",
      "summaryClosed",
      "singleDeliverableMaintained",
      "deliverableChainClosed",
      "consolidatedDeliverablePresent",
    ];
    for (const cond of expected) {
      assert.ok(conditions.includes(cond), `missing condition: ${cond}`);
    }
  });

  test("public display gate is a hard release gate", () => {
    const gate = contract.gates?.publicDisplay ?? {};
    assert.equal(gate.owner, "meta-warden");
    assert.equal(gate.hardReleaseGate, true);
    assert.equal(gate.blockFinalDraftWithoutVerifiedRun, true);
    assert.equal(gate.blockExternalDisplayWithoutSummaryClosure, true);
    assert.equal(gate.blockCompletionWithoutClosedDeliverableChain, true);
    assert.deepEqual(
      [...(gate.requiredConditions ?? [])].sort(),
      [...(contract.runDiscipline?.publicDisplayRequires ?? [])].sort()
    );
  });

  test("task classification hardening exists", () => {
    const classification = contract.runDiscipline?.taskClassification ?? {};
    assert.equal(classification.classifierVersion, "v2");
    assert.deepEqual(classification.taskClassEnum, ["Q", "A", "P", "S"]);
    assert.deepEqual(classification.requestClassEnum, ["query", "execute", "plan", "strategy"]);
    assert.ok(classification.governanceFlowEnum.includes("simple_exec"));
    assert.ok(classification.governanceFlowEnum.includes("complex_dev"));
    assert.ok(classification.governanceFlowEnum.includes("proposal_review"));
    assert.ok(classification.triggerReasonEnum.includes("multi_file"));
    assert.ok(classification.triggerReasonEnum.includes("owner_missing"));
    assert.ok(classification.upgradeReasonEnum.includes("owner_creation_required"));
    assert.ok(classification.bypassReasonEnum.includes("pure_query"));
    assert.equal(classification.ownerRequiredByDefault, true);
    assert.equal(classification.onlyQueryMayBypassOwner, true);
  });

  test("protocolFirst requires taskClassification packet", () => {
    const requiredPackets = contract.runDiscipline?.protocolFirst?.requiredPackets ?? [];
    assert.ok(requiredPackets.includes("taskClassification"));
  });

  test("finding closure rules are explicit", () => {
    const closure = contract.runDiscipline?.findingClosure ?? {};
    assert.equal(closure.findingIdRequired, true);
    assert.equal(closure.reviewFindingRequiresRevisionResponse, true);
    assert.equal(closure.revisionResponseRequiresFixArtifact, true);
    assert.equal(closure.verificationRequiresFreshEvidence, true);
    assert.equal(closure.closureRequiresVerificationResult, true);
    for (const state of ["open", "fixed_pending_verify", "verified_closed", "accepted_risk"]) {
      assert.ok(closure.closeStateEnum?.includes(state), `missing close state: ${state}`);
    }
  });

  test("review / revision / verification protocols have finding-level fields", () => {
    const reviewPacketFields = contract.protocols?.reviewPacket?.requiredFields ?? [];
    assert.ok(reviewPacketFields.includes("findings"));

    const reviewFindingFields = contract.protocols?.reviewFinding?.requiredFields ?? [];
    for (const field of ["findingId", "severity", "owner", "summary", "requiredAction", "fixArtifact", "verifiedBy", "closeState"]) {
      assert.ok(reviewFindingFields.includes(field), `reviewFinding missing ${field}`);
    }

    const revisionFields = contract.protocols?.revisionResponse?.requiredFields ?? [];
    for (const field of ["findingId", "actionId", "owner", "responseType", "status", "fixArtifact", "responseSummary"]) {
      assert.ok(revisionFields.includes(field), `revisionResponse missing ${field}`);
    }

    const verificationPacketFields = contract.protocols?.verificationPacket?.requiredFields ?? [];
    for (const field of ["fixEvidence", "revisionResponses", "verificationResults", "closeFindings"]) {
      assert.ok(verificationPacketFields.includes(field), `verificationPacket missing ${field}`);
    }

    const verificationResultFields = contract.protocols?.verificationResult?.requiredFields ?? [];
    for (const field of ["findingId", "verifiedBy", "result", "evidence", "closeState"]) {
      assert.ok(verificationResultFields.includes(field), `verificationResult missing ${field}`);
    }
  });

  test("evolution requires explicit writeback decision", () => {
    const decision = contract.runDiscipline?.evolutionDecision ?? {};
    assert.equal(decision.required, true);
    assert.ok(decision.allowedDecisions?.includes("writeback"));
    assert.ok(decision.allowedDecisions?.includes("none"));
    assert.equal(decision.noneRequiresReason, true);
    assert.equal(decision.writebackRequiresTargets, true);

    const evolutionFields = contract.protocols?.evolutionWritebackPacket?.requiredFields ?? [];
    for (const field of ["ownerAssessment", "writebackDecision", "decisionReason", "writebacks", "scarIds", "syncRequired"]) {
      assert.ok(evolutionFields.includes(field), `evolutionWritebackPacket missing ${field}`);
    }
  });
});

describe("evolution-contract.json — schema compliance", async () => {
  const evo = await readJson("contracts/evolution-contract.json");

  test("schemaVersion exists", () => {
    assert.notEqual(evo.schemaVersion, undefined);
  });

  test("has all 6 evolution dimensions as keys", () => {
    const loop = evo.evolutionFeedbackLoop ?? {};
    const expected = [
      "patternReuse",
      "boundaryDrift",
      "rhythmBottleneck",
      "capabilityGap",
      "processBottleneck",
      "scarDetected",
    ];
    const keys = Object.keys(loop);
    for (const dim of expected) {
      assert.ok(keys.includes(dim), `missing evolution dimension: ${dim}`);
    }
  });

  test("each dimension has required fields (target, storage, trigger, evidence)", () => {
    const loop = evo.evolutionFeedbackLoop ?? {};
    const requiredFields = ["target", "storage", "trigger", "evidence"];
    for (const [dim, value] of Object.entries(loop)) {
      for (const field of requiredFields) {
        assert.ok(
          value?.[field] !== undefined,
          `dimension "${dim}" missing field "${field}"`
        );
      }
    }
  });

  test("patternReuse references skills storage", () => {
    const storage = evo.evolutionFeedbackLoop?.patternReuse?.storage ?? "";
    assert.ok(
      storage.includes("skills"),
      `patternReuse storage should reference skills, got: ${storage}`
    );
  });

  test("boundaryDrift references agents storage", () => {
    const storage = evo.evolutionFeedbackLoop?.boundaryDrift?.storage ?? "";
    assert.ok(
      storage.includes("agents"),
      `boundaryDrift storage should reference agents, got: ${storage}`
    );
  });

  test("scarDetected references scar protocol", () => {
    const entry = evo.evolutionFeedbackLoop?.scarDetected ?? {};
    const combined = `${entry.target ?? ""} ${entry.storage ?? ""} ${entry.trigger ?? ""}`;
    assert.ok(
      combined.includes("scar"),
      `scarDetected should reference scar protocol, got: ${combined}`
    );
  });

  test("all dimensions have amplification operations", () => {
    const ops = evo.amplificationOperations ?? {};
    const expected = [
      "patternReuse",
      "boundaryDrift",
      "rhythmBottleneck",
      "capabilityGap",
      "processBottleneck",
      "scarDetected",
    ];
    const keys = Object.keys(ops);
    for (const dim of expected) {
      assert.ok(
        keys.includes(dim),
        `missing amplification operation for: ${dim}`
      );
    }
  });
});

describe("scar-protocol.md — schema compliance", async () => {
  const content = await readFile("contracts/scar-protocol.md");

  test("all 4 scar types documented", () => {
    for (const scarType of SCAR_TYPES) {
      assert.ok(
        content.includes(scarType),
        `scar type "${scarType}" not found in scar-protocol.md`
      );
    }
  });

  test("all 4 impact levels documented", () => {
    for (const level of SCAR_IMPACT_LEVELS) {
      assert.ok(
        content.includes(level),
        `impact level "${level}" not found in scar-protocol.md`
      );
    }
  });

  test("scar record schema fields present", () => {
    const requiredFields = [
      "id",
      "type",
      "date",
      "triggered_by",
      "what_happened",
      "root_cause",
      "impact",
      "prevention_rule",
    ];
    for (const field of requiredFields) {
      assert.ok(
        content.includes(field),
        `schema field "${field}" not found in scar-protocol.md`
      );
    }
  });
});
