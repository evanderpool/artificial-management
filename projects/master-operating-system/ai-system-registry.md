# AI System Registry

**Last Updated:** 2026-05-16
**Owner:** Erick Vanderpool
**Source of truth for:** All agents and tools in the Artificial Management AI operating system

Every agent and tool must have an entry here before it is built or used. No undocumented agents. No rogue workflows.

---

## Registry Legend

| Status | Meaning |
|---|---|
| Planning | Defined but not yet built |
| Spec Complete | Agent spec written — ready to build |
| Active | Built and operational |
| Deprecated | Retired — see notes |

---

## Section 1 — Agent Registry

| Agent ID | Agent Name | Purpose | Status | Spec File | Key Inputs | Key Outputs | Dependencies | Last Updated |
|---|---|---|---|---|---|---|---|---|
| chief-of-staff-agent | Chief of Staff Agent | Synthesizes project status, priorities, and decisions into executive summaries and next-action directives | Active | `projects/chief-of-staff-agent/spec.md` | All project READMEs, change log, decision log, session logs, priorities | Daily brief, weekly summary, next-action list, blocker report | Project Manager Agent, Documentation Agent | 2026-05-14 |
| project-manager-agent | Project Manager Agent | Tracks all workstreams, tasks, deadlines, and blockers across 10 active projects and produces weekly sprint plans | Active | `projects/project-manager-agent/spec.md` | goals.md, current-priorities.md, all project READMEs, change log | Sprint plan, status report, deadline risk report, blocker escalation | Chief of Staff Agent, all project READMEs | 2026-05-14 |
| documentation-agent | Documentation Agent | Converts work sessions, decisions, and build events into clean structured documentation automatically | Active | `projects/documentation-agent/spec.md` | Session notes, change log, decision log, project READMEs, templates | Session summaries, updated READMEs, change log entries, SOP drafts, case studies | work-session-to-docs skill, Data Integrity Agent | 2026-05-15 |
| data-integrity-agent | Data Integrity Agent | Validates consistency across all system documents, flags conflicts and outdated info, maintains system trustworthiness | Active | `projects/data-integrity-agent/spec.md` | All context files, all project READMEs, all agent specs, decision log, change log | Inconsistency report, missing fields report, outdated info flags, confidence scores | All context files, Documentation Agent | 2026-05-15 |
| change-management-agent | Change Management Agent | Tracks everything that changes inside Artificial Management — what changed, when, and why | Active | `projects/change-management-agent/spec.md` | System changes, updated files, new workflows, modified prompts | Change log entries, version diff summaries, rollback docs, outdated reference flags | logs/changes.md | 2026-05-15 |
| cost-tracking-agent | Cost Tracking Agent | Tracks all tools, APIs, subscriptions, and compute costs for Artificial Management | Active | `projects/cost-tracking-agent/spec.md` | Tool subscriptions, API costs, software licenses, storage costs | Monthly spend summary, cost change alerts, waste flags, pricing recommendations | External billing data | 2026-05-16 |
| portfolio-agent | Portfolio Agent | Converts every technical project and workflow into job-search and client-facing proof | In Progress | `projects/portfolio-agent/spec.md` | Completed tasks, agent specs, automation workflows, business outcomes | Resume bullets, case studies, LinkedIn posts, GitHub READMEs, interview stories | All project deliverables | 2026-05-14 |
| client-services-agent | Client Services Agent | Packages Artificial Management's capabilities into marketable service offers for SMB clients | Spec Complete | `projects/client-services-agent/spec.md` | Services list, market feedback, portfolio work, pain points, pricing logic | Service packages, offer language, discovery call scripts, proposal drafts | Portfolio Agent | 2026-05-14 |
| ai-engineering-build-agent | AI Engineering Build Agent | Designs and implements the technical architecture of the Artificial Management AI system | Spec Complete | `projects/ai-engineering-build-agent/spec.md` | Business requirements, agent specs, data flows, tool constraints | Architecture diagrams, tool selection rationale, database schemas, workflow specs | All agent specs | 2026-05-14 |
| master-operating-system | Master Operating System | The central system that connects all agents, projects, documentation, dashboards, and workflows | In Progress | — | All system files | Project tracker, AI system registry, weekly exec summary, architecture docs | All agents and tools | 2026-05-15 |

---

## Section 2 — Tool Registry

