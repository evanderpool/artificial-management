# Skill: Weekly Executive Summary

Run this at the end of each work week to generate a structured executive briefing. Synthesizes project status, changes, decisions, and next actions from across the entire Artificial Management system into one clear weekly report.

## How to Invoke

Type `/weekly-exec-summary` — with or without additional notes. If you have context to add (blockers, wins, anything that isn't in the files yet), paste it before running.

---

## Step 1: Read Current Targets

Read both files and extract key facts:

- `context/current-priorities.md` — top 5 priorities and immediate next actions
- `context/goals.md` — which week of the 7-week plan we are in, what this week's theme is, and what Week N+1's theme is

Identify today's date and the week's date range (Monday through today, or the full Monday–Sunday span).

---

## Step 2: Read All Project Status

Read `projects/master-operating-system/project-tracker.md` in full.

Extract:
- Status of all 10 projects (Planning / Spec Complete / In Progress / Blocked / Complete / STALE)
- Any projects with Blocked status and their documented blockers
- The Deadline Tracker table — which weeks are complete, which is current, which are ahead

---

## Step 3: Scan the Change Log for This Week

Read `logs/changes.md`.

Filter for entries dated within the current work week. Extract each matching entry. Note the total count.

---

## Step 4: Scan the Decision Log for This Week

Read `decisions/log.md`.

Filter for entries dated within the current work week. Extract each matching entry. Note the total count.

---

## Step 5: Read This Week's Session Logs

Read all files in `logs/sessions/` that have dates matching the current work week. Skip weekly summary files from prior runs.

From each session log extract:
- What got done (from the "## What Got Done" section)
- Portfolio flags (from the "## Portfolio Flags" section)
- Open blockers (from the "## Open Items / Blockers" section)

---

## Step 6: Determine Overall Status and Produce the Summary

Determine overall status using this logic:
- **On Track** — all Week N deliverables complete or progressing as planned
- **At Risk** — one or more Week N deliverables incomplete, blocked, or significantly behind
- **Behind** — major gap between plan and actual; June 30 deadline is in jeopardy

Fill out the template at `templates/weekly-exec-summary.md` with real data. Every section must cite its source file. Replace all placeholder text. If a section has nothing to report, use the "(None this week)" line — do not delete the section.

```
# Weekly Executive Summary

**Week:** [N] of 7
**Period:** [YYYY-MM-DD] to [YYYY-MM-DD]
**Produced by:** Chief of Staff Agent via /weekly-exec-summary
**Overall Status:** [On Track / At Risk / Behind]
**Produced:** [YYYY-MM-DD]

---

## 1. Week Snapshot

**Status:** [On Track / At Risk / Behind]
**Reason:** [One sentence — cite the key win or key gap]
**Weeks Remaining:** [N] of 7 (deadline: June 30, 2026)

---

## 2. What Got Done This Week

*Source: logs/sessions/ + logs/changes.md*

- [Deliverable or milestone] → [file path]

---

## 3. What Changed This Week

*Source: decisions/log.md + logs/changes.md*

### Decisions Made ([N] total)
- [YYYY-MM-DD] [Decision summary]

### System Changes ([N] total)
- [YYYY-MM-DD] [Change summary]

---

## 4. What's Blocked

| Project | Blocker | Next Action |
|---|---|---|
| [project] | [blocker] | [next action] |

*(None this week)*

---

## 5. What's Next — Top Priorities for Next Week

1. [Priority 1] — Owner: [Erick / agent]
2. [Priority 2] — Owner: [Erick / agent]
3. [Priority 3] — Owner: [Erick / agent]

---

## 6. System Health

| Check | Result |
|---|---|
| Agents registered | [N] / 10 |
| Agents with completed specs | [N] / 10 |
| Tools connected | [N] / 9 |
| Projects on track | [N] / 10 |
| Open blockers | [N] |
| Data integrity | [Pass / Needs review] |

---

## 7. Portfolio Flags

- [What was built or solved] — Suggested use: [resume bullet / case study / LinkedIn post / interview story]

*(None this week)*

---

## 8. Next Week Preview

**Week [N+1] Theme:** [from context/goals.md]
**Key deliverables due:**
- [ ] [Deliverable]
```

---

## Step 7: Save the Summary and Check Priorities

Save the completed summary to:
`logs/sessions/YYYY-MM-DD-weekly-summary.md`
(Use the last day of the work week or today's date if mid-week.)

Then append to `logs/changes.md`:

```
[YYYY-MM-DD] CHANGED: logs/sessions/YYYY-MM-DD-weekly-summary.md | TYPE: new | PROJECT: master-operating-system | NOTES: Weekly executive summary for Week N of 7
```

Then ask Erick:

> "Weekly summary saved. Do any priorities need to be updated in `context/current-priorities.md` based on this week? If yes, tell me what to change and I'll update it."

If Erick confirms changes, update `context/current-priorities.md` and append one more entry to `logs/changes.md`.

---

## Step 8: Create Gmail Draft

Create a Gmail draft using the Gmail MCP tool with:
- **To:** erick.vanderpool2@outlook.com
- **Subject:** `[Artificial Management] Weekly Brief — Week N | YYYY-MM-DD` (replace N and date with actual values)
- **Body:** The complete formatted weekly summary from Step 6

This creates a draft in Gmail ready to send. A weekly automation routine (trig_01Ed5upotVtnufPmQ9Fjbd17) also runs every Friday at 5pm ET and performs this automatically from the live GitHub repo.

---

## Final Output

After completing all steps, show this summary:

```
Weekly summary produced.

| Output         | Location                                                       |
|----------------|----------------------------------------------------------------|
| Summary file   | logs/sessions/YYYY-MM-DD-weekly-summary.md                     |
| Gmail draft    | erick.vanderpool2@outlook.com — ready to send                  |
| Decisions      | decisions/log.md (N entries this week)                         |
| Changes        | logs/changes.md (N entries this week)                          |
| Status         | [On Track / At Risk / Behind]                                  |

Top priority next week: [#1 from the next-week priorities list]
```

If there were portfolio flags, show them after the table.
