# Decision Log

Append-only. When a meaningful decision is made, log it here.

Format: [YYYY-MM-DD] DECISION: ... | REASONING: ... | CONTEXT: ...

---

[2026-05-13] DECISION: Use @context/ imports in CLAUDE.md instead of repeating information | REASONING: Keeps master brain file under 150 lines and prevents duplication drift | CONTEXT: EA Agent second brain setup

[2026-05-13] DECISION: Connected GitHub MCP + Filesystem MCP to Claude Code via .mcp.json + Node.js | REASONING: Highest-priority Week 3 unlock — enables portfolio repo management, issue tracking, PR automation, and standardized file interface for future multi-agent workflows | CONTEXT: Node.js v24.15.0 installed via winget; PAT stored in ~/.claude/settings.json env block (not in git); .mcp.json at project root is safe to commit

[2026-05-13] DECISION: 10 active project workstreams defined as the initial agent roster | REASONING: Maps to a Fortune 500-style department model and creates 10 discrete portfolio projects | CONTEXT: Artificial Management operating model

[2026-05-13] DECISION: June 30, 2026 as hard deadline | REASONING: Target date to have AI engineering job prospects, 3–4 clients, and live Artificial Management showcase ready | CONTEXT: Q2 2026 goals

[2026-05-13] DECISION: AI agents are the first "team" — build as if Fortune 500 from day one | REASONING: Forces enterprise-grade documentation standards and makes the system portfolio-ready immediately | CONTEXT: Team structure and operating model

[2026-05-13] DECISION: Session logs and change log live in logs/ (not archives/ or projects/) | REASONING: Keeps operational logs separate from reference material and project docs | CONTEXT: work-session-to-docs skill design

[2026-05-13] DECISION: Build skills organically when workflows repeat 3+ times | REASONING: Prevents over-engineering before patterns are confirmed; backlog of 7 skills defined from onboarding | CONTEXT: .claude/skills/ structure

[2026-05-13] DECISION: Agent Spec Template structure finalized — required sections: purpose, trigger conditions, inputs, outputs, tools & integrations, dependencies, success criteria, escalation path, prompt skeleton, registry entry | REASONING: Covers all fields required by ai-system-standards.md plus operational fields (triggers, escalation) needed to actually run agents | CONTEXT: templates/agent-spec.md creation

[2026-05-13] DECISION: Project status values standardized as: Planning / Spec Complete / In Progress / Complete / Blocked / STALE | REASONING: "Spec Complete" distinguishes designed-but-not-built from not-started; "STALE" creates a forcing function for stale project reviews | CONTEXT: Master Project Tracker design

[2026-05-13] DECISION: AI System Registry split into two sections — Agent Registry + Tool Registry | REASONING: Agents and tools have different fields and different governance needs; a single flat list would mix apples and oranges | CONTEXT: ai-system-registry.md design

[2026-05-13] DECISION: Registry audit section added to AI System Registry — re-run after each major build phase | REASONING: Provides a formal compliance checkpoint to enforce the "no undocumented agents" rule from ai-system-standards.md | CONTEXT: ai-system-registry.md design

[2026-05-13] DECISION: Log changes in real-time during a session rather than batching at the end | REASONING: Real-time logging is more accurate and prevents items from being missed if a session ends abruptly | CONTEXT: work-session-to-docs workflow

[2026-05-13] DECISION: Weekly executive summary skill structure finalized — 7 steps: read priorities/goals, read project tracker, scan change log, scan decision log, read session logs, produce summary, save and check priorities | REASONING: Mirrors the Chief of Staff Agent's core workflow exactly so the skill can later be handed off to the agent without redesign; standardizes the output format across all future summaries | CONTEXT: Option C — weekly-exec-summary skill and template creation

[2026-05-13] DECISION: Resume system established inside EA Agent project at references/resume/ | REASONING: Resume needs permanent versioned home tied to the operating system so it can be updated as projects are added; portfolio-agent is the owner of all resume assets | CONTEXT: Resume scored 58/100 for AI engineering roles; v1.1-2page-ai-engineer.md is the current submission version; target 75+ before heavy application push

[2026-05-13] DECISION: AI engineering resume leads with Projects before Work Experience | REASONING: Current job (Database Analyst at Envera Systems) is not AI-relevant; projects are the strongest signal; restructuring puts the best content in the 6-second recruiter scan zone | CONTEXT: Recruiter analysis — v1.1-2page-ai-engineer.md design decision

