# Skill: Work Session to Docs

Run this at the end of any meaningful work session — a build, a planning session, a design conversation, anything worth keeping.

## How to Invoke

Type `/work-session-to-docs` — with or without notes. If you paste session context first, this skill will extract from it. If you don't, it will ask.

---

## Step 1: Capture the Session

If the user has not already provided session details, ask all 6 questions in one message:

1. **What did you work on?** (project name + brief description)
2. **What was decided?** (tools, approaches, scope, naming, architecture — any choice that should be remembered)
3. **What was created or changed?** (files, docs, prompts, workflows, agent specs, templates — be specific)
4. **What is blocked or unresolved?**
5. **What are the top 3 next actions?**
6. **Anything portfolio-worthy?** (did you build, document, or solve something worth capturing as resume proof or a client case study?)

If session details were already provided, extract answers directly without asking.

---

## Step 2: Create the Session Summary File

Create a new file at:
`logs/sessions/YYYY-MM-DD-session.md`
(Use today's date. If a file already exists for that date, append `-2`, `-3`, etc.)

Use this format:

```
# Session Summary

**Date:** YYYY-MM-DD
**Focus:** [project or workstream name]

## What Got Done
- [bullet per item]

## Decisions Made
- [bullet per decision, or "None this session"]

## Changes Made
- [file/system/doc changed — be specific]

## Open Items / Blockers
- [bullet per item, or "None"]

## Next Actions
1. [most important]
2.
3.

## Portfolio Flags
- [describe what's worth capturing, or "None this session"]
```

---

## Step 3: Append to the Decision Log

If any decisions were made, append one entry per decision to `decisions/log.md`:

```
[YYYY-MM-DD] DECISION: [what was decided] | REASONING: [why] | CONTEXT: [project/workflow]
```

Never edit existing entries. Append only.

---

## Step 4: Append to the Change Log

If anything was created or changed, append one entry per change to `logs/changes.md`:

```
[YYYY-MM-DD] CHANGED: [what changed] | TYPE: [new / updated / deleted / renamed] | PROJECT: [project name] | NOTES: [brief context]
```

---

## Step 5: Update the Project README

Find the relevant project folder in `projects/`. Add a brief status note at the bottom under a `## Recent Updates` section (create it if it doesn't exist):

```
## Recent Updates
- [YYYY-MM-DD] [one-line description of what happened]
```

---

## Step 6: Update the Project Tracker (if deliverables completed)

If any deliverables were completed this session, update `projects/master-operating-system/project-tracker.md`:

1. In the Deliverables Checklist for this project, change `[ ]` to `[x]` for completed items.
2. Update the `Last Updated` column for this project to today's date.
3. If the completion changes overall project status, update `Status`. Otherwise leave it.
4. Update `**Last Updated:**` at the top of the file to today's date.

**When to skip:** If nothing was completed this session (planning/review only), skip this step.

---

## Step 7: Update the AI System Registry (if a skill or agent went Active)

Only run this step if a skill, agent, or tool reached a new status this session.

Read `projects/master-operating-system/ai-system-registry.md`.

- **New/updated skill:** Update Section 3 row — `Status` → Active, `Last Updated` → today. Add row if none exists.
- **Agent status change:** Update Section 1 row — `Status` and `Last Updated`.
- **New tool connection:** Update Section 2 row — `Status` → Connected.

Update `**Last Updated:**` at the top of the registry file to today's date.

**When to skip:** If no skill, agent, or tool changed status this session, skip this step entirely.

---

## Step 8: Surface Portfolio Flags

If anything portfolio-worthy was identified, output a formatted block for each item:

```
**Portfolio Flag — [project name]**
- What was built/solved: [description]
- Why it matters: [business or technical value]
- Suggested use: [resume bullet / case study / GitHub README / LinkedIn post / interview story]
```

---

## Final Output

After completing all steps, show this summary:

```
Session documented.

| Output         | Location                                  |
|----------------|-------------------------------------------|
| Session log      | logs/sessions/YYYY-MM-DD-session.md                     |
| Decisions        | decisions/log.md (N new entries)                        |
| Changes          | logs/changes.md (N new entries)                         |
| Project status   | projects/[name]/README.md                               |
| Tracker updated  | project-tracker.md (N deliverables checked) OR Skipped  |
| Registry updated | ai-system-registry.md (skill/agent/tool) OR Skipped     |

Top next action: [#1 from the next actions list]
```

If there were portfolio flags, show them after the table.
