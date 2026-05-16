# Skill: Documentation Agent

Convert work sessions, decisions, build events, and system changes into clean, structured documentation that keeps all projects, agents, SOPs, and portfolio outputs current and accurate.

## How to Invoke

| Command | Mode | Output |
|---|---|---|
| `/documentation` | Session summary (default) | Dated session log + change log + decision log + README update |
| `/documentation readme [project]` | README update | Updated project README with current status + recent updates |
| `/documentation sop [sop-name]` | SOP draft | New SOP file at `references/sops/[sop-name].md` |

No argument defaults to session summary mode. Read the argument (if any) before Step 1 and keep it in mind throughout — it determines which steps to run and which output format to use.

---

## Step 1: Determine Mode and Read Source Files

### Session Summary Mode (default)

Read the following:
- `logs/changes.md` — last 30 entries
- `decisions/log.md` — last 10 entries
- The relevant project's `projects/[project]/README.md` — the project this session touched
- `context/current-priorities.md` — for next action context

If the user has not already provided session details, ask all 6 questions in one message:

1. **What did you work on?** (project name + brief description)
2. **What was decided?** (tools, approaches, scope, naming, architecture — any choice that should be remembered)
3. **What was created or changed?** (files, docs, prompts, workflows, agent specs, templates — be specific)
4. **What is blocked or unresolved?**
5. **What are the top 3 next actions?**
6. **Anything portfolio-worthy?** (built, documented, or solved something worth capturing as resume proof or client case study?)

If session details were already provided in context, extract answers directly without asking.

### README Update Mode (`/documentation readme [project]`)

Read:
- `projects/[project]/README.md` — current content
- `logs/changes.md` — entries for this project in the last 30 days
- `decisions/log.md` — any binding decisions affecting this project

Skip Steps 2–4. Jump to Step 5 (README Update).

### SOP Draft Mode (`/documentation sop [sop-name]`)

Read:
- `context/current-priorities.md` — to understand which workflow is being documented
- Any existing SOPs in `references/sops/` — for formatting reference
- `.claude/rules/ai-system-standards.md` — documentation standard rules

Skip Steps 2–5. Jump to Step 6 (SOP Draft).

---

## Step 2: Integrity Pre-Check (Session Summary Mode Only)

Before writing any output, run a targeted integrity check on files this session touched.

For each project README that will be updated:
1. Check that the `**Last Updated:**` field exists and is current
2. Check that `**Status:**` reflects actual state (not stale)
3. Check that the `## Recent Updates` section exists

Flag any stale fields — correct them as part of the README update in Step 5.

---

## Step 3: Create the Session Summary File

**Session Summary Mode only.**

