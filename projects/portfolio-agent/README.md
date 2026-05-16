# Portfolio Agent

Converts every technical project and workflow inside Artificial Management into job-search and client-facing proof.

**Status:** In Progress
**Deadline:** June 30, 2026
**Last Updated:** 2026-05-16

## Responsibilities

- Resume version management and scoring
- Resume bullet generation
- LinkedIn project post drafts
- GitHub README summaries
- Portfolio case studies
- Interview talking points
- Project demo scripts
- Client-facing proof statements

## Inputs

Completed tasks, system diagrams, agent specs, automation workflows, business outcomes, technical decisions

## Outputs

Resume bullets, updated portfolio case study, LinkedIn post ideas, GitHub README updates, interview stories, client-facing proof statements

---

## Resume System (Active)

Resume files live in `references/resume/`. The system is active as of 2026-05-13.

| File | Description |
|---|---|
| `references/resume/README.md` | Version index, naming convention, update triggers |
| `references/resume/master-source.md` | Full uncut content inventory |
| `references/resume/analysis/recruiter-analysis-v1.md` | Scored analysis, AI engineering lens (58/100 baseline) |
| `references/resume/versions/v1.0-original.md` | Original resume — archived |
| `references/resume/versions/v1.1-2page-ai-engineer.md` | Previous version — AI engineering baseline |
| `references/resume/versions/v1.2-ai-engineering-mos.md` | AI OS featured project — archived |
| `references/resume/versions/v1.3-week6-polish.md` | Week 6 polish — updated metrics, cron automation, confidence scoring, 6 MCPs **(current best)** |

**Current score:** ~72–76 / 100 (v1.3 estimated)
**Target before heavy application push:** 75 / 100

### Top 5 Actions to Close the Score Gap

1. Add specific GitHub repo URLs to both projects (push README to GitHub first)
2. Build a LangChain or LlamaIndex project → v2.0 trigger
3. Add an OpenAI API project or demo
4. Add code files to the Exec Assistant GitHub repo
5. Add retrieval quality metric to the RAG pipeline bullets

## Recent Updates

- [2026-05-13] Resume system built and live — v1.0 archived, v1.1 AI engineering content library created, recruiter analysis scored at 58/100
- [2026-05-13] Agent spec v1.0 written — status updated to Spec Complete; full template with triggers, inputs, outputs, tools, dependencies, success criteria, escalation path, and prompt skeleton
- [2026-05-14] Resume v1.2 created — Artificial Management AI OS added as featured project; MCP & Tool Integrations skills section added; Professional Summary updated; estimated score 68–72/100
- [2026-05-16] Week 6 portfolio asset build complete — GitHub README, resume v1.3 (72–76/100), LinkedIn post draft, demo script (recruiter + client), client proof statement (4 variants)
