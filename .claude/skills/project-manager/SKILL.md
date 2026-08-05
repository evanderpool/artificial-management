# Skill: Project Manager Agent

Track workstreams, build sprint plans, surface blockers, and monitor the current working deadline (from `context/goals.md`) across all active Artificial Management projects. The project list is dynamic: enumerate every directory in `projects/` that contains a `README.md`.

## How to Invoke

| Command | Mode | Output |
|---|---|---|
| `/project-manager` | Sprint planning | Full weekly sprint plan |
| `/project-manager status` | Status check | All-project status table vs. quarterly goals |
| `/project-manager blockers` | Blocker review | Focused report on blocked/behind items only |

No argument defaults to sprint planning mode. Read the argument (if any) before Step 1 and keep it in mind throughout — it determines which output format to use in Step 7.

---

## Step 1: Read the Quarterly Goals

Read `context/goals.md` in full.

Extract:
- The current quarter and its main goal
- The working deadline, and how many days remain (compute from today's date — never hardcode)
- The success criteria checklist (which items are checked vs. unchecked)

---

## Step 2: Read Current Priorities

Read `context/current-priorities.md` in full.

Extract:
- System status (On Track / At Risk / Behind)
- Current phase label
- Top 5 priorities
- Immediate next actions — specifically any items listed for the current week
- What has been completed so far (the "What's been built" section)

---

## Step 3: Read the Master Project Tracker

Read `projects/master-operating-system/project-tracker.md` in full.

This is the **primary source of truth** for all project statuses.

Extract:
- The full project tracker table — every project row, with status, deadline, blockers, and next action
- The Deliverables Checklist for every project — note which items are checked (done) and unchecked (not done)

Flag any project marked STALE or Blocked before proceeding.

---

## Step 4: Read Every Project README

List all directories in `projects/` and read the `README.md` in each one. Do
not use a fixed list — new projects must appear automatically, and a project
folder without a README is itself a finding to flag.

For each project extract: current status, last updated date, any stated blockers, and next action.

**Do not skip any project.** If a README is missing or has no status, flag it explicitly — do not guess.

**Cross-check rule:** If a README and the project tracker (Step 3) disagree on status, flag the conflict explicitly. Do not silently pick one.

---

## Step 5: Read the Change Log

Read `logs/changes.md`.

Extract all entries from the last 30 days. Note anything that changes what is done, in progress, or blocked for the current sprint.

---

## Step 6: Map Deliverables Against the Quarterly Goals

Using data from Steps 1–5:

1. For each project: list unchecked deliverables in the tracker
2. Match them against the quarter's success criteria and the Top Priorities in current-priorities.md
3. Score each item: **priority-linked** (serves a Top Priority) > **carried over** (open 2+ sessions — flag as late) > **backlog** (note, do not plan)
4. Flag any project with a deadline at risk given days remaining

---

## Step 7: Produce Output Based on Mode

### Sprint Planning Mode (default — no argument)

Use this format:

```
## Sprint Plan — Week of [YYYY-MM-DD]
**Phase:** [phase label from current-priorities.md]
**Working Deadline:** [date from goals.md] ([N] days remaining)

[DEADLINE RISK: description — only include if any project is behind its week target. List each at-risk project.]

---

### This Week's Targets
| Project | Deliverable | Done When | Status |
|---|---|---|---|
| [project name] | [specific unchecked item] | [measurable criteria] | [Not Started / In Progress] |

### Carried Over
- [Project]: [Item] — open for 2+ sessions
- (None) — if nothing is carried over

### Blockers
*Source: project-tracker.md + READMEs*
- [Project]: [Blocker description] — needs [specific resolution]
- (None) — if nothing is blocked

### Definition of Done
- [Deliverable]: Done when [specific, measurable, verifiable criteria — not "complete" or "written"]

### Out of Scope This Sprint
- [Backlog items — listed so they are not confused with this sprint's work]
```

---

### Status Check Mode (`/project-manager status`)

Use this format:

```
## Project Status — [YYYY-MM-DD]
**Phase:** [phase label]
**Working Deadline:** [date from goals.md] ([N] days remaining)

| Project | Deadline | Status | Variance | Last Updated |
|---|---|---|---|---|
| [name] | [date or —] | [Planning/Spec Complete/In Progress/Active/Blocked/Complete] | [On Track / Behind / Ahead] | [date] |

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
**Phase:** [phase label]

### Active Blockers
| Project | Blocker | Impact | Resolution Needed |
|---|---|---|---|
| [name] | [description] | [what it prevents] | [what Erick needs to decide or do] |

### Behind Schedule (No Blocker Documented)
| Project | Expected Status | Actual Status | Gap |
|---|---|---|---|

### Deadline Risk Assessment
- Working deadline [date from goals.md] is [N] days away
- [GREEN / YELLOW / RED]: [one sentence on overall deadline health]
- [Any specific project whose gap could cascade into a missed deadline]
```

---

## Step 8: Save the Output to File

**Sprint mode:** Save to `logs/reports/YYYY-MM-DD-sprint-plan.md`
**Status mode:** Save to `logs/reports/YYYY-MM-DD-status-check.md`
**Blocker mode:** Save to `logs/reports/YYYY-MM-DD-blocker-review.md`

(`logs/reports/` holds agent-generated output; `logs/sessions/` is reserved for human work-session records.)

Use today's date. If a file already exists for today with that name, append `-2`, `-3`, etc.

---

## Step 8.5: Update the Master Project Tracker

After saving the sprint plan file, update `projects/master-operating-system/project-tracker.md`:

1. Update the header `**Last Updated:**` to today's date

Do not modify any project status, next actions, or blocker fields — those are updated manually or by Erick after reviewing the sprint plan.

---

## Step 9: Append to the Change Log

Append one entry to `logs/changes.md`:

For sprint mode:
```
[YYYY-MM-DD] CHANGED: logs/reports/YYYY-MM-DD-sprint-plan.md | TYPE: new | PROJECT: master-operating-system | NOTES: Project Manager Agent sprint plan produced — Week [N]
```

For status mode:
```
[YYYY-MM-DD] CHANGED: logs/reports/YYYY-MM-DD-status-check.md | TYPE: new | PROJECT: master-operating-system | NOTES: Project Manager Agent status check produced
```

For blocker mode:
```
[YYYY-MM-DD] CHANGED: logs/reports/YYYY-MM-DD-blocker-review.md | TYPE: new | PROJECT: master-operating-system | NOTES: Project Manager Agent blocker review produced
```

---

## Final Output

After saving the file, display the full output inline in chat (from Step 7), then show this summary below it:

```
Sprint plan produced.

| Output     | Location                                             |
|------------|------------------------------------------------------|
| Plan file  | logs/reports/YYYY-MM-DD-[output-type].md             |
| Mode       | [Sprint Planning / Status Check / Blocker Review]    |
| Phase      | [phase label]                                        |
| Projects   | [N] reviewed (every folder in projects/)             |

Top priority this sprint: [#1 deliverable from This Week's Targets]
```

If any DEADLINE RISK flags were raised, repeat them after the summary table.
