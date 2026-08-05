# Master Project Tracker

**Last Updated:** 2026-08-05 (PM detail format — portfolio-website + langgraph removed at Erick's direction; archived)
**Owner:** Erick Vanderpool
**Source of truth for:** the portfolio of real project work.

**Structure rule:** Agents are departments, not projects — their operational
status lives only in `ai-system-registry.md`. This tracker holds actual work:
portfolio builds, system upgrades, and (in private repos) client engagements.
Tasks are assigned to owner agents — that is how work is distributed across
departments.

---

## How to Register a Project

1. Add a row to the **Project Portfolio** table (ID is the change-log `PROJECT:` tag).
2. Add the per-project sections below, named exactly:
   - `### <Project Name> — Detail` — bold key-value lines + risk bullets
   - `### <Project Name> — Milestones` — `| Milestone | Target | Status |`
   - `### <Project Name> — Tasks` — `| Task | Owner | Status | Due |`
3. Client projects: same structure in the client's private repo, merged into
   the private master view via `dashboard/private-sources.json`. Never here.

The dashboard computes per-project progress, days-to-deadline, overdue tasks,
and staleness from these sections — dates must be `YYYY-MM-DD`.

---

## Status Legend

| Status | Meaning |
|---|---|
| Planning | Defined but not yet started |
| In Progress | Active work underway |
| Blocked | Cannot proceed — blocker documented |
| Complete | All deliverables done |
| STALE | No update in 2+ sessions — needs review |

**Visibility:** `Public` rows appear on the public dashboard. `Private` rows
(and client projects in per-client repos) appear only in the private master
view (`node dashboard/build.js --private`). Client work is never Public.

---

## Project Portfolio

| Project | ID | Type | Visibility | Status | Deadline | Last Updated | Next Step |
|---|---|---|---|---|---|---|---|
| AI OS v2 — Canonical Store | ai-os-v2-canonical-store | System upgrade | Public | Planning | 2026-09-30 | 2026-08-05 | Schema design kickoff — blocked on Session 3 audit script (parsers feed the migration) |

---

## Project Details

### AI OS v2 — Canonical Store — Detail

**Description:** Migrate the operating system's status data from markdown trackers to a Supabase/Postgres canonical store. Markdown becomes generated views for humans and git history; the dashboard and skills read live data. Doubles as the pgvector/RAG-ready foundation and the second flagship portfolio project.
**Priority:** High
**Start:** 2026-08-05
**Client:** Internal (Artificial Management)
**Links:** [Ops Dashboard](https://evanderpool.github.io/artificial-management/) · [Public repo](https://github.com/evanderpool/artificial-management)
**Risks/Blockers:**
- Supabase project + MCP connection not yet set up — gates all schema work
- Session 3 audit script is a prerequisite (its parsers become the migration source of truth)
- Single-operator risk: no second reviewer for schema decisions (mitigate: decision-log every schema choice)

### AI OS v2 — Canonical Store — Milestones

| Milestone | Target | Status |
|---|---|---|
| Session 3 complete — scripts/audit.js + tests exist | 2026-08-15 | Planning |
| Supabase project created + MCP connected | 2026-08-20 | Planning |
| Schema designed + logged to decision log | 2026-08-25 | Planning |
| Migration script runs clean against live repo | 2026-09-05 | Planning |
| Dashboard reads canonical store | 2026-09-20 | Planning |
| Case study published | 2026-09-30 | Planning |

### AI OS v2 — Canonical Store — Tasks

| Task | Owner | Status | Due |
|---|---|---|---|
| Build scripts/audit.js from dashboard parsers (Session 3) | AI Engineering Build Agent | Planning | 2026-08-15 |
| Create Supabase project + connect MCP | AI Engineering Build Agent | Planning | 2026-08-20 |
| Schema design — projects, tasks, milestones, statuses, logs | AI Engineering Build Agent | Planning | 2026-08-25 |
| Schema review + decision log entries | Data Integrity Agent | Planning | 2026-08-25 |
| Migration script: markdown trackers → tables | Data Integrity Agent | Planning | 2026-09-05 |
| Dashboard reads from canonical store | AI Engineering Build Agent | Planning | 2026-09-20 |
| Case study write-up | Portfolio Agent | Planning | 2026-09-30 |
| TEST bridge task / Visibility / hack [price redacted] [address redacted] | Erick | Complete |  |

---

## Removed / Archived Projects

| Project | Removed | Where |
|---|---|---|
| Portfolio Website | 2026-08-05 | Plan archived at `archives/2026-08-portfolio-website-plan.md`; codebase (outside this repo) untouched |
| LangGraph Research Agent | 2026-08-05 | Removed from portfolio at Erick's direction; repo remains live at github.com/evanderpool/langchain-research-agent |
| v1 agent builds | 2026-08-05 | `archives/2026-q2-agent-build-checklists.md` |
