# SOP — Mobile Bridge (phone control over Tailscale)

**Owner:** Erick Vanderpool · **Built:** 2026-08-05 · **Status:** Active
**Components:** `bridge/server.py` (stdlib, no deps) · `bridge/watch.py` ·
`bridge/static/app.html` · `run_bridge.ps1` · state in `%LOCALAPPDATA%\ea-bridge\`

## What it is

Phone → Tailscale → local server (port 8100, EA Agent only — the Video
Editor's port 8000 setup is separate and untouched). Read: the private
master dashboard. Write: structured actions the **server templates itself**
(add task, complete task, note, idea, decision, rebuild) — these work even
with no Claude session — plus session-bound actions (proceed / status /
brief / answers) queued for the **active interactive Claude Code session**.

## Daily use

1. PC on, Tailscale on (both devices). Run `run_bridge.ps1` — it prints the
   phone URL (`http://<tailscale-ip>:8100/app`) and where the access key is.
2. In the Claude Code session: arm the watcher (see CLAUDE.md bridge
   protocol). The phone's status strip shows session listening / lagging /
   dead — trust it.
3. Phone: open the URL (add to home screen), paste the key once.

## Security model (decisions, not defaults)

- **Tailnet-only bind, fail closed** — server refuses to start without a
  Tailscale IP; never binds LAN/0.0.0.0. Firewall rule scoped to 100.64.0.0/10.
- **Header key auth** (`X-App-Key`) on every API call; per-IP backoff, hard
  lockout after 10 failures. No query-string keys, no long-lived auth cookies.
- **HMAC-signed queue files** — the session ignores unsigned/forged requests,
  so nothing that merely writes files can inject commands.
- **Sanitized phone text** — pipes, newlines, backticks stripped; emails and
  prices redacted before any markdown/commit; server-templated writes only.
- **No push, no email, no deletion** from bridge-originated work — local
  commits only; publishing is a desktop act. Enforced in CLAUDE.md protocol.
- **State outside the repo and outside OneDrive** (`%LOCALAPPDATA%\ea-bridge\`):
  queue, keys, audit log, heartbeat. Verified Desktop is local; Documents is
  OneDrive-synced — never move bridge state there.
- **Requests expire** after 30 min undrained (marked stale, never executed
  late). Every request is audit-logged verbatim before execution.

## Rotation & kill switch

- **Lost phone:** tap Pause on any device that still has the app OR on the
  PC delete `%LOCALAPPDATA%\ea-bridge\app.key` and restart the bridge — a
  new key is generated; old one is dead. 10 seconds.
- **Pause/resume:** button in the app (server rejects new requests while
  paused) — flag file `paused.flag`.
- **Stop:** `run_bridge.ps1 stop`.

## Failure modes

| Phone shows | Meaning | Fix |
|---|---|---|
| PC unreachable | PC off/asleep or Tailscale down | Wake PC, check Tailscale both ends |
| watcher dead — requests will wait | Server up, no session watcher | Open the session, arm the watcher |
| watcher lagging | Watcher heartbeat stale | Re-arm the watcher |
| request stale | Sat >30 min undrained | Re-send when session is live |

## Weekly review (folds into exec summary)

Bridge request count, blocked count, auth failures, key age — from
`%LOCALAPPDATA%\ea-bridge\audit.log`.
