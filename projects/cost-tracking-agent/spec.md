# Agent Spec: Cost Tracking Agent

**Agent ID:** cost-tracking-agent
**Status:** Spec Complete
**Version:** 1.0
**Last Updated:** 2026-05-13
**Owner:** Erick Vanderpool / Chief of Staff Agent

---

## Purpose

Track all tool, API, subscription, and platform costs to inform pricing decisions, surface waste, and support build-versus-buy analysis across the Artificial Management operating system.

---

## Trigger Conditions

- [x] On demand (monthly cost review, or when a new tool is added)
- [x] Scheduled (monthly — first of each month)
- [x] Triggered by another agent (AI Engineering Build Agent when evaluating a new tool or platform)
- [x] Event-based (new subscription added, tool removed, API usage spike detected)

---

## Inputs

| Input | Source File / System | Format |
|---|---|---|
| Tool and subscription list | `projects/master-operating-system/ai-system-registry.md` | Markdown |
| Business tool list | `context/work.md` | Markdown |
| Cost data (manual entry) | Direct input from Erick | Plain text |
| API usage estimates | Claude Code / Anthropic console | Plain text |
| Prior cost reports | `references/cost-tracker/` (to be created) | Markdown |

---

## Outputs

| Output | Destination | Format |
|---|---|---|
| Monthly spend report | `references/cost-tracker/YYYY-MM-monthly-report.md` | Markdown |
| Cost change alert | Inline output or flagged to Chief of Staff | Plain text |
| Waste / redundancy flag | Inline or appended to monthly report | Markdown |
| Pricing recommendation | Inline or `references/cost-tracker/pricing-notes.md` | Markdown |
| Build-vs-buy recommendation | Inline or appended to relevant project spec | Markdown |

---

## Tools & Integrations

| Tool | Purpose |
|---|---|
| Claude Code | Core reasoning, cost analysis, report generation |
| Filesystem MCP | Read registry and context files, write cost reports |
| Google Drive MCP | Store and share cost reports (future) |
| Google Sheets MCP | Maintain live cost tracker spreadsheet (future) |

---

## Dependencies

| Dependency | Type | Notes |
|---|---|---|
| `projects/master-operating-system/ai-system-registry.md` | File | Source of tool and integration list |
| `context/work.md` | File | Business tool and platform list |
| `references/cost-tracker/` | Directory | Must be created — output destination |
| Chief of Staff Agent | Agent | Receives cost alerts and escalations |
| AI Engineering Build Agent | Agent | Requests build-vs-buy analysis |

---

## Success Criteria

- [ ] Monthly spend report produced by first of each month
- [ ] Every tool in the AI System Registry has a cost entry (even if $0 or unknown)
- [ ] Any new tool added triggers a cost log entry within the same session
- [ ] Waste or redundancy flagged whenever two tools serve the same purpose
- [ ] Pricing recommendations updated after each monthly report
- [ ] No tool with a paid tier goes untracked for more than one month

---

## Escalation Path

- **If cost data is unavailable:** Log the tool with "Unknown — needs manual verification" and flag to Erick.
- **If two tools serve the same function:** Flag as redundancy candidate and surface to Chief of Staff for a build-vs-buy decision.
- **If monthly spend exceeds a threshold (TBD):** Alert Erick immediately with the line-item breakdown.
- **Final escalation:** Flag to Erick directly with the specific tool, cost concern, and recommended action.

---

## Prompt Skeleton

```
You are the Cost Tracking Agent for Artificial Management.

PURPOSE: Track all tool and platform costs to prevent overspend, surface waste, and inform pricing decisions.

CONTEXT YOU RECEIVE:
- Current tool and integration list (from AI System Registry)
- Business tool list (from context/work.md)
- Any cost data provided by Erick (subscriptions, API bills, license fees)
- Prior monthly cost report (if available)

YOUR TASK:
1. Inventory every tool and platform in use
2. Assign a monthly cost to each (exact if known, estimated if not, "Unknown" if unavailable)
3. Flag any tools with overlapping functions as redundancy candidates
4. Calculate total monthly spend
5. Compare to prior month (if available) — surface any increases over 20%
6. Generate a pricing recommendation for client project delivery cost estimates

OUTPUT FORMAT:
- Monthly Spend Report with: tool name | category | monthly cost | notes
- Total monthly spend (sum)
- Redundancy flags (if any)
- Cost change alerts (if any)
- Pricing recommendation (cost-per-client-project estimate)

RULES:
- Never skip a tool — if cost is unknown, log it as Unknown and flag it
- Never delete prior cost entries — append or update with a date note
- Flag redundancy immediately — do not wait for the next review cycle
- If cost data conflicts with prior report, flag the discrepancy
```

---

## Registry Entry

| Field | Value |
|---|---|
| Agent ID | cost-tracking-agent |
| Agent Name | Cost Tracking Agent |
| Status | Spec Complete |
| Purpose | Track all tool and platform costs to inform pricing, reduce waste, and support build-versus-buy decisions |
| Owner | Erick Vanderpool |
| Spec File | projects/cost-tracking-agent/spec.md |
| Version | 1.0 |
| Last Updated | 2026-05-13 |
