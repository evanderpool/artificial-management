# Skill: Task Complete

Run this whenever a task, deliverable, or build milestone is marked done. Updates all 6 tracking files in one pass so nothing drifts from the completed state.

## How to Invoke

`/task-complete` — Claude will ask for the inputs it needs, or you can provide them upfront:

```
/task-complete
Task: Built /cost-tracking skill (SKILL.md — 2 modes)
Project: cost-tracking-agent
Type: skill
```

---

## Step 1: Gather Inputs

If the user has not provided all three inputs, ask in one message:

1. **What was completed?** (describe the task or deliverable — be specific)
2. **Which project does it belong to?** (use the project folder name, e.g., `master-operating-system`, `documentation-agent`, `portfolio-agent`)
3. **What type of completion is this?**
   - `task` — a general task (write SOP, run audit, update file, etc.)
   - `skill` — a new Claude Code skill went live (`/skill-name` is now operational)
   - `agent` — an agent reached a new status (e.g., Spec Complete → Active)
   - `tool` — a new tool or MCP server was connected or activated

If inputs were already provided inline with the command, extract them directly without asking.

Confirm the inputs before proceeding:

```
Ready to mark complete:
- Task: [task description]
- Project: [project-name]
- Type: [task / skill / agent / tool]

Proceed? (yes to continue, or correct any field)
```

---

## Step 2: Read All 6 Tracking Files

Read the following files before making any changes:

- `context/current-priorities.md`
- `projects/master-operating-system/project-tracker.md`
- `projects/master-operating-system/ai-system-registry.md`
- `projects/[project-name]/README.md` (the project from Step 1)
- `logs/changes.md` (last 20 entries — to check for duplicate entries)
- `references/source-of-truth/source-of-truth-map.md`

Extract from `current-priorities.md`: the current week label and any existing done section.
Extract from `project-tracker.md`: the current Status, Last Updated, and deliverables list for this project.
Extract from `ai-system-registry.md`: the current row for this project/skill/tool (if type is skill, agent, or tool).
Extract from `source-of-truth-map.md`: the rows whose File Path matches any of the 6 files being updated.

---

## Step 3: Update `context/current-priorities.md`

Find the task in the current week's next actions or priorities list. If it appears there, mark it done using this exact format:

```
~~[original task text]~~ — DONE [YYYY-MM-DD] — [one-line result]
```

If the task does not appear explicitly in the priorities file, add a done entry under the current week's "All Done" section:

```
- ~~[task description]~~ — DONE [YYYY-MM-DD]
```

If there is no "All Done" section for the current week, create one before the next week's section:

```
### Week [N] — All Done
- ~~[task description]~~ — DONE [YYYY-MM-DD]
```

Update `**Last updated:**` at the top to today's date.

---

## Step 4: Update `projects/master-operating-system/project-tracker.md`

### 4a — Deliverables Checklist

Scan the Deliverables Checklist section for this project. Find the line that most closely matches the completed task and change `[ ]` to `[x]`.

If no matching deliverable exists, add one:
```
- [x] [Task description] — completed [YYYY-MM-DD]
```

### 4b — Project Tracker Table

Update the row for this project:
- `Last Updated` → today's date
- `Status` → update ONLY if the completion changes overall project status (e.g., all deliverables now done → Complete; task unblocks the project → Blocked to In Progress). If status is unchanged, leave it.
- `Next Action` → update to the next logical action based on remaining unchecked deliverables

### 4c — Header

Update `**Last Updated:**` at the top of the file to today's date.

---

## Step 5: Update `projects/[project-name]/README.md`

Add one entry to the `## Recent Updates` section (create it if it doesn't exist):

```
- [YYYY-MM-DD] [One-line description of what was completed and what it enables]
```

If the project README has a `**Status:**` field, update it if the completion changes the project's overall status. Use the same status values as the project tracker: Planning / Spec Complete / In Progress / Active / Blocked / Complete.

Update `**Last Updated:**` to today's date.

---

## Step 6: Update `projects/master-operating-system/ai-system-registry.md`

**Only run this step if the task type (from Step 1) is `skill`, `agent`, or `tool`. If type is `task`, skip this step entirely.**

### If type is `skill`:

Find the row in Section 3 — Skill Registry where the Skill ID matches the completed skill. Update:
- `Status` → `Active`
- `Last Updated` → today's date

If this is a brand new skill with no registry entry, add a row:
```
| [skill-id] | [Skill Name] | [one-line purpose] | Active | `.claude/skills/[skill-id]/SKILL.md` | Erick | [YYYY-MM-DD] |
```

### If type is `agent`:

Find the row in Section 1 — Agent Registry. Update `Status` and `Last Updated`.

### If type is `tool`:

Find the row in Section 2 — Tool Registry. Update `Status` → `Connected` and `Last Updated`.

Update `**Last Updated:**` at the top of the registry file to today's date.

---

## Step 7: Append to `logs/changes.md`

Append one entry per file that was actually changed in Steps 3–6. Use the exact format:

```
[YYYY-MM-DD] CHANGED: [file path] | TYPE: updated | PROJECT: [project-name] | NOTES: [what changed — one sentence]
```

Every file touched gets its own entry. Minimum: 3 entries (current-priorities, project-tracker, project README). Maximum: 6 (add registry and source-of-truth if updated).

Do not batch multiple files into one entry. Do not create duplicate entries for files already updated today with identical notes.

---

## Step 8: Update `references/source-of-truth/source-of-truth-map.md`

For each file updated in Steps 3–6, find the matching row in the source-of-truth map (match by File Path column). Update only:
- `Last Verified` → today's date
- `Status` → `Current` (if it was Stale or Needs Review)

Do not add new rows. Do not change any other columns.

---

## Final Output

After completing all steps, show this summary:

```
Task marked complete.

Task: [task description]
Project: [project-name]
Type: [task / skill / agent / tool]
Date: [YYYY-MM-DD]

| File                                              | Change Made                               |
|---------------------------------------------------|-------------------------------------------|
| context/current-priorities.md                     | Marked done — ~~[task]~~                  |
| projects/master-operating-system/project-tracker.md | [x] checked + Last Updated updated      |
| projects/[project-name]/README.md                 | Recent Updates entry added                |
| projects/master-operating-system/ai-system-registry.md | Updated / Skipped (type = task)     |
| logs/changes.md                                   | [N] entries appended                      |
| references/source-of-truth/source-of-truth-map.md | [N] Last Verified dates updated          |

Next action for [project-name]: [next unchecked deliverable or "All deliverables complete"]
```

If the registry was updated (type = skill/agent/tool), add one line after the table:
```
Registry note: [skill-name / agent-name / tool-name] status → Active in ai-system-registry.md
```
