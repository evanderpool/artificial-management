# Agent Build Checklists — v1 (Q2 2026)

**ARCHIVED 2026-08-05** — the per-agent deliverables checklists from the v1
build, removed from the Master Project Tracker when it was restructured into a
project portfolio (agents are departments, not projects — their operational
status lives in `ai-system-registry.md`). Unchecked items here are open
backlog, not lost work: agent ownership model, skill live-run validation
(now Session 3 eval work), and AI Engineering Build Agent docs.

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
