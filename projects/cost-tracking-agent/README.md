# Cost Tracking Agent

Tracks all tools, APIs, subscriptions, compute costs, and estimated client pricing for Artificial Management.

**Status:** Active
**Spec:** [spec.md](spec.md)
**Deadline:** June 30, 2026
**Last Updated:** 2026-05-16

## Responsibilities

- Monthly tool cost tracking
- API usage estimation
- Client project pricing inputs
- Profit margin analysis
- Build-versus-buy decision support
- Business expense categorization

## Inputs

Tool subscriptions, API costs, software licenses, storage costs, automation platform costs, business expenses

## Outputs

Monthly spend summary, cost change alerts, waste/redundancy flags, estimated client delivery cost, pricing recommendations

## Cost Tracker

**Active:** [references/cost-tracker/](../../references/cost-tracker/)

| File | Period | Status |
|---|---|---|
| [2026-05-cost-tracker.md](../../references/cost-tracker/2026-05-cost-tracker.md) | May 2026 | Active — pending cost confirmations |

**Open action items:** Confirm actual costs for Claude, ChatGPT, Google Workspace, and Microsoft 365 by 2026-05-20.

## Recent Updates

- [2026-05-13] Agent spec v1.0 written — status updated to Spec Complete; output destination defined as references/cost-tracker/
- [2026-05-13] Cost tracker activated — references/cost-tracker/ created; 2026-05 tracker live with 17 tools registered; 4 cost confirmations pending
- [2026-05-14] Actuals confirmed — $47/month total; 4 tool stack decisions made (ChatGPT downgrade, Microsoft 365 evaluation, Google Workspace upgrade plan, Anthropic API addition plan)
- [2026-05-16] Skill activated — `.claude/skills/cost-tracking/SKILL.md` live; 2 modes: monthly-report (default), add-tool; status updated Spec Complete → Active
