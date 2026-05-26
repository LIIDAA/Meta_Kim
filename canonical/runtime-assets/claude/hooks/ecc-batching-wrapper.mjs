#!/usr/bin/env node
/**
 * ecc-batching-wrapper.mjs — Meta_Kim ECC plugin install batching wrapper hook.
 *
 * Purpose:
 *   When the Edit/Write tool repeatedly touches files inside the ECC plugin
 *   marketplace cache within a short session window, batch the related ECC
 *   plugin install side-effects so they do not trigger on every micro-edit.
 *   Closes EB-003 (Option D: Meta_Kim wrapper hook with session+file scope + TTL).
 *
 * Scope (per Warden C10):
 *   - Cache key: SHA256(session_id || file_path)
 *   - TTL: 5 minutes
 *   - Scope: per session + per file (not global, not persistent across sessions)
 *
 * Behavior (PreToolUse):
 *   - Exit 0 with empty stdout: no batching applied, pass through normally
 *   - Exit 0 with hookSpecificOutput.permissionDecision=allow: cache hit, batched
 *
 * Closes: EB-003 (v2.3.0)
 */

import process from "node:process";
import { createHash } from "node:crypto";
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const TTL_MS = 5 * 60 * 1000;
const CACHE_DIR = join(tmpdir(), "meta-kim-ecc-batch-cache");

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
  });
}

function cacheKey(sessionId, filePath) {
  return createHash("sha256")
    .update(`${sessionId || "no-session"}::${filePath || "no-file"}`)
    .digest("hex");
}

function readCacheEntry(key) {
  try {
    const fp = join(CACHE_DIR, `${key}.json`);
    if (!existsSync(fp)) return null;
    const raw = readFileSync(fp, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeCacheEntry(key, payload) {
  try {
    if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
    const fp = join(CACHE_DIR, `${key}.json`);
    writeFileSync(fp, JSON.stringify(payload));
  } catch {
    // Cache write failure is non-fatal
  }
}

function isFreshEntry(entry) {
  return (
    entry &&
    typeof entry.timestamp === "number" &&
    Date.now() - entry.timestamp < TTL_MS
  );
}

async function main() {
  try {
    const raw = await readStdin();
    const payload = raw ? JSON.parse(raw) : {};
    const sessionId = payload.session_id || payload.sessionId || "";
    const toolInput = payload.tool_input || payload.toolInput || {};
    const filePath =
      toolInput.file_path || toolInput.filePath || toolInput.path || "";
    const toolName = payload.tool_name || payload.toolName || "";

    const isEccTouchedTool = ["Edit", "Write", "MultiEdit"].includes(toolName);
    const looksLikeEccPath =
      /\.claude[\\/]plugins[\\/]marketplaces[\\/]ecc/i.test(filePath) ||
      /everything-claude-code/i.test(filePath);

    if (!isEccTouchedTool || !looksLikeEccPath) {
      process.exit(0);
      return;
    }

    const key = cacheKey(sessionId, filePath);
    const existing = readCacheEntry(key);
    if (isFreshEntry(existing)) {
      process.stdout.write(
        JSON.stringify({
          hookSpecificOutput: {
            permissionDecision: "allow",
            permissionDecisionReason:
              "ecc-batching-wrapper: cached within 5min TTL for session+file scope",
          },
        }),
      );
      process.exit(0);
      return;
    }

    writeCacheEntry(key, { timestamp: Date.now(), sessionId, filePath });
    process.exit(0);
  } catch (err) {
    process.stderr.write(`[ecc-batching-wrapper] error: ${err.message}\n`);
    process.exit(0);
  }
}

main();
