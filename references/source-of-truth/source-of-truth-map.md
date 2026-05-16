# Source-of-Truth Map

**Last Updated:** 2026-05-16
**Owner:** Data Integrity Agent
**Verified By:** Erick Vanderpool

This is the authoritative catalog of every data source in the Artificial Management operating system. Every agent reads this map to know what to read, who owns it, and whether it can be trusted.

**Conflict resolution rule:** When two sources disagree on the same fact, the source with the lower Priority number wins. Priority 1 always beats Priority 2. Never silently resolve a conflict — surface it to Erick.

---

## Status Legend

| Status | Meaning |
|---|---|
| Current | Verified accurate as of Last Verified date |
| Stale | Has not been updated within expected cadence — needs review |
| Needs Review | Known conflict or gap — do not use without verifying |
| Placeholder | File/directory exists but has no content yet |

---

## System Configuration (Priority 0 — Governs the System Itself)

These files define how the operating system works. They sit above the data hierarchy because they define the rules everything else follows.

| Source Name | File Path | Governs | Owner | Update Cadence | Last Verified | Status | Used By |
|---|---|---|---|---|---|---|---|
| Master Brain | `CLAUDE.md` | All operating instructions for Claude Code — imports context, defines tools, skills, standards | Erick Vanderpool | On major system change | 2026-05-15 | Current | All agents (loaded at every session start) |
| AI System Standards | `.claude/rules/ai-system-standards.md` | Every agent spec requirement, data integrity rules, source-of-truth hierarchy, documentation standard, Fortune 500 operating standard | Erick Vanderpool | Rarely (foundational rules) | 2026-05-15 | Current | Data Integrity Agent, Documentation Agent, all agents |
| Communication Style | `.claude/rules/communication-style.md` | Output format preferences, internal tone, external tone, what to avoid | Erick Vanderpool | Rarely (foundational rules) | 2026-05-15 | Current | All agents (governs every response) |
| MCP Configuration | `.mcp.json` | Active MCP server definitions — GitHub, Filesystem | Erick Vanderpool | When MCP servers are added/changed | 2026-05-15 | Current | Claude Code runtime |
| Local Overrides | `CLAUDE.local.md` | Personal/local preferences not shared via git | Erick Vanderpool | As needed | 2026-05-15 | Current | Claude Code (local only) |

---

## Priority 1 — Context Files (`context/*.md`)

The highest-priority data sources. Erick's profile, the business, the team, the priorities, and the goals. These win every conflict.

| Source Name | File Path | Governs | Owner | Update Cadence | Last Verified | Status | Used By |
|---|---|---|---|---|---|---|---|
| Erick's Profile | `context/me.md` | Erick's roles, background, skills, career direction, timezone, contact | Erick Vanderpool | Rarely (stable) | 2026-05-15 | Current | Chief of Staff Agent, Portfolio Agent, Client Services Agent |
| Business Context | `context/work.md` | Artificial Management services, business stage, day-to-day tools, MCP server status | Erick Vanderpool | When services or tools change | 2026-05-15 | Current | Chief of Staff Agent, Client Services Agent, Cost Tracking Agent |
| Team Context | `context/team.md` | Team structure (solo), communication hub, AI agent roster description, core pain points | Erick Vanderpool | When team grows or changes | 2026-05-15 | Current | Chief of Staff Agent, all agents |
| Current Priorities | `context/current-priorities.md` | System status, current week, top 5 priorities, immediate next actions, what's been built | Erick Vanderpool / Chief of Staff Agent | Per work session | 2026-05-15 | Current | Chief of Staff Agent, Project Manager Agent, all agents |
| Quarterly Goals | `context/goals.md` | Q2 2026 goal, success criteria checklist, 7-week build plan | Erick Vanderpool | Per quarter | 2026-05-15 | Current | Chief of Staff Agent, Project Manager Agent |

---

## Priority 2 — Project READMEs (`projects/*/README.md`)

One file per active project. Authoritative for individual project status, scope, and recent updates. Must align with context/ files — flag if they conflict.

