#!/usr/bin/env python3
"""
EA Agent bridge watcher — arm from the ACTIVE Claude Code session via
Bash(run_in_background: true). Exits (re-invoking the session) when a
session-bound request needs draining. Writes a PID-stamped heartbeat so
/api/health can distinguish live / stale / dead — and so the EA watcher
can never be confused with the Video Editor's watcher.

Drain protocol (session side) lives in CLAUDE.md — verify each request's
HMAC signature with verify.py before acting on it.
"""
import hashlib
import hmac
import json
import os
import sys
import time
from pathlib import Path

HOME = Path(os.environ.get("LOCALAPPDATA", str(Path.home()))) / "ea-bridge"
QUEUE = HOME / "queue"
HEARTBEAT = HOME / "watcher.json"
HMAC_FILE = HOME / "hmac.secret"
QUEUE_ACTIONS = {"proceed", "project_status", "run_brief", "answer"}


def valid_sig(req):
    try:
        secret = HMAC_FILE.read_text(encoding="utf-8").strip()
        payload = {k: v for k, v in req.items() if k != "sig"}
        blob = json.dumps(payload, sort_keys=True, ensure_ascii=False).encode()
        expect = hmac.new(secret.encode(), blob, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expect, req.get("sig", ""))
    except Exception:
        return False


def pending():
    QUEUE.mkdir(parents=True, exist_ok=True)
    out = []
    for rf in sorted(QUEUE.glob("*.request.json")):
        try:
            req = json.loads(rf.read_text(encoding="utf-8"))
        except Exception:
            continue
        if req.get("action") not in QUEUE_ACTIONS:
            continue
        rid = req.get("id", "")
        if list(QUEUE.glob(f"*{rid}.response.json")):
            continue
        if time.time() - rf.stat().st_mtime > 1800:
            # stale — never silently executed; mark so the phone sees it
            (QUEUE / f"{int(time.time())}-{rid}.response.json").write_text(
                json.dumps({"id": rid, "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ",
                                                           time.gmtime()),
                            "state": "stale",
                            "summary": "Request expired (>30 min) before an "
                                       "active session could drain it."}),
                encoding="utf-8")
            continue
        if not valid_sig(req):
            continue  # unsigned/forged file — ignore entirely
        out.append((rf.name, req))
    return out


def main():
    # single-watcher rule: replace any previous heartbeat with our PID
    HOME.mkdir(parents=True, exist_ok=True)
    me = os.getpid()
    print(f"EA bridge watcher armed (pid {me}). Watching {QUEUE}", flush=True)
    while True:
        HEARTBEAT.write_text(json.dumps(
            {"pid": me, "project": "ea-agent", "epoch": time.time()}),
            encoding="utf-8")
        items = pending()
        if items:
            print("BRIDGE REQUESTS PENDING — drain the queue now "
                  "(verify sigs, act per CLAUDE.md bridge protocol, write "
                  "<id>.response.json, re-arm watcher):", flush=True)
            for name, req in items:
                print(f"  {name}: {req.get('action')} project="
                      f"{req.get('project') or '-'}", flush=True)
            sys.exit(0)
        time.sleep(3)


if __name__ == "__main__":
    main()
