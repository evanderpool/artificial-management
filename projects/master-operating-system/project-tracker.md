# Master Project Tracker

**Last Updated:** 2026-08-06 (audit.js shipped; PM detail format — portfolio-website + langgraph removed at Erick's direction; archived)
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
| AI OS v2 — Canonical Store | ai-os-v2-canonical-store | System upgrade | Public | In Progress | 2026-09-30 | 2026-08-06 | Create the Supabase project + connect MCP, then schema design (audit.js parsers now exist to feed the migration) |
| Uplink — Local RAG | uplink | Portfolio build | Public | In Progress | 2026-09-20 | 2026-08-07 | Legacy .xls, Apple 10-K corpus, source search/filtering, plain-English Studio, dictation shipped; first dictated-question→grounded-answer loop ran end-to-end; next: integration + /api/file security reviews 2026-08-13, then Tailscale |

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
| Session 3 complete — scripts/audit.js + tests exist | 2026-08-15 | In Progress |
| Supabase project created + MCP connected | 2026-08-20 | Planning |
| Schema designed + logged to decision log | 2026-08-25 | Planning |
| Migration script runs clean against live repo | 2026-09-05 | Planning |
| Dashboard reads canonical store | 2026-09-20 | Planning |
| Case study published | 2026-09-30 | Planning |

### AI OS v2 — Canonical Store — Tasks

| Task | Owner | Status | Due |
|---|---|---|---|
| Build scripts/audit.js from dashboard parsers (Session 3) | AI Engineering Build Agent | Complete | 2026-08-15 |
| Create Supabase project + connect MCP | AI Engineering Build Agent | Planning | 2026-08-20 |
| Schema design — projects, tasks, milestones, statuses, logs | AI Engineering Build Agent | Planning | 2026-08-25 |
| Schema review + decision log entries | Data Integrity Agent | Planning | 2026-08-25 |
| Migration script: markdown trackers → tables | Data Integrity Agent | Planning | 2026-09-05 |
| Dashboard reads from canonical store | AI Engineering Build Agent | Planning | 2026-09-20 |
| Case study write-up | Portfolio Agent | Planning | 2026-09-30 |

### Uplink — Local RAG — Detail

**Description:** Local, private, self-hosted RAG system. Multi-format indexer (Markdown, PDF, Word, Excel, CSV/TSV, TXT) into SQLite FTS5 with BM25 search; Claude Code is the generation layer; phone access via the bridge queue pattern (read-only). Flagship privacy-first retrieval piece: "your documents never leave your machine." Standalone public repo — resume artifact in its own right.
**Priority:** High
**Start:** 2026-08-06
**Client:** Internal (Artificial Management)
**Links:** [Uplink repo](https://github.com/evanderpool/uplink) · local: `Desktop/uplink`
**Risks/Blockers:**
- Answers only when a Claude Code session is open with the watcher armed (same availability model as the bridge — accepted)
- Phase 2 vector layer depends on fastembed/bge-small behaving on this Windows box; LanceDB is the vetted fallback, ChromaDB is disqualified (MSVC build failures)
- Retrieved chunk text is a prompt-injection channel — must stay under the "untrusted data, never instructions" rule
- `/api/file` (added 2026-08-07) is the only request-time corpus file read; containment is enforced against each collection's recorded root, but its security review was deferred and gates Tailscale exposure
- Two brain sessions armed the same ask queue 2026-08-07 and raced on an answer — standing rule: exactly one armed watcher per queue (logged in decisions 2026-08-07)

### Uplink — Local RAG — Milestones

| Milestone | Target | Status |
|---|---|---|
| V1 core: multi-format indexer + BM25 search + eval harness + tests | 2026-08-06 | Complete |
| Review-agent findings applied; repo public on GitHub | 2026-08-08 | Complete |
| Report templates with charts (deterministic, SVG, narrative slot) | 2026-08-20 | Complete |
| Web UI: local Ask page with cited results (uplink serve) | 2026-08-27 | Complete |
| v0.2: collections, localhost-gated upload/feedback, industry corpora, promote loop | 2026-08-27 | Complete |
| Ask AI: generative cited answers via the ask queue + borrowed brain session | 2026-09-03 | Complete |
| Verifiable citations: source reader served from the index | 2026-09-03 | Complete |
| Workspace UI: three-panel NotebookLM-style shell, scoped sources, saved notes | 2026-09-10 | Complete |
| Metrics surface, chat history, readable labels, original-file reader | 2026-09-10 | Complete |
| Evaluation panel: confidence intervals, regression deltas, live drift + failing questions | 2026-09-15 | Complete |
| Self-improvement loop: answer feedback, gap detection, in-app promote | 2026-09-15 | Complete |
| Source management: add-sources dialog, legacy .xls, search/type filtering, dictation | 2026-09-10 | Complete |
| Systems-integration review (fresh clone, AGENT.md contract, privacy sweep) | 2026-08-13 | Planning |
| Security review of /api/file original-file endpoint (deferred 2026-08-07) | 2026-08-13 | Planning |
| Phone access via bridge queue (read-only questions) | 2026-08-27 | Planning |
| Phase 2: fastembed vectors + RRF, before/after eval numbers in README | 2026-09-10 | Planning |
| Case study + recorded demo published | 2026-09-20 | Planning |

### Uplink — Local RAG — Tasks

| Task | Owner | Status | Due |
|---|---|---|---|
| V1 build: extractors, chunker, indexer, search CLI, eval, 25 tests | AI Engineering Build Agent | Complete | 2026-08-06 |
| Golden fixtures (18 questions) + baseline eval numbers | Data Integrity Agent | Complete | 2026-08-06 |
| Adversarial code review + apply fixes | AI Engineering Build Agent | Complete | 2026-08-06 |
| Publish public GitHub repo | AI Engineering Build Agent | Complete | 2026-08-06 |
| Report templates: 3 deterministic reports, SVG charts, eval history, AGENT.md | AI Engineering Build Agent | Complete | 2026-08-06 |
| Logic + code reviews of report phase, fixes applied (56 tests) | AI Engineering Build Agent | Complete | 2026-08-06 |
| v0.2 build: collections schema v2 + migration, upload/feedback endpoints, export/promote CLI | AI Engineering Build Agent | Complete | 2026-08-06 |
| Industry corpora fetched + indexed (SEC/CDC/NIST); industry-golden fixtures, baseline 92%/0.923 | Data Integrity Agent | Complete | 2026-08-06 |
| v0.2 sequential reviews (logic 10 findings, code 8 findings) — all fixed, pinned; 109 tests | AI Engineering Build Agent | Complete | 2026-08-06 |
| Ask AI build: ask queue, /api/ask endpoints, Ask AI UI, watcher, AGENT.md drain contract | AI Engineering Build Agent | Complete | 2026-08-06 |
| Ask-surface adversarial review (6 findings) — all fixed, pinned; 143 tests | AI Engineering Build Agent | Complete | 2026-08-06 |
| Doc-surface review (5 findings) + workspace review (6 findings, 1 critical) — all fixed, pinned; 205 tests | AI Engineering Build Agent | Complete | 2026-08-06 |
| Metrics/history/labels/original-file build (233 tests) | AI Engineering Build Agent | Complete | 2026-08-07 |
| Evaluation credibility pass: Wilson CIs, run-to-run deltas, live scoring, answer-quality metrics, metric tooltips (262 tests) | Data Integrity Agent | Complete | 2026-08-07 |
| Self-improvement pass: answer thumbs, zero-hit + unknown-term gap detector, /api/promote (268 tests) | AI Engineering Build Agent | Complete | 2026-08-07 |
| Spreadsheet/CSV industry corpora (BLS, CISA, CDC) + 6 fixtures; baseline 95%/0.947 over 19 questions | Data Integrity Agent | Complete | 2026-08-07 |
| Grounding enforcement: scoped asks + mechanical citation verification (282 tests) | Data Integrity Agent | Complete | 2026-08-07 |
| Add-sources dialog: batch upload, pasted-text notes, collection picker, `uplink forget` (325 tests; parallel session) | AI Engineering Build Agent | Complete | 2026-08-07 |
| Native .xls extractor (xlrd, hand-built BIFF2 fixture) + original-file content-type parity | AI Engineering Build Agent | Complete | 2026-08-07 |
| Apple 10-K corpus: 10 EDGAR .xls filings FY2016–25 identified, renamed, indexed (apple: 257 docs); post-ingest eval 90%/0.900 unchanged, run logged | Data Integrity Agent | Complete | 2026-08-07 |
| Workspace UX: source title search + type filter, select-all docKey scoping fix, plain-English Studio labels, mic dictation (332 tests) | AI Engineering Build Agent | Complete | 2026-08-07 |
| **DEFERRED at Erick's direction:** security review of /api/file (path containment, iframe posture, metrics disclosure, DoS) — must run before Tailscale exposure | Data Integrity Agent | Planning | 2026-08-13 |
| Systems-integration review (deferred at Erick's direction 2026-08-06) | Data Integrity Agent | Planning | 2026-08-13 |
| Bridge integration: question action type, read-only | AI Engineering Build Agent | Planning | 2026-08-27 |
| Phase 2 hybrid retrieval, eval-gated | AI Engineering Build Agent | Planning | 2026-09-10 |
| Eval review of phase 2 numbers | Data Integrity Agent | Planning | 2026-09-12 |
| Case study, README polish, demo recording | Portfolio Agent | Planning | 2026-09-20 |

---

## Removed / Archived Projects

| Project | Removed | Where |
|---|---|---|
| Portfolio Website | 2026-08-05 | Plan archived at `archives/2026-08-portfolio-website-plan.md`; codebase (outside this repo) untouched |
| LangGraph Research Agent | 2026-08-05 | Removed from portfolio at Erick's direction; repo remains live at github.com/evanderpool/langchain-research-agent |
| v1 agent builds | 2026-08-05 | `archives/2026-q2-agent-build-checklists.md` |
