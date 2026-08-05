# Sprint Plan — Week of 2026-05-13
**Week in 7-Week Plan:** Week 3 — Chief of Staff + Project Manager Agent
**Hard Deadline:** June 30, 2026 (~7 weeks remaining)

> **DATA INTEGRITY FLAGS (non-blocking):**
> - `projects/chief-of-staff-agent/README.md` says "Spec Complete" — tracker says "In Progress." README is stale. Needs update.
> - `projects/portfolio-agent/README.md` says "Planning" — tracker says "In Progress." README is stale. Needs update.
> *Source: cross-check of project-tracker.md vs. READMEs per Step 4 cross-check rule.*

---

### This Week's Targets
*Source: context/current-priorities.md (Week 3 targets) + project-tracker.md (unchecked deliverables)*

| Project | Deliverable | Done When | Status |
|---|---|---|---|
| Project Manager Agent | `/project-manager` skill live | Skill invocable, produces sprint plan file in `logs/sessions/`, change log updated | In Progress (this run) |
| Project Manager Agent | Sprint planning workflow active | First sprint plan produced and validated against known system state | In Progress (this run) |
| Project Manager Agent | Connected to Master Project Tracker | Sprint plan cites tracker as source; tracker updated with new status after activation | Not Started |
| Chief of Staff Agent | Weekly summary handoff test | `/weekly-exec-summary` invoked after sprint plan — output reviewed for accuracy | Not Started |
| Chief of Staff Agent | Integrated with Project Manager Agent | CoS daily brief references PM sprint plan; PM plan cites CoS priorities | Not Started |
| Master Operating System | Write 5 remaining agent specs | Spec files exist for Change Management, Cost Tracking, Portfolio, Client Services, AI Engineering Build | Not Started |

---

### Carried Over from Last Week
*Source: context/current-priorities.md (Week 2 items not completed)*

- **Master Operating System:** Cost tracker — targeted Week 2, still not built. No tracker file exists.
- **Master Operating System:** Data/source tracker — targeted Week 2, still not built. No file exists.
- **Master Operating System:** Architecture diagram — targeted Week 1–3, still not built. Source-of-truth map, agent ownership model, and data flow diagram also unchecked.

---

### Blockers
*Source: project-tracker.md + READMEs*

- (None) — all 10 projects show no documented blockers.

---

### Definition of Done

| Deliverable | Done When |
|---|---|
| `/project-manager` skill active | Skill runs, produces formatted sprint plan, saves file to `logs/sessions/`, appends to `logs/changes.md` |
| Sprint planning workflow active | This sprint plan file exists, is saved, and tracker updated with deliverables checked |
| 5 remaining agent specs | Each spec file exists at `projects/[agent]/spec.md`, follows `templates/agent-spec.md` format, registered in `ai-system-registry.md` |
| Cost tracker | File exists, lists all current tools/subscriptions with cost, referenced in `ai-system-registry.md` |
| Data/source tracker | File exists, lists all data sources and source-of-truth status, referenced in registry |
| CoS + PM integration | `/chief-of-staff` daily brief references sprint plan file by path; `/project-manager` reads CoS priorities as input |

---

### Out of Scope This Sprint
*Week 4+ items — do not start until Week 3 targets are cleared*

- Documentation Agent activation (Week 4)
- Data Integrity Agent activation (Week 4)
- Change Management Agent activation (Week 4)
- Cost Tracking Agent activation (Week 5)
- Portfolio case study publishing (Week 6)
- Client services packaging (Week 7)
