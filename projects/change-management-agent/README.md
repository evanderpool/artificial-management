# Change Management Agent

Tracks everything that changes inside Artificial Management — what changed, when it changed, and why.

**Status:** Active
**Deadline:** June 30, 2026
**Spec:** [spec.md](spec.md)
**Last Updated:** 2026-05-15

## Responsibilities

- Prompt version history
- Workflow update tracking
- Tool and platform change logging
- System architecture updates
- Decision log entries
- Rollback notes and history

## Inputs

System changes, updated files, new workflows, modified prompts, tool additions/removals, architectural decisions

## Outputs

Change log entries, version diff summaries, rollback documentation, outdated reference flags

## System Context (Current as of 2026-05-14)

**Where the system stands:** Week 3 of 7 complete. The change log (`logs/changes.md`) is active and append-only with 98 entries as of 2026-05-14. All system changes across 7 build sessions are logged. Agent spec v1.0 is written and ready to build.

**What this agent needs to do next:** Prompt skeleton validated and change log workflow made active (Week 4 target). This agent monitors `logs/changes.md` as its primary source and alerts when changes affect source-of-truth documents, active agent specs, or governance files.

**Key files to read at activation:**
- `logs/changes.md` — the live append-only change log this agent governs
- `projects/master-operating-system/ai-system-registry.md` — tracks all agents and tools this agent monitors
- `decisions/log.md` — binding decisions that should correspond to change log entries
- `.claude/rules/ai-system-standards.md` — the data integrity rules this agent enforces

## Recent Updates

- [2026-05-15] Skill activated — `.claude/skills/change-management/SKILL.md` live; 3 modes: log changes (default), review (gap/orphan detection), flag [topic] (cross-document reference scan); `/change-management` now invocable
- [2026-05-13] Agent spec v1.0 written — status updated to Spec Complete; full template complete with triggers, inputs, outputs, tools, escalation path, and prompt skeleton
- [2026-05-14] System Context added; Last Updated date set; registry status corrected to Spec Complete with spec file link