[2026-05-13] DECISION: LangChain/LlamaIndex and OpenAI API identified as highest-priority skill gaps to close before heavy application push | REASONING: These appear in 70%+ of AI engineering postings; closing both gaps is estimated to raise score from 58 to 75+ and significantly improve ATS filter pass rate | CONTEXT: recruiter-analysis-v1.md gap analysis

[2026-05-13] DECISION: Resume versions are comprehensive content libraries — no content ever gets cut from a version file | REASONING: Versions are pick-and-choose inventories; submission files are curated separately at application time; certifications, older projects, and all work experience stay in every version | CONTEXT: philosophy correction after v1.1 was initially built as a length-constrained 2-page cut

[2026-05-13] DECISION: GitHub MCP uses @modelcontextprotocol/server-github via npx (not Docker binary) | REASONING: No Docker installed; npx + Node.js is simpler, zero ongoing cost, works identically | CONTEXT: Week 3 MCP infrastructure setup

[2026-05-13] DECISION: GitHub PAT stored in ~/.claude/settings.json env block only — never in project files or .mcp.json | REASONING: ~/.claude/ is outside the git repo; prevents accidental credential exposure in version control | CONTEXT: Security design for MCP authentication

[2026-05-13] DECISION: Chief of Staff Agent will be built as a Claude Code skill (.claude/skills/chief-of-staff/SKILL.md) | REASONING: Skills are the native invocation mechanism in Claude Code; allows /chief-of-staff to be called on demand with one command | CONTEXT: Week 3 — Chief of Staff Agent activation

[2026-05-13] DECISION: Chief of Staff daily brief outputs to file AND displays inline in chat | REASONING: File provides a durable record for the session log system; inline display makes it immediately actionable without switching files | CONTEXT: Chief of Staff skill design — output mode resolved

[2026-05-13] DECISION: Project Manager Agent built as a Claude Code skill with 3 modes — sprint planning (default), status check, blocker review | REASONING: Single skill handles all PM use cases via argument; mirrors Chief of Staff pattern for consistency; modes separate the three distinct outputs the PM Agent is designed to produce | CONTEXT: Week 3 — Project Manager Agent activation

[2026-05-13] DECISION: All 5 remaining agent specs written in parallel in a single session — Change Management, Cost Tracking, Portfolio, Client Services, AI Engineering Build | REASONING: Specs unblock Weeks 4–7; writing them together ensures consistent format and cross-agent dependencies are resolved simultaneously | CONTEXT: Week 3 — agent spec completion push

[2026-05-14] DECISION: Downgrade ChatGPT Plus to free tier | REASONING: Used as a secondary tool for cross-checking and drafting only; free tier GPT-4o access is sufficient; saves $20/month ($240/year) | CONTEXT: Tool stack cost review — cost-tracker 2026-05

[2026-05-14] DECISION: Evaluate and likely cancel Microsoft 365 Personal | REASONING: $7/month overlap with Google Workspace; MCP integration is bundled through claude.ai and not dependent on the subscription; only retain if Office desktop apps or OneDrive are in active daily use | CONTEXT: Tool stack cost review — cost-tracker 2026-05

[2026-05-14] DECISION: Upgrade Google Workspace Free to Business Starter before Week 7 client outreach | REASONING: Custom domain email (erick@artificialmanagement.com) is required for professional client credibility; free tier lacks this capability | CONTEXT: Client acquisition preparation — planned upgrade at Week 7 start

[2026-05-14] DECISION: Add Anthropic API (pay-per-use) in Week 5–6 for client-facing demos | REASONING: Claude Pro covers personal use; API access is required for embedding Claude into custom demos and client deliverables; estimated $10–20/month to start | CONTEXT: Week 5–6 automation and portfolio build phase

[2026-05-14] DECISION: Keep ChatGPT Plus ($20/month) | REASONING: Erick's decision to retain | CONTEXT: Overrides earlier flag to downgrade; tool stack cost review 2026-05

[2026-05-14] DECISION: Keep Microsoft 365 Personal (~$7/month) | REASONING: Erick's decision to retain | CONTEXT: Overrides earlier flag for cancellation evaluation; tool stack cost review 2026-05

[2026-05-14] DECISION: Run Chief of Staff check as first action in any system sync session | REASONING: CoS check surfaces all stale data, conflicts, and flag issues before making changes; prevents fixing wrong things or missing dependencies | CONTEXT: Established as standard operating procedure during this sync session

