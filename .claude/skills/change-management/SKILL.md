# Skill: Change Management Agent

Log, review, and flag all changes to agents, prompts, workflows, tools, and system architecture inside Artificial Management — so nothing drifts from its documented state and every change has a traceable record.

## How to Invoke

| Command | Mode | What It Does |
|---|---|---|
| `/change-management` | Log changes (default) | Reviews the current session's changes and writes structured entries to `logs/changes.md` |
| `/change-management review` | Review mode | Scans `logs/changes.md` + `decisions/log.md` for gaps, orphaned decisions, and stale READMEs |
| `/change-management flag [topic]` | Flag mode | Finds all documents referencing a specific changed item and flags which ones need updating |

No argument defaults to log mode. Read the argument (if any) before Step 1.

---

## Change Log Format

All entries appended to `logs/changes.md` must use this exact format — consistent with all existing entries:

```
[YYYY-MM-DD] CHANGED: [what changed] | TYPE: new / updated / deleted / renamed | PROJECT: [project name] | NOTES: [brief context — what changed and why, one sentence]
```

**TYPE values:**
- `new` — file or system created for the first time
- `updated` — existing file modified
- `deleted` — file removed
- `renamed` — file or folder renamed or moved

**PROJECT values:** use the agent ID or system name that owns the changed file (e.g., `change-management-agent`, `master-operating-system`, `portfolio-agent`)

Never use an alternative format. Never batch multiple files into one entry. One entry per distinct file or system change.

---

## Log Mode (default) — Step by Step

### Step 1: Read source files

Read:
- `logs/changes.md` — last 20 entries (to avoid creating duplicate entries)
- `decisions/log.md` — last 10 entries (to identify decisions that need a corresponding change entry)

If the user has already provided session details (files changed, what was built or updated), extract the change list directly. If not, ask all questions in one message:

1. What files were created or modified?
2. What type of change for each? (new / updated / deleted / renamed)
3. Which project does each change belong to?
4. Any decisions made this session that should be logged?
5. Was anything replaced (a prior version superseded)? If yes, rollback note may apply.

### Step 2: Draft change log entries

For each changed file or system component, draft one entry in the standard format:

```
[YYYY-MM-DD] CHANGED: [what changed] | TYPE: [new/updated/deleted/renamed] | PROJECT: [project name] | NOTES: [what changed and why]
```

Before finalizing entries:
- Check the last 20 entries already in `logs/changes.md` — if an identical entry already exists, skip it
- If the NOTES field would be vague (e.g., "file updated"), ask for more context before writing

### Step 3: Cross-check against decisions log

Compare the drafted change entries against the last 10 decisions in `decisions/log.md`.

Flag any decision that has no corresponding change entry:
```
GAP DETECTED — [date]: Decision "[decision text]" has no matching change entry. Was a file modified as a result? Confirm before closing the log.
```

Flag any change entry where no corresponding decision exists (for architectural or agent-level changes):
```
NOTE — [file]: Change logged but no corresponding decision found. If this reflects a design choice, consider logging a decision entry.
```

### Step 4: Detect outdated references

For each file changed this session, check: does any other active document reference this file by name, path, or status?

Key places to check:
- `projects/master-operating-system/ai-system-registry.md` — agent statuses
- `projects/master-operating-system/project-tracker.md` — project statuses and deliverables
- `context/current-priorities.md` — active task list
- The relevant `projects/[project]/README.md` — Recent Updates section

If a referencing document hasn't been updated to reflect the change, flag it:
```
OUTDATED REFERENCE — [referencing file] still references [changed file/old state]. Needs update before session closes.
```

### Step 5: Write rollback note (if applicable)

A rollback note is required only when a prior version was replaced — not for incremental updates.

Conditions that require a rollback note:
- A SKILL.md was rewritten (not just edited)
- An agent spec was replaced with a new version
- A workflow was fundamentally redesigned

Format — append to the relevant spec or session log:
```
**Version History**
- [YYYY-MM-DD] v[X.Y] — [what changed] — previous version: [brief description or "no prior version on record"]
```

If no prior version is being replaced, skip this step.

### Step 6: Append entries and show summary

Append all finalized entries to `logs/changes.md` in order (oldest first if multiple). Then show:

```
Change log updated.

| Entries added  | N                                    |
| Gaps flagged   | N (or "None")                        |
| Outdated refs  | N (or "None")                        |
| Rollback notes | N (or "None")                        |

[List any gaps or outdated reference flags here]

Top action (if any): [most urgent flag or "Log complete — no gaps found"]
```

---

## Review Mode — `/change-management review`

### Step 1: Read logs

Read:
- `logs/changes.md` — last 30 entries
- `decisions/log.md` — last 20 entries

### Step 2: Find orphaned decisions

An orphaned decision is one with no matching change log entry within 2 days. For each orphaned decision:
```
ORPHANED DECISION — [date]: "[decision text]" — no change entry found within 2 days
```

### Step 3: Find stale project READMEs

A README is stale if a change was logged for that project but the README's `**Last Updated:**` date is older than the most recent change log entry for that project.

For each stale README:
```
STALE README — projects/[project]/README.md: last change entry [date], README Last Updated [older date]
```

### Step 4: Output review summary

Inline only — no report file saved.

```
Change log review complete.

| Orphaned decisions | N |
| Stale READMEs      | N |
| Entries reviewed   | N |
| Decisions reviewed | N |

[List each flag with file path and date]

Run `/change-management` to add any missing entries.
Run `/documentation readme [project]` to update any stale READMEs.
```

---

## Flag Mode — `/change-management flag [topic]`

### Step 1: Identify scope

Extract the topic from the argument (e.g., "data-integrity skill", "project-tracker", "resume v1.2").

Read all of the following to find references:
- All 5 context files (`context/*.md`)
- All 10 project READMEs (`projects/*/README.md`)
- `projects/master-operating-system/ai-system-registry.md`
- `projects/master-operating-system/project-tracker.md`
- All agent specs that reference the topic

### Step 2: List referencing documents

For each document that mentions the topic:
```
[file path] | references: "[topic]" | last updated: [date] | needs review: Yes / No
```

Needs review = Yes if:
- The document's reference to the topic describes a status or state that changed
- The document's `**Last Updated:**` date predates the most recent change log entry for the topic

### Step 3: Output flag report

Inline only — no report file saved.

```
Flag report: [topic]

Documents referencing this topic: N
Documents that may need updating: N

[List each document with needs review: Yes, with the specific reference that may be stale]

No changes made. Review and update each flagged document as needed.
Tip: Run `/documentation readme [project]` to update any flagged project README.
```

---

## Rules

- Append-only to `logs/changes.md` — never edit or remove past entries
- One entry per distinct file or system change — never batch multiple files into one entry
- Use the existing format exactly — do not introduce new fields or formatting
- Never assume a change is minor — every spec, skill, prompt, workflow, and config change gets logged
- If uncertain about the scope of a change (e.g., what exactly changed), ask before logging
- Flag conflicts and gaps immediately — do not silently resolve them
- Every session that produces file changes must close with a complete change log
- If a decision was made but no file changed, still note it — decisions without corresponding changes are worth flagging
