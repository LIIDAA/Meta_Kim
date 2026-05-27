# Planning Files

When file-based planning is enabled and the task is not a pure query, Stage 3 may maintain:

- `task_plan.md`: steps, owner, verify check.
- `findings.md`: open issues, evidence, decisions.
- `progress.md`: current status and completed checks.

These files are supplemental. Packets in `config/contracts/workflow-contract.json` remain canonical.

Only the conductor/main coordinator writes these planning files unless the run explicitly delegates ownership.
