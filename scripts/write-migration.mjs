#!/usr/bin/env node
/**
 * Write a real migration record to simulate a Meta_Kim schema upgrade.
 *
 * Usage: node scripts/write-migration.mjs [--from <version>] [--to <version>]
 *
 * This script simulates what happens when Meta_Kim schemaVersion changes —
 * it writes a migration record to:
 *   .meta-kim/state/{profile}/migrations/{seq}-{from}to{to}.json
 *
 * In production, this would be triggered automatically by schema version
 * detection in setup.mjs or ensureProfileState().
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  ensureProfileState,
  getProfilePaths,
  toRepoRelative,
} from "./meta-kim-local-state.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const fromIdx = process.argv.indexOf("--from");
const toIdx = process.argv.indexOf("--to");
const fromVersion = fromIdx !== -1 ? process.argv[fromIdx + 1] : "2.0.0";
const toVersion = toIdx !== -1 ? process.argv[toIdx + 1] : "2.1.0";

async function listMigrations(migrationsDir) {
  try {
    const files = await fs.readdir(migrationsDir);
    return files
      .filter((f) => f.endsWith(".json"))
      .sort()
      .map((f) => f.replace(".json", ""));
  } catch {
    return [];
  }
}

async function writeMigration({ fromVersion, toVersion, profile }) {
  const state = getProfilePaths({ profile });
  const existing = await listMigrations(state.migrationsDir);
  const seq = String(existing.length + 1).padStart(3, "0");

  const migrationId = `${seq}-${fromVersion}to${toVersion}`;
  const timestamp = new Date().toISOString();

  // Simulate schema changes for a v2.0.0 -> v2.1.0 upgrade
  // In production, these would be detected by comparing current vs previous schemaVersion
  const schemaChanges = [];

  // Example: adding a new column to run_index if upgrading
  if (fromVersion === "2.0.0" && toVersion === "2.1.0") {
    schemaChanges.push(
      {
        type: "table_alter",
        target: "run_index",
        description:
          "Added 'closed_reason' column to track why a run was closed",
        sql: "ALTER TABLE run_index ADD COLUMN closed_reason TEXT",
      },
      {
        type: "table_alter",
        target: "run_index",
        description:
          "Added 'verify_gate_state' column to cache verify gate status",
        sql: "ALTER TABLE run_index ADD COLUMN verify_gate_state TEXT DEFAULT 'pending_verify'",
      },
    );
  } else {
    schemaChanges.push({
      type: "init",
      target: "profile_state",
      description: `Initial profile state at version ${toVersion}`,
    });
  }

  const migration = {
    migrationId,
    fromVersion,
    toVersion,
    appliedAt: timestamp,
    appliedBy: "write-migration.mjs",
    description: `Upgrade profile schema from v${fromVersion} to v${toVersion}`,
    schemaChanges,
    rollbackNote:
      "Downgrade not supported — profile state must be rebuilt from run artifacts if reverted.",
    nodeVersion: process.version,
  };

  const outFile = path.join(state.migrationsDir, `${migrationId}.json`);
  await fs.writeFile(outFile, JSON.stringify(migration, null, 2), "utf8");

  return {
    path: toRepoRelative(outFile),
    profile: state.profile,
    migrationId,
    changesCount: schemaChanges.length,
  };
}

async function main() {
  console.log("meta-kim write-migration\n");

  const profileState = await ensureProfileState();
  console.log(`  profile: ${profileState.profile}`);
  console.log(`  upgrade: v${fromVersion} -> v${toVersion}`);

  const result = await writeMigration({
    fromVersion,
    toVersion,
    profile: profileState.profile,
  });

  console.log(`\n  [ok] migration record written`);
  console.log(`  path:    ${result.path}`);
  console.log(`  changes:  ${result.changesCount} schema change(s)`);
  console.log(`  note:    rollback not supported`);
}

main().catch((e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
