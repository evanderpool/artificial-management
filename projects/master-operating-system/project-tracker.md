# Master Project Tracker

**Last Updated:** 2026-08-05 (v1 close-out + Phase 2 restart)
**Owner:** Erick Vanderpool
**Source of truth for:** All 10 active Artificial Management project workstreams

Update this file after every work session. If a project has no update for 2+ sessions, flag it as STALE.

---

## Status Legend

| Status | Meaning |
|---|---|
| Planning | Defined but not yet started |
| Spec Complete | Agent spec written — ready to build |
| In Progress | Active work underway |
| Blocked | Cannot proceed — blocker documented |
| Complete | All deliverables done |
| STALE | No update in 2+ sessions — needs review |

---

## Project Tracker

| Project | Agent ID | Status | Week Target | Deadline | Last Updated | Blockers | Next Action |
|---|---|---|---|---|---|---|---|
| Master Operating System | master-operating-system | Active | v1 complete | — | 2026-08-05 | None | Operate: heartbeat live via dashboard; next audit per Q3 plan |
| Chief of Staff Agent | chief-of-staff-agent | Active | Week 3 | 2026-06-30 | 2026-05-16 | None | Daily brief + weekly summary running; monitor Week 7 sprint |
| Project Manager Agent | project-manager-agent | Active | Week 3 | 2026-06-30 | 2026-05-16 | None | Sprint plan active — Week 7 targets set 2026-05-16 |
| Documentation Agent | documentation-agent | Active | Week 4 | 2026-06-30 | 2026-05-15 | None | Run /documentation live; validate session summary, README update, and SOP draft modes |
| Data Integrity Agent | data-integrity-agent | Active | Week 4 | 2026-06-30 | 2026-05-15 | None | Run /data-integrity full audit; validate confidence scoring output |
| Change Management Agent | change-management-agent | Active | Week 4 | 2026-06-30 | 2026-05-15 | None | Run /change-management review to validate gap detection; integrate with session close workflow |
| Cost Tracking Agent | cost-tracking-agent | Active | Week 5 | 2026-06-30 | 2026-05-16 | None | Monthly report + API tracking live; confirm 4 tool actuals by 2026-05-20 |
| Portfolio Agent | portfolio-agent | Active | v1 complete | — | 2026-08-05 | None | Add ops dashboard + LangGraph project to case study; resume refresh in private repo |
| Client Services Agent | client-services-agent | Active | v1 complete | — | 2026-08-05 | None | Write client-data-handling SOP before first outreach; packages/proposal now in private repo |
| AI Engineering Build Agent | ai-engineering-build-agent | Active | v1 complete | — | 2026-08-05 | None | Architecture diagram + dashboard delivered 2026-08-05; next: scripts/audit.js (Session 3) |
| Portfolio Website | portfolio-website | In Progress | Phase 2 | 2026-09-30 | 2026-08-05 | Awaiting project data + decisions | Contact form UI, social links, project questionnaire (see projects/portfolio-website/README.md) |

---

## Deliverables Checklist by Project

### Master Operating System
- [x] CLAUDE.md master brain
- [x] All 5 context files
- [x] 10 project READMEs
- [x] 2 rule files (communication-style, ai-system-standards)
- [x] work-session-to-docs skill
- [x] Decision log, change log, session log
- [x] Agent Spec Template
- [x] Master Project Tracker (this file)
- [x] AI System Registry
- [x] Weekly Executive Summary template
- [x] Weekly Executive Summary skill
- [x] Architecture diagram — dashboard explainer SVG + README Mermaid (2026-08-05)
- [x] Source-of-truth map
- [ ] Agent ownership model
- [x] Data flow diagram — README data-flow section + dashboard architecture SVG (2026-08-05)
- [x] Master dashboard — dashboard/ static generator, GitHub Pages, daily heartbeat (2026-08-05)