[2026-05-14] DECISION: Resume v1.2 adds Artificial Management AI OS as featured project without awaiting GitHub code repo | REASONING: The system architecture, agent specs, operational skills, and governance demonstrate AI engineering capability even without a public code repo; the breadth and enterprise-grade documentation are the signal; waiting for code risks leaving the biggest portfolio achievement out of the resume during active job search | CONTEXT: Portfolio Agent — resume v1.2-ai-engineering-mos.md created 2026-05-14

[2026-05-14] DECISION: AI System Registry uses "Active" status (not "In Progress") for agents with working skills | REASONING: Registry status legend has no "In Progress" value; "Active: Built and operational" is the correct status for CoS and PM agents once their skills are live and producing output | CONTEXT: Registry sync — corrected CoS and PM from Spec Complete → Active during 2026-05-14 sync

[2026-05-15] DECISION: Source-of-truth tracker uses Priority 0 as a system config tier above the standard data hierarchy | REASONING: CLAUDE.md, .claude/rules/*.md, and .mcp.json govern how the entire system operates — they sit above all data sources in the hierarchy and should not compete with context files for priority | CONTEXT: source-of-truth-map.md design — references/source-of-truth/

[2026-05-15] DECISION: One artifact (source-of-truth-map.md) satisfies both the "data/source-of-truth tracker" carry-forward and the "Source-of-truth map" Master OS deliverable | REASONING: The structured table format serves both the operational need (agents know where to look) and the architectural need (maps what governs what) — building two separate documents would create duplication and drift | CONTEXT: Week 4 sprint planning + Master OS deliverable checklist

[2026-05-15] DECISION: Documentation Agent skill uses 3 modes — session summary (default), README update, SOP draft | REASONING: Matches the 3 trigger types defined in the spec; single skill handles all documentation use cases via argument; mirrors Project Manager Agent 3-mode pattern for consistency | CONTEXT: Documentation Agent SKILL.md design

[2026-05-15] DECISION: Integrity pre-check built into Documentation Agent as Step 2 before writing any output | REASONING: Documentation produced on top of stale data compounds errors; running a targeted check on files the session touched catches issues before they propagate into session logs and READMEs | CONTEXT: Documentation Agent SKILL.md design — system integrity standard

[2026-05-15] DECISION: Sprint planning sessions include inline integrity audit of touched files | REASONING: Integrating integrity enforcement into sprint planning catches issues naturally without a separate invocation; 6 issues caught this session that were invisible until audit ran | CONTEXT: Week 4 sprint planning + Documentation Agent integration

[2026-05-15] DECISION: Data Integrity Agent skill uses 3 modes — full audit (default), quick check, conflict resolution | REASONING: Full audit is too heavy for lightweight spot-checks; quick mode lets other agents or Erick validate high-priority files without reading all 25+ source documents; conflicts mode isolates the most actionable output when a specific mismatch is known | CONTEXT: Data Integrity Agent SKILL.md design — Week 4 build

[2026-05-15] DECISION: Change Management Agent skill uses existing change log format (TYPE/PROJECT/NOTES) not the format in the spec's prompt skeleton (FILE/IMPACT/VERSION) | REASONING: 134 existing entries already use the TYPE/PROJECT/NOTES format; introducing a new format would break consistency across the entire log and require migration; the spec format was aspirational, not prescriptive — existing operational format takes precedence | CONTEXT: Change Management Agent SKILL.md design — format consistency rule

[2026-05-15] DECISION: Change Management flag mode takes a [topic] argument for targeted cross-document reference scans | REASONING: Scanning all 25+ files for every flag would be too slow for quick post-change checks; a topic argument limits the scan to relevant documents and makes the mode fast enough to use routinely after any system change | CONTEXT: Change Management Agent SKILL.md design — flag mode design

[2026-05-16] DECISION: Week 5 primary deliverable is converting /weekly-exec-summary from manually-invoked skill to a scheduled automation with Gmail delivery | REASONING: The skill is fully operational but requires a human trigger; making it scheduled (every Friday) and auto-delivered by email completes the "first working automation workflow" goal — the system runs itself rather than waiting for Erick to invoke it | CONTEXT: Week 5 kickoff — goals.md "First Working Automation Workflow" theme

[2026-05-16] DECISION: Week 5 also builds the Cost Tracking Agent skill and 3 formal SOPs before moving to Week 6 portfolio work | REASONING: Cost tracking skill is Spec Complete and unblocked; SOPs in references/sops/ are needed for client-facing credibility (Week 7 dependency) — building them in Week 5 prevents a crunch in Weeks 6–7 | CONTEXT: Week 5 plan — plan file at C:\Users\Erick\.claude\plans\lets-move-into-week-replicated-newell.md

[2026-05-16] DECISION: Build /task-complete skill + extend work-session-to-docs to cover project-tracker.md and ai-system-registry.md | REASONING: Marking tasks complete required 6 manual edits across tracking files — causing persistent drift between current-priorities, project-tracker, registry, READMEs, change log, and source-of-truth map; a dedicated skill ensures all completions propagate consistently in one pass | CONTEXT: master-operating-system — Week 5 operational gap identified

[2026-05-16] DECISION: All weekly briefing email references changed from erick.vanderpool2@outlook.com to artifical.management@gmail.com | REASONING: Briefing is a business operations output — it belongs in the Artificial Management Gmail inbox, not the personal Outlook; Outlook address was set during initial system build before Gmail routing was clarified | CONTEXT: Week 5/6 housekeeping — 5 files updated (weekly-exec-summary skill, weekly-briefing SOP, case-study-draft, weekly summary log, current-priorities)

[2026-05-16] DECISION: Architecture and data flow diagrams deferred — Mermaid diagram in README.md serves as the Week 6 architecture visual | REASONING: Mermaid renders natively on GitHub and covers the architecture overview needed for recruiters and clients; standalone PNG/SVG export is non-blocking for job search and client acquisition and can be added in Week 7 as polish | CONTEXT: Week 6 close-out — portfolio-agent case study Week 6 targets

[2026-05-16] DECISION: GitHub README identified as the keystone Week 6 asset — all other Week 6 portfolio assets built from its narrative | REASONING: README is the only public, permanently linkable proof; every other asset (LinkedIn post, demo script, proof statement) needs the same core narrative; writing README first forced clarity on the system description that sharpened all downstream assets | CONTEXT: Week 6 planning — portfolio-agent asset sequencing

[2026-05-16] DECISION: LangGraph multi-agent research workflow built as portfolio project — LangChain + LangGraph + Tavily + Claude Haiku + Streamlit | REASONING: LangChain/LangGraph appeared in 70%+ of AI engineering postings and was the top identified resume gap; parallel Send API pattern, structured output, and streaming UI demonstrate production-grade LangGraph skills that close the gap; resume score updated to 82–86/100 (was 74–78) | CONTEXT: Week 7 stretch goal — github.com/evanderpool/langchain-research-agent

[2026-05-16] DECISION: Client Services Agent activated in Week 7 with 4 service tiers (Data Essentials $750+, Automation Starter $2,500+, AI Agent Build $6,000+, Full AI OS custom) | REASONING: 4 tiers cover the full spectrum from quick data fixes to full enterprise system builds; pricing anchors at value-based starting points with scope confirmed after discovery; all packages link to live GitHub proof | CONTEXT: Week 7 — Client Services Agent build; 5 deliverables created: service-packages.md, discovery-call-script.md, proposal-template.md, outreach-templates.md (6 variants), client-onboarding.md

[2026-08-05] DECISION: Ops dashboard v1 built as a read-only static page generated from the markdown repo — no database, no separate write path | REASONING: A dashboard with its own writable store would create a second source of truth and reintroduce the drift problem the system already fought; generating from the repo keeps markdown canonical and costs nothing to host | CONTEXT: Dashboard v1 — dashboard/build.js + GitHub Pages via Actions; public-data whitelist enforced in the generator (no emails, no pricing, no resume content)

[2026-08-05] DECISION: June 30 deadline closed as PARTIAL — v1 system build succeeded ahead of schedule, outcome goals (job offers, 3-4 clients) not achieved; root cause: system went dark 2026-05-20 with no liveness mechanism, and outcome work (applications, outreach) never started | REASONING: An honest retrospective is required before restart; the failure was operational (no heartbeat, pull-based safeguards only), not architectural — the build itself finished 6 weeks early | CONTEXT: v1 close-out 2026-08-05; heartbeat now enforced by dashboard + daily CI recompute

[2026-08-05] DECISION: v1 build project closed as Complete; system enters operations mode — no more week-numbered build calendar; Q2 goals and final Q2 priorities archived to archives/ | REASONING: The operating system is permanent infrastructure and never "completes"; the project of building it is finishable and finished; time-anchored week numbers decayed the moment work paused, so operations mode uses dates and the heartbeat instead | CONTEXT: archives/2026-q2-goals.md, archives/2026-q2-priorities-final.md; Q3 goals in context/goals.md

[2026-08-05] DECISION: Public/private repo split executed — resume, service pricing, outreach and proposal templates moved to artificial-management-private and purged from public git history via git filter-repo + force push | REASONING: The public repo is the portfolio showcase; PII and pricing in it contradicted the dashboard's own data whitelist and exposed the client playbook to competitors; client work will follow the same rule in per-client private repos | CONTEXT: Session 1 "Secure & Sync"; split rule codified in .claude/rules/ai-system-standards.md; pointer at references/PRIVATE-CONTENT.md

[2026-08-05] DECISION: logs/ split into logs/sessions/ (human work-session records — agent input) and logs/reports/ (agent-generated briefs, summaries, sprint plans, audits — agent output) | REASONING: Chief of Staff read "3 most recent session files" from a directory containing its own prior briefs — an echo loop where a brief could summarize a brief; separating input from output removes the hallucination-amplification path | CONTEXT: Architecture review finding M2; skill read/write paths updated same session
[2026-08-05] DECISION: Business Gmail confirmed as-registered: artifical.management@gmail.com (the spelling is intentional, not a typo) | REASONING: Erick verified during restart audit follow-up; closes the open verification item from the security review | CONTEXT: Weekly briefing routine delivery address; remaining open item is verifying the routine itself still runs

[2026-08-05] DECISION: Master Project Tracker restructured into a Project Portfolio — agents removed from the tracker (registry is their sole home), Visibility column governs public vs private dashboard views, and every project task is assigned to an owner agent | REASONING: Agents are departments, not projects; the tracker now models real work (portfolio builds, system upgrades, client engagements) and shows how work distributes across departments; client projects live in per-client private repos and appear only in the private master view (build.js --private + private-sources.json) | CONTEXT: Erick design decision 2026-08-05 — dashboard as portfolio overview with per-project drill-down; v1 agent checklists archived to archives/2026-q2-agent-build-checklists.md

[2026-08-05] DECISION: Portfolio Website and LangGraph Research Agent removed from the project portfolio at Erick's direction — new project slate incoming | REASONING: Erick is redefining the active project set; per the archive rule nothing is deleted — the portfolio-website plan is archived and the LangGraph repo remains live on GitHub as portfolio proof, both just leave the tracked portfolio | CONTEXT: archives/2026-08-portfolio-website-plan.md; tracker Removed/Archived Projects section records both
[2026-08-05] DECISION: Per-project PM detail format added to the tracker — Detail (description, priority, client, start, links, risks), Milestones (target dates), Tasks (owner + due date); dashboard computes progress %, deadline countdown, overdue tasks/milestones, per-project staleness, and team chips at build time | REASONING: The project drill-down should give everything a project manager needs at a glance; computed fields (progress, overdue, countdown) come from raw dates so they can never go stale like hardcoded numbers | CONTEXT: Erick request 2026-08-05 — dashboard as full PM view; format documented in the tracker's How to Register a Project section
[2026-08-05] DECISION: Dashboard motion layer added — GSAP vendored locally (assets/), full-showcase load choreography, scroll reveals, View Transitions; all motion gated on prefers-reduced-motion and the page remains fully readable with JavaScript disabled | REASONING: Erick chose full showcase mode; the zero-JS constraint existed for the artifact preview's CSP, not GitHub Pages; reframed honestly as 'static data, decorative motion' — data still requires no runtime, and the explainer/footer copy was updated so the page does not overstate itself | CONTEXT: Design pass phase 1 of the improvement plan; assets shipped by CI to Pages

[2026-08-05] DECISION: Mobile bridge added — supersedes the 'no separate write path' clause of the dashboard-v1 decision: the bridge is a SERVER-TEMPLATED write path (the server composes every markdown line; phone text is sanitized data), so the markdown repo remains the single canonical store and drift risk is unchanged | REASONING: Phone control requires writes; freeform remote prompts were rejected in design review (remote-code-execution risk) in favor of structured intents + a question/answer loop with the active session; local commits only, no push/email from bridge work, state outside the repo in LOCALAPPDATA | CONTEXT: bridge/server.py + watch.py + app.html + run_bridge.ps1; adversarial pre-implementation review 2026-08-05; SOP references/sops/mobile-bridge-sop.md
