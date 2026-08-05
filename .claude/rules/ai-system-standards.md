# AI System Standards

Rules for how every agent, workflow, and document inside Artificial Management must be built and maintained.

## Every Agent Must Have

- **Purpose** — one-sentence description of what it does
- **Inputs** — what data or context it receives
- **Outputs** — what it produces
- **Owner** — which agent or person is responsible
- **Dependencies** — what other agents or tools it relies on
- **Success criteria** — how we know it is working correctly
- **Registry entry** — must be logged in the AI System Registry

No undocumented agents. No rogue workflows.

## Data Integrity Rules

1. **Cite the source.** If a statement is based on a specific file, log, or document, name it.
2. **Flag outdated information.** If you suspect information may be stale, say so explicitly.
3. **Log all changes.** Any update to a workflow, prompt, agent spec, or system document goes in the Change Log.
4. **Don't assume — verify.** When uncertain about current system state, check the source-of-truth files before proceeding.
5. **One source of truth per topic.** If two documents conflict, flag it immediately and resolve it before acting on either.

## Source-of-Truth Hierarchy

| Priority | Source | What It Governs |
|---|---|---|
| 1 | `context/` files | Erick's profile, business, team, priorities, goals |
| 2 | `projects/*/README.md` | Individual project status and scope |
| 3 | `decisions/log.md` | Binding decisions made |
| 4 | `references/sops/` | Official process definitions |
| 5 | Agent prompts and specs | Agent behavior |

When in conflict, higher-priority sources win. Flag and resolve conflicts — do not silently pick one.

## Documentation Standard

- Every project gets a README before substantial work begins
- Every agent gets a spec before it is built
- Every workflow gets a workflow doc before it is automated
- Every meaningful decision gets logged in `decisions/log.md`
- Every system change gets logged in the Change Log

## Public / Private Repo Split (2026-08-05)

This repo is **public** — it is the portfolio showcase. Business-sensitive
content lives in the **private** repo `artificial-management-private`
(github.com/evanderpool/artificial-management-private), and future client work
lives in **per-client private repos**.

**Never commit to the public repo:** personal PII (address, phone, personal
email), resume content, service pricing, outreach/proposal templates, client
names, or any client data. When creating a file that contains any of these,
create it in the private repo and leave only a pointer here if needed.

Currently in the private repo: `references/resume/`,
`references/examples/outreach/`, `references/sops/service-packages.md`,
`templates/proposal-template.md` (moved + purged from public history
2026-08-05).

## Fortune 500 Operating Standard

Design everything as if Artificial Management is a real enterprise company. That means:

- Departments with clear ownership
- Agents with defined roles and dependencies
- Data flows that are documented and traceable
- Change management that prevents drift
- Cost tracking that supports business decisions
- Portfolio outputs that prove capability to employers and clients
