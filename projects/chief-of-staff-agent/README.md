# Chief of Staff Agent

Keeps the entire Artificial Management system aligned — summarizes progress, identifies priorities, coordinates across agents, and tells Erick what to do next.

**Status:** Active
**Deadline:** June 30, 2026
**Spec:** [spec.md](spec.md)
**Last Updated:** 2026-05-14

## Responsibilities

- Daily and weekly executive summaries
- Priority ranking and next-action planning
- Cross-agent coordination
- Decision tracking and visibility
- Project status updates

## Inputs

Active project tracker, calendar items, open tasks, recent notes, current priority list, deadlines

## Outputs

Daily brief, weekly summary, next-action list, blocker report, portfolio-worthy accomplishments

## System Context (Current as of 2026-05-16)

**Where the system stands:** Week 4 of 7 complete — transitioning to Week 5. All 9 agent specs are written. 5 agents are Active (Chief of Staff, Project Manager, Documentation, Data Integrity, Change Management). 4 agents are Spec Complete. 7 skills are operational (chief-of-staff, project-manager, weekly-exec-summary, work-session-to-docs, documentation, data-integrity, change-management). Master Project Tracker, AI System Registry, and Source-of-Truth Map are all live and audited.

**What this agent needs to do next:** Lead Week 5 — First Working Automation Workflow. Trigger /weekly-exec-summary at the end of each week. Coordinate with Project Manager Agent on the AI Executive Weekly Briefing System build.

**Key files to read at activation:**
- `context/current-priorities.md` — top priorities and Week 3 targets
- `context/goals.md` — 7-week plan and June 30 deadline
- `projects/master-operating-system/project-tracker.md` — all 10 project statuses
- `projects/master-operating-system/ai-system-registry.md` — all agents, tools, and skills
- `logs/sessions/2026-05-13-weekly-summary.md` — most recent weekly summary

## Recent Updates

- [2026-05-13] Spec v1.0 written — `projects/chief-of-staff-agent/spec.md`
- [2026-05-13] /weekly-exec-summary skill linked in Tools & Integrations — skill is now operational
- [2026-05-13] Status corrected to Spec Complete in spec header and registry entry
- [2026-05-13] First weekly executive summary produced using this agent's workflow pattern
- [2026-05-13] Full activation scope briefed — skill build (.claude/skills/chief-of-staff/SKILL.md) confirmed as next action; GitHub + Filesystem MCPs now live to support agent workflows
- [2026-05-14] Integrated with Project Manager Agent — Step 6 of SKILL.md updated to read PM sprint plan as primary source for Next Actions list; weekly summary workflow confirmed active
