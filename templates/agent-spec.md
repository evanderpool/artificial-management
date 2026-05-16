# Agent Spec: [Agent Name]

**Agent ID:** [kebab-case-id]
**Status:** Planning / Active / Deprecated
**Version:** 1.0
**Last Updated:** YYYY-MM-DD
**Owner:** Erick Vanderpool / [supervising agent if applicable]

---

## Purpose

One sentence describing exactly what this agent does and why it exists.

---

## Trigger Conditions

When and how does this agent run?

- [ ] On demand (manually invoked)
- [ ] Scheduled (daily / weekly / monthly)
- [ ] Triggered by another agent (specify which)
- [ ] Event-based (specify what event)

---

## Inputs

| Input | Source File / System | Format |
|---|---|---|
| [Input name] | [File path or system name] | [Markdown / JSON / plain text / etc.] |

---

## Outputs

| Output | Destination | Format |
|---|---|---|
| [Output name] | [File path or system name] | [Markdown / JSON / plain text / etc.] |

---

## Tools & Integrations

List every tool, MCP server, skill, or API this agent uses.

| Tool | Purpose |
|---|---|
| Claude Code | [what it does here] |
| [MCP server] | [what it does here] |

---

## Dependencies

What must exist or be functioning for this agent to work?

| Dependency | Type | Notes |
|---|---|---|
| [Name] | Agent / File / Tool / System | [What it provides] |

---

## Success Criteria

How do we know this agent is working correctly? Each item should be verifiable.

- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]
- [ ] [Measurable outcome 3]

---

## Escalation Path

What happens if this agent is uncertain, blocked, missing data, or produces a low-confidence output?

- **If data is missing:** [action]
- **If there is a conflict:** [action]
- **If output cannot be verified:** [action]
- **Final escalation:** Flag to Erick directly with a specific description of the blocker.

---

## Prompt Skeleton

The core instruction set for this agent. Fill this in before building.

```
You are the [Agent Name] for Artificial Management.

PURPOSE: [one sentence]

CONTEXT YOU RECEIVE:
- [input 1]
- [input 2]

YOUR TASK:
[Step-by-step instructions for what the agent does]

OUTPUT FORMAT:
[Describe the exact format, sections, and structure of the output]

RULES:
- [Rule 1]
- [Rule 2]
- [Escalation rule]
```

---

## Registry Entry

To be copied into the AI System Registry once built.

| Field | Value |
|---|---|
| Agent ID | [kebab-case-id] |
| Agent Name | [Full name] |
| Status | Planning / Active / Deprecated |
| Purpose | [One sentence] |
| Owner | [Name] |
| Spec File | [projects/agent-name/spec.md] |
| Version | 1.0 |
| Last Updated | YYYY-MM-DD |
