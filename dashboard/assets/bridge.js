/*
 * Bridge layer — only present in the private build served by bridge/server.py.
 * The page is the dashboard; this file adds the action wiring on top.
 * Same page on desktop browser and phone, exactly like the video editor app.
 */
(function () {
  "use strict";
  var KEY = localStorage.getItem("ea_bridge_key") || "";
  var WATCHER = { state: "unknown" };
  var paused = false;

  function $(id) { return document.getElementById(id); }
  function headers() { return { "Content-Type": "application/json", "X-App-Key": KEY }; }
  function get(p) {
    return fetch(p, { headers: headers() }).then(function (r) { return r.json(); })
      .catch(function () { return { ok: false, error: "unreachable" }; });
  }
  function post(p, b) {
    return fetch(p, { method: "POST", headers: headers(), body: JSON.stringify(b || {}) })
      .then(function (r) { return r.json(); })
      .catch(function () { return { ok: false, error: "unreachable" }; });
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function uuid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function toast(msg) {
    var t = $("brToast");
    if (!t) { t = document.createElement("div"); t.id = "brToast"; t.className = "br-toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove("show"); }, 3800);
  }
  function done(r) { toast(r.summary || r.error || "done"); refresh(); }
  function project() { var e = $("brProject"); return e ? e.value : (window.__BRIDGE_PROJECT || ""); }

  // ---- key gate ------------------------------------------------------
  function gate() {
    var g = $("brGate");
    if (!g) return;
    if (KEY) { g.style.display = "none"; return; }
    g.style.display = "";
    $("brUnlock").onclick = function () {
      KEY = $("brKeyInput").value.trim();
      localStorage.setItem("ea_bridge_key", KEY);
      g.style.display = "none";
      refresh();
    };
  }

  // ---- actions -------------------------------------------------------
  function wire() {
    document.querySelectorAll("[data-br-action]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var a = btn.getAttribute("data-br-action");
        if (a === "proceed" || a === "project_status" || a === "run_brief") {
          post("/api/action", { type: a, project: project(), uuid: uuid() }).then(function (r) {
            toast(r.id ? "Sent to the desktop session — see Bridge activity" : (r.summary || r.error));
            refresh();
          });
        } else if (a === "add_task" || a === "complete_task") {
          var t = $("brTask") ? $("brTask").value.trim() : "";
          if (!t) return toast(a === "add_task" ? "type a task first" : "type part of the task text");
          var body = { type: a, project: project(), task: t, uuid: uuid() };
          if (a === "add_task") {
            body.owner = $("brOwner") ? $("brOwner").value : "";
            body.due = $("brDue") ? $("brDue").value : "";
          }
          post("/api/action", body).then(function (r) {
            if ($("brTask")) $("brTask").value = "";
            toast(r.resolved ? "Completed: " + r.resolved : (r.summary || r.error));
            refresh();
          });
        } else if (a === "add_note" || a === "capture_idea" || a === "log_decision") {
          var x = $("brCapture") ? $("brCapture").value.trim() : "";
          if (!x) return toast("nothing to save");
          var b2 = a === "log_decision"
            ? { type: "log_decision", decision: x, reasoning: "", uuid: uuid() }
            : { type: a, project: project(), text: x, uuid: uuid() };
          post("/api/action", b2).then(function (r) {
            if ($("brCapture")) $("brCapture").value = "";
            done(r);
          });
        } else if (a === "rebuild") {
          toast("rebuilding…");
          post("/api/rebuild", {}).then(function (r) { done(r); setTimeout(function () { location.reload(); }, 900); });
        } else if (a === "pause") {
          post(paused ? "/api/resume" : "/api/pause", {}).then(done);
        }
      });
    });
  }

  // ---- queue ---------------------------------------------------------
  function renderQueue(items) {
    var el = $("brQueue");
    if (!el) return;
    if (!items.length) { el.innerHTML = '<p class="dim" style="padding:10px 16px">Nothing queued.</p>'; return; }
    el.innerHTML = items.slice(-8).reverse().map(function (i) {
      var cls = i.state === "done" ? "pill-good" : i.state === "queued" ? "pill-warn"
        : i.state === "question" ? "pill-info" : i.state === "stale" ? "pill-muted" : "pill-crit";
      var h = '<div class="br-item"><div class="br-head"><span>' + esc(i.action) +
        (i.project ? ' <span class="dim">· ' + esc(i.project) + "</span>" : "") +
        '</span><span class="pill ' + cls + '">' + esc(i.state) + "</span></div>";
      if (i.state === "queued") {
        h += '<div class="br-wait">' + (WATCHER.state === "live"
          ? "waiting for the desktop session to pick it up…"
          : "no desktop session listening — this will wait") + "</div>" +
          '<div class="br-btns"><button class="br-btn br-sec" data-br-cancel="' + esc(i.id) + '">Cancel</button></div>';
      }
      if (i.summary) h += '<div class="br-sum">' + esc(i.summary) + "</div>";
      if (i.state === "question" && i.question) {
        h += '<div class="br-q">' + esc(i.question) +
          '<input class="br-in" id="brAns-' + esc(i.id) + '" placeholder="your answer (mic key works)">' +
          '<div class="br-btns"><button class="br-btn" data-br-answer="' + esc(i.id) + '">Send answer</button></div></div>';
      }
      return h + "</div>";
    }).join("");
    el.querySelectorAll("[data-br-cancel]").forEach(function (b) {
      b.onclick = function () { post("/api/cancel", { id: b.getAttribute("data-br-cancel") }).then(done); };
    });
    el.querySelectorAll("[data-br-answer]").forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-br-answer");
        var v = $("brAns-" + id);
        if (!v || !v.value.trim()) return;
        post("/api/answer", { thread: id, answer_to: id, text: v.value.trim(), project: project() }).then(done);
      };
    });
  }

  // ---- status --------------------------------------------------------
  function refresh() {
    if (!KEY) return;
    get("/api/health").then(function (h) {
      paused = !!h.paused;
      WATCHER = h.watcher || { state: "unknown" };
      var s = $("brStatus");
      if (s) {
        var live = WATCHER.state === "live";
        var cls = h.error ? "pill-crit" : live ? "pill-good" : WATCHER.state === "stale" ? "pill-warn" : "pill-crit";
        var label = h.error ? "PC unreachable" : live ? "session listening"
          : WATCHER.state === "stale" ? "session lagging" : "no session listening";
        s.innerHTML = '<span class="pill ' + cls + '">● ' + label + "</span>" +
          (h.pending ? '<span class="pill pill-warn">' + h.pending + " waiting</span>" : "") +
          (paused ? '<span class="pill pill-crit">PAUSED</span>' : "") +
          '<span class="dim" style="font-size:12px">' +
          (WATCHER.age_s != null ? "heartbeat " + WATCHER.age_s + "s ago" : "") + "</span>";
      }
      var pb = document.querySelector('[data-br-action="pause"]');
      if (pb) pb.textContent = paused ? "Resume bridge" : "Pause bridge";
    });
    get("/api/queue").then(function (q) { if (q.items) renderQueue(q.items); });
  }

  gate();
  wire();
  refresh();
  setInterval(refresh, 6000);
})();
