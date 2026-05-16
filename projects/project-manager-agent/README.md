# Project Manager Agent

Tracks all workstreams, tasks, deadlines, blockers, and deliverables across Artificial Management.

**Status:** Active
**Deadline:** June 30, 2026
**Spec:** [spec.md](spec.md)
**Last Updated:** 2026-05-14

## Responsibilities

- Sprint planning
- Task breakdown and assignment
- Progress tracking
- Deadline monitoring
- Portfolio milestone tracking
- Blocker identification and escalation

## Inputs

Quarter goals, active projects, portfolio needs, client-service needs, technical dependencies

## Outputs

Weekly sprint plan, task list with statuses, deadlines, blockers, definition-of-done for each deliverable

## System Context (Current as of 2026-05-14)

**Where the system stands:** Week 3 of 7 complete. All 10 projects are unblocked. 9 agents are Spec Complete. Chief of Staff Agent and this agent are fully Active with working skills. This agent is integrated with the Master Project Tracker (Step 8.5 — updates Last Updated date and Deadline Tracker fields after each run) and integrated with the Chief of Staff Agent (CoS Step 6 reads this agent's sprint plan as primary source for Next Actions).

**What this agent needs to do next:** Produce a new Week 4 sprint plan to kick off Documentation + Data Integrity Agent activation. Read the most recent daily brief and context/current-priorities.md to pull current targets.

**Integration with Chief of Staff Agent:**
- This agent receives priority directives from the Chief of Staff Agent (CoS priorities become PM sprint targets)
- The Chief of Staff Agent reads this agent's sprint plan output as the primary source for its Next Actions list
- Files: `.claude/skills/chief-of-staff/SKILL.md` Step 6 reads the most recent sprint-plan session log

**Key files to read at activation:**
- `projects/master-operating-system/project-tracker.md` — all 10 projects with status, blockers, next actions
- `context/goals.md` — 7-week plan and which week we are in
- `context/current-priorities.md` — current top priorities and Week 4 targets
- `logs/sessions/2026-05-14-daily-brief.md` — most recent daily brief showing current system state

## Recent Updates

- [2026-05-13] Spec v1.0 written — `projects/project-manager-agent/spec.md`
- [2026-05-13] Master Project Tracker built — this agent's primary source of truth is now live
- [2026-05-13] Week 2 closed as On Track — all Week 2 deliverables complete; moving to Week 3 activation
- [2026-05-14] Connected to Master Project Tracker — Step 8.5 added to SKILL.md; PM skill now updates tracker Last Updated date and Deadline Tracker fields after each run
