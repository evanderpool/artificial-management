# Skill: Project Manager Agent

Track workstreams, build sprint plans, surface blockers, and monitor the June 30, 2026 deadline across all 10 active Artificial Management projects.

## How to Invoke

| Command | Mode | Output |
|---|---|---|
| `/project-manager` | Sprint planning | Full weekly sprint plan |
| `/project-manager status` | Status check | 10-project status table vs. 7-week plan |
| `/project-manager blockers` | Blocker review | Focused report on blocked/behind items only |

No argument defaults to sprint planning mode. Read the argument (if any) before Step 1 and keep it in mind throughout — it determines which output format to use in Step 7.

---

## Step 1: Read the 7-Week Plan and Identify Current Week

Read `context/goals.md` in full.

Extract:
- Which week of the 7-week plan we are currently in
- The theme for this week
- The deliverables listed for this week in the build plan table
- How many weeks remain until June 30, 2026
- The full Q2 success criteria checklist (which items are checked vs. unchecked)

---

## Step 2: Read Current Priorities

Read `context/current-priorities.md` in full.

Extract:
- System status (On Track / At Risk / Behind)
- Current week number and phase label
- Top 5 priorities
- Immediate next actions — specifically any items listed for the current week
- What has been completed so far (the "What's been built" section)

---

## Step 3: Read the Master Project Tracker

Read `projects/master-operating-system/project-tracker.md` in full.

This is the **primary source of truth** for all project statuses.

Extract:
- The full project tracker table — all 10 projects with status, week target, blockers, and next action
- The Deliverables Checklist for all 10 projects — note which items are checked (done) and unchecked (not done)
- The Deadline Tracker table — which weeks are complete, in progress, or not started

Flag any project marked STALE or Blocked before proceeding.

---

## Step 4: Read All 10 Project READMEs

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

For each project extract: current status, last updated date, any stated blockers, and next action.

**Do not skip any project.** If a README is missing or has no status, flag it explicitly — do not guess.

**Cross-check rule:** If a README and the project tracker (Step 3) disagree on status, flag the conflict explicitly. Do not silently pick one.

---

## Step 5: Read the Change Log

Read `logs/changes.md`.

Extract all entries from the last 30 days. Note anything that changes what is done, in progress, or blocked for the current sprint.

---

## Step 6: Map Deliverables Against the 7-Week Plan

Using data from Steps 1–5:

1. Identify which week of the plan we are in (from Step 1)
2. For each project: list what deliverables are unchecked in the tracker that fall under the current week's scope
3. Identify any deliverables that were targeted in previous weeks but are still unchecked — these carry over
4. Score each item by urgency:
   - **This week's target** — highest priority
   - **Carried over from prior week** — high priority, flag as late
   - **Future week** — out of scope this sprint, note but do not plan
5. Flag any project whose status does not match its expected week target — this is a deadline risk

---

## Step 7: Produce Output Based on Mode

### Sprint Planning Mode (default — no argument)

Use this format:

```
## Sprint Plan — Week of [YYYY-MM-DD]
**Week in 7-Week Plan:** Week [N] — [Theme from goals.md]
**Hard Deadline:** June 30, 2026 ([N] weeks remaining)

[DEADLINE RISK: description — only include if any project is behind its week target. List each at-risk project.]

---

### This Week's Targets
| Project | Deliverable | Done When | Status |
|---|---|---|---|
| [project name] | [specific unchecked item] | [measurable criteria] | [Not Started / In Progress] |

### Carried Over from Last Week
- [Project]: [Item] — targeted Week [N-1], still unchecked
- (None) — if nothing is carried over

### Blockers
*Source: project-tracker.md + READMEs*
- [Project]: [Blocker description] — needs [specific resolution]
- (None) — if nothing is blocked

### Definition of Done
- [Deliverable]: Done when [specific, measurable, verifiable criteria — not "complete" or "written"]

### Out of Scope This Sprint
- [Projects/deliverables that are future-week items — list so they are not confused with this week's work]
```

---

### Status Check Mode (`/project-manager status`)

Use this format:

```
## Project Status — [YYYY-MM-DD]
**Week in 7-Week Plan:** Week [N] — [Theme]
**Hard Deadline:** June 30, 2026 ([N] weeks remaining)

| Project | Week Target | Status | Variance | Last Updated |
|---|---|---|---|---|
| [name] | Week [N] | [Planning/Spec Complete/In Progress/Active/Blocked/Complete] | [On Track / Behind / Ahead] | [date] |

### Summary
- On Track: [N] projects
- Behind: [N] projects — [names]
- No recent update (STALE risk): [N] projects — [names]
```

---

### Blocker Review Mode (`/project-manager blockers`)

Use this format:

```
## Blocker Review — [YYYY-MM-DD]
**Week in 7-Week Plan:** Week [N] — [Theme]

### Active Blockers
| Project | Blocker | Impact | Resolution Needed |
|---|---|---|---|
| [name] | [description] | [what it prevents] | [what Erick needs to decide or do] |

### Behind Schedule (No Blocker Documented)
| Project | Expected Status | Actual Status | Gap |
|---|---|---|---|

### Deadline Risk Assessment
- June 30, 2026 is [N] weeks away
- [GREEN / YELLOW / RED]: [one sentence on overall deadline health]
- [Any specific project whose gap could cascade into a missed deadline]
```

---

## Step 8: Save the Output to File

**Sprint mode:** Save to `logs/sessions/YYYY-MM-DD-sprint-plan.md`
**Status mode:** Save to `logs/sessions/YYYY-MM-DD-status-check.md`
**Blocker mode:** Save to `logs/sessions/YYYY-MM-DD-blocker-review.md`

Use today's date. If a file already exists for today with that name, append `-2`, `-3`, etc.

---

## Step 8.5: Update the Master Project Tracker

After saving the sprint plan file, update `projects/master-operating-system/project-tracker.md`:

1. Update the header `**Last Updated:**` to today's date
2. Update the Deadline Tracker `**Today:**` field to today's date
3. Recalculate `**Weeks remaining:**` based on today vs. June 30, 2026

Do not modify any project status, next actions, or blocker fields — those are updated manually or by Erick after reviewing the sprint plan.

---

## Step 9: Append to the Change Log

Append one entry to `logs/changes.md`:

For sprint mode:
```
[YYYY-MM-DD] CHANGED: logs/sessions/YYYY-MM-DD-sprint-plan.md | TYPE: new | PROJECT: master-operating-system | NOTES: Project Manager Agent sprint plan produced — Week [N]
```

For status mode:
```
[YYYY-MM-DD] CHANGED: logs/sessions/YYYY-MM-DD-status-check.md | TYPE: new | PROJECT: master-operating-system | NOTES: Project Manager Agent status check produced
```

For blocker mode:
```
[YYYY-MM-DD] CHANGED: logs/sessions/YYYY-MM-DD-blocker-review.md | TYPE: new | PROJECT: master-operating-system | NOTES: Project Manager Agent blocker review produced
```

---

## Final Output

After saving the file, display the full output inline in chat (from Step 7), then show this summary below it:

```
Sprint plan produced.

| Output     | Location                                             |
|------------|------------------------------------------------------|
| Plan file  | logs/sessions/YYYY-MM-DD-[output-type].md            |
| Mode       | [Sprint Planning / Status Check / Blocker Review]    |
| Week       | Week [N] of 7 — [Theme]                              |
| Projects   | [N] / 10 reviewed                                    |

Top priority this sprint: [#1 deliverable from This Week's Targets]
```

If any DEADLINE RISK flags were raised, repeat them after the summary table.