| Source Name | File Path | Governs | Owner | Update Cadence | Last Verified | Status | Used By |
|---|---|---|---|---|---|---|---|
| Master OS README | `projects/master-operating-system/README.md` | Central system status, deliverables list, recent updates | Master Operating System | Per major session | 2026-05-15 | Current | Chief of Staff Agent, Project Manager Agent |
| Chief of Staff README | `projects/chief-of-staff-agent/README.md` | CoS Agent status, responsibilities, inputs/outputs, system context, recent updates | Chief of Staff Agent | Per session | 2026-05-15 | Current | Chief of Staff Agent, Project Manager Agent |
| Project Manager README | `projects/project-manager-agent/README.md` | PM Agent status, responsibilities, integration details, recent updates | Project Manager Agent | Per session | 2026-05-15 | Current | Chief of Staff Agent, Project Manager Agent |
| Documentation Agent README | `projects/documentation-agent/README.md` | Doc Agent status, responsibilities, system context, recent updates | Documentation Agent | Per session | 2026-05-15 | Current | Chief of Staff Agent, Documentation Agent |
| Data Integrity Agent README | `projects/data-integrity-agent/README.md` | DI Agent status, responsibilities, known open items, audit targets | Data Integrity Agent | Per session | 2026-05-15 | Current | Chief of Staff Agent, Data Integrity Agent |
| Change Management Agent README | `projects/change-management-agent/README.md` | Change Agent status, responsibilities, system context | Change Management Agent | Per session | 2026-05-15 | Current | Chief of Staff Agent |
| Cost Tracking Agent README | `projects/cost-tracking-agent/README.md` | Cost Agent status, responsibilities, cost tracker link, open action items | Cost Tracking Agent | Per session | 2026-05-15 | Current | Chief of Staff Agent, Cost Tracking Agent |
| Portfolio Agent README | `projects/portfolio-agent/README.md` | Portfolio Agent status, resume system links, current score, top gap actions | Portfolio Agent | Per session | 2026-05-15 | Current | Chief of Staff Agent, Portfolio Agent |
| Client Services Agent README | `projects/client-services-agent/README.md` | Client Agent status, responsibilities, upstream dependencies | Client Services Agent | Per session | 2026-05-15 | Current | Chief of Staff Agent |
| AI Engineering Build Agent README | `projects/ai-engineering-build-agent/README.md` | AI Eng Agent status, responsibilities, system context, current architecture state | AI Engineering Build Agent | Per session | 2026-05-15 | Current | Chief of Staff Agent |

---

## Priority 3 — Decision Log

Binding decisions that override other sources when a conflict is found. Append-only — never edit past entries.

| Source Name | File Path | Governs | Owner | Update Cadence | Last Verified | Status | Used By |
|---|---|---|---|---|---|---|---|
| Decision Log | `decisions/log.md` | All binding decisions made for Artificial Management — technical, operational, strategic | Erick Vanderpool | Per session (append only) | 2026-05-15 | Current | Chief of Staff Agent, Data Integrity Agent, Documentation Agent |

---

## Priority 4 — Standard Operating Procedures (`references/sops/`)

Official process definitions. Currently empty — first SOPs are a Week 4 deliverable (Documentation Agent).

| Source Name | File Path | Governs | Owner | Update Cadence | Last Verified | Status | Used By |
|---|---|---|---|---|---|---|---|
| SOPs Directory | `references/sops/` | Official workflow and process definitions | Documentation Agent | When new processes are formalized | 2026-05-15 | Placeholder | All agents (once populated) |

---

## Priority 5 — Agent Specs (`projects/*/spec.md`)

One spec file per agent. Authoritative for how each agent behaves — inputs, outputs, triggers, dependencies, success criteria.

| Source Name | File Path | Governs | Owner | Update Cadence | Last Verified | Status | Used By |
|---|---|---|---|---|---|---|---|
| Chief of Staff Spec | `projects/chief-of-staff-agent/spec.md` | CoS Agent behavior, triggers, inputs, outputs, tools, escalation path | Chief of Staff Agent | When agent design changes | 2026-05-15 | Current | Documentation Agent, Data Integrity Agent |
| Project Manager Spec | `projects/project-manager-agent/spec.md` | PM Agent behavior, sprint modes, output formats | Project Manager Agent | When agent design changes | 2026-05-15 | Current | Documentation Agent, Data Integrity Agent |
| Documentation Agent Spec | `projects/documentation-agent/spec.md` | Doc Agent behavior, triggers, inputs, outputs | Documentation Agent | When agent design changes | 2026-05-15 | Current | Documentation Agent, Data Integrity Agent |
| Data Integrity Agent Spec | `projects/data-integrity-agent/spec.md` | DI Agent behavior, audit process, conflict rules, confidence scoring | Data Integrity Agent | When agent design changes | 2026-05-15 | Current | Documentation Agent, Data Integrity Agent |
| Change Management Spec | `projects/change-management-agent/spec.md` | Change Agent behavior, log format, version tracking | Change Management Agent | When agent design changes | 2026-05-15 | Current | Documentation Agent, Data Integrity Agent |
| Cost Tracking Spec | `projects/cost-tracking-agent/spec.md` | Cost Agent behavior, cost categories, report format | Cost Tracking Agent | When agent design changes | 2026-05-15 | Current | Documentation Agent, Data Integrity Agent |
| Portfolio Agent Spec | `projects/portfolio-agent/spec.md` | Portfolio Agent behavior, outputs, resume management rules | Portfolio Agent | When agent design changes | 2026-05-15 | Current | Documentation Agent, Data Integrity Agent |
| Client Services Spec | `projects/client-services-agent/spec.md` | Client Agent behavior, service packaging process, dependencies | Client Services Agent | When agent design changes | 2026-05-15 | Current | Documentation Agent, Data Integrity Agent |
| AI Engineering Build Spec | `projects/ai-engineering-build-agent/spec.md` | AI Eng Agent behavior, architecture outputs, tool evaluation process | AI Engineering Build Agent | When agent design changes | 2026-05-15 | Current | Documentation Agent, Data Integrity Agent |