Create a new file at:
`logs/sessions/YYYY-MM-DD-session.md`
(Use today's date. If a file already exists for that name, append `-2`, `-3`, etc.)

Use this format:

```
# Session Summary

**Date:** YYYY-MM-DD
**Focus:** [project or workstream name]
**Agent:** Documentation Agent

## What Got Done
- [bullet per completed item — be specific: file names, versions, decisions made]

## Decisions Made
- [bullet per decision, or "None this session"]

## Changes Made
- [file or system changed — be specific]

## Open Items / Blockers
- [bullet per item, or "None"]

## Next Actions
1. [most important]
2.
3.

## Portfolio Flags
- [describe what's worth capturing, or "None this session"]

## Integrity Notes
- [any stale dates, missing fields, or conflicts corrected — or "None"]
```

---

## Step 4: Append to Logs

**Session Summary Mode only.**

### Decision Log

If any decisions were made, append one entry per decision to `decisions/log.md`:

```
[YYYY-MM-DD] DECISION: [what was decided] | REASONING: [why] | CONTEXT: [project/workflow]
```

Append only. Never edit past entries.

### Change Log

If anything was created or changed, append one entry per change to `logs/changes.md`:

```
[YYYY-MM-DD] CHANGED: [what changed] | TYPE: [new / updated / deleted / renamed] | PROJECT: [project name] | NOTES: [brief context]
```

Append only. Never edit past entries.

---

## Step 5: Update the Project README

For **Session Summary** and **README Update** modes.

Locate the relevant project folder at `projects/[project]/README.md`.

Update the following fields:
- `**Last Updated:**` — set to today's date
- `**Status:**` — update if status changed this session
- `## Recent Updates` — prepend a new entry (newest at top):

```
## Recent Updates
- [YYYY-MM-DD] [one-line description of what was built, decided, or changed]
```

If `## Recent Updates` does not exist, create it at the bottom of the file.

**Cross-reference rule:** If the README status conflicts with `projects/master-operating-system/project-tracker.md`, flag the conflict explicitly — do not silently resolve it. Surface it to Erick.

---

## Step 6: SOP Draft Mode — Create the SOP File

**SOP Draft Mode only.**

Create a new file at: `references/sops/[sop-name].md`

Use this format:

```
# SOP: [Workflow Name]

**SOP ID:** [kebab-case-name]
**Owner:** Erick Vanderpool
**Status:** Draft
**Last Reviewed:** YYYY-MM-DD
**Version:** 1.0

---

## Purpose

[One paragraph — what this SOP governs and why it matters]

---

## Trigger

[What event or condition causes this workflow to start — manual, scheduled, event-based]

---

## Inputs

| Input | Source | Format |
|---|---|---|
| [what comes in] | [where it comes from] | [how it's formatted] |

---

## Steps

1. [Clear, numbered steps — each step is one action]
2.
3.

---

## Outputs

| Output | Destination | Format |
|---|---|---|
| [what comes out] | [where it goes] | [how it's formatted] |

---

## Owner / Responsible Agent

**Primary:** [who executes this SOP]
**Review escalation:** [who to escalate to if blocked]

---

## Notes

[Any exceptions, edge cases, or context that makes this SOP non-obvious]
```

After creating the SOP, append one entry to `logs/changes.md` and update the relevant project README.

---

## Step 7: Surface Portfolio Flags

**Session Summary Mode only.**

If anything portfolio-worthy was identified in Step 1, output a formatted block for each item:

```
**Portfolio Flag — [project name]**
- What was built/solved: [description]
- Why it matters: [business or technical value]
- Suggested use: [resume bullet / case study / GitHub README / LinkedIn post / interview story]
```

---

## Step 8: Save Output and Show Summary

### Session Summary Mode

```
Session documented.

| Output         | Location                                        |
|----------------|-------------------------------------------------|
| Session log    | logs/sessions/YYYY-MM-DD-session.md             |
| Decisions      | decisions/log.md (N new entries)                |
| Changes        | logs/changes.md (N new entries)                 |
| Project README | projects/[project]/README.md (Last Updated updated) |

Top next action: [#1 from the next actions list]
```

If portfolio flags were found, show them after the summary table.

### README Update Mode

```
README updated.

| Output     | Location                               |
|------------|----------------------------------------|
| README     | projects/[project]/README.md           |
| Change log | logs/changes.md (1 new entry)          |

Status: [old status] → [new status]
Last Updated: [old date] → [today's date]
```

### SOP Draft Mode

```
SOP created.

| Output     | Location                               |
|------------|----------------------------------------|
| SOP file   | references/sops/[sop-name].md          |
| Change log | logs/changes.md (1 new entry)          |

Next step: Review the draft and mark Status: Active when approved.
```

---

## Rules

- Follow templates exactly — do not improvise structure
- Append-only to decision log and change log — never edit past entries
- Cite sources for every factual claim in documentation
- Mark any uncertain or unverified claim as [VERIFY]
- Every output must have a date
- Never fill in gaps with assumptions — ask Erick if information is missing
- If a README conflicts with the project tracker, flag it — do not silently pick one
