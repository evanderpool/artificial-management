# Artificial Management — AI Operating System

**A Fortune 500-style AI business operating system built from scratch in 7 weeks.**

10 specialized AI agents. 10 operational skills. A shared source of truth. Enterprise-grade documentation, change management, data integrity, and cost tracking — running on a solo founder's desk.

**[Read the case study →](CASE-STUDY.md)** · **[Live dashboard →](https://evanderpool.github.io/artificial-management/)**

---

## The Problem

Running a business — even a solo consulting operation — requires constant coordination across strategy, project management, documentation, data quality, and financial tracking. These functions normally require a team.

The deeper problem: AI tools are powerful in isolation but disconnected. There's no enterprise-grade system that makes them work together as a coherent team — reading the same data, using the same formats, producing outputs that feed into each other, and never losing context between sessions.

**The goal:** Design and build a complete AI operating system that works like a real company — with specialized agents in every department, working in parallel, against a single shared source of truth.

---

## What Was Built

### Agent Roster

| Agent | Role | Status |
|---|---|---|
| Chief of Staff Agent | Synthesizes priorities, produces daily briefs and weekly summaries, coordinates all agents | Active |
| Project Manager Agent | Sprint planning, deadline tracking, blocker escalation across 10 projects | Active |
| Documentation Agent | Session capture, README updates, SOP drafts | Active |
| Data Integrity Agent | Cross-document audits, confidence scoring (0–100), conflict resolution | Active |
| Change Management Agent | Append-only change logging, gap detection, orphan reference scanning | Active |
| Cost Tracking Agent | Monthly spend reports, waste flags, pricing recommendations | Active |
| Portfolio Agent | Resume bullets, case studies, LinkedIn posts, interview stories | In Progress |
| Client Services Agent | Service packages, discovery scripts, proposal drafts | Spec Complete |
| AI Engineering Build Agent | Architecture design, tool evaluation, integration specs | Spec Complete |
| Master Operating System | Central system connecting all agents, documents, and workflows | In Progress |

### System Architecture

```mermaid
graph TD
    EW[Erick / Claude Code] --> COS[Chief of Staff Agent]
    EW --> PM[Project Manager Agent]

    COS --> DA[Documentation Agent]
    COS --> DIA[Data Integrity Agent]
    COS --> CMA[Change Management Agent]
    COS --> CTA[Cost Tracking Agent]

    subgraph Source of Truth
        CTX[context/]
        PROJ[projects/]
        LOGS[logs/]
        DEC[decisions/log.md]
    end

    DA --> LOGS
    DIA --> CTX
    DIA --> PROJ
    CMA --> LOGS
    CMA --> DEC
    CTA --> REF[references/cost-tracker/]

    COS --> WB[Weekly Briefing\nEvery Friday 5pm ET]
    WB --> GMAIL[artifical.management@gmail.com]
```

### Automation Workflows

| Workflow | Trigger | Output |
|---|---|---|
| Weekly Executive Briefing | Every Friday 5pm ET — automated cron routine | Gmail draft with 8-section executive summary |
| Daily Brief | On demand — `/chief-of-staff` | Session file + inline brief |
| Sprint Planning | On demand — `/project-manager` | Sprint plan saved to `logs/sessions/` |
| Data Integrity Audit | On demand — `/data-integrity` | Audit report with confidence scores per document |
| Session Close | After any work session — `/work-session-to-docs` | Session log, change log, decision log all updated |
| Cost Report | On demand — `/cost-tracking` | Monthly spend report with waste flags and pricing rec |
| Documentation | On demand — `/documentation` | Session summary, README update, or SOP draft |
| Change Review | On demand — `/change-management` | Gap report, orphan reference flags, decision audit |

---

## How It Works

Every agent operates through **Claude Code skills** — structured, reusable workflows defined in `.claude/skills/`. When invoked, a skill reads from the shared source of truth (context files, logs, project READMEs), performs its function, and writes its outputs back into the system. All agents share the same data layer. Nothing is siloed.

**The data flow:**

```
context/current-priorities.md  ─┐
context/goals.md                ├──► Chief of Staff Agent ──► Weekly Summary ──► Gmail
projects/*/README.md            ─┘                        ──► Daily Brief
                                                          ──► Next Actions

projects/*/README.md            ─┐
references/source-of-truth/     ├──► Data Integrity Agent ──► Audit Report ──► Corrections
decisions/log.md                ─┘                        ──► Confidence Scores

logs/changes.md                 ─┐
decisions/log.md                ├──► Change Management Agent ──► Gap Report
projects/*/spec.md              ─┘                           ──► Orphan Flags

references/cost-tracker/        ────► Cost Tracking Agent ──► Monthly Spend Report
                                                          ──► Pricing Recommendations

logs/sessions/ (milestones)     ─┐
decisions/log.md                ├──► Portfolio Agent ──► Resume Bullets
projects/*/spec.md              ─┘                  ──► Case Studies ──► LinkedIn Posts
```

**Change management** is enforced at every layer:
- All decisions log to `decisions/log.md` (append-only, never edited)
- All file changes log to `logs/changes.md` (append-only, never edited)
- Every session closes with `/work-session-to-docs`, which updates 6 tracking files in sequence
- The Data Integrity Agent audits for conflicts, stale fields, and missing links across all documents

---

## Results (Week 5 of 7)

| Metric | Value |
|---|---|
| Agents designed and documented | 10 / 10 |
| Agents fully Active | 6 / 10 |
| Claude Code skills operational | 8 |
| Source files catalogued (source-of-truth map) | 52 |
| Decisions logged | 90+ |
| System changes logged | 170+ |
| Session logs produced | 16+ |
| Integrity issues caught and corrected (first audit) | 18 |
| Formal SOPs written | 3 |
| Monthly tool cost baseline | ~$47/mo |
| Weekly briefing automation | Live — first run 2026-05-22 |
| Resume version | v1.2 — AI OS featured project |

---

## Tech Stack

| Layer | Tools |
|---|---|
| AI runtime | Claude Code, Claude Sonnet 4.6, Anthropic API (pay-per-use) |
| MCP integrations | Gmail, Google Calendar, Google Drive, GitHub, Filesystem/Local, Microsoft 365 |
| Version control | Git + GitHub |
| Dev environment | VS Code, Windows 11 |
| Automation | Claude Code Remote Routine (cron-triggered cloud agent) |
| Documentation | Markdown — all system docs, specs, SOPs, logs, and trackers |

---

## Project Structure

```
EA Agent/
├── CLAUDE.md                        # Master brain — operating instructions for all agents
├── context/                         # Who, business, team, priorities, goals
├── projects/                        # 10 active workstreams — each has README + spec
│   ├── master-operating-system/
│   ├── chief-of-staff-agent/
│   ├── project-manager-agent/
│   ├── documentation-agent/
│   ├── data-integrity-agent/
│   ├── change-management-agent/
│   ├── cost-tracking-agent/
│   ├── portfolio-agent/
│   ├── client-services-agent/
│   └── ai-engineering-build-agent/
├── .claude/
│   ├── skills/                      # 8 Claude Code skills — reusable agent workflows
│   └── rules/                       # AI system standards + communication style
├── references/
│   ├── resume/                      # v1.2 active — AI OS as top project
│   ├── cost-tracker/                # Monthly spend tracker
│   ├── source-of-truth/             # 52 authoritative sources catalogued
│   └── sops/                        # 3 formal SOPs (briefing, data integrity, change mgmt)
├── decisions/
│   └── log.md                       # Append-only binding decision log
├── logs/
│   ├── changes.md                   # Append-only change log (170+ entries)
│   └── sessions/                    # Dated session logs and weekly summaries
└── templates/                       # Reusable output templates
```

---

## Skills Reference

| Skill | Invoke | What It Does |
|---|---|---|
| `/chief-of-staff` | `/chief-of-staff` | Reads all 10 project READMEs + logs → produces daily brief |
| `/project-manager` | `/project-manager [sprint\|status\|blockers]` | Sprint planning, status check, or blocker review |
| `/weekly-exec-summary` | `/weekly-exec-summary` | Generates 8-section weekly brief → saves file + creates Gmail draft |
| `/work-session-to-docs` | `/work-session-to-docs` | Closes any session → updates session log, change log, decision log, README, tracker, registry |
| `/documentation` | `/documentation [session\|readme\|sop]` | Session summary, README update, or SOP draft |
| `/data-integrity` | `/data-integrity [full\|quick\|resolve]` | Document audit with confidence scoring (0–100) |
| `/change-management` | `/change-management [log\|review\|flag]` | Log changes, review for gaps, or flag a topic |
| `/cost-tracking` | `/cost-tracking [monthly-report\|add-tool]` | Monthly spend report or log a new tool |

---

## Build Timeline

| Week | Theme | Status |
|---|---|---|
| 1–2 | Foundation + Tracking | Complete |
| 3 | Chief of Staff + Project Manager | Complete |
| 4 | Documentation + Data Integrity + Change Management | Complete |
| 5 | First Working Automation Workflow | Complete |
| 6 | Portfolio Case Study + Resume Assets | In Progress |
| 7 | Client Offer + AI Engineer Job Positioning | Upcoming |

**Hard deadline:** June 30, 2026

---

## About

Built by **Erick Vanderpool** — Data Analyst, AI Engineer, and founder of **Artificial Management**.

Artificial Management helps small, medium, and enterprise teams organize data, automate operations, and build AI-powered systems that reduce manual work and improve decision-making.

This system is both the product and the proof — designed to demonstrate enterprise-grade AI engineering capability for job search and client acquisition simultaneously.

**Services:** Data Management · SQL / Database Support · Access Control Systems · AI Automation · AI Engineering · Small Business Automation

---

*Built with [Claude Code](https://claude.ai/code) · Powered by Anthropic Claude Sonnet 4.6*
