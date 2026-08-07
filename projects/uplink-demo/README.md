# Uplink Public Demo

**Status:** Built, not yet live (launch gated by 2026-08-13 security reviews)
**Code lives in its own repo:** local `Desktop/uplink-demo` (GitHub repo + Render deploy pending Erick's go)
**Tracker:** registered in the [Master Project Tracker](../master-operating-system/project-tracker.md) as `uplink-demo`

## What it is

The internet-reachable showcase of Uplink: same retrieval engine, deployed on
Render's free plan at a free `*.onrender.com` address. Differences from the
product are deliberate and small: public documents only (SEC/CDC/BLS/CISA,
fetched at deploy — the copyrighted Apple manuals stay out), an API brain
(Claude Haiku, ~1¢/question) instead of the borrowed-brain session, all writes
disabled except asking, and a per-visitor limit of 5 questions with a 3-day
reset. Grounding is unchanged: citations chosen by chunk number, coordinates
copied verbatim, mechanically verified before publishing.

## Cost controls

Rate limit (5/visitor/3 days) + monthly spend cap on the Anthropic workspace
(~$10) + free hosting. Worst case is "demo pauses," never a surprise bill.

## Launch checklist (in order)

1. Erick: create GitHub repo, push (publishing is a keyboard act)
2. Erick: Render account → New Blueprint → set `ANTHROPIC_API_KEY` + `UPLINK_CONTACT`, spend cap on the Anthropic workspace
3. **2026-08-13 security reviews pass** — hard gate before the service goes public
4. Link from portfolio/dashboard

## Scope boundary

This folder is the ops-system pointer only. The demo repo never receives
private corpora, client data, or the private repo's content. The main
`Desktop/uplink` product is untouched by this project.
