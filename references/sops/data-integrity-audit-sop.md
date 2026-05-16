# SOP: Data Integrity Audit

**SOP ID:** sop-data-integrity-audit
**Version:** 1.0
**Owner:** Data Integrity Agent
**Last Updated:** 2026-05-16
**Status:** Active

---

## Purpose

Define how data integrity audits are conducted across the Artificial Management operating system — what triggers an audit, what is checked, how findings are scored, and what constitutes a resolved issue. Prevents system drift, hallucination, and conflicting information across agents and documents.

---

## Trigger

| Trigger Type | When to Run |
|---|---|
| Weekly (standard) | At the start of each new sprint week — before any new builds begin |
| After any bulk edit | Any session where 5+ files are changed |
| Before a weekly summary | Run quick check before producing the weekly briefing |
| After a new agent or skill is built | Validate all registry/README/spec fields are synchronized |
| On demand | Erick invokes `/data-integrity` or `/data-integrity quick-check` |

---

## Inputs

The audit reads from the **Source-of-Truth Map** at `references/source-of-truth/source-of-truth-map.md` as its primary audit list.

| Priority | Sources Checked |
|---|---|
| Priority 0 | System config files (CLAUDE.md, rules, .mcp.json) |
| Priority 1 | context/*.md — Erick's profile, business, team, priorities, goals |
| Priority 2 | projects/*/README.md — all 10 project READMEs |
| Priority 3 | decisions/log.md |
| Priority 4 | references/sops/ |
| Priority 5 | projects/*/spec.md — all agent specs |
| Priority 6 | Operational registries (project-tracker.md, ai-system-registry.md) |
| Priority 7 | .claude/skills/*/SKILL.md |
| Priority 8 | references/ — cost tracker, resume, source-of-truth |
| Priority 9 | logs/ — change log, session logs |
| Priority 10 | templates/ |

---

## Process

| Step | Action | Mode |
|---|---|---|
| 1 | Read source-of-truth-map.md — identify all files to audit | Full + Quick |
| 2 | Read all Priority 1 context files | Full + Quick |
| 3 | Read all Priority 2 project READMEs | Full |
| 4 | Read all Priority 5 agent specs | Full |
| 5 | Read Priority 6 operational registries | Full + Quick |
| 6 | Cross-check: every agent's status must match across README, spec, registry, and tracker | Full + Quick |
| 7 | Cross-check: every decision in decisions/log.md must have a corresponding change log entry | Full |
| 8 | Cross-check: every file in source-of-truth-map.md must exist at its stated path | Full |
| 9 | Flag any field that is stale (not updated in 2+ sessions), missing, or conflicting | Full + Quick |
| 10 | Assign confidence scores (0–100) to each document | Full |
| 11 | Produce integrity report with Critical / Warning / Info tiering | Full |
| 12 | Save report to logs/sessions/YYYY-MM-DD-integrity-report.md | Full |
| 13 | Append entry to logs/changes.md | Full + Quick |

---

## Confidence Scoring

| Score | Meaning |
|---|---|
| 100 | Healthy — no issues found |
| 90–99 | Minor issues — warnings only; no critical conflicts |
| 75–89 | Needs attention — at least one warning affecting this document |
| Below 75 | Problematic — critical conflict present; do not use until resolved |

**Deduction rules:**
- −15 per critical conflict (status mismatch between two authoritative sources)
- −10 per stale field (date not updated in 2+ sessions)
- −5 per missing optional field (e.g., Last Updated header)

---

## Issue Tiers

| Tier | Definition | Response Required |
|---|---|---|
| Critical | Two authoritative sources directly contradict each other (e.g., registry says Active, README says Spec Complete) | Fix before any new builds; do not proceed |
| Warning | Stale data, missing optional fields, spec/README not in sync with a lower-priority source | Fix within the same session |
| Info | Future gaps, planned items not yet built, minor format inconsistencies | Log and resolve within the sprint |

---

## Outputs

| Output | Destination | Format |
|---|---|---|
| Integrity report (full audit) | `logs/sessions/YYYY-MM-DD-integrity-report.md` | Markdown with Critical / Warning / Info tables + Confidence Scores |
| Quick check findings | Inline in chat — not saved to file | Plain text |
| Change log entry | `logs/changes.md` | Append-only |

---

## Conflict Resolution Rule

When two sources conflict, the **higher-priority source wins** (lower Priority number = higher authority):

`context/` files > project READMEs > decisions/log.md > SOPs > agent specs > registries > skills

Flag the conflict explicitly before resolving it. Never silently pick one source over another.

---

## Owner

**Primary:** Data Integrity Agent
**Invoked by:** Erick Vanderpool, Chief of Staff Agent (weekly), Documentation Agent (pre-check)

---

## Success Criteria

- [ ] Full audit run at the start of each sprint week
- [ ] Zero critical conflicts unresolved for more than one session
- [ ] All documents reach confidence score ≥ 90 after corrections
- [ ] Audit report saved and change log entry appended
- [ ] Source-of-truth map updated when new files are added to the system

---

## Related Files

- Skill: `.claude/skills/data-integrity/SKILL.md`
- Source-of-truth map: `references/source-of-truth/source-of-truth-map.md`
- Audit log: `logs/sessions/` (all files ending in `-integrity-report.md`)
- Standards: `.claude/rules/ai-system-standards.md`
