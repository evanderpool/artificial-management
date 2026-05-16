# Skill: Chief of Staff Agent

Run this at the start of any work session, or any time you need a clear picture of where the entire Artificial Management system stands.

## How to Invoke

Type `/chief-of-staff` — no arguments needed. The skill reads all source files automatically and produces a daily brief both inline in chat and saved to a file.

---

## Step 1: Read Current Priorities and Goals

Read both files in full:

- `context/current-priorities.md` — top 5 priorities, immediate next actions, system status
- `context/goals.md` — which week of the 7-week plan we are in, the June 30 deadline, and Q2 success criteria

Extract: current week number, overall system status, and the full list of immediate next actions.

---

## Step 2: Read All 10 Project READMEs

Read each of the following files:

- `projects/master-operating-system/README.md`
- `projects/chief-of-staff-agent/README.md`
- `projects/project-manager-agent/README.md`
- `projects/documentation-agent/README.md`
- `projects/data-integrity-agent/README.md`
- `projects/change-management-agent/README.md`
- `projects/cost-tracking-agent/README.md`
- `projects/portfolio-agent/README.md`
- `projects/client-services-agent/README.md`
- `projects/ai-engineering-build-agent/README.md`

For each project extract: current status, last updated date, any blockers, and next action.

**Do not skip any project.** If a README is missing or has no status, flag it explicitly — do not guess.

---

## Step 3: Read the Project Tracker

Read `projects/master-operating-system/project-tracker.md` in full.

Extract: the status of all 10 projects from the tracker table, any flagged blockers, and the Deadline Tracker week status.

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

## Step 6: Read the Most Recent Session Logs

List all files in `logs/sessions/`. Read the 3 most recent files (by date in filename).

From each session log extract:
- What got done
- Open items and blockers
- Next actions listed

**PM Agent integration:** If any of the 3 most recent files is a sprint plan (filename contains `sprint-plan`), treat it as a primary input — its "This Week's Targets" table becomes the primary source for the Next Actions list in Step 7. If no sprint plan exists in the recent logs, derive next actions from session logs and `context/current-priorities.md` as normal.

---

## Step 7: Synthesize and Produce the Daily Brief

Using all data gathered in Steps 1–6, produce the daily brief.

**Deadline risk rule:** Any project or action that could jeopardize the June 30, 2026 deadline must be flagged at the top of the brief with **RED FLAG**.

**Data integrity rules:**
- Cite which file each fact comes from
- Flag any information that appears stale (not updated in 2+ sessions) or inconsistent
- If data is missing, say so explicitly — never guess at project status
- If two sources conflict, surface the conflict rather than silently picking one

Use this exact format:

```
## Daily Brief — [YYYY-MM-DD]

**Overall Status:** [On Track / At Risk / Behind]
**Week:** [N] of 7 — [Week theme from goals.md]
**Weeks Remaining:** [N] until June 30, 2026

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
`logs/sessions/YYYY-MM-DD-daily-brief.md`

Use today's date. If a daily brief already exists for today, append `-2`, `-3`, etc.

---

## Step 9: Append to the Change Log

Append one entry to `logs/changes.md`:

```
[YYYY-MM-DD] CHANGED: logs/sessions/YYYY-MM-DD-daily-brief.md | TYPE: new | PROJECT: master-operating-system | NOTES: Chief of Staff daily brief produced
```

---

## Final Output

After saving the file, display the full brief inline in chat (from Step 7), then show this summary below it:

```
Daily brief produced.

| Output      | Location                                        |
|-------------|-------------------------------------------------|
| Brief file  | logs/sessions/YYYY-MM-DD-daily-brief.md         |
| Status      | [On Track / At Risk / Behind]                   |
| Projects    | [N] / 10 reviewed                               |

Top next action: [#1 from the Next Actions list]
```

If any RED FLAGs were raised, repeat them after the summary table so they are impossible to miss.
