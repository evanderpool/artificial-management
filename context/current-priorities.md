# Current Priorities

**Last updated:** 2026-08-05 (v1 close-out + Phase 2 restart)

## System Status

**Current phase:** Phase 2 — Launch (Q3 2026, operations mode; no week numbering)
**Overall status:** Restarted 2026-08-05 after a dark period (2026-05-20 → 2026-08-05)
**v1 build:** Complete — all 7 weekly themes delivered; retrospective in `decisions/log.md`

### What changed at restart (2026-08-05)
- Full system audit: 2.5-month gap found and documented; trackers resynced
- Ops dashboard built and deployed — `dashboard/` → GitHub Pages, daily heartbeat, registry-vs-tracker conflict detection, expert-reviewed (UX + architecture)
- Public/private split executed — resume, pricing, outreach, proposals moved to `artificial-management-private` and purged from public git history
- Config repaired — filesystem MCP path fixed, MCP versions pinned, task-complete hook scoped to this repo and de-looped
- Q2 goals + final Q2 priorities archived to `archives/`; Q3 goals live in `context/goals.md`
- Portfolio Website registered as first non-agent project in the tracker

## Top Priorities (Q3)

1. **Job applications** — 10–15/week; system + live dashboard are the proof stack
2. **Client readiness, then outreach** — client-data-handling SOP first, then 6-template outreach to 10–15 targets
3. **Session 3 credibility work** — scripts/audit.js, run log, tests + eval fixtures, skill frontmatter/versions
4. **Second AI project** — leading candidate: Supabase canonical-store migration (doubles as pgvector/RAG resume piece)
5. **Define the new project slate** — portfolio-website and LangGraph removed from the portfolio 2026-08-05; new projects to be scoped with Erick and registered in the tracker

### Immediate Next Actions

- **Verify dashboard live** — confirm GitHub Pages deploy at evanderpool.github.io/artificial-management; check heartbeat flipped to ACTIVE
- **Verify Friday briefing routine** — confirm routine trig_01Ed5upotVtnufPmQ9Fjbd17 still runs and delivers (address confirmed correct 2026-08-05)
- **Write client-data-handling SOP** — gates all client outreach; doubles as sales asset
- **Write disaster-recovery runbook** — inventory of non-repo assets (PAT, routines, connectors, local overrides)
- **Start job applications** — resume lives in private repo (`artificial-management-private/references/resume/`); add dashboard + close-out story to it first
- **Scope the new projects with Erick** — define, then register each via the tracker's How-to-Register steps

## Standing rules carried forward

- June 30 deadline is closed (see retrospective); Q3 working deadline is 2026-09-30 (`context/goals.md`)
- Dashboard heartbeat enforces liveness: QUIET at 7 days without a commit, STALE at 14
- New projects: README in `projects/<name>/` + tracker row = registered; client projects go in private per-client repos, never here
