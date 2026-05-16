# Skill: Data Integrity Agent

Validate consistency across all Artificial Management documents — detect conflicts between sources, flag outdated information, verify required fields, and produce a confidence-scored integrity report that keeps the system trustworthy as a single source of truth.

## How to Invoke

| Command | Mode | Output |
|---|---|---|
| `/data-integrity` | Full audit (default) | Integrity report file + confidence scores + inline summary |
| `/data-integrity quick` | Quick check | Inline summary of high-priority files only — no report file |
| `/data-integrity conflicts` | Conflict resolution | Side-by-side conflict blocks + recommended resolutions |

No argument defaults to full audit. Read the argument (if any) before Step 1 and keep it in mind throughout — it determines which steps to run and which output format to use.

---

## Step 1: Load Rules and Determine Mode

Read the following before doing anything else:
- `.claude/rules/ai-system-standards.md` — required field definitions, source-of-truth hierarchy, documentation standard
- `references/source-of-truth/source-of-truth-map.md` — the primary audit list (49 catalogued sources)

Extract the 7 required fields every agent spec must have:
`Purpose · Inputs · Outputs · Owner · Dependencies · Success Criteria · Registry Entry`

Extract the source-of-truth priority order:
1. `context/` files
2. `projects/*/README.md`
3. `decisions/log.md`
4. `references/sops/`
5. Agent specs

**Quick mode:** Read only `context/current-priorities.md`, `projects/master-operating-system/ai-system-registry.md`, and `projects/master-operating-system/project-tracker.md`. Skip to Step 3, then Step 5, then Step 6. No report file — output inline summary only.

**Conflicts mode:** Read all source files listed in Step 2, then skip Steps 3–5 and run Step 6 only (deep conflict detection). No confidence scores.

---

## Step 2: Read All Source Files (Full Audit Only)

Read in this order:

**Context files (5):**
- `context/me.md`
- `context/work.md`
- `context/team.md`
- `context/current-priorities.md`
- `context/goals.md`

**Master system files:**
- `projects/master-operating-system/ai-system-registry.md`
- `projects/master-operating-system/project-tracker.md`

**All 10 project READMEs:**
`projects/master-operating-system/README.md`, `projects/chief-of-staff-agent/README.md`, `projects/project-manager-agent/README.md`, `projects/documentation-agent/README.md`, `projects/data-integrity-agent/README.md`, `projects/change-management-agent/README.md`, `projects/cost-tracking-agent/README.md`, `projects/portfolio-agent/README.md`, `projects/client-services-agent/README.md`, `projects/ai-engineering-build-agent/README.md`

**All agent specs (9):**
Read `projects/[project]/spec.md` for each of the 10 projects that has one. Flag immediately if any project is missing a spec file.

**Logs (last 20 entries each):**
- `decisions/log.md`
- `logs/changes.md`

---

## Step 3: Agent Spec Integrity Check

For each agent spec found, verify all 7 required fields are present and non-empty:

| Required Field | What to Check |
|---|---|
| Purpose | Present + at least one sentence |
| Inputs | Present + lists at least one input |
| Outputs | Present + lists at least one output |
| Owner | Present + names a person or agent |
| Dependencies | Present (can be "None") |
| Success Criteria | Present + at least one measurable criterion |
| Registry Entry | Confirms agent is in `ai-system-registry.md` |

**Flag as CRITICAL** any spec with a missing or blank required field.
**Flag as WARNING** any spec where the `Status` field in the spec does not match the status in `ai-system-registry.md`.

If any project has no `spec.md` at all, flag as CRITICAL: "Missing spec — undocumented agent."

**Quick mode:** Check only the registry for completeness — skip individual spec field checks.

---

## Step 4: Project README Integrity Check (Full Audit Only)

For each of the 10 project READMEs, verify:

| Check | Pass Condition | Fail Severity |
|---|---|---|
| `**Status:**` field exists | Field is present and non-blank | CRITICAL |
| `**Last Updated:**` field exists | Field is present | WARNING |
| `**Last Updated:**` is current | Date is within 14 days OR no change log entry exists for this project in the last 14 days | WARNING |
| `## Recent Updates` section exists | Section header present with at least one entry | WARNING |
| Status matches project-tracker.md | README status = project-tracker status for this project | CRITICAL (conflict) |

If README status conflicts with `projects/master-operating-system/project-tracker.md` — flag as CRITICAL and record the specific mismatch (e.g., README says "Active," tracker says "Spec Complete").

---

## Step 5: Registry Completeness Check (Full Audit and Quick)

Using `projects/master-operating-system/ai-system-registry.md` as the reference:

1. For every agent listed in the registry — confirm a `projects/[agent-id]/spec.md` file exists. Flag missing spec as CRITICAL.
2. For every `spec.md` found in `projects/` — confirm a matching registry entry exists. Flag missing registry entry as CRITICAL: "Undocumented agent."
3. Check that no two agents share the same Agent ID. Flag duplicates as CRITICAL.

---

## Step 6: Cross-Source Conflict Detection

Compare across sources in this order (higher source-of-truth priority wins when in conflict):

**Check 1 — Current priorities vs. project tracker:**
Does `context/current-priorities.md` claim a week/phase that matches what `project-tracker.md` shows as the current state? If a project is listed as "complete" in priorities but "In Progress" in the tracker — flag as WARNING.

**Check 2 — Registry status vs. README status:**
For each of the 10 agents, compare the `Status` field in `ai-system-registry.md` vs. the `**Status:**` field in its `README.md`. Any mismatch → CRITICAL conflict.

