# GridPulse — EIA Grid Data Product

**Status:** Planning locked (2026-08-15) — build starts at Phase 0
**Owner:** Erick Vanderpool · owner agents per tracker tasks
**Type:** Portfolio build (public repo, separate from this one, not yet created)
**MVP target:** 2026-09-07

A live view of the U.S. electricity grid — hourly demand and fuel mix pulled
from the EIA open-data API v2, tamed by a documented deterministic conversion
tool, and published as a self-refreshing GitHub Pages report (primary) plus a
Streamlit dashboard (stretch). Built to answer exactly three business
questions; anything that doesn't serve one of them is out of scope.

## Authoritative documents

Planning was completed 2026-08-15 in a separate session (two-agent brainstorm
plus a red-team stress test). The two artifacts are the source of truth for
every locked decision — **update them, never recreate them**:

- **Build plan:** https://claude.ai/code/artifact/fd5184db-301c-44e7-adc3-0b2c72126c9d
- **Stress-test / red-team report:** https://claude.ai/code/artifact/d1a16508-125f-448c-818b-fc4f3b8dea80
- Machine handoff folder: `Desktop/GridPulse-Handoff` (kickoff prompt + memory file)

Do not re-open settled decisions. Key locked calls: EIA API v2 as the source;
static Pages report as primary showcase; MVP-first scope (~2 weeks, phases
0–3); swappable Polars/pandas backend (Polars ships MVP); $0 running cost with
an enforced API pull budget; deterministic conversion core (AI only at the
optional reporting edge); propose-and-approve improvement loop gated by PRs.
Deliberately absent: Airflow, Docker, Postgres, dbt.

## Where the work lives

- **This folder:** registration + pointers only. Status lives in the
  [master tracker](../master-operating-system/project-tracker.md).
- **The build repo:** created in Phase 0 (gate order from the red-team report:
  EIA key + data validation FIRST, then repo). Will be public under
  github.com/evanderpool.

## Next step

Phase 0, gate 1: Erick requests the free EIA API key
(https://www.eia.gov/opendata/register.php), then exploratory pulls validate
data availability for all three questions — the Q3 duck-curve solar series is
the risky one — before any repo is created.
