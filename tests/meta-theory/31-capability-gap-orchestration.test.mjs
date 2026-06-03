import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import {
  buildCapabilityGapOrchestration,
  decomposeCapabilityGapRequests,
} from "../../scripts/run-capability-gap-orchestration.mjs";

describe("31 — Capability Gap orchestration through meta-theory Conductor", () => {
  test("decomposes a meta-theory request into multiple independently decided gaps", () => {
    const input = [
      "同一套 PRD review standard 已经多次出现，需要流程包和触发条件。",
      "项目长期缺 test coverage strategy owner，要稳定 owner、verifier 和输入输出。",
      "release summary JSON 需要脚本。",
      "内部知识库需要 MCP provider 边界，明确权限边界、凭证隔离、只读查询。",
      "这次只整理一个标题的措辞，已有编辑能力足够。",
      "请直接给远程 GitHub PR 加 label，但当前没有授权。",
    ].join("\n");

    const report = buildCapabilityGapOrchestration(input);

    assert.equal(report.status, "pass");
    assert.equal(report.capabilityGaps.length, 6);
    assert.equal(report.orchestrationTaskBoardPacket.synthesisOwner, "meta-conductor");
    assert.deepEqual(report.orchestrationTaskBoardPacket.triggerChain, [
      "meta-theory-skill-adapter",
      "meta-warden-entry-gate",
      "meta-conductor-orchestration",
      "capability-gap-decision-kernel",
    ]);
    assert.deepEqual(
      Object.fromEntries(
        Object.entries(report.decisionCounts).filter(([, count]) => count > 0)
      ),
      {
        create_skill: 1,
        create_agent: 1,
        create_script: 1,
        create_mcp_provider: 1,
        worker_task_only: 1,
        blocked_or_needs_approval: 1,
      }
    );
    assert.equal(report.workerTaskPackets.length, 6);
    assert.ok(
      report.workerTaskPackets.every(
        (packet) =>
          packet.mergeOwner === "meta-conductor" &&
          packet.parallelGroup &&
          packet.roleInstanceId &&
          packet.shardScope
      )
    );
    assert.equal(report.reviewResult.checks.skillIsNotPlanner, true);
    assert.equal(report.reviewResult.checks.conductorOwnsBoard, true);
  });

  test("groups same-type same-repeatKey needs without collapsing worker instances", () => {
    const input = [
      "同一套 PRD review standard 已经多次出现，需要流程包和触发条件。",
      "每次 PRD review 都要 same Critical Fetch Thinking Review，可复用流程要沉淀。",
      "另一个 coverage strategy owner 需求需要长期 owner 和 verifier。",
    ].join("\n");

    const report = buildCapabilityGapOrchestration(input);
    const skillGroup = report.groupedGaps.find(
      (group) => group.decision === "create_skill" && group.repeatKey === "prd-review-flow"
    );
    const skillTasks = report.workerTaskPackets.filter(
      (packet) => packet.shardScope === "prd-review-flow"
    );

    assert.equal(report.status, "pass");
    assert.ok(skillGroup, "same-type PRD review gaps should share a group");
    assert.equal(skillGroup.items.length, 2);
    assert.equal(skillGroup.duplicatePolicy, "same_type_same_repeat_key_grouped");
    assert.equal(skillTasks.length, 2);
    assert.equal(new Set(skillTasks.map((packet) => packet.roleInstanceId)).size, 2);
    assert.equal(new Set(skillTasks.map((packet) => packet.mergeOwner)).size, 1);
    assert.equal([...new Set(skillTasks.map((packet) => packet.mergeOwner))][0], "meta-conductor");
    assert.equal(report.decisionCounts.create_skill, 2);
    assert.equal(report.decisionCounts.create_agent, 1);
  });

  test("CLI writes an orchestration report for a child-session test window", async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), "meta-kim-gap-orchestration-"));
    try {
      const outputPath = path.join(tempDir, "orchestration.json");
      const result = spawnSync(
        process.execPath,
        [
          "scripts/run-capability-gap-orchestration.mjs",
          "--task",
          "同一套 PRD review standard 需要 skill；长期 test coverage owner 需要 agent。",
          "--json-out",
          outputPath,
        ],
        { cwd: process.cwd(), encoding: "utf8" }
      );
      assert.equal(result.status, 0, result.stderr);
      const summary = JSON.parse(result.stdout);
      assert.equal(summary.status, "pass");
      assert.equal(summary.boardMode, "factory_then_dispatch");
      const report = JSON.parse(await readFile(outputPath, "utf8"));
      assert.equal(report.orchestrationTaskBoardPacket.synthesisOwner, "meta-conductor");
      assert.ok(report.workerTaskPackets.length >= 2);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  test("CLI accepts positional task text when an npm runner strips --task", async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), "meta-kim-gap-orchestration-"));
    try {
      const outputPath = path.join(tempDir, "orchestration-positional.json");
      const result = spawnSync(
        process.execPath,
        [
          "scripts/run-capability-gap-orchestration.mjs",
          "同一套 PRD review standard 需要 skill；长期 test coverage owner 需要 agent。",
          "--json-out",
          outputPath,
        ],
        { cwd: process.cwd(), encoding: "utf8" }
      );
      assert.equal(result.status, 0, result.stderr);
      const summary = JSON.parse(result.stdout);
      assert.equal(summary.status, "pass");
      assert.equal(summary.gaps, 2);
      const report = JSON.parse(await readFile(outputPath, "utf8"));
      assert.equal(report.decisionCounts.create_skill, 1);
      assert.equal(report.decisionCounts.create_agent, 1);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  test("CLI preserves the child-window requested decision counts", async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), "meta-kim-gap-orchestration-"));
    try {
      const outputPath = path.join(tempDir, "orchestration-child-window.json");
      const result = spawnSync(
        process.execPath,
        [
          "scripts/run-capability-gap-orchestration.mjs",
          "同一套 PRD review standard 需要 skill；长期 test coverage owner 需要 agent；release summary JSON 需要脚本；外部知识库需要 MCP provider；没有授权的 GitHub PR 发布动作要阻塞。",
          "--json-out",
          outputPath,
        ],
        { cwd: process.cwd(), encoding: "utf8" }
      );
      assert.equal(result.status, 0, result.stderr);
      const report = JSON.parse(await readFile(outputPath, "utf8"));
      assert.deepEqual(
        Object.fromEntries(
          Object.entries(report.decisionCounts).filter(([, count]) => count > 0)
        ),
        {
          create_skill: 1,
          create_agent: 1,
          create_script: 1,
          create_mcp_provider: 1,
          blocked_or_needs_approval: 1,
        }
      );
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  test("decomposition preserves explicit list items before decisions are made", () => {
    const requests = decomposeCapabilityGapRequests("- first gap\n- second gap");
    assert.equal(requests.length, 2);
    assert.equal(requests[0].index, 0);
    assert.equal(requests[1].index, 1);
  });
});