| Tool Name | Type | Status | What It Enables | Notes |
|---|---|---|---|---|
| Claude Code | AI coding assistant + file manager | Connected | Reads and writes all project files, runs skills, executes agent workflows | Primary work environment — all agents operate through this |
| Anthropic API | API | Connected | Programmatic access to Claude models — client-facing demos, custom integrations, agent automation outside Claude Code | Added 2026-05-16 — pay-per-use; no monthly minimum; key needed for Week 5–6 demo builds |
| Gmail MCP | MCP server | Connected | Claude can read, draft, label, and search emails | Used for: weekly briefing delivery, client outreach drafts |
| Google Calendar MCP | MCP server | Connected | Claude can read/create/update calendar events, suggest meeting times | Used for: deadline tracking, daily brief scheduling |
| Google Drive MCP | MCP server | Connected | Claude can read, create, copy, and search Drive files | Used for: storing portfolio docs, case studies, client-facing assets |
| Microsoft 365 MCP | MCP server | Connected | Claude can authenticate and interact with Microsoft 365 services | Available for: cross-platform doc access if needed |
| GitHub MCP | MCP server | Connected | Claude can read/create issues, view PRs, browse commits, track portfolio work | Connected 2026-05-13 via @modelcontextprotocol/server-github — 22 tools live |
| Filesystem/Local MCP | MCP server | Connected | Claude can read/write local files outside VS Code — true file automation | Connected 2026-05-13 — scoped to EA Agent folder only |
| PostgreSQL/Supabase MCP | MCP server | Not Connected | Claude can query databases, inspect schemas, generate reports from real data | Planned — core to Data Management service offering and live demos |
| Notion or Airtable MCP | MCP server | Not Connected | Claude can read/write a knowledge base, CRM, or SOP tracker | Planned — replaces markdown trackers with a proper system of record |
| Source-of-Truth Tracker | Reference system | Active | Formal catalog of all 49 authoritative sources — priority levels, owners, update cadence, status | Built 2026-05-15 — `references/source-of-truth/`; primary audit list for Data Integrity Agent |

---

## Section 3 — Skill Registry

| Skill ID | Skill Name | Purpose | Status | Skill File | Used By | Last Updated |
|---|---|---|---|---|---|---|
| chief-of-staff | Chief of Staff Agent | Reads all 10 project READMEs, logs, and priorities and produces a daily brief — saved to file and displayed in chat | Active | `.claude/skills/chief-of-staff/SKILL.md` | Erick | 2026-05-14 |
| project-manager | Project Manager Agent | Produces sprint plans, status checks, and blocker reviews across all 10 projects — 3 modes (sprint/status/blockers) | Active | `.claude/skills/project-manager/SKILL.md` | Chief of Staff Agent, Erick | 2026-05-14 |
| weekly-exec-summary | Weekly Executive Summary | Automates producing a structured weekly executive briefing — reads all source files and fills out the weekly-exec-summary template | Active | `.claude/skills/weekly-exec-summary/SKILL.md` | Chief of Staff Agent, Erick | 2026-05-13 |
| work-session-to-docs | Work Session to Docs | Captures decisions and changes from any work session and updates all relevant docs — session log, change log, decision log, project README | Active | `.claude/skills/work-session-to-docs/SKILL.md` | Documentation Agent, Erick | 2026-05-13 |
| documentation | Documentation Agent | Converts sessions, decisions, and changes into structured documentation — 3 modes: session summary, README update, SOP draft | Active | `.claude/skills/documentation/SKILL.md` | Erick | 2026-05-15 |
| data-integrity | Data Integrity Agent | Validates system document consistency — 3 modes: full audit, quick check, conflict resolution; confidence scoring (0–100) | Active | `.claude/skills/data-integrity/SKILL.md` | Data Integrity Agent, Erick | 2026-05-15 |
| change-management | Change Management Agent | Logs, reviews, and flags all system changes — 3 modes: log changes (default), review (gap/orphan detection), flag [topic] | Active | `.claude/skills/change-management/SKILL.md` | Change Management Agent, Erick | 2026-05-15 |
| cost-tracking | Cost Tracking Agent | Monthly spend report and add-tool workflow — 2 modes: monthly-report (default), add-tool | Active | `.claude/skills/cost-tracking/SKILL.md` | Cost Tracking Agent, Erick | 2026-05-16 |

---

## Registry Audit

**Last audit:** 2026-05-16 (Week 5 kickoff — cost-tracking-agent Spec Complete → Active; cost-tracking skill added (8 skills total); weekly briefing routine registered; 18 integrity issues corrected this session)
**Audit performed by:** Erick Vanderpool + Claude Code

| Check | Result |
|---|---|
| All agents have a registry entry | 10 / 10 |
| All agents with specs have spec file links | 9 / 9 (master-operating-system does not need a spec) |
| All tools documented | 11 tools/systems registered (8 connected, 2 planned, 1 reference system active) |
| All skills documented | 8 / 8 (chief-of-staff, project-manager, weekly-exec-summary, work-session-to-docs, documentation, data-integrity, change-management, cost-tracking) |
| No undocumented agents | Pass |
| No rogue workflows | Pass |
| All Week 4 active skills status accurate | Pass — documentation, data-integrity, change-management all Active across README / registry / tracker |
| README Last Updated fields present and current | Pass |
| master-operating-system Last Updated current | Pass — corrected 2026-05-13 → 2026-05-15 |

**Next audit:** Start of Week 5 — after Cost Tracking Agent build begins
