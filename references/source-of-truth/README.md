# Source-of-Truth Tracker

**Owner:** Data Integrity Agent
**Source of truth for:** Every authoritative data source inside the Artificial Management AI operating system

---

## Purpose

This tracker is the **metadata layer** of the Artificial Management operating system. It answers one question that every agent needs before doing anything:

> *Where is the authoritative version of [fact], and is it current?*

Without this tracker, agents either guess which file to read, hardcode paths into skill files, or pull from stale sources without knowing it. All three create drift, hallucination, and broken automations — especially as the system grows.

---

## What It Is

A formal registry of every authoritative file in the system — organized by priority level, with ownership, update cadence, last-verified date, and a list of which agents depend on each source.

This is **not**:
- The AI System Registry (that catalogs agents and tools — *who* does what)
- The Project Tracker (that tracks project progress — *how far along*)
- The Change Log (that records what changed — *what happened*)
- The Decision Log (that records binding decisions — *what was decided*)

All five systems are intentionally separate and work together.

---

## Files in This Directory

| File | Description |
|---|---|
| [source-of-truth-map.md](source-of-truth-map.md) | Full catalog of all authoritative sources — organized by priority level |

---

## Priority Hierarchy

Sources are assigned a priority level (1 = highest). When two sources conflict, the lower number wins.

| Priority | Source Group | Governs |
|---|---|---|
| 1 | `context/*.md` | Erick's profile, the business, the team, current priorities, quarterly goals |
| 2 | `projects/*/README.md` | Individual project status, scope, and recent updates |
| 3 | `decisions/log.md` | Binding decisions that override other sources |
| 4 | `references/sops/` | Official process definitions and standard operating procedures |
| 5 | `projects/*/spec.md` | Agent behavior, inputs, outputs, and dependencies |
| 6 | Operational registries | Master project tracker and AI system registry |
| 7 | `/.claude/skills/*/SKILL.md` | How each skill runs step-by-step |
| 8 | Reference systems | Cost tracker, resume system, this tracker |
| 9 | Operational logs | Change log, session logs |
| 10 | Templates | Reusable document templates |

---

## Update Cadence

| Trigger | Action |
|---|---|
| New file added to the system | Add row to source-of-truth-map.md immediately |
| File moved or renamed | Update path in map and log in change log |
| File no longer authoritative | Mark Status → Archived; note what replaced it |
| End of each work session | Update Last Verified date for any files reviewed |
| Weekly integrity check | Data Integrity Agent runs a full pass and updates Status fields |

---

## Data Integrity Agent

This directory is the primary audit list for the Data Integrity Agent. See [projects/data-integrity-agent/](../../projects/data-integrity-agent/README.md) for the full agent spec and responsibilities.

During any integrity check, the Data Integrity Agent reads `source-of-truth-map.md` and verifies:
1. Every listed file exists at the stated path
2. Every listed file has been updated within its expected cadence
3. No conflicts exist between Priority 1 and Priority 2 sources
4. All Status fields are accurate