**Check 3 — Decision log vs. context files:**
Scan `decisions/log.md` for any decision that directly contradicts current content in `context/` files (e.g., a decision to rename a project that isn't reflected in context). Flag as WARNING.

**Check 4 — Change log completeness:**
For every file updated in the last 20 decisions log entries — confirm a corresponding `logs/changes.md` entry exists. Flag orphaned decisions (decision made but no change logged) as INFO.

**Conflicts mode output format** — for each conflict found, output a block:

```
**CONFLICT: [Short label]**
- Source A: [file name] — "[exact claim]"
- Source B: [file name] — "[exact claim]"
- Priority winner: [which source wins per hierarchy]
- Recommended action: [what to do to resolve]
```

Do not silently resolve any conflict. Surface all of them. Ask Erick which resolution to apply before changing any file.

---

## Step 7: Outdated Information Scan (Full Audit Only)

Flag as WARNING any document that meets any of these conditions:

- `**Last Updated:**` is older than 14 days AND the document is referenced as current in another document
- The `**Status:**` field says "Active" or "In Progress" but the most recent change log entry for that project is older than 30 days
- A `context/` file references a project state (e.g., "9 agent specs complete") that no longer matches the actual file count

For each flag, record: file name, the stale claim, and what the current value should be based on other sources.

---

## Step 8: Assign Confidence Scores (Full Audit Only)

For each document audited, score from 0–100 using this rubric:

| Condition | Deduction |
|---|---|
| Missing required field (per spec) | −20 per field |
| Unresolved conflict with higher-priority source | −15 per conflict |
| Stale `**Last Updated:**` (>14 days) | −10 |
| Missing `## Recent Updates` section | −5 |
| Status mismatch vs. registry or tracker | −15 |
| No spec file (for agents) | −30 |

Start at 100. Apply deductions. Floor at 0.

Score interpretation:
- 90–100: Healthy
- 70–89: Minor issues
- 50–69: Needs attention
- Below 50: Critical — action required

---

## Step 9: Produce Integrity Report (Full Audit Only)

Create a new file at:
`logs/sessions/YYYY-MM-DD-integrity-report.md`
(Use today's date. If a file already exists for that name, append `-2`, `-3`, etc.)

Use this format:

```
# Integrity Report

**Date:** YYYY-MM-DD
**Mode:** Full Audit
**Agent:** Data Integrity Agent
**Files Audited:** N

---

## Critical Issues (N)

| # | File | Issue | Recommended Action |
|---|---|---|---|
| 1 | [file] | [description] | [what to do] |

## Warnings (N)

| # | File | Issue | Recommended Action |
|---|---|---|---|
| 1 | [file] | [description] | [what to do] |

## Info (N)

| # | File | Issue | Recommended Action |
|---|---|---|---|
| 1 | [file] | [description] | [what to do] |

---

## Confidence Scores

| Document | Score | Status |
|---|---|---|
| [file name] | [0–100] | Healthy / Minor issues / Needs attention / Critical |

---

## Summary

- **Total issues:** N (N critical / N warnings / N info)
- **Highest confidence:** [file] — [score]
- **Lowest confidence:** [file] — [score]
- **Top recommended action:** [most critical fix, one sentence]
- **Clean documents:** N of N files passed all checks
```

---

## Step 10: Append to Logs and Show Summary

### If any corrections were made this session:

Append to `logs/changes.md` for each correction applied:
```
[YYYY-MM-DD] CHANGED: [file corrected] | TYPE: updated | PROJECT: [project name] | NOTES: Integrity correction — [what was fixed]
```

Append to `decisions/log.md` only if a conflict resolution choice was made:
```
[YYYY-MM-DD] DECISION: [what was resolved] | REASONING: [why this resolution was chosen] | CONTEXT: data-integrity-agent audit
```

Append only. Never edit past entries.

### Show inline summary:

**Full Audit mode:**

```
Integrity audit complete.

| Output              | Location                                          |
|---------------------|---------------------------------------------------|
| Integrity report    | logs/sessions/YYYY-MM-DD-integrity-report.md      |
| Files audited       | N                                                 |
| Critical issues     | N                                                 |
| Warnings            | N                                                 |
| Corrections applied | N (or "None — review required")                   |

Lowest confidence document: [file] — [score]
Top action: [most critical fix]
```

**Quick mode (inline only — no report file):**

```
Quick integrity check complete.

| Check                         | Result |
|-------------------------------|--------|
| Registry completeness         | ✓ Pass / ✗ N issues |
| Spec completeness (registry)  | ✓ Pass / ✗ N issues |
| Priority vs. tracker conflict | ✓ Pass / ✗ N issues |

Top issue (if any): [description and file]
Run `/data-integrity` for the full audit with confidence scores.
```

**Conflicts mode (inline only — no report file):**

```
Conflict scan complete. N conflict(s) found.

[Show each conflict block from Step 6]

No changes made. Confirm with Erick before resolving any conflict.
```

---

## Rules

- Never silently resolve a conflict — surface every one and ask Erick which resolution to apply
- Append-only to `decisions/log.md` and `logs/changes.md` — never edit past entries
- Cite the exact file and field for every issue flagged — no vague references
- Mark any claim that cannot be verified against a source file as [UNVERIFIABLE]
- Every confidence score must show its deductions if the score is below 90
- Do not skip any of the 10 projects — flag as CRITICAL if a project file is missing entirely
- If the source-of-truth map conflicts with what files actually exist on disk, trust the disk — update the map
- Escalate any CRITICAL issue to Erick immediately — do not proceed with a session that has unresolved CRITICAL items unless Erick explicitly approves
