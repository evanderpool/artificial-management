# SOP: Weekly Executive Briefing System

**SOP ID:** sop-weekly-briefing
**Version:** 1.0
**Owner:** Chief of Staff Agent
**Last Updated:** 2026-05-16
**Status:** Active

---

## Purpose

Define how the Artificial Management Weekly Executive Briefing System operates — what triggers it, what it reads, what it produces, and how output is delivered. This SOP governs both the automated routine and the manual invocation path.

---

## Trigger

| Trigger Type | Description |
|---|---|
| Automated | Every Friday at 5pm ET (9pm UTC) — remote routine `trig_01Ed5upotVtnufPmQ9Fjbd17` runs against the live GitHub repo |
| Manual | Erick invokes `/weekly-exec-summary` in Claude Code at any time |

---

## Inputs

| Source File | What It Provides |
|---|---|
| `context/current-priorities.md` | Current sprint week, system status, top 5 priorities, immediate next actions |
| `context/goals.md` | 7-sprint plan, current sprint theme, next sprint theme, June 30 deadline |
| `projects/master-operating-system/project-tracker.md` | All 10 project statuses, blockers, deadline tracker |
| `logs/changes.md` | All system changes — filtered for current calendar week |
| `decisions/log.md` | All binding decisions — filtered for current calendar week |
| `logs/sessions/` | Session logs from current week — used to extract deliverables, portfolio flags, blockers |

---

## Process

| Step | Action | Owner |
|---|---|---|
| 1 | Read context/current-priorities.md + context/goals.md | Chief of Staff Agent |
| 2 | Read project-tracker.md — extract all 10 project statuses and deadline tracker | Chief of Staff Agent |
| 3 | Scan logs/changes.md — filter entries dated this calendar week | Chief of Staff Agent |
| 4 | Scan decisions/log.md — filter entries dated this calendar week | Chief of Staff Agent |
| 5 | Read all session logs from this calendar week | Chief of Staff Agent |
| 6 | Determine overall status: On Track / At Risk / Behind | Chief of Staff Agent |
| 7 | Fill out the 8-section weekly summary template | Chief of Staff Agent |
| 8 | Save to logs/sessions/YYYY-MM-DD-weekly-summary.md | Chief of Staff Agent |
| 9 | Append entry to logs/changes.md | Chief of Staff Agent |
| 10 | Create Gmail draft to artifical.management@gmail.com | Chief of Staff Agent via Gmail MCP |
| 11 | Prompt Erick: do priorities need updating in context/current-priorities.md? | Chief of Staff Agent |

---

## Outputs

| Output | Destination | Format |
|---|---|---|
| Weekly summary file | `logs/sessions/YYYY-MM-DD-weekly-summary.md` | Markdown |
| Gmail draft | artifical.management@gmail.com | Email with 8-section summary as body |
| Change log entry | `logs/changes.md` | Append-only entry |

**Subject line format:** `[Artificial Management] Weekly Brief — Week N | YYYY-MM-DD`

---

## Output Structure (8 Sections)

1. **Week Snapshot** — Status (On Track / At Risk / Behind), reason, weeks remaining
2. **What Got Done This Week** — Deliverables with source file citations
3. **What Changed This Week** — Decisions made (count + summaries), system changes (count + summaries)
4. **What's Blocked** — Any project with Blocked status; if none: "(None this week)"
5. **What's Next** — Top 3–5 priorities for the coming week, with owner
6. **System Health** — Agents registered, Active count, skills count, projects on track, blockers, data integrity status
7. **Portfolio Flags** — Resume-worthy wins, suggested asset type (resume bullet / case study / LinkedIn post)
8. **Next Week Preview** — Sprint theme from goals.md, key deliverables due

---

## Owner

**Primary:** Chief of Staff Agent
**Backup:** Erick Vanderpool (manual run via `/weekly-exec-summary`)

---

## Success Criteria

- [ ] Summary produced every Friday (automated) or at end of every sprint week (manual)
- [ ] All 8 sections populated — no placeholder text remaining
- [ ] Every fact cites its source file
- [ ] Gmail draft created and visible in Erick's drafts folder
- [ ] Summary file saved to logs/sessions/ and change log updated
- [ ] Overall status (On Track / At Risk / Behind) is accurate and reasoned

---

## Related Files

- Skill: `.claude/skills/weekly-exec-summary/SKILL.md`
- Template: `templates/weekly-exec-summary.md`
- Automated routine: `trig_01Ed5upotVtnufPmQ9Fjbd17` (view at claude.ai/code/routines)
- Output directory: `logs/sessions/`
