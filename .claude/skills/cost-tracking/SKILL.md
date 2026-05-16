# Skill: Cost Tracking Agent

Tracks all tools, APIs, subscriptions, and compute costs for Artificial Management. Produces monthly spend reports, flags waste and redundancy, and informs pricing decisions.

## How to Invoke

- `/cost-tracking` — run monthly report (default)
- `/cost-tracking monthly-report` — produce full monthly spend report
- `/cost-tracking add-tool` — log a new tool to the cost tracker

---

## Mode 1: Monthly Report (default)

### Step 1: Read the Active Cost Tracker

Identify the current month (YYYY-MM format) and read the matching file:
`references/cost-tracker/YYYY-MM-cost-tracker.md`

If the file for the current month does not exist, read the most recent file in `references/cost-tracker/` and note that it may need to be rolled over to a new month file.

Also read:
- `projects/master-operating-system/ai-system-registry.md` — Section 2 (Tool Registry) for the current connected tool list
- `context/work.md` — MCP Servers section for current connection status

### Step 2: Inventory Every Tool

Compare the cost tracker's Tool Registry against the AI System Registry's Tool section. Flag any tool that:
- Appears in the registry but not in the cost tracker (missing entry)
- Has status "Planned" in the tracker but "Connected" in the registry (stale)
- Has "TBD" cost and has been planned for 2+ months (needs resolution)

### Step 3: Produce the Monthly Spend Report

Output the following structure:

```
## Monthly Spend Report — [Month YYYY]

**Total confirmed monthly spend:** $[N]
**Last updated:** [YYYY-MM-DD]

### Cost Breakdown by Category

| Tool | Category | Monthly Cost | Status | Notes |
|---|---|---|---|---|
| [tool] | [AI / Dev / Workspace / MCP / Storage / Other] | $[N]/mo or Free | Active/Planned | [notes] |

**Category Totals:**
- AI tools: $[N]/mo
- Workspace tools: $[N]/mo
- Dev tools: $[N]/mo
- MCP tools: $[N]/mo
- Storage tools: $[N]/mo
- Other: $[N]/mo
- **Total: $[N]/mo**

### Month-Over-Month Delta
[Compare to prior month tracker if available. If not, state "No prior month data — establishing baseline."]

- Prior month: $[N]/mo
- Current month: $[N]/mo
- Change: +/- $[N] ([%] change)

### Waste / Redundancy Flags
[List any tools that overlap in function or have low ROI. If none, write "None identified this month."]

| Tool | Overlap With | Recommendation |
|---|---|---|

### TBD Cost Items (Needs Resolution)
[List any tools with unknown or TBD costs.]

| Tool | Status | Action Needed | Due |
|---|---|---|---|

### Action Items Carried Forward
[Copy open action items from the tracker that aren't done yet.]

### Pricing Recommendation
Based on current spend of $[N]/mo, estimated cost to deliver one client AI automation project:
- Tool overhead per project: ~$[N]/mo (prorated across active clients)
- Labor not included in this estimate
- Recommended minimum project fee to cover tooling: $[N]/project or $[N]/mo retainer
```

### Step 4: Update the Tracker

Append the monthly report output to the current cost tracker file under a `## Monthly Report — [Month YYYY]` section if one doesn't exist yet.

Update the Summary block in the tracker with current actuals.

### Step 5: Log Changes

Append to `logs/changes.md`:
```
[YYYY-MM-DD] CHANGED: references/cost-tracker/YYYY-MM-cost-tracker.md | TYPE: updated | PROJECT: cost-tracking-agent | NOTES: Monthly spend report produced — $[N]/mo confirmed; [N] tools tracked; [N] flags raised
```

### Final Output

```
Cost report produced.

| Metric          | Value                              |
|-----------------|------------------------------------|
| Period          | [Month YYYY]                       |
| Total spend     | $[N]/mo                            |
| Tools tracked   | [N]                                |
| Waste flags     | [N]                                |
| TBD costs       | [N] tools need confirmation        |
| Report saved    | references/cost-tracker/YYYY-MM... |
```

---

## Mode 2: Add Tool (`/cost-tracking add-tool`)

Use this when a new tool, API, subscription, or service is added to the Artificial Management stack.

### Step 1: Gather Tool Info

Ask for (or infer from context):
- **Tool name**
- **Category** (AI / Dev / Workspace / MCP / Storage / Other)
- **Monthly cost** (exact, estimated, Free, or TBD)
- **Purpose** — one sentence: what it does for Artificial Management
- **Status** (Active / Planned)
- **Notes** — any relevant context (trial period, bundled cost, usage limits, ROI notes)

### Step 2: Check for Redundancy

Scan the existing Tool Registry in `references/cost-tracker/YYYY-MM-cost-tracker.md` for any tool that:
- Serves the same primary function as the new tool
- Is in the same category and has overlapping use cases

If found, flag it:
> ⚠ Redundancy detected: [New tool] and [Existing tool] both serve [function]. Recommend evaluating build-vs-buy before activating.

### Step 3: Add the Tool

Add a new row to the Tool Registry table in the current cost tracker file:

```
| [Tool Name] | [Category] | [Cost] | [Purpose] | [Status] | [Notes] |
```

Update the Summary block totals.

### Step 4: Log Changes

Append to `logs/changes.md`:
```
[YYYY-MM-DD] CHANGED: references/cost-tracker/YYYY-MM-cost-tracker.md | TYPE: updated | PROJECT: cost-tracking-agent | NOTES: New tool added — [Tool Name] | [Category] | [Cost]/mo | [Status]
```

If there is a redundancy flag, also append to `decisions/log.md`:
```
[YYYY-MM-DD] DECISION: Review [New Tool] vs [Existing Tool] for redundancy | REASONING: Both serve [function] — evaluate before committing to paid tier | CONTEXT: /cost-tracking add-tool session
```

### Final Output

```
Tool added.

| Field    | Value           |
|----------|-----------------|
| Tool     | [Name]          |
| Category | [Category]      |
| Cost     | $[N]/mo         |
| Status   | [Active/Planned]|
| Tracker  | references/cost-tracker/YYYY-MM-cost-tracker.md |
```

Plus any redundancy flags.
