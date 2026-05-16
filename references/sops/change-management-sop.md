# SOP: Change Management

**SOP ID:** sop-change-management
**Version:** 1.0
**Owner:** Change Management Agent
**Last Updated:** 2026-05-16
**Status:** Active

---

## Purpose

Define how all changes to the Artificial Management operating system are logged, reviewed, and flagged. Prevents undocumented drift, enables rollback when needed, and maintains a complete audit trail of every system modification.

---

## Trigger

| Trigger Type | When to Run |
|---|---|
| Every session (default) | Log any file, workflow, spec, prompt, or system document that changed |
| Post-build | After any agent, skill, or integration is built or modified |
| Weekly review | Run `/change-management review` at the end of each sprint week |
| Topic flag | Run `/change-management flag [topic]` after modifying a specific area (e.g., agent status, skill design) |

---

## Inputs

| Source | What It Provides |
|---|---|
| Session work (any file modified) | The raw change to be logged |
| `logs/changes.md` | Existing change log — always append, never edit |
| `decisions/log.md` | Decisions that should have corresponding change entries |
| `projects/master-operating-system/ai-system-registry.md` | Current agent and skill list — used in gap detection |
| `references/source-of-truth/source-of-truth-map.md` | All authoritative sources — used in cross-reference scan |

---

## Log Format

Every entry in `logs/changes.md` must follow this exact format:

```
[YYYY-MM-DD] CHANGED: [file path or system name] | TYPE: [new/updated/deleted/renamed] | PROJECT: [project-id] | NOTES: [one-line description of what changed and why]
```

**TYPE values:**
- `new` — file or system created for the first time
- `updated` — existing file or config modified
- `deleted` — file or system removed
- `renamed` — file path changed

**PROJECT values** must match an Agent ID from the AI System Registry (e.g., `master-operating-system`, `chief-of-staff-agent`, `cost-tracking-agent`).

---

## Process — Log Changes (default mode)

| Step | Action |
|---|---|
| 1 | Identify every file, config, or system that changed during the session |
| 2 | For each change, write one entry in the format above |
| 3 | Append all entries to `logs/changes.md` — never edit existing entries |
| 4 | If a decision was made during the session, verify it also has an entry in `decisions/log.md` |

**Rule:** One entry per logical change. If the same file was updated 3 times in a session for the same reason, write one entry describing the net change. If it was updated for 3 different reasons, write 3 entries.

---

## Process — Review (gap/orphan detection)

Run at the end of each sprint week or after any large build session.

| Step | Action |
|---|---|
| 1 | Read the current week's change log entries |
| 2 | Read the current week's decision log entries |
| 3 | Check: every decision should have at least one corresponding change log entry. Flag any decision with no change entry as a **gap**. |
| 4 | Check: every change entry should reference a valid Project ID from the AI System Registry. Flag any entry with an unknown project as an **orphan**. |
| 5 | Check: if a file was logged as changed but no longer exists at that path, flag it as a **stale reference**. |
| 6 | Report findings inline — gaps, orphans, stale references |

---

## Process — Flag [topic] (cross-document reference scan)

Use after modifying a specific area of the system to catch documents that reference outdated information.

| Step | Action |
|---|---|
| 1 | Identify the topic (e.g., "agent status", "skill design", "resume version") |
| 2 | Identify which documents typically reference this topic (from source-of-truth map) |
| 3 | Read each relevant document and check for references to the changed item |
| 4 | Flag any document that still references the old value |
| 5 | Report findings — which files need updating and what specifically is stale |

---

## Outputs

| Output | Destination | Format |
|---|---|---|
| Change log entries | `logs/changes.md` | Append-only entries |
| Gap/orphan report | Inline in chat | Structured list |
| Cross-reference flags | Inline in chat | Structured list with file + stale reference |

---

## What Must Always Be Logged

| Change Type | Must Log? |
|---|---|
| New file created | Yes — always |
| Existing file updated | Yes — always |
| File deleted or archived | Yes — always |
| Agent or skill status changed | Yes — always |
| New MCP server connected | Yes — always |
| Decision made | Yes — in decisions/log.md AND a corresponding change log entry |
| Config file updated (.mcp.json, settings.json) | Yes — always |
| Integrity issue corrected | Yes — note what was corrected and why |

---

## What Does NOT Need a Change Log Entry

| Change Type | Reason |
|---|---|
| Typo fixes in session logs | Low governance value |
| Formatting-only edits | No semantic change |
| Session log itself being created | Covered by the work-session-to-docs skill workflow |

---

## Owner

**Primary:** Change Management Agent
**Invoked by:** Erick Vanderpool, Documentation Agent (during session close), Data Integrity Agent (during audit)

---

## Success Criteria

- [ ] Every session closes with all changes logged in logs/changes.md
- [ ] No change log entry has an unknown project ID
- [ ] Weekly review run at end of each sprint week — gaps and orphans resolved
- [ ] Every decision in decisions/log.md has at least one corresponding change log entry
- [ ] No file logged as changed is missing at its stated path

---

## Related Files

- Skill: `.claude/skills/change-management/SKILL.md`
- Change log: `logs/changes.md`
- Decision log: `decisions/log.md`
- Standards: `.claude/rules/ai-system-standards.md` (Data Integrity Rules section)
