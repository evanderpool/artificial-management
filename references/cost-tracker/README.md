# Cost Tracker

**Owner:** Cost Tracking Agent
**Source of truth for:** All tools, APIs, subscriptions, and compute costs for Artificial Management

---

## Purpose

Track every dollar spent on tools, platforms, APIs, and subscriptions — so we can make smart build-vs-buy decisions, flag waste, estimate client delivery costs, and support pricing decisions.

---

## File Naming Convention

Monthly trackers: `YYYY-MM-cost-tracker.md`

| File | Period |
|---|---|
| [2026-05-cost-tracker.md](2026-05-cost-tracker.md) | May 2026 |

---

## Update Cadence

| Event | Action |
|---|---|
| New tool added | Add row to current month tracker immediately |
| Tool cancelled | Mark as Cancelled with cancellation date |
| Price changes | Update row and add note |
| End of month | Review tracker, carry forward active tools to new month file |
| New month | Create new `YYYY-MM-cost-tracker.md` from previous month |

---

## Categories

| Category | What It Covers |
|---|---|
| AI | Claude, ChatGPT, Codex, other LLM APIs |
| MCP | MCP servers — connected or planned |
| Workspace | Google Workspace, Microsoft 365, productivity tools |
| Dev | VS Code, Node.js, GitHub, dev environments |
| Storage | Cloud storage, databases |
| Other | Misc tools not covered above |

---

## Cost Tracking Agent

This directory is the output target for the Cost Tracking Agent. See [projects/cost-tracking-agent/](../../projects/cost-tracking-agent/README.md) for the full agent spec and responsibilities.
