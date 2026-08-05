# Master Project Tracker

**Last Updated:** 2026-08-05 (restructured: project portfolio — agents moved to registry-only)
**Owner:** Erick Vanderpool
**Source of truth for:** the portfolio of real project work.

**Structure rule:** Agents are departments, not projects — their operational
status lives only in `ai-system-registry.md`. This tracker holds actual work:
portfolio builds, system upgrades, and (in private repos) client engagements.
A project is registered when it has a `projects/<id>/README.md` (or its own
repo) plus a row here. Tasks are assigned to owner agents — that is how work
is distributed across departments.

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
| Portfolio Website | portfolio-website | Portfolio build | Public | In Progress | 2026-09-30 | 2026-08-05 | Contact form UI + social links (no decisions needed); project questionnaire × 12 needs Erick |
| LangGraph Research Agent | langchain-research-agent | Portfolio build | Public | Complete | — | 2026-05-17 | Done — live at github.com/evanderpool/langchain-research-agent + HuggingFace demo |
| AI OS v2 — Canonical Store | ai-os-v2-canonical-store | System upgrade | Public | Planning | 2026-09-30 | 2026-08-05 | Scope Supabase schema for projects/tasks/statuses; Session 3 audit script is the prerequisite |

> Client projects (e.g., a client website build or client AI OS) get their own
> private repo using this same structure and are merged into the private
> master view via `dashboard/private-sources.json`. They never appear here.

---

## Tasks by Project

### Portfolio Website — Tasks

| Task | Owner | Status |
|---|---|---|
| Contact form UI (glass card, structured fields, no backend) | AI Engineering Build Agent | Planning |
| Social + contact links in Contact.tsx + Footer.tsx | AI Engineering Build Agent | Planning |
| Project data questionnaire × 12 | Erick | Blocked |
| /work standalone page decision | Erick | Blocked |
| Project cover images (12) | Portfolio Agent | Planning |
| Mobile QA at 375px + clean build | AI Engineering Build Agent | Planning |
| Deploy to Vercel + analytics | AI Engineering Build Agent | Planning |
| Launch case study + resume bullets | Portfolio Agent | Planning |

### AI OS v2 — Canonical Store — Tasks

| Task | Owner | Status |
|---|---|---|
| Schema design — projects, tasks, statuses, logs | AI Engineering Build Agent | Planning |
| Supabase project + MCP connection | AI Engineering Build Agent | Planning |
| Migration script: markdown trackers → tables | Data Integrity Agent | Planning |
| Dashboard reads from canonical store | AI Engineering Build Agent | Planning |
| Case study write-up | Portfolio Agent | Planning |

---

## Agent Build History (v1)

The v1 build's per-agent deliverables checklists are archived at
`archives/2026-q2-agent-build-checklists.md`. Open items from that archive
(agent ownership model, skill live-run validation, AI Eng Build docs) roll
into Session 3 and the AI OS v2 project. Operational agent status:
`projects/master-operating-system/ai-system-registry.md`.
