# AI Engineering Build Agent

Designs and implements the technical architecture of the Artificial Management AI system.

**Status:** Spec Complete
**Deadline:** June 30, 2026
**Spec:** [spec.md](spec.md)
**Last Updated:** 2026-05-14

## Responsibilities

- System architecture planning
- Tool selection and evaluation
- MCP server recommendations
- Database design and data flow logic
- Workflow and automation logic
- Testing strategy and quality checks
- Integration planning between agents and tools

## Inputs

Business requirements, agent specs, data flows, tool constraints, performance requirements, security considerations

## Outputs

Architecture diagrams, tool selection rationale, database schemas, workflow specs, integration guides, testing checklists

## System Context (Current as of 2026-05-14)

**Where the system stands:** Week 3 of 7 complete. Agent spec v1.0 is written. The system currently has 9 agent specs, 4 operational skills, GitHub MCP + Filesystem MCP (36 tools), and a cost tracking baseline ($47/month). The architecture is designed at a conceptual level inside CLAUDE.md and the agent specs. The formal architecture diagram, data flow diagram, and source-of-truth map are not yet produced.

**What this agent needs to do next:** Produce the first architecture diagram and data flow diagram for the full operating system (carried forward from Week 1–3 targets). These are critical inputs for the Master Operating System dashboard and portfolio case study. This agent is used on an ongoing basis as the system grows — it evaluates new tools, reviews integration logic, and keeps the technical architecture aligned with business goals.

**Key files to read at activation:**
- `projects/master-operating-system/ai-system-registry.md` — full agent + tool roster to inform architecture
- `context/work.md` — tool stack and MCP servers in use
- All `projects/*/spec.md` files — agent I/O contracts define the data flows
- `.mcp.json` — current MCP server configuration

## Recent Updates

- [2026-05-13] Agent spec v1.0 written — status updated to Spec Complete; first deliverables identified: architecture diagram and data flow diagram for the full operating system; full template complete with triggers, inputs, outputs, tools, escalation path, and prompt skeleton
- [2026-05-14] System Context added; Last Updated date set; registry status corrected to Spec Complete with spec file link
