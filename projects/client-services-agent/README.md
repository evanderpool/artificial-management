# Client Services Agent

Packages Artificial Management's capabilities into clear, marketable service offers for small and medium business clients.

**Status:** Spec Complete
**Deadline:** June 30, 2026
**Spec:** [spec.md](spec.md)
**Last Updated:** 2026-05-14

## Responsibilities

- Defining service packages and pricing
- Building client intake forms
- Creating discovery call scripts
- Drafting proposals and scopes of work
- Mapping small business automation opportunities
- Preparing client onboarding workflows

## Inputs

Services list, market feedback, completed portfolio work, common business pain points, pricing logic

## Outputs

Updated service packages, offer language, discovery call questions, client proposal drafts, outreach message templates

## System Context (Current as of 2026-05-14)

**Where the system stands:** Week 3 of 7 complete. Agent spec v1.0 is written. This agent activates in Week 7 after the Portfolio Agent has generated resume bullets, case studies, and proof statements. Artificial Management's services are defined at a high level in `context/work.md`; this agent formalizes them into marketable packages.

**What this agent needs to do next:** Wait for Portfolio Agent to produce proof assets (Week 6), then build service packages, discovery call script, proposal template, and outreach messages (Week 7 target). This agent's output directly supports the June 30, 2026 client acquisition goal.

**Key files to read at activation:**
- `context/work.md` — Artificial Management services, day-to-day tools, positioning
- `projects/portfolio-agent/README.md` — upstream dependency; portfolio assets must exist before packaging
- `projects/portfolio-agent/spec.md` — outputs this agent depends on (case studies, proof statements)
- `references/resume/` — resume system showing skills and accomplishments available to package

## Recent Updates

- [2026-05-13] Agent spec v1.0 written — status updated to Spec Complete; Portfolio Agent identified as upstream dependency for proof statements; full template complete with triggers, inputs, outputs, tools, escalation path, and prompt skeleton
- [2026-05-14] System Context added; Last Updated date set; registry status corrected to Spec Complete with spec file link
