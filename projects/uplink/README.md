# Uplink — Local RAG

**Status:** In Progress (V1 core complete 2026-08-06)
**Code lives in its own public repo:** [github.com/evanderpool/uplink](https://github.com/evanderpool/uplink) (local: `Desktop/uplink`)
**Tracker:** registered in the [Master Project Tracker](../master-operating-system/project-tracker.md) as `uplink`

## What it is

A local, private, self-hosted RAG system and the portfolio's privacy-first
retrieval piece. It indexes mixed-format documentation — Markdown, PDF, Word,
Excel, CSV/TSV, TXT — into a single SQLite FTS5 database and serves BM25
search to Claude Code, which composes answers with citations. Phone access
follows the bridge queue pattern, read-only: the phone can only ask.

## Key architecture decisions (logged 2026-08-06)

- Generation layer = the open Claude Code session (no Ollama, no local LLM)
- BM25-first; vectors arrive in phase 2 only with before/after eval numbers
- Retrieval is a CLI, not a daemon; search connections open the DB read-only
- Retrieved chunk text is untrusted data — same rule as bridge text
- Demo corpus = this operating system's own public docs (dogfooding)

## V1 measured baseline (2026-08-06)

90 docs / 990 chunks from this repo; 18 golden questions:
hit@1 67%, hit@5 89%, MRR 0.769 (after stopword filter; raw baseline was
44%/67%/0.532 — both rows kept in the Uplink README as the honesty record).

## Scope boundary

This folder is the ops-system pointer only. Code, tests, fixtures, and eval
results belong to the standalone repo. Client corpora would be indexed into
local databases that are never committed anywhere.
