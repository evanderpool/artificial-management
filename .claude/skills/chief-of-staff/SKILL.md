# Skill: Chief of Staff Agent

Run this at the start of any work session, or any time you need a clear picture of where the entire Artificial Management system stands.

## How to Invoke

Type `/chief-of-staff` — no arguments needed. The skill reads all source files automatically and produces a daily brief both inline in chat and saved to a file.

---

## Step 1: Read Current Priorities and Goals

Read both files in full:

- `context/current-priorities.md` — top 5 priorities, immediate next actions, system status
- `context/goals.md` — the current quarter, working deadline, and success criteria

Extract: current phase, working deadline (compute days remaining from today — never hardcode), overall system status, and the full list of immediate next actions.

---

## Step 2: Read Every Project README

List all directories in `projects/` and read the `README.md` in each one. Do
not use a fixed list — new projects must appear automatically, and a project
folder without a README is itself a finding to flag.

For each project extract: current status, last updated date, any blockers, and next action.

**Do not skip any project.** If a README is missing or has no status, flag it explicitly — do not guess.

---

## Step 3: Read the Project Tracker

Read `projects/master-operating-system/project-tracker.md` in full.

Extract: the status of every project in the tracker table and any flagged blockers.

Cross-check against the READMEs from Step 2. If the tracker and a README disagree on status, flag the conflict.

---

## Step 4: Scan Recent Decisions

Read `decisions/log.md`.

Extract all entries from the last 30 days. Note the total count and any decisions that affect current priorities or active projects.

---

## Step 5: Scan Recent Changes

Read `logs/changes.md`.

Extract all entries from the last 30 days. Note what was created, updated, or deleted recently. Identify any changes that affect system health or current priorities.

---

## Step 6: Read Recent Sessions and the Latest Sprint Plan

List all files in `logs/sessions/` (human work-session records only — agent
output lives in `logs/reports/` and must NOT be treated as session input).
Read the 3 most recent files (by date in filename).

From each session log extract:
- What got done
- Open items and blockers
- Next actions listed

**PM Agent integration:** Check `logs/reports/` for the most recent `sprint-plan` file. If one exists and is newer than the last session log, its "This Week's Targets" table becomes the primary source for the Next Actions list in Step 7. Otherwise derive next actions from session logs and `context/current-priorities.md` as normal. Never read prior daily briefs or weekly summaries as input — summarizing your own output is an echo loop.

---

## Step 7: Synthesize and Produce the Daily Brief

Using all data gathered in Steps 1–6, produce the daily brief.

**Deadline risk rule:** Any project or action that could jeopardize the current working deadline in `context/goals.md` must be flagged at the top of the brief with **RED FLAG**.

**Data integrity rules:**
- Cite which file each fact comes from
- Flag any information that appears stale (not updated in 2+ sessions) or inconsistent
- If data is missing, say so explicitly — never guess at project status
- If two sources conflict, surface the conflict rather than silently picking one

Use this exact format:

```
## Daily Brief — [YYYY-MM-DD]

**Overall Status:** [On Track / At Risk / Behind]
**Phase:** [phase label from current-priorities.md]
**Working Deadline:** [date from goals.md] — [N] days remaining

[RED FLAG: description — only include if deadline is at risk]

---

### What Got Done Recently
*Source: logs/sessions/ + logs/changes.md*
- [bullet per item — cite which session or log entry]

---

### Active Right Now
*Source: projects/*/README.md + project-tracker.md*
- [bullet per in-progress item across all projects]

---

### Blockers & Risks
*Source: project-tracker.md + session logs*
- [any overdue items, missing data, stale projects, or deadline risks]
- (None) — if nothing is blocked

---

### Next Actions
*Source: context/current-priorities.md + session logs*
1. [Highest priority — cite source]
2. [Second priority]
3. [Third priority]
4. [Fourth if applicable]
5. [Fifth if applicable]

---

### Portfolio Wins
*Source: logs/sessions/ — Portfolio Flags sections*
- [any milestone worth capturing for resume/portfolio this period]
- (None this period) — if nothing flagged
```

---

## Step 8: Save the Brief to File

Save the completed brief to:
`logs/reports/YYYY-MM-DD-daily-brief.md`

(`logs/reports/` holds agent-generated output; never write agent output into `logs/sessions/`.)

Use today's date. If a daily brief already exists for today, append `-2`, `-3`, etc.

---

## Step 9: Append to the Change Log

Append one entry to `logs/changes.md`:

```
[YYYY-MM-DD] CHANGED: logs/reports/YYYY-MM-DD-daily-brief.md | TYPE: new | PROJECT: master-operating-system | NOTES: Chief of Staff daily brief produced
```

---

## Final Output

After saving the file, display the full brief inline in chat (from Step 7), then show this summary below it:

```
Daily brief produced.

| Output      | Location                                        |
|-------------|-------------------------------------------------|
| Brief file  | logs/reports/YYYY-MM-DD-daily-brief.md          |
| Status      | [On Track / At Risk / Behind]                   |
| Projects    | [N] reviewed (every folder in projects/)        |

Top next action: [#1 from the Next Actions list]
```

If any RED FLAGs were raised, repeat them after the summary table so they are impossible to miss.
