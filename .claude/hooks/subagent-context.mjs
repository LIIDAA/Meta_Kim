import process from "node:process";

await readJsonFromStdin();

const additionalContext = [
  "Meta_Kim subagent rule set:",
  "- Optional local research note: meta/meta.md (may be absent in the public repository)",
  "- Canonical Claude agent source: .claude/agents/*.md",
  "- After editing agents or skills, run npm run sync:runtimes and npm run validate",
  "- Prefer the smallest agent boundary that can solve the task cleanly",
  "- Do not fork runtime-specific instructions unless the target runtime genuinely requires it",
].join("\n");

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "SubagentStart",
      additionalContext,
    },
  })
);

async function readJsonFromStdin() {
  for await (const _chunk of process.stdin) {
    // The hook only needs to consume stdin so Claude Code can continue.
  }
}
