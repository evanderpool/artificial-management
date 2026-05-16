# Demo Script — Artificial Management AI Operating System

**Status:** Draft — Week 6
**Owner:** Portfolio Agent
**Last Updated:** 2026-05-16
**Use for:** Recruiter technical screens · Client discovery calls · Portfolio presentations

---

## Overview

Two versions of the same demo — one for AI engineering recruiters, one for potential clients. The underlying system is identical. The framing, emphasis, and pace are completely different.

**GitHub README:** github.com/evanderpool (have this open before starting)
**Repo root:** EA Agent folder in VS Code

---

## Version 1 — Recruiter / Technical Screen (4–5 minutes)

> Goal: Show you built a real, production-grade multi-agent system — not a toy. Get to a technical deep-dive.

---

### Opening (30 seconds)

> "I built a 10-agent enterprise AI operating system over the last 5 weeks. The goal was to design something that runs like a real company — departments, agents, formal governance, and shared data layer — using Claude Code and MCP server integrations. Let me show you how it's structured and walk you through a few key moments."

*Open the GitHub README. Let the architecture diagram sit on screen for a beat.*

---

### The Architecture (60 seconds)

> "The system has three layers.

> The top layer is 10 specialized agents — each one has a formal spec: purpose, inputs, outputs, tool dependencies, success criteria. No undocumented agents anywhere in the system. The specs enforce a governance contract before anything gets built.

> The middle layer is 8 Claude Code skills — these are the runnable workflows. Each skill reads from a shared source of truth and writes structured outputs back. They're designed so agents share a data contract without hardcoded coupling. For example, the Chief of Staff reads the Project Manager's sprint output as its primary source for next-action directives — but that link is implemented as a skill-level step reference, not a function call or database join.

> The bottom layer is the shared data layer — context files, project READMEs, decision log, change log, and the AI System Registry. Every agent reads from the same files. Nothing is siloed."

*Scroll slowly through the data flow section of the README as you talk.*

---

### The Cron Automation (60 seconds)

> "The flagship automation is a weekly executive briefing that runs on a cron every Friday at 5pm ET. It's a remote cloud routine — it clones the GitHub repo, reads from the live source files, runs the Chief of Staff agent workflow, generates an 8-section executive summary, and delivers a Gmail draft to the Artificial Management inbox. Zero manual work.

> The reason I built this as a cron rather than just an on-demand skill is that it demonstrates the system is actually running — not just available to run. A scheduled agent that reads from a live repo and writes to Gmail is a different class of reliability than something that only works when someone types a command."

*If live: show the Gmail draft that was delivered. If not live: show the weekly-exec-summary skill in the SKILL.md file.*

---

### The Data Integrity Engine (60 seconds)

> "One of the things I'm most proud of is the data integrity layer. There's a `/data-integrity` skill that audits all 52 source documents, applies confidence scoring from 0 to 100 per document, and flags conflicts — for example, if the AI System Registry says an agent is Active but the project README still says Spec Complete. The first run caught 18 issues across 27 files.

> This is essentially an eval pipeline for the system's own documentation. The reason it matters is that multi-agent systems degrade when agents read from inconsistent state. If the Chief of Staff is making decisions based on a stale priority file, every downstream output is wrong. The integrity engine closes that loop."

*Show a snippet of the data integrity audit output or the SKILL.md file.*

---

### Results + Positioning (60 seconds)

> "At the end of 5 weeks: 6 active agents, 8 production skills, 6 MCP server integrations, 52 source files catalogued, 90+ decisions logged, 170+ change log entries, and a live cron automation running every Friday.

> What I want you to take away is the pattern — not just the specific system. I designed this the way I'd design any production agent system: formal specs before building, shared data contracts between agents, eval-driven quality checks, append-only audit logs, and automated delivery as the proof of production status. That pattern scales to whatever you're building."

---

### Technical Deep-Dive Offer

> "I'm happy to go deeper on any layer — the MCP integration and PAT storage pattern, the skill architecture and how I handle context passing between agents, the confidence scoring logic in the integrity engine, or the cron setup. What's most relevant to what your team is working on?"

---

---

## Version 2 — Client Discovery Call (7–10 minutes)

> Goal: Make the prospect feel the pain of running without this. Show that it exists and works. Open the door to a scoped proposal.

---

### Opening — Their Problem First (90 seconds)

> "Before I show you anything — I want to ask you something. Think about the last time you needed to know the answer to one of these questions:

> What did we actually finish last week? What changed in our systems in the last 30 days and why? Are we on track for our goals this quarter — and how do we know? What's costing us money that we forgot we were paying for?

> For most small and mid-size businesses, those questions either go unanswered, or someone has to go digging through emails and spreadsheets to piece together the answer. And by the time they find it, two more things have changed.

> That's the problem this system solves. Let me show you what it looks like when your operations run on a real system instead of tribal knowledge."

---

### The Weekly Briefing (2 minutes)

> "Every Friday at 5pm, this system sends an executive briefing to my inbox. I don't do anything. It runs automatically.

