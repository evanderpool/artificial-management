/*
 * Ops Dashboard — motion choreography (progressive enhancement).
 * The page is fully readable with this file absent or JS disabled;
 * nothing here creates, fetches, or modifies data. No data is embedded
 * in script context — everything animates what the static HTML already shows.
 */
// ---- page chrome: freshness + refresh (runs regardless of motion prefs) ----
(function () {
  "use strict";
  var stamp = document.getElementById("builtAgo");

  function ago(iso) {
    var secs = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (secs < 90) return "just now";
    if (secs < 5400) return Math.round(secs / 60) + " min ago";
    if (secs < 172800) return Math.round(secs / 3600) + " h ago";
    return Math.round(secs / 86400) + " days ago";
  }
  function tick() {
    if (!stamp) return;
    var iso = stamp.getAttribute("data-built");
    if (!iso) return;
    var secs = (Date.now() - new Date(iso).getTime()) / 1000;
    stamp.textContent = "built " + ago(iso);
    stamp.classList.toggle("stale", secs > 86400);
  }
  tick();
  setInterval(tick, 30000);

  var btn = document.getElementById("refreshBtn");
  if (btn) {
    btn.addEventListener("click", function () {
      // bridge.js overrides this on the private build (rebuild, then reload)
      if (btn.dataset.handled === "bridge") return;
      btn.classList.add("spin");
      var u = new URL(window.location.href);
      u.searchParams.set("r", Date.now()); // bypass any CDN/browser cache
      window.location.replace(u.toString());
    });
  }
})();

(function () {
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.gsap) return;
  var gsap = window.gsap;
  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

  // ---- helpers ---------------------------------------------------------
  function countUp(el) {
    // Animate pure integers and "N%" only; leave dates, money, ratios alone.
    var text = (el.textContent || "").trim();
    var m = text.match(/^(\d{1,4})(%?)$/);
    if (!m) return;
    var target = parseInt(m[1], 10);
    var suffix = m[2];
    var obj = { v: 0 };
    gsap.to(obj, {
      v: target,
      duration: 1.1,
      ease: "power2.out",
      delay: 0.35,
      onUpdate: function () {
        el.textContent = Math.round(obj.v) + suffix;
      },
    });
  }

  // ---- load timeline ---------------------------------------------------
  var tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.from("header", { y: -18, autoAlpha: 0, duration: 0.55 });

  var strip = document.querySelectorAll(".explainer, .heartbeat, .activity");
  if (strip.length)
    tl.from(strip, { y: 22, autoAlpha: 0, duration: 0.55, stagger: 0.08 }, "-=0.25");

  var tiles = document.querySelectorAll(".metrics .metric");
  if (tiles.length)
    tl.from(tiles, { y: 18, autoAlpha: 0, duration: 0.45, stagger: 0.05 }, "-=0.3");

  document.querySelectorAll(".metric .v").forEach(countUp);

  // sparkline bars grow out of the baseline
  var bars = document.querySelectorAll(".activity rect.bar, .activity rect.bar-end, .activity rect.bar-zero");
  if (bars.length)
    tl.from(
      bars,
      { scaleY: 0, transformOrigin: "50% 100%", duration: 0.5, stagger: 0.025, ease: "power2.out" },
      "-=0.6"
    );

  // sparkline labels after bars
  var barLabels = document.querySelectorAll(".activity .bar-label, .activity .axis-label");
  if (barLabels.length) tl.from(barLabels, { autoAlpha: 0, duration: 0.4 }, "-=0.1");

  // heartbeat status label pops last
  var hb = document.querySelector(".hb-label");
  if (hb) tl.from(hb, { scale: 0.6, autoAlpha: 0, duration: 0.45, ease: "back.out(2)" }, "-=0.5");

  // ---- architecture diagram: arrows draw themselves --------------------
  document.querySelectorAll(".arch .arrow").forEach(function (el, i) {
    var len = 0;
    try {
      len = el.getTotalLength ? el.getTotalLength() : 0;
    } catch (e) {
      /* line elements without length API */
    }
    if (!len && el.tagName === "line") {
      var dx = (el.x2 && el.x2.baseVal.value) - (el.x1 && el.x1.baseVal.value);
      var dy = (el.y2 && el.y2.baseVal.value) - (el.y1 && el.y1.baseVal.value);
      len = Math.sqrt(dx * dx + dy * dy);
    }
    if (!len) return;
    el.style.strokeDasharray = len;
    el.style.strokeDashoffset = len;
    gsap.to(el, {
      strokeDashoffset: 0,
      duration: 0.8,
      delay: 0.9 + i * 0.18,
      ease: "power2.inOut",
    });
  });
  document.querySelectorAll(".arch .node, .arch text").forEach(function (el, i) {
    gsap.from(el, { autoAlpha: 0, duration: 0.5, delay: 0.7 + i * 0.03 });
  });

  // ---- progress bars fill to their value -------------------------------
  document.querySelectorAll(".progress-fill").forEach(function (el) {
    var w = el.style.width;
    gsap.fromTo(el, { width: "0%" }, { width: w, duration: 0.9, delay: 0.5, ease: "power2.out" });
  });

  // ---- below-the-fold cards reveal on scroll ---------------------------
  if (window.ScrollTrigger) {
    window.ScrollTrigger.batch(".grid .card", {
      start: "top 92%",
      once: true,
      onEnter: function (els) {
        gsap.from(els, { y: 26, autoAlpha: 0, duration: 0.6, stagger: 0.08, ease: "power3.out" });
      },
    });
  } else {
    gsap.from(".grid .card", { y: 26, autoAlpha: 0, duration: 0.6, stagger: 0.08, delay: 0.4 });
  }
})();
