# Data Integrity Agent

Reduces hallucination and keeps all information inside the Artificial Management system consistent, current, and trustworthy.

**Status:** Active
**Deadline:** June 30, 2026
**Spec:** [spec.md](spec.md)
**Last Updated:** 2026-05-15

## Responsibilities

- Source-of-truth validation
- Conflict detection across documents
- Outdated information flagging
- Data lineage tracking
- Missing documentation detection
- Confidence scoring for system documentation

## Inputs

Project tracker, agent registry, system documentation, prompt library, change log, decision log

## Outputs

Inconsistency report, missing fields report, outdated information report, recommended corrections, confidence score

## System Context (Current as of 2026-05-16)

**Where the system stands:** Week 4 of 7 complete — transitioning to Week 5. All 9 agent specs are written. Skill is Active — `/data-integrity` live with 3 modes (full audit, quick check, conflict resolution). Source-of-Truth Map built 2026-05-15 at `references/source-of-truth/source-of-truth-map.md` — 52 sources catalogued. First full integrity audit completed 2026-05-16 — 18 issues found and corrected.

**What this agent needs to do next:** Establish weekly integrity check cadence. Integrate with Chief of Staff weekly summary workflow. Build Week 5 automation workflow tracking.

**Known open items to flag at first audit:**
- `references/sops/` is empty — no SOPs written yet (expected; Week 4 target)
- Data/source-of-truth tracker built 2026-05-15 — `references/source-of-truth/source-of-truth-map.md` — 49 sources catalogued; use as primary audit list
- AI System Registry agent statuses were stale by 1 day (Cost Tracking, Change Management, Client Services, AI Engineering Build) — corrected 2026-05-14
- Architecture diagram, source-of-truth map, agent ownership model, and data flow diagram not yet built (Master Operating System deliverables)
- Git not in system PATH — full path required: `C:\Program Files\Git\bin\git.exe`

**Key files to audit at activation:**
- `references/source-of-truth/source-of-truth-map.md` — **start here** — the primary audit list (49 sources catalogued)
- `projects/master-operating-system/ai-system-registry.md` — registry audit section
- `projects/master-operating-system/project-tracker.md` — all project statuses
- All `context/` files vs all `projects/*/README.md` files — check for conflicts
- `decisions/log.md` + `logs/changes.md` — verify all decisions have corresponding change entries

## Recent Updates

- [2026-05-13] Spec v1.0 written — `projects/data-integrity-agent/spec.md`
- [2026-05-13] AI System Registry audit section created — formal compliance checkpoint live
- [2026-05-13] Source-of-truth hierarchy documented in `.claude/rules/ai-system-standards.md`
- [2026-05-13] First integrity pass performed — no conflicts detected across all Week 1–2 builds
- [2026-05-14] Known open items updated — all 9 agent specs now written; stale registry corrected; stale items removed from this section
- [2026-05-15] Source-of-truth tracker built — `references/source-of-truth/source-of-truth-map.md`; 49 sources catalogued across 10 priority levels; added as primary audit list in Key Files to Audit section
- [2026-05-15] Skill activated — `.claude/skills/data-integrity/SKILL.md` live; 3 modes: full audit, quick check, conflict resolution; `/data-integrity` now invocable