---

## Priority 6 — Operational Registries

Master tracking files that govern system-wide state. Updated more frequently than specs.

| Source Name | File Path | Governs | Owner | Update Cadence | Last Verified | Status | Used By |
|---|---|---|---|---|---|---|---|
| Master Project Tracker | `projects/master-operating-system/project-tracker.md` | All 10 project statuses, week targets, blockers, deliverables checklists, deadline tracker | Project Manager Agent | After every sprint plan or major session | 2026-05-15 | Current | Project Manager Agent, Chief of Staff Agent |
| AI System Registry | `projects/master-operating-system/ai-system-registry.md` | All registered agents (10), tools (9), and skills (4) with status, purpose, spec links | Chief of Staff Agent / Erick Vanderpool | After each major build phase | 2026-05-15 | Current | Chief of Staff Agent, Data Integrity Agent, all agents |

---

## Priority 7 — Skills (`/.claude/skills/*/SKILL.md`)

Step-by-step instructions for each Claude Code skill. Authoritative for how each skill runs.

| Source Name | File Path | Governs | Owner | Update Cadence | Last Verified | Status | Used By |
|---|---|---|---|---|---|---|---|
| Chief of Staff Skill | `.claude/skills/chief-of-staff/SKILL.md` | How /chief-of-staff runs — 9 steps, daily brief format, file output rules | Chief of Staff Agent | When workflow changes | 2026-05-15 | Current | Erick (invokes via /chief-of-staff) |
| Project Manager Skill | `.claude/skills/project-manager/SKILL.md` | How /project-manager runs — 9 steps, 3 modes, sprint plan format | Project Manager Agent | When workflow changes | 2026-05-15 | Current | Chief of Staff Agent, Erick |
| Weekly Exec Summary Skill | `.claude/skills/weekly-exec-summary/SKILL.md` | How /weekly-exec-summary runs — 7 steps, output format, file save rules | Chief of Staff Agent | When workflow changes | 2026-05-15 | Current | Chief of Staff Agent, Erick |
| Work Session to Docs Skill | `.claude/skills/work-session-to-docs/SKILL.md` | How /work-session-to-docs runs — 6 steps, session log format, change log update rules | Documentation Agent | When workflow changes | 2026-05-15 | Current | Documentation Agent, Erick |
| Documentation Skill | `.claude/skills/documentation/SKILL.md` | How /documentation runs — 3 modes (session summary, README update, SOP draft); integrity pre-check included | Documentation Agent | When workflow changes | 2026-05-16 | Current | Documentation Agent, Erick |
| Data Integrity Skill | `.claude/skills/data-integrity/SKILL.md` | How /data-integrity runs — 10 steps, 3 modes (full audit, quick check, conflict resolution); confidence scoring 0–100 | Data Integrity Agent | When workflow changes | 2026-05-16 | Current | Data Integrity Agent, Erick |
| Change Management Skill | `.claude/skills/change-management/SKILL.md` | How /change-management runs — 3 modes (log changes, review, flag [topic]); gap/orphan detection; cross-document reference scan | Change Management Agent | When workflow changes | 2026-05-16 | Current | Change Management Agent, Erick |

---

## Priority 8 — Reference Systems

Structured reference directories. Each has its own README and data files.