> The briefing has 8 sections: what got done this week, what changed, what decisions were made, what's blocked, what's coming next, system health, portfolio wins, and a preview of next week. Every fact in the briefing cites the file it came from. Nothing is made up.

> For a business owner, this replaces a Friday team standup, a status report, and a 'catch me up' conversation with every person on your team — all in one email you can read in 5 minutes."

*Show the Gmail draft or the weekly summary file if available.*

---

### The Agents (2 minutes)

> "The system runs 10 specialized agents — think of them as department heads who never miss a meeting and never forget anything.

> The Chief of Staff synthesizes everything and tells you what matters most. The Project Manager tracks every open workstream, deadline, and blocker. The Documentation Agent writes up everything that happened so your team doesn't have to. The Data Integrity Agent checks that all your records are consistent — no conflicting information, no stale data. The Change Management Agent keeps an append-only log of every decision and every system change.

> Each agent has a formal job description: what it does, what it reads, what it produces, and what it depends on. When you bring a new person into your business, they can read the agent specs and understand how the whole operation works in 20 minutes."

---

### The Audit Trail (90 seconds)

> "Here's what most businesses don't have: a real audit trail.

> This system maintains an append-only decision log — every meaningful decision your business makes gets recorded with the reasoning and context. It also maintains a change log — every time something in your systems changes, it's logged. Over 90 decisions and 170 changes tracked since we started.

> This is what enterprise companies pay lawyers and operations managers to maintain. We automate it."

*Show the decisions/log.md or changes.md file briefly.*

---

### What This Costs to Build vs. Run (90 seconds)

> "The tool stack to run something like this costs about $47 a month at baseline — that's Claude Pro, a Google Workspace account, and GitHub. The Anthropic API adds a variable cost depending on how much it runs.

> What it replaces is the cost of an operations manager, a project coordinator, a weekly status meeting, and the mental overhead of tracking everything yourself.

> For a small business, we typically scope this as a custom build — I design the agent roster for your specific operations, configure the workflows, connect your existing tools, and hand you a running system with documentation. Then you own it."

---

### Close — What Working Together Looks Like (60 seconds)

> "The way I work with clients starts with a discovery call where I map your current operations — what tools you use, what's manual, where things fall through the cracks. From there I put together a scope and a proposal.

> Most small business builds take 4–8 weeks depending on complexity. You walk away with a running system, formal documentation for every workflow, and the skills to maintain it without needing a developer on call.

> The question I always start with is: what's the one operational problem that costs you the most time or stress every week? That usually tells me everything I need to know about where to start."

---

---

## Common Questions — Both Audiences

**"Is this just ChatGPT?"**
> "No — this uses Claude Code, which is an agentic AI environment built specifically for running structured workflows against file systems and external APIs. The difference between a chatbot and what I built is the same difference between asking someone a question and hiring them full-time with a job description and access to all your systems."

**"How does it know what's accurate?"**
> "The system reads from files I control — context files, project READMEs, logs. It doesn't hallucinate because it cites every fact it produces back to a source file. The data integrity agent also audits for conflicts so if two files disagree, it flags it before any agent acts on the wrong information."

**"Could this work for my business?"**
> "Yes — the agent roster and workflow design change based on your operations, but the underlying pattern is the same: specialized agents reading from a shared source of truth, automated delivery, and an audit trail. The first thing I'd do is a discovery session to map what you actually need."

**"What happens if it makes a mistake?"**
> "The system is designed with human-in-the-loop checkpoints — it drafts, it flags, it suggests. It doesn't send emails, delete files, or make irreversible decisions without approval. The append-only logs mean nothing can be silently overwritten — every change is traceable."

**"How long did this take to build?"**
> "5 weeks of evenings and weekends. The upfront investment is in the design and documentation — once the specs are written and the skills are built, the system runs itself."

---

## What to Have Open Before Any Demo

- [ ] GitHub README (github.com/evanderpool) — start here for visual context
- [ ] A recent Gmail draft from the weekly briefing (if available)
- [ ] The `logs/changes.md` file — shows real activity volume
- [ ] The `decisions/log.md` file — shows governance rigor
- [ ] One skill file (e.g., `.claude/skills/chief-of-staff/SKILL.md`) — shows the depth of a single workflow
- [ ] VS Code with the EA Agent folder open — shows the real project structure

---

## Timing Reference

| Version | Section | Time |
|---|---|---|
| Recruiter | Opening | 0:30 |
| Recruiter | Architecture | 1:30 |
| Recruiter | Cron automation | 2:30 |
| Recruiter | Data integrity | 3:30 |
| Recruiter | Results + positioning | 4:30 |
| Recruiter | Deep-dive offer | 5:00 |
| Client | Opening — their problem | 1:30 |
| Client | Weekly briefing | 3:30 |
| Client | The agents | 5:30 |
| Client | Audit trail | 7:00 |
| Client | Cost | 8:30 |
| Client | Close | 9:30 |
