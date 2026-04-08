import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFile as readFileRaw } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  SKILL_PATH,
  REFERENCE_DIR,
  QUALITY_GRADES,
  EMPTY_ADJECTIVES,
  DELIVERY_SHELL_DIMENSIONS,
  TEN_CARD_TYPES,
  readFile,
} from "./_helpers.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCENARIOS_PATH = path.join(
  __dirname,
  "scenarios",
  "amplification-scenarios.json"
);
const INTENT_AMP_PATH = path.join(REFERENCE_DIR, "intent-amplification.md");

let refContent;
let scenarios;

async function loadFixtures() {
  if (!refContent) {
    refContent = await readFileRaw(INTENT_AMP_PATH, "utf-8");
  }
  if (!scenarios) {
    const raw = await readFileRaw(SCENARIOS_PATH, "utf-8");
    scenarios = JSON.parse(raw);
  }
}

describe("06 — Intent Amplification (Intent Core + Delivery Shell)", async () => {
  await loadFixtures();

  describe("Part A: Structure Verification (references/intent-amplification.md)", () => {
    test("A-01: Intent core definition present", () => {
      assert.match(refContent, /### Intent core \(stable\)/i, "Missing Intent core section");
      assert.match(
        refContent,
        /intent core|underlying goal/i,
        "Intent core should be described as the invariant part"
      );
      assert.match(
        refContent,
        /goal.*information.*decision|information\/decision/i,
        "Intent core should mention goals/information/decisions"
      );
    });

    test("A-02: Delivery shell definition present", () => {
      assert.match(refContent, /### Delivery shell/i, "Missing Delivery shell section");
      assert.match(
        refContent,
        /wrapped for a given audience|Same core, different shell/i,
        "Delivery shell should be context-dependent wrapping"
      );
    });

    test("A-03: Shell selection 4 dimensions (audience, touchpoint, context density, attention budget)", () => {
      assert.match(refContent, /Four dimensions of shell choice/i, "Missing four-dimensions section");
      assert.match(refContent, /\*\*Audience\*\*/i, "Missing Audience dimension");
      assert.match(refContent, /Touchpoint/i, "Missing Touchpoint dimension");
      assert.match(refContent, /Context density/i, "Missing Context density dimension");
      assert.match(refContent, /Attention budget/i, "Missing Attention budget dimension");
    });

    test("A-04: Shell selection decision table (selectDeliveryShell pseudocode)", () => {
      assert.match(
        refContent,
        /selectDeliveryShell/,
        "Missing selectDeliveryShell pseudocode function"
      );
      assert.match(
        refContent,
        /IF audience\s*=\s*exec/i,
        "Decision table should handle exec audience"
      );
      assert.match(
        refContent,
        /IF audience\s*=\s*developer/i,
        "Decision table should handle developer audience"
      );
      assert.match(
        refContent,
        /IF audience\s*=\s*auditor/i,
        "Decision table should handle auditor audience"
      );
    });

    test("A-05: Exec shell characteristics", () => {
      assert.match(
        refContent,
        /high abstraction.*conclusions first/i,
        "Missing high abstraction / conclusions first for exec shell"
      );
      assert.match(
        refContent,
        /recommended actions/i,
        "Exec shell should mention recommended actions"
      );
    });

    test("A-06: Developer shell characteristics", () => {
      assert.match(
        refContent,
        /low abstraction.*implementation detail/i,
        "Missing low abstraction / implementation detail for developer shell"
      );
      assert.match(
        refContent,
        /code refs|snippets/i,
        "Developer shell should mention code references"
      );
    });

    test("A-07: Auditor shell characteristics", () => {
      assert.match(
        refContent,
        /medium abstraction.*evidence chain/i,
        "Missing medium abstraction / evidence chain for auditor shell"
      );
      assert.match(
        refContent,
        /assertion \+ evidence \+ verdict/i,
        "Auditor shell should mention assertion + evidence + verdict"
      );
    });

    test("A-08: Five evolution amplification operations documented", () => {
      assert.match(
        refContent,
        /Five evolution amplification actions/i,
        "Missing five evolution amplification section"
      );

      const dimensions = [
        "Pattern reuse",
        "Agent boundaries",
        "Guidance UX",
        "Process bottleneck",
        "Capability coverage",
      ];
      for (const dim of dimensions) {
        assert.ok(
          refContent.includes(dim),
          `Missing evolution dimension: ${dim}`
        );
      }

      assert.match(refContent, /Artisan/, "Dimension 1 executor (Artisan) must be documented");
      assert.match(refContent, /Warden/, "Dimension 2 executor (Warden) must be documented");
      assert.match(refContent, /Conductor/, "Dimension 3/4 executor (Conductor) must be documented");
      assert.match(refContent, /Scout|Genesis/, "Dimension 5 executor (Scout/Genesis) must be documented");
    });

    test("A-09: Warden intent amplification review checklist", () => {
      assert.match(
        refContent,
        /## Warden: intent amplification review/i,
        "Missing Warden intent amplification review section"
      );

      assert.match(refContent, /Exec shell checklist/i, "Missing exec shell checklist");
      assert.match(refContent, /Conclusion first/i, "Missing conclusion-first check");
      assert.match(refContent, /Actionable recommendation/i, "Missing actionable recommendation");
      assert.match(refContent, /Density matches budget/i, "Missing density vs budget check");
    });

    test("A-10: Cross-audience consistency check rule", () => {
      assert.match(refContent, /### Cross-audience consistency/i, "Missing cross-audience consistency section");
      assert.match(refContent, /Facts must agree/i, "Must state facts must agree");
      assert.match(
        refContent,
        /on track.*late|exec.*on track.*dev/i,
        "Must include exec vs developer contradiction example"
      );
      assert.match(refContent, /reconcile the core/i, "Must mention reconciling intent core");
    });
  });

  describe("Part B: Amplification Scenarios (from amplification-scenarios.json)", () => {
    test("B-00: Scenario file loads and contains 12 scenarios", () => {
      assert.ok(Array.isArray(scenarios), "Scenarios must be an array");
      assert.equal(scenarios.length, 12, "Expected exactly 12 scenarios");
    });

    test("B-01 (IA-01): Same intent core, 3 shells — CEO/developer/reviewer variants", () => {
      const s = scenarios.find((sc) => sc.id === "IA-01");
      assert.ok(s, "IA-01 scenario missing");
      assert.match(s.intentCore, /Token.*refresh/i);

      const shells = s.expectedShells;
      assert.ok(shells.CEO, "Must have CEO shell");
      assert.ok(shells.developer, "Must have developer shell");
      assert.ok(shells.reviewer, "Must have reviewer shell");

      assert.equal(shells.CEO.audience, "CEO");
      assert.equal(shells.CEO.abstractionLevel, "high abstraction");
      assert.ok(
        shells.CEO.forbiddenContent.includes("code snippets"),
        "CEO shell must forbid code snippets"
      );
      assert.ok(
        shells.CEO.forbiddenContent.includes("file paths"),
        "CEO shell must forbid file paths"
      );

      assert.equal(shells.developer.audience, "developer");
      assert.equal(shells.developer.abstractionLevel, "low abstraction");
      assert.match(
        shells.developer.exampleText,
        /refreshToken|JWT/i,
        "Developer shell must include technical specifics"
      );

      assert.equal(shells.reviewer.audience, "auditor");
      assert.equal(shells.reviewer.abstractionLevel, "medium abstraction");
      assert.match(
        shells.reviewer.format,
        /assertion.*evidence.*verdict/i,
        "Reviewer shell must follow assertion+evidence+verdict format"
      );
    });

    test("B-02 (IA-02): 4-dimension combo CEO + urgent + low budget → one-line shell", () => {
      const s = scenarios.find((sc) => sc.id === "IA-02");
      assert.ok(s, "IA-02 scenario missing");

      assert.equal(s.dimensions.audience, "CEO");
      assert.equal(s.dimensions.contextDensity, "emergency");
      assert.equal(s.dimensions.attentionBudget, "low");

      const result = s.expectedShells.result;
      assert.equal(result.shellType, "One-line summary");
      assert.equal(result.attentionCost, "low");
      assert.match(
        result.contextAdjustment,
        /emergency.*conclusions.*actions/i,
        "Urgent context should produce conclusion + action only"
      );
      assert.match(
        result.budgetAdjustment,
        /low.*one-line summary/i,
        "Low budget should produce one-line summary"
      );
    });

    test("B-03 (IA-03): Cross-audience consistency violation detection", () => {
      const s = scenarios.find((sc) => sc.id === "IA-03");
      assert.ok(s, "IA-03 scenario missing");

      const violation = s.expectedShells.violation;
      assert.ok(violation.contradiction, "Must flag as contradiction");
      assert.match(
        violation.ceoShell,
        /on track|On track/i,
        "CEO shell says progress is on track"
      );
      assert.match(
        violation.developerShell,
        /20%.*behind|behind plan/i,
        "Developer shell says behind by ~20%"
      );
      assert.match(
        violation.resolution,
        /intent core/i,
        "Resolution must trace back to intent core"
      );
    });

    test("B-04 (IA-04): 5+1 evolution amplification operations", () => {
      const s = scenarios.find((sc) => sc.id === "IA-04");
      assert.ok(s, "IA-04 scenario missing");

      const amp = s.evolutionAmplification.fivePlusOne;
      assert.ok(amp.dimension1_pattern, "Missing dimension 1 pattern");
      assert.ok(amp.dimension2_boundary, "Missing dimension 2 boundary");
      assert.ok(amp.dimension3_guidance, "Missing dimension 3 guidance");
      assert.ok(amp.dimension4_bottleneck, "Missing dimension 4 bottleneck");
      assert.ok(amp.dimension5_capability, "Missing dimension 5 capability");
      assert.ok(amp.overlay_scars, "Missing scars overlay (the +1)");

      assert.equal(amp.dimension1_pattern.executor, "Artisan");
      assert.equal(amp.dimension2_boundary.executor, "Warden");
      assert.equal(amp.dimension3_guidance.executor, "Conductor");
      assert.equal(amp.dimension4_bottleneck.executor, "Conductor");
      assert.equal(amp.dimension5_capability.executor, "Scout/Genesis");

      const scarTypes = amp.overlay_scars.types;
      assert.ok(
        scarTypes.includes("overstep"),
        "Scar types must include overstep"
      );
      assert.ok(
        scarTypes.includes("boundary-violation"),
        "Scar types must include boundary-violation"
      );
    });

    test("B-05 (IA-05): Forced silence card after 3 consecutive high-cost cards", () => {
      const s = scenarios.find((sc) => sc.id === "IA-05");
      assert.ok(s, "IA-05 scenario missing");

      const silence = s.expectedShells.silenceCard;
      assert.match(
        silence.trigger,
        /3 consecutive/i,
        "Must trigger after 3 consecutive high-cost rounds"
      );
      assert.equal(silence.cardType, "Pause");
      assert.ok(
        TEN_CARD_TYPES.includes(silence.cardType),
        "Pause must be a valid card type from TEN_CARD_TYPES"
      );
      assert.equal(
        silence.attentionCost,
        "zero",
        "Silence card has zero attention cost"
      );
    });

    test("B-06 (IA-06): Developer + first-time + high budget → full technical document shell", () => {
      const s = scenarios.find((sc) => sc.id === "IA-06");
      assert.ok(s, "IA-06 scenario missing");

      assert.equal(s.dimensions.audience, "developer");
      assert.equal(s.dimensions.contextDensity, "first view");
      assert.equal(s.dimensions.attentionBudget, "high");

      const result = s.expectedShells.result;
      assert.equal(result.shellType, "Full technical document");
      assert.equal(result.attentionCost, "high");
      assert.match(
        result.contextAdjustment,
        /first view.*background/i,
        "First-time context should add background"
      );
      assert.match(
        result.budgetAdjustment,
        /high.*full detail/i,
        "High budget should produce complete detailed output"
      );
      assert.ok(
        result.expectedContent.includes("file paths"),
        "Developer technical doc must include file paths"
      );
      assert.ok(
        result.expectedContent.includes("code snippets"),
        "Developer technical doc must include code snippets"
      );
    });

    test("B-07 (IA-07): Reviewer + re-review + medium budget → delta-only shell", () => {
      const s = scenarios.find((sc) => sc.id === "IA-07");
      assert.ok(s, "IA-07 scenario missing");

      assert.equal(s.dimensions.audience, "reviewer");
      assert.equal(s.dimensions.contextDensity, "revisit");
      assert.equal(s.dimensions.attentionBudget, "medium");

      const result = s.expectedShells.result;
      assert.equal(result.shellType, "Delta-only");
      assert.equal(result.attentionCost, "low");
      assert.match(
        result.contextAdjustment,
        /revisit.*deltas only/i,
        "Re-review context should produce delta only"
      );
    });

    test("B-08 (IA-08): Interrupt scenario — Sentinel security alert cuts in", () => {
      const s = scenarios.find((sc) => sc.id === "IA-08");
      assert.ok(s, "IA-08 scenario missing");

      const interrupt = s.expectedShells.interrupt;
      assert.match(
        interrupt.mechanism,
        /Sentinel.*Conductor/i,
        "Interrupt must go through Sentinel→Conductor channel"
      );
      assert.equal(interrupt.interruptType, "security alert");
      assert.match(
        interrupt.action,
        /preempt/i,
        "Security alert must preempt current card"
      );
      assert.match(
        interrupt.postInterrupt,
        /resume/i,
        "Must resume normal flow after interrupt resolved"
      );
    });

    test("B-09 (IA-09): CEO report self-check — no code snippets or file paths", () => {
      const s = scenarios.find((sc) => sc.id === "IA-09");
      assert.ok(s, "IA-09 scenario missing");

      const selfCheck = s.expectedShells.selfCheck;
      assert.match(
        selfCheck.rule,
        /CEO.*must not contain code snippets or file paths/i,
        "Must state CEO reports should not contain code/paths"
      );

      const forbidden = selfCheck.forbiddenInCEOShell;
      assert.ok(
        forbidden.includes("code snippets"),
        "Code snippets must be forbidden"
      );
      assert.ok(
        forbidden.includes("file paths"),
        "File paths must be forbidden"
      );
      assert.ok(
        forbidden.includes("function names"),
        "Function names must be forbidden"
      );

      const required = selfCheck.requiredInCEOShell;
      assert.ok(
        required.includes("conclusion first"),
        "Must require conclusion first"
      );
      assert.ok(
        required.includes("recommended actions"),
        "Must require recommended actions"
      );
    });

    test("B-10 (IA-10): Intent amplification x rhythm orchestration integration", () => {
      const s = scenarios.find((sc) => sc.id === "IA-10");
      assert.ok(s, "IA-10 scenario missing");

      const integration = s.expectedShells.integration;
      assert.ok(
        integration.rhythmOrchestration,
        "Must describe rhythm orchestration side"
      );
      assert.ok(
        integration.intentAmplification,
        "Must describe intent amplification side"
      );
      assert.ok(
        integration.interplay,
        "Must describe how the two systems interplay"
      );
      assert.match(
        integration.interplay,
        /Conductor/,
        "Interplay must reference Conductor"
      );
      assert.match(
        integration.intentAmplification.consistency,
        /same intent core/i,
        "Must maintain same intent core across shells"
      );
    });

    test("B-11 (IA-11): Evolution dimension cascading trigger", () => {
      const s = scenarios.find((sc) => sc.id === "IA-11");
      assert.ok(s, "IA-11 scenario missing");

      const cascade = s.evolutionCascade;
      assert.ok(cascade.trigger, "Must have a triggering event");
      assert.ok(
        Array.isArray(cascade.cascade) && cascade.cascade.length >= 2,
        "Must have at least 2 cascaded dimensions"
      );

      const secondDim = cascade.cascade.find(
        (c) => c.dimension === "dimension2_boundary"
      );
      assert.ok(secondDim, "Must include boundary dimension in cascade");
      assert.ok(
        secondDim.cascadedFrom,
        "Cascaded dimension must trace its trigger to previous dimension"
      );

      const thirdDim = cascade.cascade.find(
        (c) => c.dimension === "dimension5_capability"
      );
      assert.ok(thirdDim, "Must include capability dimension in cascade");
      assert.ok(
        thirdDim.cascadedFrom,
        "Third dimension must trace its trigger to boundary analysis"
      );
    });

    test("B-12 (IA-12): XSS vulnerability fix — CEO/developer/reviewer shells", () => {
      const s = scenarios.find((sc) => sc.id === "IA-12");
      assert.ok(s, "IA-12 scenario missing");
      assert.match(s.intentCore, /XSS/);

      const shells = s.expectedShells;
      assert.ok(shells.CEO, "Must have CEO shell");
      assert.ok(shells.developer, "Must have developer shell");
      assert.ok(shells.reviewer, "Must have reviewer shell");

      assert.ok(
        shells.CEO.forbiddenContent.includes("code snippets"),
        "CEO shell must forbid code snippets"
      );
      assert.ok(
        shells.CEO.forbiddenContent.includes("DOMPurify"),
        "CEO shell must forbid technical terms like DOMPurify"
      );
      assert.ok(
        shells.CEO.requiredContent.includes("business impact"),
        "CEO shell must include business impact"
      );
      assert.ok(
        shells.CEO.requiredContent.includes("recommended action"),
        "CEO shell must include recommended action"
      );

      assert.match(
        shells.developer.exampleText,
        /pages\/.*\.tsx:\d+/,
        "Developer shell must include file paths with line numbers"
      );
      assert.match(
        shells.developer.exampleText,
        /DOMPurify/,
        "Developer shell must mention technical solution"
      );
      assert.ok(
        shells.developer.requiredContent.includes("file paths with line numbers"),
        "Developer shell must require file paths with line numbers"
      );

      assert.match(
        shells.reviewer.exampleText,
        /Claim:/i,
        "Reviewer shell must include claim/assertion"
      );
      assert.match(
        shells.reviewer.exampleText,
        /Evidence:/i,
        "Reviewer shell must include evidence"
      );
      assert.match(
        shells.reviewer.exampleText,
        /Test:/i,
        "Reviewer shell must include verification test"
      );
      assert.ok(
        shells.reviewer.requiredContent.includes("assertion"),
        "Reviewer shell must require assertion"
      );
      assert.ok(
        shells.reviewer.requiredContent.includes("evidence"),
        "Reviewer shell must require evidence"
      );
      assert.ok(
        shells.reviewer.requiredContent.includes("verification method"),
        "Reviewer shell must require verification method"
      );
    });
  });
});