| Source Name | File Path | Governs | Owner | Update Cadence | Last Verified | Status | Used By |
|---|---|---|---|---|---|---|---|
| Cost Tracker Directory | `references/cost-tracker/` | All tool/API/subscription costs — monthly trackers, ROI flags, action items | Cost Tracking Agent | Monthly + when tools change | 2026-05-15 | Current | Cost Tracking Agent, Chief of Staff Agent |
| Cost Tracker (May 2026) | `references/cost-tracker/2026-05-cost-tracker.md` | May 2026 spend: ~$47/month, 17 tools registered, 3 active paid tools | Cost Tracking Agent | Monthly | 2026-05-15 | Current | Cost Tracking Agent |
| Resume Directory | `references/resume/` | All resume versions, master source, recruiter analysis | Portfolio Agent | Per resume version update | 2026-05-15 | Current | Portfolio Agent, Erick |
| Resume Master Source | `references/resume/master-source.md` | Full uncut resume content inventory — never modified | Portfolio Agent | Rarely (preserves original) | 2026-05-15 | Current | Portfolio Agent |
| Resume Current Best | `references/resume/versions/v1.2-ai-engineering-mos.md` | Current best submission version — AI OS featured, score 68–72/100 | Portfolio Agent | Per version update | 2026-05-15 | Current | Portfolio Agent, Erick |
| Resume Analysis | `references/resume/analysis/recruiter-analysis-v1.md` | AI engineering recruiter scoring — 58/100 baseline, 9 gaps, rescore triggers | Portfolio Agent | When resume is rescored | 2026-05-15 | Current | Portfolio Agent |
| Source-of-Truth Directory | `references/source-of-truth/` | All authoritative sources — this tracker (self-referencing) | Data Integrity Agent | When new sources are added | 2026-05-15 | Current | Data Integrity Agent, all agents |

---

## Priority 9 — Operational Logs

Running records of system activity. Append-only. Do not use as source of truth for current state — use project READMEs or registries instead.

| Source Name | File Path | Governs | Owner | Update Cadence | Last Verified | Status | Used By |
|---|---|---|---|---|---|---|---|
| Change Log | `logs/changes.md` | Record of every meaningful change to a file, workflow, prompt, or system doc | Change Management Agent | Every session (append only) | 2026-05-15 | Current | Chief of Staff Agent, Data Integrity Agent, Documentation Agent |
| Session Logs Directory | `logs/sessions/` | Dated session summaries — daily briefs, sprint plans, weekly summaries, session captures | Documentation Agent | Per session | 2026-05-15 | Current | Chief of Staff Agent (reads most recent brief and sprint plan) |

---

## Priority 10 — Templates (`templates/`)

Reusable document templates. Authoritative for output format and structure.

| Source Name | File Path | Governs | Owner | Update Cadence | Last Verified | Status | Used By |
|---|---|---|---|---|---|---|---|
| Agent Spec Template | `templates/agent-spec.md` | Standard format for all agent specs — required sections, field definitions | Documentation Agent | When spec format changes | 2026-05-15 | Current | All agents when writing new specs |
| Weekly Exec Summary Template | `templates/weekly-exec-summary.md` | Standard format for weekly executive summaries — 8 sections, field definitions | Documentation Agent | When summary format changes | 2026-05-15 | Current | Chief of Staff Agent, /weekly-exec-summary skill |
| Session Summary Template | `templates/session-summary.md` | Standard format for closing out any major work session | Documentation Agent | When session format changes | 2026-05-15 | Current | Documentation Agent, /work-session-to-docs skill |

---

## Summary Stats

| Priority Group | Files Catalogued | Status |
|---|---|---|
| Priority 0 — System Config | 5 | All Current |
| Priority 1 — Context Files | 5 | All Current |
| Priority 2 — Project READMEs | 10 | All Current |
| Priority 3 — Decision Log | 1 | Current |
| Priority 4 — SOPs | 1 | Placeholder (Week 4 build target) |
| Priority 5 — Agent Specs | 9 | All Current |
| Priority 6 — Operational Registries | 2 | All Current |
| Priority 7 — Skills | 7 | All Current |
| Priority 8 — Reference Systems | 7 | All Current |
| Priority 9 — Operational Logs | 2 | All Current |
| Priority 10 — Templates | 3 | All Current |
| **Total** | **52** | **51 Current, 1 Placeholder** |

---

## Known Gaps (Open Items)

| Gap | Impact | Target |
|---|---|---|
| `references/sops/` is empty | No formalized SOPs — processes exist in skill files only | Week 4 (Documentation Agent deliverable) |
| Architecture diagram not built | No visual representation of system architecture | Week 4–5 carry-forward |
| Agent ownership model not built | No formal mapping of which agent owns which output domain | Week 4–5 carry-forward |
| Data flow diagram not built | No visual showing how data moves between agents | Week 4–5 carry-forward |
| Master dashboard not built | No centralized real-time view of system status | Week 5 target |

---

## Integrity Rules for This Document

1. Every file listed must exist at the stated path — verify before updating Status to Current
2. Every new file added to the system must get a row in this map within the same session
3. Do not silently set Status to Current — only after verification
4. Self-referencing entry (`references/source-of-truth/`) is intentional — this document is itself a source of truth
5. Resume "current best" row must be updated when a new resume version is created
