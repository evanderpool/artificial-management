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

## Step 6: Surface Portfolio Flags

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
| Session log    | logs/sessions/YYYY-MM-DD-session.md       |
| Decisions      | decisions/log.md (N new entries)          |
| Changes        | logs/changes.md (N new entries)           |
| Project status | projects/[name]/README.md                 |

Top next action: [#1 from the next actions list]
```

If there were portfolio flags, show them after the table.