### Chief of Staff Agent
- [x] Project README
- [x] Agent spec (v1.0)
- [x] Prompt tested and validated — /chief-of-staff skill built and first brief produced 2026-05-13
- [x] Daily brief workflow active — reads all 10 READMEs + logs; outputs to file + chat
- [x] Weekly summary workflow active — /weekly-exec-summary skill live; CoS reads weekly summary from session logs
- [x] Integrated with Project Manager Agent — CoS Step 6 reads PM sprint plan as primary source for Next Actions

### Project Manager Agent
- [x] Project README
- [x] Agent spec (v1.0)
- [x] Prompt tested and validated
- [x] Sprint planning workflow active
- [x] Connected to Master Project Tracker — Step 8.5 added to PM skill; updates tracker Last Updated + Deadline Tracker dates after each run

### Documentation Agent
- [x] Project README
- [x] Agent spec (v1.0)
- [x] /documentation skill built — `.claude/skills/documentation/SKILL.md` — 3 modes (session summary, README update, SOP draft) — 2026-05-15; status corrected In Progress → Active 2026-05-15
- [ ] Skill validated with live run
- [ ] SOP template created
- [ ] Portfolio case study template created

### Data Integrity Agent
- [x] Project README
- [x] Agent spec (v1.0)
- [x] /data-integrity skill built — `.claude/skills/data-integrity/SKILL.md` — 3 modes (full audit, quick check, conflict resolution); 10-step workflow; confidence scoring (0–100) — 2026-05-15
- [ ] Skill validated with live run
- [ ] Weekly integrity check workflow active

### Change Management Agent
- [x] Project README
- [x] Agent spec (v1.0)
- [x] /change-management skill built — `.claude/skills/change-management/SKILL.md` — 3 modes (log changes, review, flag [topic]); append-only change log enforcement; gap/orphan detection; cross-document reference scan — 2026-05-15
- [ ] Skill validated with live run
- [ ] Change log review workflow active

### Cost Tracking Agent
- [x] Project README
- [x] Agent spec (v1.0)
- [x] Tool cost tracker created (references/cost-tracker/) — 2026-05-13
- [x] API cost tracking active — Anthropic API added to tracker 2026-05-16 (pay-per-use)
- [x] Monthly spend report workflow — /cost-tracking skill monthly-report mode live 2026-05-16

### Portfolio Agent
- [x] Project README
- [x] Agent spec (v1.0)
- [x] Resume bullets generated (first set) — v1.3 produced 2026-05-16; estimated 72–76/100
- [x] First portfolio case study published — case-study-draft.md created 2026-05-16
- [x] GitHub README written — README.md at repo root 2026-05-16; Mermaid architecture diagram included
- [x] LinkedIn post drafted — linkedin-post-draft.md created 2026-05-16; 3 alternate hooks included
- [x] Demo script written — demo-script.md; recruiter (4–5 min) + client (7–10 min) versions
- [x] Client proof statement written — client-proof-statement.md; 4 variants (one-liner, short, standard, extended)

### Client Services Agent
- [x] Project README
- [x] Agent spec (v1.0)
- [x] Service packages defined — 2026-05-16 (4 tiers; now in private repo)
- [x] Discovery call script written — 2026-05-16 (`references/sops/discovery-call-script.md`)
- [x] Proposal template created — 2026-05-16 (now in private repo)
- [x] Outreach messages drafted — 2026-05-16 (6 variants; now in private repo)
- [ ] Client data handling SOP (required before first outreach)

### AI Engineering Build Agent
- [x] Project README
- [x] Agent spec (v1.0)
- [ ] System architecture diagram
- [ ] Data flow diagram
- [ ] Tool selection rationale documented
- [ ] MCP server integration guide
- [ ] Testing checklist created

---

## v1 Build — Complete (archived)

The 7-week v1 build (2026-05-13 → 2026-05-17) is closed: all 7 weekly themes
delivered, ahead of schedule. Retrospective in `decisions/log.md` (2026-08-05).
Current deadlines live in `context/goals.md` (Q3) — this file no longer tracks
a build calendar; per-project deadlines are in the tracker table above.

| Week | Theme | Status |
|---|---|---|
| Weeks 1–7 | Foundation → Client Offer (full plan in `archives/2026-q2-goals.md`) | Complete |
