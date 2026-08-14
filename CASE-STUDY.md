# Artificial Management: an AI operating system that runs like a company

**A solo operator's business, run the way a Fortune 500 runs departments — by
ten specialized AI agents working against one governed source of truth, with
every decision logged, every change tracked, and a public dashboard that
proves the system is alive.**

Built and directed by **Erick Vanderpool** ·
[repository](https://github.com/evanderpool/artificial-management) ·
[**live dashboard →**](https://evanderpool.github.io/artificial-management/)

| 10 | 10 | 88 | 317 | $0 |
|---|---|---|---|---|
| specialized agents, each with a written spec | operational skills (reusable workflows) | decisions in an append-only log | changes tracked in the change log | per month to host — the whole system is markdown, git, and a static page |

---

## The problem

A solo business has the same moving parts as a large one — strategy, project
management, documentation, data quality, change control, cost tracking — but
one person doing all of it. AI can do real work in every one of those
functions, but AI work has a failure mode of its own: **it evaporates.** A
session produces something useful, the session ends, and a week later nobody —
human or AI — can say what was built, what changed, what's current, and what's
stale. Tools that are individually powerful stay collectively amnesiac.

The premise of this system: treat that as an *operations* problem, not a
tooling problem. Give the AI workforce what a real company gives employees —
**departments, job descriptions, a shared filing system, change management,
and an audit trail** — and the work stops evaporating.

## The system

Everything lives in one git repository of plain markdown files. That
repository *is* the company:

- **Ten agents, modeled as departments** — Chief of Staff, Project Manager,
  Documentation, Data Integrity, Change Management, Cost Tracking, Portfolio,
  Client Services, AI Engineering Build, and the Master Operating System that
  connects them. Every agent has a written spec — purpose, inputs, outputs,
  dependencies, success criteria — and a registry entry. **No undocumented
  agents, no rogue workflows** is a written rule, and an audit script enforces
  it.
- **Ten operational skills** — repeatable workflows an agent runs on demand:
  daily briefs, weekly executive summaries, session-to-documentation capture,
  integrity audits, change logging, cost reviews. Workflows earn skill status
  by recurring; nothing is automated on speculation.
- **A source-of-truth hierarchy** — when documents disagree, a written
  priority order says which one wins, and the conflict is flagged rather than
  silently resolved. One topic, one authoritative document.
- **Two append-only logs** — every meaningful decision (88 so far) goes in the
  decision log with its reasoning and context; every system change (317 so
  far) goes in the change log. Past entries are never edited. The logs are why
  a session that starts cold can reconstruct *why* the system is the way it
  is, not just *what* it is.
- **MCP integrations** wire the agents to the real world: Gmail, Google
  Calendar, Google Drive, Microsoft 365, GitHub, and a scoped filesystem
  server.

## Governance is code, not vibes

The standards document is short and blunt: cite the source, flag what's
stale, log every change, don't assume — verify. But rules that live only in
prose decay, so the load-bearing ones became mechanisms:

- **`scripts/audit.js` counts; the agent interprets.** Integrity audits
  originally asked a language model to do arithmetic across ~30 documents —
  slow, and two runs could score the same file differently. The audit is now a
  deterministic script producing identical results every run. Its very first
  run caught a real violation: a skill in active use that had never been
  registered.
- **The dashboard cross-checks the trackers.** Registry says one thing, the
  project tracker says another? The build detects the conflict and displays
  it, because the standards say conflicts get flagged, not papered over.
- **The echo loop was cut.** The Chief of Staff agent once read its own prior
  briefs as input — a hallucination-amplification path where a summary could
  summarize a summary. Human session records and agent-generated reports now
  live in separate directories, and agents read only the human side.

## The dashboard: proof of life, not a second database

The [public dashboard](https://evanderpool.github.io/artificial-management/)
is a static page generated from the markdown repo by one build script — no
database, no backend, no separate write path. That was a deliberate refusal:
a dashboard with its own store would be a second source of truth, and drift
between two sources is exactly the disease this system exists to cure. The
page shows the agent roster, the skill registry, the project portfolio with
computed progress and deadline countdowns, recent decisions, and change
activity — every figure derived at build time from the same files the agents
read and write.

Two details worth noticing: a **daily CI rebuild** recomputes the page even on
days nobody works, so staleness is visible rather than hidden; and a
**heartbeat** turns silence into a status — seven days without a commit shows
QUIET, fourteen shows STALE, on the public internet, where it can't be
ignored.

## The failure that built the heartbeat

This case study would be fiction without this section. The v1 build sprinted:
a seven-week build plan's themes were delivered in the first four days, ahead
of schedule, fully documented. Then the system went **dark for 77 days** — no
commits, no sessions, no outcomes — and nothing noticed. Every safeguard was
pull-based: the logs, trackers, and audits all worked perfectly *when asked*,
and silence never asks.

The restart began with a written retrospective in the decision log, closing
the original deadline as **partial: build succeeded, outcomes missed** — and
the diagnosis was operational, not architectural. The system needed a
push-based liveness signal that fails loudly in public. That's what the
heartbeat is: the system's most useful feature, built directly out of its
worst failure. The gap itself is documented in the logs rather than smoothed
over, because an operating system for real work has to survive contact with
real life — including the operator's.

## Remote control without remote code execution

The system can be driven from a phone — but a phone that can inject
instructions into an AI agent with filesystem access is a remote-code-execution
hole with a nice UI. The mobile bridge was adversarially reviewed *before*
implementation, and the design that survived is deliberately narrow:

- **Structured intents only.** The phone sends typed actions — proceed, status,
  brief, answer — never freeform prompts. Free text arrives labeled as
  untrusted data describing a request, never as instructions with authority.
- **Server-templated writes.** The server composes every markdown line
  written; phone text is sanitized data inside a template. The repo stays the
  single canonical store.
- **Signed queue, private network.** Requests travel over a WireGuard-based
  private network (Tailscale) and are HMAC-signed; the agent ignores anything
  the verifying watcher didn't list.
- **A hard forbidden list.** Bridge-originated work cannot push to GitHub,
  send email, delete files, touch configuration, or read secrets. Publishing
  is a human act at the keyboard, by rule.

The same posture governed the repository itself: when resume content, pricing,
and outreach material were found in the public repo, they were moved to a
private repo and **purged from public git history** — and the split became a
written rule with a whitelist enforced in the dashboard build.

## Proof it works: the system ships systems

The strongest evidence is what the operating system produced when pointed at a
real project. **[Uplink](https://github.com/evanderpool/uplink)** — a private,
self-hosted RAG system whose every answer must prove where it came from — went
from first commit to a deployed, security-reviewed
[public demo](https://github.com/evanderpool/uplink-demo) in days, *through
this system's process*: registered in the tracker with milestones and owner
agents, every architecture call in the decision log, adversarial review before
every surface shipped, retrieval quality measured against golden fixtures
instead of asserted, and a two-agent security review gating the launch. Uplink
has [its own case study](https://github.com/evanderpool/uplink-demo/blob/main/CASE-STUDY.md);
the method it was built with is the product described in this one.

The pattern generalizes: the dashboard, the bridge, and the audit tooling were
each built the same way — scoped, decided, logged, reviewed, shipped, tracked.
The operating system is self-hosting: it manages the projects that improve it.

## How it was built

I directed the build; AI sessions executed it. The division of labor is the
same one Uplink's case study describes, because it *is* the house method:

- **I own the decisions** — the governance model, what becomes a rule versus a
  mechanism, what's public versus private, the security posture, the cost
  ceiling, and every scope call. All 88 of those decisions are in the log with
  their reasoning.
- **AI sessions own the keystrokes** — implementation, documentation,
  auditing — inside the governance the system itself defines. Agents cite
  sources, flag staleness, and log their own changes, because the standards
  bind the workforce that wrote them.
- **Nothing ships on trust.** The dashboard, the bridge, and every major
  surface got adversarial review passes — sessions instructed to attack the
  design — and findings became fixes, and fixes became rules.

## Check everything on this page

The system's first rule is *cite the source*. This document follows it — every
claim above is inspectable:

- **The agents and skills** — specs in
  [`projects/`](https://github.com/evanderpool/artificial-management/tree/main/projects),
  registry at
  [`ai-system-registry.md`](https://github.com/evanderpool/artificial-management/blob/main/projects/master-operating-system/ai-system-registry.md)
- **The 88 decisions, reasoning included** —
  [`decisions/log.md`](https://github.com/evanderpool/artificial-management/blob/main/decisions/log.md)
  (the 77-day gap and its retrospective are entries like any other)
- **The 317 changes** —
  [`logs/changes.md`](https://github.com/evanderpool/artificial-management/blob/main/logs/changes.md)
- **The governance rules** —
  [`ai-system-standards.md`](https://github.com/evanderpool/artificial-management/blob/main/.claude/rules/ai-system-standards.md)
- **The audit script** —
  [`scripts/audit.js`](https://github.com/evanderpool/artificial-management/blob/main/scripts/audit.js)
- **The dashboard generator** — one readable file,
  [`dashboard/build.js`](https://github.com/evanderpool/artificial-management/blob/main/dashboard/build.js),
  and [the page it builds](https://evanderpool.github.io/artificial-management/)
- **The system it shipped** — [Uplink](https://github.com/evanderpool/uplink)
  and [its case study](https://github.com/evanderpool/uplink-demo/blob/main/CASE-STUDY.md)

---

**Erick Vanderpool** — data analyst and AI engineer. Artificial Management is
both the portfolio and the factory that builds it.
[github.com/evanderpool](https://github.com/evanderpool)
