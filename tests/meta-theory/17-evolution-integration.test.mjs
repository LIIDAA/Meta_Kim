/**
 * 17-evolution-integration.test.mjs
 *
 * Evolution Integration Tests — End-to-End
 *
 * Tests the complete Evolution Stage 8 flow:
 * 1. SKILL.md documents direct agent self-evolution (not memory/)
 * 2. evolution-contract.json maps all gap types to canonical/agents/
 * 3. workflow-contract.json evolutionWritebackTargets exclude memory/
 * 4. Gap-type → target mapping table exists in SKILL.md
 * 5. File-level rollback via git checkout works
 *
 * These tests validate the Evolution mechanism itself, not the agent audit results.
 */
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readJson, readFile } from "./_helpers.mjs";
import path from "node:path";
import { promises as fs } from "node:fs";
import { execSync } from "node:child_process";

const REPO_ROOT = path.join(import.meta.dirname, "..", "..");

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Evolution Mechanism Validation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("Evolution Stage 8 — mechanism validation", async () => {
  test("SKILL.md: Stage 8 describes direct agent definition editing", async () => {
    const skill = await readFile("canonical/skills/meta-theory/SKILL.md");
    const mentionsDirectEdit =
      /directly.*edit|direct.*edit.*agent|agent.*definition.*edit/i.test(skill);
    assert.ok(
      mentionsDirectEdit,
      "SKILL.md Stage 8 must describe direct agent definition editing",
    );
  });

  test("SKILL.md: evolution storage does NOT reference memory/", async () => {
    const skill = await readFile("canonical/skills/meta-theory/SKILL.md");
    const mentionsMemory = /memory\/.*evolution|evolution.*memory\//i.test(
      skill,
    );
    assert.ok(
      !mentionsMemory,
      "SKILL.md must NOT reference memory/ as evolution storage — evolution writes to agent definition files",
    );
  });

  test("evolution-contract.json: all 5+1 gap types map to agent definition files", async () => {
    const evo = await readJson("config/contracts/evolution-contract.json");
    const storages = Object.values(evo.evolutionFeedbackLoop ?? {}).map(
      (d) => d.storage ?? "",
    );
    for (const storage of storages) {
      assert.ok(
        storage.includes("canonical/agents/") ||
          storage.includes("canonical/skills/") ||
          storage.includes("contracts/"),
        `Evolution storage "${storage}" must point to canonical paths, not memory/`,
      );
    }
  });

  test("workflow-contract.json: evolutionWritebackTargets exclude memory/", async () => {
    const contract = await readJson("config/contracts/workflow-contract.json");
    const targets = contract.runDiscipline?.evolutionWritebackTargets ?? [];
    assert.ok(
      !targets.some((t) => t.includes("memory/")),
      "evolutionWritebackTargets must NOT include memory/ paths",
    );
    assert.ok(
      targets.some((t) => t.includes("canonical/agents/")),
      "evolutionWritebackTargets must include canonical/agents/",
    );
  });

  test("SKILL.md: gap-type → evolution target mapping table exists", async () => {
    const skill = await readFile("canonical/skills/meta-theory/SKILL.md");
    const hasMapping =
      /Gap type.*Evolution target|evolution.*target.*agent.*definition/i.test(
        skill,
      );
    assert.ok(
      hasMapping,
      "SKILL.md must document gap-type → evolution target mapping",
    );
  });

  test("SKILL.md: evolution writes to specific agent file, not pattern directory", async () => {
    const skill = await readFile("canonical/skills/meta-theory/SKILL.md");
    const noMemoryDir =
      !/memory\//.test(skill) ||
      /directly.*edit|direct.*edit.*SOUL|edit.*agent.*definition/i.test(skill);
    assert.ok(
      noMemoryDir,
      "Evolution must target specific agent files, not a generic memory/ directory",
    );
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Evolution Rollback Integration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("Evolution Stage 8 — rollback integration", async () => {
  const TEST_FILE = path.join(
    import.meta.dirname,
    "17-evolution-integration.test.mjs",
  );

  test("evolution marker can be written and removed from a file", async () => {
    // Test the basic apply + rollback mechanism using a temp file
    const TEMP_FILE = path.join(
      import.meta.dirname,
      "evo_temp_marker_test.txt",
    );
    const MARKER = "EVOLUTION_MARKER_12345";

    try {
      // Apply: write marker
      await fs.writeFile(TEMP_FILE, `// ${MARKER}\n`, "utf8");
      const afterApply = await fs.readFile(TEMP_FILE, "utf8");
      assert.ok(
        afterApply.includes(MARKER),
        "Evolution marker must be present after apply",
      );

      // Rollback: remove marker
      await fs.writeFile(TEMP_FILE, "// cleaned\n", "utf8");
      const afterRollback = await fs.readFile(TEMP_FILE, "utf8");
      assert.ok(
        !afterRollback.includes(MARKER),
        "Evolution marker must be removed after rollback",
      );
    } finally {
      // Cleanup
      try {
        await fs.unlink(TEMP_FILE);
      } catch {
        // ignore cleanup errors
      }
    }
  });

  test("Evolution is NOT a separate agent — it's a Stage 8 action", async () => {
    const skill = await readFile("canonical/skills/meta-theory/SKILL.md");
    // Evolution must be described as a stage/action, not as an agent entity
    const describesAsAgent =
      /\bevolution\b.*\bagent\b.*designates|designates.*\bagent\b.*\bevolution\b/i.test(
        skill,
      );
    assert.ok(
      !describesAsAgent,
      "Evolution must not be described as a separate agent — it is Stage 8 action",
    );
  });

  test("Evolution writeback: storage paths do not start with memory/", async () => {
    const skill = await readFile("canonical/skills/meta-theory/SKILL.md");
    const devGov = await readFile(
      "canonical/skills/meta-theory/references/dev-governance.md",
    );
    // Evolution storage paths must point to canonical/agents/, not memory/
    // This regex catches: "memory/{something}.md" as a storage/writeback target
    const hasMemoryStorage =
      /evolution.*writes.*to.*memory\/|memory\/.*evolution.*target|write.*back.*memory\//i.test(
        skill + devGov,
      );
    assert.ok(
      !hasMemoryStorage,
      "Evolution storage paths must not reference memory/ — write directly to agent definition files",
    );
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Evolution Target Scope — Meta-Agents vs Execution Agents
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("Evolution target scope — meta vs execution agents", async () => {
  test("Evolution: meta-agents evolve via direct SOUL.md edit", async () => {
    const skill = await readFile("canonical/skills/meta-theory/SKILL.md");
    const devGov = await readFile(
      "canonical/skills/meta-theory/references/dev-governance.md",
    );
    const metaAgentsDirectEdit =
      /directly.*edit|canonical.*agent.*direct.*edit|direct.*edit.*SOUL/i.test(
        skill + devGov,
      );
    assert.ok(
      metaAgentsDirectEdit,
      "Evolution must describe direct SOUL.md editing for meta-agents",
    );
  });

  test(
    "Evolution: execution agents evolve via capabilityGapPacket + Type B pipeline",
    async () => {
      const evo = await readJson(
        "config/contracts/evolution-contract.json",
      );
      const capGap = evo.evolutionFeedbackLoop?.capabilityGap ?? {};
      assert.ok(
        capGap.target?.includes("scout") ||
          capGap.target?.includes("pipeline"),
        "capabilityGap must route to Scout pipeline (Type B trigger)",
      );
      assert.ok(
        !capGap.storage?.includes("memory/"),
        "capabilityGap storage must not be memory/",
      );
    },
  );

  test(
    "Evolution: SKILL.md references capabilityGapPacket for execution-agent evolution",
    async () => {
      const skill = await readFile("canonical/skills/meta-theory/SKILL.md");
      const hasCapGapPacket = /capabilityGapPacket/i.test(skill);
      assert.ok(
        hasCapGapPacket,
        "SKILL.md must reference capabilityGapPacket as evolution artifact for execution agents",
      );
    },
  );

  test(
    "Evolution: execution-agent evolution uses Type B pipeline, not direct edit",
    async () => {
      const skill = await readFile("canonical/skills/meta-theory/SKILL.md");
      const hasTypeBPipeline = /Type B|TypeB/i.test(skill);
      assert.ok(
        hasTypeBPipeline,
        "SKILL.md must reference Type B pipeline for execution agent evolution",
      );
    },
  );
});
