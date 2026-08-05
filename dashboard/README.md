# Ops Dashboard (v1)

**Status:** Built 2026-08-05
**Type:** Read-only static view — the markdown repo remains the single source of truth
**Live URL:** GitHub Pages (enable in repo Settings → Pages → Source: "GitHub Actions")

## What it is

A single self-contained HTML page generated from the system's markdown files.
No database, no runtime, no framework. `dashboard/build.js` (Node, zero
dependencies) parses the source of truth and writes `dashboard/index.html`.
The GitHub Actions workflow (`.github/workflows/dashboard.yml`) rebuilds and
redeploys it on every push to `main`.

## Data sources (read-only)

| Dashboard section | Source file |
|---|---|
| Heartbeat / staleness | git log (last commit date) — falls back to session log dates |
| Project tracker table | `projects/master-operating-system/project-tracker.md` |
| Agent / skill / tool counts | `projects/master-operating-system/ai-system-registry.md` |
| Decisions feed | `decisions/log.md` |
| Changes feed | `logs/changes.md` |
| Next actions | `context/current-priorities.md` (Immediate Next Actions) |
| Monthly spend (aggregate) | latest `references/cost-tracker/*-cost-tracker.md` |

## Data whitelist (security rule)

The page is public. It may show: statuses, counts, dates, decision/change log
lines, aggregate monthly spend, next-action titles.

It must never show: resume content, service-tier pricing, outreach templates,
email addresses. `build.js` scrubs email addresses and dollar amounts from all
free-text feed lines. If a new section is added, it must pass this whitelist.

## Design intent

The heartbeat banner is the point: it computes days-since-last-commit at build
time and goes QUIET (>7 days) or STALE (>14 days) on its own. The system
detecting its own silence is the feature the rest of the page hangs off.

## Run locally

```
node dashboard/build.js
# open dashboard/index.html
```
