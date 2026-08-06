#!/usr/bin/env node
/**
 * Artificial Management — Ops Dashboard generator (v1.5)
 *
 * Reads the markdown source of truth and emits dashboard/index.html.
 * The repo stays the only writable store; this page is read-only glass.
 *
 * v1.5: progressive disclosure — expandable agent/skill/decision rows
 * (native <details>, zero JS), GitHub source links on every card,
 * self-explainer panel, architecture diagram, weekly activity sparkline.
 *
 * Data whitelist (public repo, public page): statuses, counts, dates,
 * decision/change log lines, aggregate monthly spend, next-action titles.
 * Never: resume content, service pricing, outreach templates, emails.
 * scrub() enforces the last two on all free text.
 *
 * Usage: node dashboard/build.js   (run from repo root or dashboard/)
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const GH = "https://github.com/evanderpool/artificial-management/blob/main/";

const ROOT = fs.existsSync(path.join(process.cwd(), "CLAUDE.md"))
  ? process.cwd()
  : path.resolve(__dirname, "..");

const read = (rel) => {
  try {
    return fs.readFileSync(path.join(ROOT, rel), "utf8");
  } catch {
    console.warn(`WARN: missing ${rel}`);
    return "";
  }
};

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const stripMd = (s) =>
  s.replace(/\*\*/g, "").replace(/`/g, "").replace(/~~/g, "").trim();

const truncate = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

// Whitelist enforcement on free text: no emails, no dollar amounts.
// Replacements are worded so scrubbed lines read as deliberate redaction,
// not rendering glitches; degenerate "from X to X" sentences are rewritten.
const scrub = (s) =>
  s
    .replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, "[address redacted]")
    .replace(/\$\d[\d,]*(?:\.\d+)?\+?(?:\/mo(?:nth)?)?/g, "[price redacted]")
    .replace(
      /from \[address redacted\] to \[address redacted\]/g,
      "to the business inbox (addresses redacted)"
    );

const srcLink = (rel, label) =>
  `<a href="${GH}${esc(rel)}" target="_blank" rel="noopener">${esc(label || rel)}</a>`;

// ---------------------------------------------------------------- parsers

function parseTableRows(md, sectionHeading) {
  const idx = md.indexOf(sectionHeading);
  if (idx === -1) return [];
  const lines = md.slice(idx).split("\n");
  const rows = [];
  let inTable = false;
  for (const line of lines.slice(1)) {
    const t = line.trim();
    if (t.startsWith("|")) {
      inTable = true;
      const cells = t.split("|").slice(1, -1).map((c) => stripMd(c));
      if (cells.every((c) => /^[-\s:]*$/.test(c))) continue; // separator
      rows.push(cells);
    } else if (inTable && t !== "") {
      break;
    } else if (!inTable && t.startsWith("#")) {
      break; // next heading before any table — empty section, don't swallow the next table
    }
  }
  return rows.slice(1); // drop header row
}

const trackerMd = read("projects/master-operating-system/project-tracker.md");
const registryMd = read("projects/master-operating-system/ai-system-registry.md");
const decisionsMd = read("decisions/log.md");
const changesMd = read("logs/changes.md");
const prioritiesMd = read("context/current-priorities.md");

// --private: master view — includes Private rows and extra repos from
// dashboard/private-sources.json; output goes to dashboard/private/ (gitignored).
const PRIVATE_MODE = process.argv.includes("--private");

// | Project | ID | Type | Visibility | Status | Deadline | Last Updated | Next Step |
const parsePortfolio = (md, sourceLabel) =>
  parseTableRows(md, "## Project Portfolio").map((c) => {
    const vis = (c[3] || "").trim().toLowerCase();
    // fail CLOSED: anything that isn't explicitly "public" is treated as private
    if (vis !== "public" && vis !== "private")
      console.warn(`WARN: project "${c[0]}" has visibility "${c[3] || ""}" — treating as private`);
    return {
      name: scrub(c[0] || "?"),
      id: (c[1] || "").replace(/[^\w-]/g, ""),
      type: scrub(c[2] || ""),
      visibility: vis === "public" ? "public" : "private",
      status: c[4] || "?",
      deadline: c[5] || "—",
      lastUpdated: c[6] || "",
      nextAction: scrub(c[7] || ""),
      source: sourceLabel || "",
      sectionKey: scrub(c[0] || "?"),
    };
  });

// ### <Project Name> — Tasks   followed by | Task | Owner | Status | Due |
function parseTaskSections(md) {
  const out = {};
  const re = /^### (.+?) — Tasks\s*$/gm;
  let m;
  while ((m = re.exec(md))) {
    const key = stripMd(m[1].trim());
    if (out[key]) console.warn(`WARN: duplicate Tasks section for "${key}" — last one wins`);
    out[key] = parseTableRows(md.slice(m.index), `### ${m[1]} — Tasks`).map((c) => ({
      task: scrub(c[0] || ""),
      owner: scrub(c[1] || "—"),
      status: c[2] || "—",
      due: c[3] || "",
    }));
  }
  return out;
}

// ### <Project Name> — Milestones   followed by | Milestone | Target | Status |
function parseMilestoneSections(md) {
  const out = {};
  const re = /^### (.+?) — Milestones\s*$/gm;
  let m;
  while ((m = re.exec(md))) {
    out[stripMd(m[1].trim())] = parseTableRows(md.slice(m.index), `### ${m[1]} — Milestones`).map(
      (c) => ({ milestone: scrub(c[0] || ""), target: c[1] || "", status: c[2] || "—" })
    );
  }
  return out;
}

// ### <Project Name> — Detail   bold key-value lines + risk bullets
function parseDetailSections(md) {
  const out = {};
  const re = /^### (.+?) — Detail\s*$/gm;
  let m;
  while ((m = re.exec(md))) {
    const name = stripMd(m[1].trim());
    const rest = md.slice(re.lastIndex);
    const endIdx = rest.search(/^###? /m);
    const block = endIdx === -1 ? rest : rest.slice(0, endIdx);
    const d = { fields: {}, risks: [] };
    let inRisks = false;
    for (const line of block.split("\n")) {
      const kv = line.match(/^\*\*([\w /]+):\*\*\s*(.*)$/);
      if (kv) {
        inRisks = /risks/i.test(kv[1]);
        if (!inRisks && kv[2].trim()) d.fields[kv[1].trim()] = scrub(kv[2].trim());
        continue;
      }
      const bullet = line.match(/^- (.+)$/);
      if (bullet && inRisks) d.risks.push(scrub(bullet[1].trim()));
    }
    out[name] = d;
  }
  return out;
}

let projects = parsePortfolio(trackerMd, "");
let taskSections = parseTaskSections(trackerMd);
let milestoneSections = parseMilestoneSections(trackerMd);
let detailSections = parseDetailSections(trackerMd);

if (PRIVATE_MODE) {
  let sources = [];
  try {
    sources = JSON.parse(
      fs.readFileSync(path.join(ROOT, "dashboard", "private-sources.json"), "utf8")
    );
  } catch (e) {
    if (e.code !== "ENOENT") console.warn(`WARN: private-sources.json unreadable — ${e.message}`);
  }
  for (const src of sources) {
    // per-source isolation: one bad path must not silently drop the rest
    try {
      const md = fs.readFileSync(src.tracker, "utf8");
      const label = src.name || src.tracker;
      const ns = (k) => `${label}::${k}`;
      const rows = parsePortfolio(md, label).map((p) => ({
        ...p,
        visibility: "private",
        sectionKey: ns(p.sectionKey),
      }));
      projects = projects.concat(rows);
      for (const [k, v] of Object.entries(parseTaskSections(md))) {
        if (taskSections[ns(k)]) console.warn(`WARN: task-section collision ${ns(k)}`);
        taskSections[ns(k)] = v;
      }
      for (const [k, v] of Object.entries(parseMilestoneSections(md)))
        milestoneSections[ns(k)] = v;
      for (const [k, v] of Object.entries(parseDetailSections(md))) detailSections[ns(k)] = v;
    } catch (e) {
      console.warn(`WARN: private source "${src.name || src.tracker}" FAILED — ${e.message} — its projects are MISSING from this build`);
    }
  }
}
const visibleProjects = PRIVATE_MODE
  ? projects
  : projects.filter((p) => p.visibility === "public");

// | Agent ID | Agent Name | Purpose | Status | Spec File | Key Inputs | Key Outputs | Dependencies | Last Updated |
const agents = parseTableRows(registryMd, "## Section 1 — Agent Registry").map(
  (c) => ({
    id: c[0] || "?",
    name: c[1] || c[0] || "?",
    purpose: scrub(c[2] || ""),
    status: c[3] || "?",
    spec: (c[4] || "").replace(/[`]/g, "").trim(),
    inputs: scrub(c[5] || ""),
    outputs: scrub(c[6] || ""),
    deps: scrub(c[7] || ""),
    updated: c[8] || "",
  })
);

// | Skill ID | Skill Name | Purpose | Status | Skill File | Used By | Last Updated |
const skills = parseTableRows(registryMd, "## Section 3 — Skill Registry").map(
  (c) => ({
    id: c[0] || "?",
    name: c[1] || "?",
    purpose: scrub(c[2] || ""),
    status: c[3] || "?",
    file: (c[4] || "").replace(/[`]/g, "").trim(),
    usedBy: c[5] || "",
  })
);

// | Tool Name | Type | Status | ...
const tools = parseTableRows(registryMd, "## Section 2 — Tool Registry").map(
  (c) => ({ name: c[0] || "?", status: c[2] || "?" })
);

const decisionRe =
  /^\[(\d{4}-\d{2}-\d{2})\] DECISION: (.+?) \| REASONING: (.+?)(?: \| CONTEXT: (.+))?$/gm;
const decisions = [...decisionsMd.matchAll(decisionRe)].map((m) => ({
  date: m[1],
  text: scrub(stripMd(m[2])),
  reasoning: scrub(stripMd(m[3] || "")),
  context: scrub(stripMd(m[4] || "")),
}));

const changeRe =
  /^\[(\d{4}-\d{2}-\d{2})\] CHANGED: (.*?) \| TYPE: (\w[\w/ ]*?) \|(?: PROJECT: (.*?) \|)?/gm;
const changes = [...changesMd.matchAll(changeRe)].map((m) => ({
  date: m[1],
  file: scrub(stripMd(m[2])),
  type: m[3].trim(),
  project: (m[4] || "").trim(),
}));

let sessionFiles = [];
try {
  sessionFiles = fs
    .readdirSync(path.join(ROOT, "logs/sessions"))
    .filter((f) => /^\d{4}-\d{2}-\d{2}/.test(f));
} catch {}
const lastSessionDate = sessionFiles.map((f) => f.slice(0, 10)).sort().pop() || "—";

let costSummary = "—";
try {
  const trackers = fs
    .readdirSync(path.join(ROOT, "references/cost-tracker"))
    .filter((f) => /^\d{4}-\d{2}-cost-tracker\.md$/.test(f))
    .sort();
  const latest = trackers.pop();
  if (latest) {
    const md = read(`references/cost-tracker/${latest}`);
    const m = md.match(/\| *Total confirmed monthly spend *\| *(.+?) *\|/);
    if (m) costSummary = stripMd(m[1]);
  }
} catch {}
// Tile grammar: a short number in the value slot, prose in the subtitle.
let costValue = costSummary;
let costNote = "";
const cm = costSummary.match(/^(~?\$\d[\d,]*(?:\.\d+)?)\s*\/?\s*month\s*(.*)$/i);
if (cm) {
  costValue = cm[1] + "/mo";
  costNote = cm[2].trim();
}

const prioUpdated =
  (prioritiesMd.match(/\*\*Last updated:\*\*\s*(\d{4}-\d{2}-\d{2})/) || [])[1] || "";

const naIdx = prioritiesMd.indexOf("### Immediate Next Actions");
const nextActions = [];
if (naIdx !== -1) {
  for (const line of prioritiesMd.slice(naIdx).split("\n").slice(1)) {
    const t = line.trim();
    if (t.startsWith("#")) break;
    const m = t.match(/^- \*\*(.+?)\*\*/);
    if (m && !t.startsWith("- ~~")) nextActions.push(stripMd(m[1]));
  }
}

let lastCommitDate = null;
let lastCommitSubject = "";
try {
  lastCommitDate = new Date(
    execSync("git log -1 --format=%cI", { cwd: ROOT }).toString().trim()
  );
  lastCommitSubject = execSync("git log -1 --format=%s", { cwd: ROOT })
    .toString()
    .trim();
} catch {
  console.warn("WARN: git unavailable — heartbeat falls back to session date");
}

const now = new Date();
const daysSince = (d) => Math.floor((now - d) / 86400000);
const heartbeatDays = lastCommitDate
  ? daysSince(lastCommitDate)
  : lastSessionDate !== "—"
  ? daysSince(new Date(lastSessionDate))
  : null;

const heartbeat =
  heartbeatDays === null
    ? { level: "warn", label: "UNKNOWN", detail: "No git history or session logs found." }
    : heartbeatDays > 14
    ? {
        level: "crit",
        label: "STALE",
        detail: `No commits in ${heartbeatDays} days — past both the 7-day quiet and 14-day stale thresholds. Trackers below reflect the last active state, not the present.`,
      }
    : heartbeatDays > 7
    ? { level: "warn", label: "QUIET", detail: `No commits in ${heartbeatDays} days — past the 7-day quiet threshold.` }
    : { level: "good", label: "ACTIVE", detail: `Last commit ${heartbeatDays} day${heartbeatDays === 1 ? "" : "s"} ago.` };
heartbeat.detail += " Recomputed at every build — rebuilt daily by CI.";

// ------------------------------------------------- activity sparkline data

// Bucket change-log entries by ISO week (Monday start), first entry → now.
const mondayOf = (d) => {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7));
  return x;
};
let weeks = [];
if (changes.length) {
  const first = mondayOf(new Date(changes.map((c) => c.date).sort()[0]));
  const lastW = mondayOf(now);
  const counts = {};
  for (const c of changes) {
    const k = mondayOf(new Date(c.date)).toISOString().slice(0, 10);
    counts[k] = (counts[k] || 0) + 1;
  }
  for (let d = new Date(first); d <= lastW; d.setUTCDate(d.getUTCDate() + 7)) {
    const k = d.toISOString().slice(0, 10);
    weeks.push({ week: k, count: counts[k] || 0 });
  }
}

function sparklineSVG() {
  if (!weeks.length) return "";
  const shown = weeks.slice(-26); // cap: trailing 26 weeks
  const capped = shown.length < weeks.length;
  const PAD = 16, BW = 16, GAP = 3, H = 64, TOP = 16, LBL = 16;
  const W = shown.length * (BW + GAP) - GAP + PAD * 2;
  const max = Math.max(...shown.map((w) => w.count));
  const maxIdx = shown.findIndex((w) => w.count === max);
  const lastIdx = shown.length - 1;
  // sqrt scale keeps small weeks visible next to the 190-change build burst
  const scale = (c) =>
    c === 0 ? 0 : Math.max(2, Math.round((Math.sqrt(c) / Math.sqrt(max)) * (H - TOP)));
  const bars = shown
    .map((w, i) => {
      const x = PAD + i * (BW + GAP);
      if (w.count === 0)
        return `<rect x="${x}" y="${H - 1}" width="${BW}" height="1" class="bar-zero"><title>Week of ${w.week}: no changes logged</title></rect>`;
      const h = scale(w.count);
      const y = H - h;
      const emphasized = i === lastIdx;
      let out = `<rect x="${x}" y="${y}" width="${BW}" height="${h}" rx="2"
        class="bar${emphasized ? " bar-end" : ""}"><title>Week of ${w.week}: ${w.count} change${w.count === 1 ? "" : "s"} logged</title></rect>`;
      if (i === maxIdx || (emphasized && i !== maxIdx))
        out += `<text x="${x + BW / 2}" y="${y - 4}" class="bar-label">${w.count}</text>`;
      return out;
    })
    .join("\n");
  const firstLabel = (capped ? "…" : "") + shown[0].week.slice(0, 7);
  const lastLabel = shown[lastIdx].week.slice(0, 7);
  const zeroWeeks = shown.filter((w) => w.count === 0).length;
  return `<svg viewBox="0 0 ${W} ${H + LBL}" width="${W}" height="${H + LBL}" role="img"
    aria-label="Changes logged per week, ${firstLabel} to ${lastLabel}: peak ${max} in week of ${shown[maxIdx].week}, ${zeroWeeks} quiet weeks, ${shown[lastIdx].count} this week. Square-root scale.">
    <line x1="${PAD}" y1="${H}" x2="${W - PAD}" y2="${H}" class="baseline"/>
    ${bars}
    <text x="${PAD}" y="${H + 13}" class="axis-label">${firstLabel}</text>
    <text x="${W - PAD}" y="${H + 13}" class="axis-label" text-anchor="end">${lastLabel}</text>
  </svg>`;
}

// ------------------------------------------------- architecture diagram

const archSVG = `<svg viewBox="0 -8 720 218" width="100%" style="min-width:640px" role="img"
  aria-label="Architecture: markdown source of truth is read by agents and skills, whose outputs are written back append-only; this dashboard is generated read-only from the same files.">
  <defs>
    <marker id="arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L8,4 L0,8 z" class="arrow-head"/>
    </marker>
  </defs>
  <g class="node">
    <rect x="8" y="30" width="200" height="110" rx="6"/>
    <text x="108" y="52" text-anchor="middle" class="node-title">MARKDOWN SOURCE OF TRUTH</text>
    <text x="108" y="74" text-anchor="middle" class="node-body">context/ · projects/</text>
    <text x="108" y="92" text-anchor="middle" class="node-body">decisions/log.md · logs/</text>
    <text x="108" y="110" text-anchor="middle" class="node-body">registry · trackers · SOPs</text>
    <text x="108" y="130" text-anchor="middle" class="node-dim">git-versioned · append-only logs</text>
  </g>
  <g class="node">
    <rect x="268" y="30" width="180" height="110" rx="6"/>
    <text x="358" y="52" text-anchor="middle" class="node-title">AGENTS &amp; SKILLS</text>
    <text x="358" y="74" text-anchor="middle" class="node-body">${agents.length} agents · ${skills.length} skills</text>
    <text x="358" y="92" text-anchor="middle" class="node-body">run in Claude Code</text>
    <text x="358" y="110" text-anchor="middle" class="node-body">+ 1 scheduled routine</text>
    <text x="358" y="130" text-anchor="middle" class="node-dim">read → act → write back</text>
  </g>
  <g class="node">
    <rect x="512" y="30" width="200" height="110" rx="6"/>
    <text x="612" y="52" text-anchor="middle" class="node-title">OUTPUTS</text>
    <text x="612" y="74" text-anchor="middle" class="node-body">daily briefs · sprint plans</text>
    <text x="612" y="92" text-anchor="middle" class="node-body">integrity audits · cost reports</text>
    <text x="612" y="110" text-anchor="middle" class="node-body">weekly email briefing</text>
    <text x="612" y="130" text-anchor="middle" class="node-dim">every output cites its sources</text>
  </g>
  <line x1="208" y1="85" x2="262" y2="85" class="arrow" marker-end="url(#arr)"/>
  <line x1="448" y1="85" x2="506" y2="85" class="arrow" marker-end="url(#arr)"/>
  <path d="M 612 140 L 612 168 L 108 168 L 108 146" class="arrow" fill="none" marker-end="url(#arr)"/>
  <text x="360" y="163" text-anchor="middle" class="node-dim">written back to the same files — append-only, change-logged</text>
  <path d="M 108 30 L 108 12 L 680 12" class="arrow arrow-accent" fill="none" marker-end="url(#arr)"/>
  <text x="394" y="8" text-anchor="middle" class="node-accent">dashboard/build.js reads the same files → generates this page (read-only)</text>
</svg>`;

// ---------------------------------------------------------------- render

const STATUS_LEVEL = {
  active: "good",
  complete: "good",
  connected: "good",
  "in progress": "info",
  "spec complete": "muted",
  planning: "muted",
  planned: "muted",
  "not connected": "muted",
  blocked: "crit",
  stale: "warn",
  deprecated: "warn",
};
const level = (status) => STATUS_LEVEL[status.toLowerCase()] || "muted";
const pill = (status) => `<span class="pill pill-${level(status)}">${esc(status)}</span>`;

const countBy = (arr) => {
  const m = {};
  for (const x of arr) m[x.status] = (m[x.status] || 0) + 1;
  return Object.entries(m)
    .map(([k, v]) => `${v} ${k}`)
    .join(" · ");
};

const fmtDate = (d) =>
  d.toISOString().slice(0, 10) + " " + d.toISOString().slice(11, 16) + " UTC";

// Cross-check: registry status vs tracker status for the same name.
// A mismatch is surfaced as a visible conflict pill — drift is shown, not hidden.
const trackerStatusByName = {};
for (const p of visibleProjects) trackerStatusByName[p.name.toLowerCase()] = p.status;
const conflictPill = (a) => {
  const ts = trackerStatusByName[a.name.toLowerCase()];
  if (!ts || ts.toLowerCase() === a.status.toLowerCase()) return "";
  console.warn(`WARN: status conflict for "${a.name}" — registry: ${a.status} / tracker: ${ts}`);
  return `<span class="pill pill-warn" title="Registry and project tracker disagree — flagged by the build's integrity cross-check">conflict · tracker: ${esc(ts)}</span>`;
};

const agentItems = agents
  .map(
    (a) => `<details class="row">
  <summary><span class="chev"></span><span class="row-name">${esc(a.name)}</span>${conflictPill(a)}${pill(a.status)}</summary>
  <div class="row-body">
    <p>${esc(a.purpose)}</p>
    <div class="kv">
      <div><span class="k">Reads</span><span>${esc(a.inputs) || "—"}</span></div>
      <div><span class="k">Produces</span><span>${esc(a.outputs) || "—"}</span></div>
      <div><span class="k">Depends on</span><span>${esc(a.deps) || "—"}</span></div>
    </div>
    ${a.spec && a.spec !== "—" ? `<div class="row-links">${srcLink(a.spec, "spec: " + a.spec)}</div>` : ""}
  </div>
</details>`
  )
  .join("\n");

const skillItems = skills
  .map(
    (s) => `<details class="row">
  <summary><span class="chev"></span><span class="row-name mono">/${esc(s.id)}</span>${pill(s.status)}</summary>
  <div class="row-body">
    <p>${esc(s.purpose)}</p>
    <div class="row-links">${s.file ? srcLink(s.file, "source: " + s.file) : ""}${
      s.usedBy ? `<span class="dim">· used by ${esc(s.usedBy)}</span>` : ""
    }</div>
  </div>
</details>`
  )
  .join("\n");

// ---- PM computations -------------------------------------------------
// Date convention: all comparisons are date-only in UTC; a due date is
// inclusive — an item is overdue only when today is strictly past it.
const DAY = 86400000;
const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
const parseISO = (s) => {
  const m = String(s).match(/(\d{4}-\d{2}-\d{2})/);
  return m ? new Date(m[1] + "T00:00:00Z") : null;
};
const daysFromNow = (d) => Math.round((d - todayUTC) / DAY);
const isDone = (status) => /^(complete|completed|done)\b/i.test(status.trim());
const isBlocked = (status) => /^blocked\b/i.test(status.trim());
// Only http(s) hrefs survive; anything else renders as plain text (no javascript: injection)
const mdLinks = (s) =>
  esc(s).replace(/\[([^\]]+)\]\(([^\s)]+)\)/g, (full, label, href) =>
    /^https?:\/\//i.test(href)
      ? `<a href="${href}" target="_blank" rel="noopener">${label}</a>`
      : label
  );

const deadlineChip = (dateStr, doneOverall) => {
  const d = parseISO(dateStr);
  if (!d || doneOverall) return "";
  const n = daysFromNow(d);
  if (n < 0) return `<span class="pill pill-crit">${-n}d overdue</span>`;
  if (n <= 7) return `<span class="pill pill-warn">${n}d left</span>`;
  return `<span class="pill pill-muted">${n}d left</span>`;
};

// Attention-first ordering: Blocked, In Progress, Planning, Complete; then by deadline
const STATUS_ORDER = { blocked: 0, "in progress": 1, planning: 2, stale: 2, complete: 3 };
const sortedProjects = [...visibleProjects].sort((a, b) => {
  const so =
    (STATUS_ORDER[a.status.toLowerCase()] ?? 2) - (STATUS_ORDER[b.status.toLowerCase()] ?? 2);
  if (so !== 0) return so;
  const da = parseISO(a.deadline),
    db = parseISO(b.deadline);
  return (da ? da.getTime() : Infinity) - (db ? db.getTime() : Infinity);
});

// Orphan detection: sections with no portfolio row are silently invisible — warn instead
const rowKeys = new Set(projects.map((p) => p.sectionKey));
for (const k of Object.keys(taskSections))
  if (!rowKeys.has(k)) console.warn(`WARN: Tasks section "${k}" matches no portfolio row (name/em-dash mismatch?)`);

const projectData = sortedProjects
  .map((p) => {
    const tasks = taskSections[p.sectionKey] || [];
    const milestones = milestoneSections[p.sectionKey] || [];
    const detail = detailSections[p.sectionKey] || { fields: {}, risks: [] };
    const doneOverall = isDone(p.status);

    // progress
    const doneCount = tasks.filter((t) => isDone(t.status)).length;
    const pct = tasks.length ? Math.round((doneCount / tasks.length) * 100) : doneOverall ? 100 : 0;
    const blockedCount = tasks.filter((t) => isBlocked(t.status)).length;
    const lateBy = (dateStr, status) => {
      const d = parseISO(dateStr);
      return d && daysFromNow(d) < 0 && !isDone(status);
    };
    const overdueCount =
      tasks.filter((t) => lateBy(t.due, t.status)).length +
      milestones.filter((ms) => lateBy(ms.target, ms.status)).length;
    const msDone = milestones.filter((ms) => isDone(ms.status)).length;
    const nextMilestone = milestones
      .filter((ms) => !isDone(ms.status) && parseISO(ms.target))
      .sort((a, b) => parseISO(a.target) - parseISO(b.target))[0];

    // staleness (own 2-week rule, independent of repo heartbeat)
    const lu = parseISO(p.lastUpdated);
    const staleDays = lu ? -daysFromNow(lu) : null;
    const staleChip =
      staleDays !== null && staleDays > 14 && !doneOverall
        ? `<span class="pill pill-warn">stale ${staleDays}d</span>`
        : "";

    const agentsInvolved = [...new Set(tasks.map((t) => t.owner).filter((o) => o && o !== "—"))];

    const progressBar = (mini) => `<span class="progress${mini ? " mini" : ""}" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${mini ? esc(p.name) + " tasks complete" : "tasks complete"}"><span class="progress-fill" style="width:${pct}%"></span></span>`;

    const fieldRows = [
      ["Description", detail.fields["Description"]],
      ["Priority", detail.fields["Priority"]],
      ["Client", detail.fields["Client"]],
      ["Start", detail.fields["Start"]],
      ["Deadline", p.deadline !== "—" ? `${esc(p.deadline)} ${deadlineChip(p.deadline, doneOverall)}` : null],
      ["Next milestone", nextMilestone ? `${esc(nextMilestone.milestone)} <span class="num dim">(${esc(nextMilestone.target)})</span>` : null],
      ["Updated", p.lastUpdated ? `${esc(p.lastUpdated)} ${staleChip}` : null],
      ["Team", agentsInvolved.length ? agentsInvolved.map((a) => `<span class="pill pill-muted">${esc(a)}</span>`).join(" ") : null],
      ["Links", detail.fields["Links"] ? mdLinks(detail.fields["Links"]) : null],
    ]
      .filter(([, v]) => v)
      .map(([k, v]) => {
        const isHtml = ["Deadline", "Next milestone", "Updated", "Team", "Links"].includes(k);
        return `<div><span class="k">${k}</span><span>${isHtml ? v : esc(v)}</span></div>`;
      })
      .join("\n");

    const milestoneHtml = milestones.length
      ? milestones
          .map((ms) => {
            const late = lateBy(ms.target, ms.status);
            return `<div class="task-line"><span${late ? ' class="overdue"' : ""}>${esc(ms.milestone)}</span><span class="num dim" style="white-space:nowrap">${esc(ms.target)}</span>${late ? '<span class="pill pill-crit">late</span>' : pill(ms.status)}</div>`;
          })
          .join("\n")
      : "";

    const byOwner = {};
    for (const t of tasks) (byOwner[t.owner] = byOwner[t.owner] || []).push(t);
    const taskHtml = tasks.length
      ? Object.entries(byOwner)
          .map(
            ([owner, ts]) => `<div class="task-group">
  <div class="task-owner">${esc(owner)}</div>
  ${ts
    .map((t) => {
      const late = lateBy(t.due, t.status);
      return `<div class="task-line"><span${late ? ' class="overdue"' : ""}>${esc(t.task)}</span>${t.due ? `<span class="num dim" style="white-space:nowrap">${esc(t.due)}</span>` : ""}${late ? '<span class="pill pill-crit">late</span>' : pill(t.status)}</div>`;
    })
    .join("\n")}
</div>`
          )
          .join("\n")
      : `<p class="dim">No task breakdown yet — add a "### ${esc(p.name)} — Tasks" section to the tracker.</p>`;

    const riskHtml = detail.risks.length
      ? `<ul class="risk-list">` + detail.risks.map((r) => `<li>${esc(r)}</li>`).join("") + `</ul>`
      : "";

    const projChanges = p.id
      ? changes.filter((c) => c.project === p.id).slice(-6).reverse()
      : [];
    const changesHtml = projChanges.length
      ? projChanges
          .map(
            (c) =>
              `<div class="task-line dim"><span><span class="num">${c.date}</span> · <span class="mono">${esc(truncate(c.file, 48))}</span></span></div>`
          )
          .join("\n")
      : "";

    const readmeRel = `projects/${p.id}/README.md`;
    const readmeLink =
      p.id && fs.existsSync(path.join(ROOT, readmeRel))
        ? `<div class="row-links">${srcLink(readmeRel, "README: " + readmeRel)}</div>`
        : "";

    const summaryBits = `<span class="row-name">${esc(p.name)}</span>${
      PRIVATE_MODE && p.visibility === "private"
        ? `<span class="pill pill-warn">private</span>`
        : ""
    }${pill(p.status)}`;

    return { p, tasks, milestones, pct, doneCount, msDone, blockedCount, overdueCount, doneOverall, staleChip, nextMilestone, fieldRows, milestoneHtml, taskHtml, riskHtml, changesHtml, readmeLink, summaryBits };
  });

const projectItems = projectData
  .map((d) =>
    d.p.id
      ? `<a class="row-link" href="projects/${d.p.id}.html"><span class="chev"></span>${d.summaryBits}<span class="go">open →</span></a>`
      : `<div class="row-link"><span class="chev"></span>${d.summaryBits}</div>`
  )
  .join("\n");

const decisionItems = decisions
  .slice(-10)
  .reverse()
  .map(
    (d) => `<details class="row">
  <summary><span class="chev"></span><span class="num">${d.date}</span><span class="row-name row-wrap">${esc(
      truncate(d.text, 96)
    )}</span></summary>
  <div class="row-body">
    ${d.text.length > 96 ? `<p>${esc(d.text)}</p>` : ""}
    <div class="kv">
      <div><span class="k">Reasoning</span><span>${esc(d.reasoning) || "—"}</span></div>
      ${d.context ? `<div><span class="k">Context</span><span>${esc(d.context)}</span></div>` : ""}
    </div>
  </div>
</details>`
  )
  .join("\n");

const changeItems = changes
  .slice(-8)
  .reverse()
  .map(
    (c) =>
      `<li><span class="num">${c.date}</span><span class="mono dim">${esc(
        truncate(c.file, 58)
      )}</span><span class="pill pill-muted">${esc(c.type)}</span></li>`
  )
  .join("\n");

const nextActionItems = nextActions.map((a) => `<li>${esc(a)}</li>`).join("\n");

// ---- bridge layer (private build only) -------------------------------
// The dashboard IS the app: these cards are injected into the same pages,
// styled with the same classes. Public build never includes them.
const BRIDGE = PRIVATE_MODE;

const brGate = BRIDGE
  ? `<div class="card" id="brGate" style="display:none">
  <h2>Bridge access key</h2>
  <div style="padding:12px 16px 14px;display:flex;gap:8px;flex-wrap:wrap">
    <input class="br-in" id="brKeyInput" type="password" placeholder="paste the key shown on the PC" style="flex:1;min-width:200px">
    <button class="br-btn" id="brUnlock">Unlock</button>
  </div>
</div>`
  : "";

const brStatusCard = BRIDGE
  ? `<div class="card">
  <h2>Bridge <small class="dim">actions run on this PC</small></h2>
  <div id="brStatus" class="br-status">connecting…</div>
  <div class="br-actions">
    <button class="br-btn br-sec" data-br-action="rebuild">Rebuild dashboard</button>
    <button class="br-btn br-danger" data-br-action="pause">Pause bridge</button>
  </div>
</div>`
  : "";

const brCaptureCard = BRIDGE
  ? `<div class="card">
  <h2>Capture</h2>
  <div style="padding:10px 16px 0">
    <textarea class="br-in" id="brCapture" placeholder="note, idea, or decision — tap the mic key to dictate"></textarea>
  </div>
  <div class="br-actions">
    <button class="br-btn" data-br-action="add_note">Save note</button>
    <button class="br-btn br-sec" data-br-action="capture_idea">Save idea</button>
    <button class="br-btn br-sec" data-br-action="log_decision">Log as decision</button>
    <button class="br-btn br-sec" data-br-action="run_brief">Run daily brief</button>
  </div>
</div>`
  : "";

const brQueueCard = BRIDGE
  ? `<div class="card">
  <h2>Bridge activity <small class="dim">queued work + answers</small></h2>
  <div id="brQueue"><p class="dim" style="padding:10px 16px">Nothing queued.</p></div>
</div>`
  : "";

const brStyle = BRIDGE
  ? `
.br-status{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:10px 16px 0}
.br-actions{display:flex;gap:8px;flex-wrap:wrap;padding:12px 16px 14px}
.br-btn{background:color-mix(in srgb,var(--accent) 15%,transparent);color:var(--accent);
  border:1px solid color-mix(in srgb,var(--accent) 38%,transparent);border-radius:8px;
  padding:10px 14px;font:600 13px "Segoe UI",system-ui;cursor:pointer;flex:1 1 auto;min-width:140px}
.br-btn:active{transform:scale(.98)}
.br-sec{background:transparent;color:var(--dim);border-color:var(--line)}
.br-danger{background:color-mix(in srgb,var(--crit) 13%,transparent);color:var(--crit);
  border-color:color-mix(in srgb,var(--crit) 38%,transparent)}
.br-in{width:100%;background:var(--panel-2);color:var(--text);border:1px solid var(--line);
  border-radius:8px;padding:10px;font:14px "Segoe UI",system-ui;margin:4px 0}
textarea.br-in{min-height:62px;resize:vertical}
.br-fields{display:flex;gap:8px;flex-wrap:wrap;padding:10px 16px 0}
.br-fields .br-in{flex:1 1 140px;width:auto}
.br-item{border-bottom:1px solid var(--line);padding:10px 16px;font-size:13px}
.br-item:last-child{border-bottom:none}
.br-head{display:flex;justify-content:space-between;gap:8px;align-items:baseline}
.br-sum{color:var(--dim);margin-top:4px;line-height:1.45}
.br-wait{color:var(--warn);margin-top:4px;font-size:12.5px}
.br-q{margin-top:8px;padding:9px 10px;border-left:3px solid var(--info);
  background:color-mix(in srgb,var(--info) 8%,transparent);border-radius:0 6px 6px 0}
.br-btns{display:flex;gap:8px;margin-top:8px}
.br-btns .br-btn{flex:0 0 auto;min-width:0;padding:6px 12px;font-size:12px}
.br-toast{position:fixed;left:14px;right:14px;bottom:14px;max-width:640px;margin:0 auto;
  background:var(--panel-2);border:1px solid var(--accent);border-radius:10px;padding:12px 14px;
  font-size:13.5px;z-index:99;display:none;box-shadow:0 10px 34px -10px rgba(0,0,0,.7)}
.br-toast.show{display:block}
@media (max-width:520px){ .br-btn{min-width:0;flex:1 1 45%} }
`
  : "";

const STYLE = `
:root{
  --ink:#0e1418; --panel:#151d23; --panel-2:#1a242b; --line:#243139;
  --text:#e7eceb; --dim:#8ca1a3; --accent:#56a8a2;
  --good:#53b788; --warn:#d9a441; --crit:#d96459; --info:#6fa8c9;
}
@media (prefers-color-scheme: light){
  :root{ --ink:#f4f5f2; --panel:#ffffff; --panel-2:#eceeea; --line:#d8dcd6;
    --text:#1d2a26; --dim:#5f6f6d; --accent:#2e7d78;
    --good:#2e8f63; --warn:#8a6410; --crit:#a53d33; --info:#3d7ba3; }
}
:root[data-theme="dark"]{ --ink:#0e1418; --panel:#151d23; --panel-2:#1a242b; --line:#243139;
  --text:#e7eceb; --dim:#8ca1a3; --accent:#56a8a2;
  --good:#53b788; --warn:#d9a441; --crit:#d96459; --info:#6fa8c9; }
:root[data-theme="light"]{ --ink:#f4f5f2; --panel:#ffffff; --panel-2:#eceeea; --line:#d8dcd6;
  --text:#1d2a26; --dim:#5f6f6d; --accent:#2e7d78;
  --good:#2e8f63; --warn:#8a6410; --crit:#a53d33; --info:#3d7ba3; }
*{box-sizing:border-box}
body{margin:0;background:var(--ink);color:var(--text);
  font:15px/1.55 "Segoe UI",system-ui,-apple-system,sans-serif;}
.mono,.num,.pill,.eyebrow,th,h1 .co{font-family:"Cascadia Code","SF Mono",Consolas,ui-monospace,monospace}
.num{font-variant-numeric:tabular-nums}
.wrap{max-width:1120px;margin:0 auto;padding:28px 24px 64px}
header{display:flex;justify-content:space-between;align-items:baseline;gap:16px;flex-wrap:wrap;margin-bottom:14px}
h1{font-size:20px;margin:0;letter-spacing:.02em}
h1 .co{color:var(--accent)}
.eyebrow{font-size:11px;text-transform:uppercase;letter-spacing:.14em;color:var(--dim)}
a{color:var(--accent)}
/* explainer */
.explainer{border:1px solid var(--line);background:var(--panel);border-radius:6px;margin-bottom:16px}
.explainer summary{cursor:pointer;padding:11px 16px;font-size:13px;color:var(--accent);list-style:none;display:flex;align-items:center;gap:10px}
.explainer summary::-webkit-details-marker{display:none}
.explainer[open] summary{border-bottom:1px solid var(--line)}
.explainer .x-body{padding:14px 18px;font-size:14px;color:var(--text);max-width:76ch}
.explainer .x-body p{margin:0 0 10px}
.explainer .arch{padding:6px 18px 16px;overflow-x:auto}
/* heartbeat */
.heartbeat{display:flex;gap:14px;align-items:flex-start;border:1px solid var(--line);
  border-left:4px solid var(--accent);background:var(--panel);border-radius:6px;
  padding:14px 18px;margin-bottom:16px}
.heartbeat.crit{border-left-color:var(--crit)}
.heartbeat.warn{border-left-color:var(--warn)}
.heartbeat.good{border-left-color:var(--good)}
.hb-label{font-family:"Cascadia Code",Consolas,ui-monospace,monospace;font-size:13px;
  letter-spacing:.12em;padding:3px 10px;border-radius:4px;white-space:nowrap}
.crit .hb-label{background:color-mix(in srgb,var(--crit) 18%,transparent);color:var(--crit)}
.warn .hb-label{background:color-mix(in srgb,var(--warn) 18%,transparent);color:var(--warn)}
.good .hb-label{background:color-mix(in srgb,var(--good) 18%,transparent);color:var(--good)}
.hb-detail{color:var(--dim);font-size:14px}
/* activity */
.activity{border:1px solid var(--line);background:var(--panel);border-radius:6px;padding:12px 18px 8px;margin-bottom:16px;overflow-x:auto}
.activity .a-title{font-size:11px;text-transform:uppercase;letter-spacing:.13em;color:var(--dim);
  font-family:"Cascadia Code",Consolas,ui-monospace,monospace;margin-bottom:8px}
.bar{fill:var(--accent);opacity:.75}
.bar:hover{opacity:1}
.bar-end{fill:var(--accent);opacity:1}
.bar-zero{fill:var(--line)}
.a-src{text-transform:none;letter-spacing:.02em}
.baseline{stroke:var(--line);stroke-width:1}
.bar-label{fill:var(--dim);font:11px "Cascadia Code",Consolas,ui-monospace,monospace;text-anchor:middle;font-variant-numeric:tabular-nums}
.axis-label{fill:var(--dim);font:11px "Cascadia Code",Consolas,ui-monospace,monospace}
/* arch diagram */
.node rect{fill:var(--panel-2);stroke:var(--line)}
.node-title{fill:var(--accent);font:600 11px "Cascadia Code",Consolas,ui-monospace,monospace;letter-spacing:.08em}
.node-body{fill:var(--text);font:12px "Segoe UI",system-ui,sans-serif}
.node-dim{fill:var(--dim);font:11px "Segoe UI",system-ui,sans-serif}
.node-accent{fill:var(--accent);font:11px "Segoe UI",system-ui,sans-serif}
.arrow{stroke:var(--dim);stroke-width:1.5}
.arrow-accent{stroke:var(--accent)}
.arrow-head{fill:var(--dim)}
/* metrics */
.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:22px}
.metric{background:var(--panel);border:1px solid var(--line);border-radius:6px;padding:12px 16px}
.metric .v{font-family:"Cascadia Code",Consolas,ui-monospace,monospace;font-size:24px;
  font-variant-numeric:tabular-nums;letter-spacing:-.01em}
.metric .k{font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:var(--dim);margin-top:2px}
.metric .s{font-size:12px;color:var(--dim);margin-top:4px}
/* layout */
.grid{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:16px;align-items:start}
@media (max-width:860px){.grid{grid-template-columns:1fr}}
.card{background:var(--panel);border:1px solid var(--line);border-radius:6px;overflow:hidden}
.card h2{font-size:12px;margin:0;padding:11px 16px;border-bottom:1px solid var(--line);
  text-transform:uppercase;letter-spacing:.13em;color:var(--dim);
  font-family:"Cascadia Code",Consolas,ui-monospace,monospace;font-weight:600;
  display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:baseline}
.card h2 small{letter-spacing:.02em;text-transform:none;font-weight:400}
.card h2 small a{color:var(--dim)}
.card h2 small a:hover{color:var(--accent)}
.card .scroll{overflow-x:auto}
table{border-collapse:collapse;width:100%;font-size:13.5px}
th{font-size:10.5px;text-transform:uppercase;letter-spacing:.1em;color:var(--dim);
  text-align:left;font-weight:600;padding:8px 16px;border-bottom:1px solid var(--line)}
td{padding:8px 16px;border-bottom:1px solid var(--line);vertical-align:top}
tr:last-child td{border-bottom:none}
tbody tr:nth-child(odd){background:color-mix(in srgb,var(--panel-2) 55%,transparent)}
.dim{color:var(--dim)}
.pill{display:inline-block;font-size:11px;letter-spacing:.05em;padding:2px 9px;border-radius:99px;white-space:nowrap}
.pill-good{background:color-mix(in srgb,var(--good) 16%,transparent);color:var(--good)}
.pill-warn{background:color-mix(in srgb,var(--warn) 16%,transparent);color:var(--warn)}
.pill-crit{background:color-mix(in srgb,var(--crit) 16%,transparent);color:var(--crit)}
.pill-info{background:color-mix(in srgb,var(--info) 16%,transparent);color:var(--info)}
.pill-muted{background:color-mix(in srgb,var(--dim) 14%,transparent);color:var(--dim)}
/* expandable rows */
details.row{border-bottom:1px solid var(--line)}
details.row:last-child{border-bottom:none}
details.row summary{cursor:pointer;display:flex;align-items:baseline;gap:12px;
  padding:9px 16px;list-style:none;font-size:13.5px}
details.row summary::-webkit-details-marker{display:none}
details.row summary:hover{background:color-mix(in srgb,var(--panel-2) 70%,transparent)}
details.row summary:focus-visible,.explainer summary:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
@media (max-width:520px){
  details.row summary{flex-wrap:wrap}
  .row-name{white-space:normal}
  table{min-width:560px}
}
/* phone layout — the same page, sized for a hand */
html{overflow-x:hidden}
@media (max-width:640px){
  .wrap{padding:16px 12px 48px}
  h1{font-size:17px}
  header{margin-bottom:10px}
  .metrics{grid-template-columns:repeat(auto-fit,minmax(124px,1fr));gap:10px}
  .metric{padding:10px 12px}
  .metric .v{font-size:20px}
  .grid{gap:12px}
  .explainer .x-body{padding:12px 14px;font-size:13.5px}
  .explainer .arch{max-width:100%;padding:6px 12px 14px}
  .activity{max-width:100%;padding:10px 12px 6px}
  a.row-link{flex-wrap:wrap}
  a.row-link .go{margin-left:auto}
  .card h2{padding:10px 14px;font-size:11px}
  .row-body{padding:4px 14px 12px 28px}
  ul.feed li,ul.next li{padding-left:14px;padding-right:14px}
  ul.next li{padding-left:30px}
}
.chev{flex:none;width:8px;color:var(--dim)}
.chev::before{content:"▸";font-size:11px}
details[open]>summary .chev::before{content:"▾"}
.row-name{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.row-wrap{white-space:normal}
.row-body{padding:4px 16px 14px 36px;font-size:13.5px;background:color-mix(in srgb,var(--panel-2) 45%,transparent)}
.row-body p{margin:6px 0 10px;max-width:72ch}
.kv{display:flex;flex-direction:column;gap:6px}
.kv .k{display:inline-block;min-width:96px;color:var(--dim);font-size:10.5px;
  text-transform:uppercase;letter-spacing:.1em;
  font-family:"Cascadia Code",Consolas,ui-monospace,monospace}
.kv>div{display:flex;gap:8px;align-items:baseline}
.kv span:last-child{color:var(--text)}
.task-group{margin-bottom:8px}
.task-owner{font-size:10.5px;text-transform:uppercase;letter-spacing:.1em;color:var(--accent);
  font-family:"Cascadia Code",Consolas,ui-monospace,monospace;margin:6px 0 4px}
.task-line{display:flex;justify-content:space-between;gap:10px;align-items:baseline;
  padding:3px 0;font-size:13px;border-bottom:1px dashed color-mix(in srgb,var(--line) 60%,transparent)}
.task-line:last-child{border-bottom:none}
.progress{display:inline-block;width:120px;height:6px;border-radius:3px;vertical-align:middle;
  background:color-mix(in srgb,var(--dim) 18%,transparent);overflow:hidden}
.progress.mini{width:56px;height:5px;flex:none}
.progress-fill{display:block;height:100%;background:var(--accent);border-radius:3px}
.overdue{color:var(--crit)}
ul.risk-list{margin:4px 0 0;padding-left:18px;font-size:13px}
ul.risk-list li{margin-bottom:3px;color:var(--text)}
a.row-link{display:flex;align-items:baseline;gap:12px;padding:9px 16px;font-size:13.5px;
  color:var(--text);text-decoration:none;border-bottom:1px solid var(--line)}
a.row-link:last-of-type{border-bottom:none}
a.row-link:hover{background:color-mix(in srgb,var(--panel-2) 70%,transparent)}
a.row-link:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
a.row-link .go{color:var(--accent);font-size:12px;white-space:nowrap}
.row-links{margin-top:10px;font-size:12.5px}
.row-links a{font-family:"Cascadia Code",Consolas,ui-monospace,monospace;font-size:12px}
ul.feed{list-style:none;margin:0;padding:6px 0}
ul.feed li{display:flex;gap:12px;align-items:baseline;padding:7px 16px;font-size:13.5px;border-bottom:1px solid var(--line)}
ul.feed li:last-child{border-bottom:none}
ul.feed .num{color:var(--dim);font-size:12px;white-space:nowrap}
details.row .num{color:var(--dim);font-size:12px;white-space:nowrap}
ul.next{list-style:none;margin:0;padding:6px 0}
ul.next li{padding:8px 16px 8px 34px;position:relative;font-size:14px;border-bottom:1px solid var(--line)}
ul.next li:last-child{border-bottom:none}
ul.next li::before{content:"→";position:absolute;left:16px;color:var(--accent)}
.col{display:flex;flex-direction:column;gap:16px;min-width:0}
footer{margin-top:26px;color:var(--dim);font-size:12.5px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
/* showcase layer */
body{background-image:
  radial-gradient(1100px 520px at 72% -8%, color-mix(in srgb,var(--accent) 8%,transparent), transparent 62%),
  radial-gradient(800px 420px at -10% 108%, color-mix(in srgb,var(--info) 5%,transparent), transparent 60%),
  linear-gradient(color-mix(in srgb,var(--line) 24%,transparent) 1px, transparent 1px),
  linear-gradient(90deg, color-mix(in srgb,var(--line) 24%,transparent) 1px, transparent 1px);
  background-size:auto,auto,44px 44px,44px 44px;
  background-attachment:fixed}
.card,.metric,.heartbeat,.activity,.explainer{
  background:color-mix(in srgb,var(--panel) 86%,transparent);
  backdrop-filter:blur(9px);-webkit-backdrop-filter:blur(9px)}
h1 .co{text-shadow:0 0 18px color-mix(in srgb,var(--accent) 45%,transparent)}
.hb-label{box-shadow:0 0 14px color-mix(in srgb,currentColor 25%,transparent)}
.progress-fill{background:linear-gradient(90deg,var(--accent),color-mix(in srgb,var(--accent) 55%,var(--info)));
  box-shadow:0 0 8px color-mix(in srgb,var(--accent) 40%,transparent)}
@view-transition{navigation:auto}
::view-transition-old(root){animation-duration:.22s}
::view-transition-new(root){animation-duration:.32s}
@media (prefers-reduced-motion: no-preference){
  .heartbeat.good .hb-label{animation:pulse 2.4s ease-in-out infinite}
  @keyframes pulse{50%{opacity:.55}}
  .card,.metric{transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}
  .card:hover,.metric:hover{transform:translateY(-2px);border-color:color-mix(in srgb,var(--accent) 45%,var(--line));
    box-shadow:0 10px 34px -14px color-mix(in srgb,var(--accent) 45%,transparent)}
  a.row-link,details.row summary{transition:background .2s ease}
  a.row-link .go{transition:transform .2s ease}
  a.row-link:hover .go{transform:translateX(4px)}
  .pill{transition:box-shadow .25s ease}
  .pill-good:hover,.pill-crit:hover,.pill-warn:hover{box-shadow:0 0 10px color-mix(in srgb,currentColor 35%,transparent)}
}
@media (prefers-reduced-motion: reduce){
  ::view-transition-old(root),::view-transition-new(root){animation:none}
}
${brStyle}
`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Artificial Management — Ops Dashboard${PRIVATE_MODE ? " (PRIVATE MASTER VIEW)" : ""}</title>
<style>${STYLE}</style>
</head>
<body>
<main class="wrap">
${PRIVATE_MODE ? `<div class="heartbeat warn" style="margin-bottom:16px"><span class="hb-label">PRIVATE</span><div>Master view — includes private and client projects. Never publish or share this file.</div></div>` : ""}
${brGate}
<header>
  <div>
    <div class="eyebrow">Operations Dashboard${BRIDGE ? " · live control" : " · read-only view of the repo"}</div>
    <h1>Artificial Management <span class="co">// AI Operating System</span></h1>
  </div>
  <div class="eyebrow num">built ${fmtDate(now)} · <a href="https://github.com/evanderpool/artificial-management">view the repo</a></div>
</header>

<details class="explainer" open>
  <summary><span class="chev"></span>What is this? — how this page works, and what to click</summary>
  <div class="x-body">
    <p>This is the live operations dashboard for an AI business operating system:
    ${agents.length} specialized AI agents and ${skills.length} reusable skills that run a solo
    business the way a Fortune 500 runs departments — with a project tracker, an
    append-only decision log, a change log, integrity audits, and cost tracking.</p>
    <p>Everything on this page is generated from plain markdown files in a git repo —
    the system's single source of truth. Agents read those files, do their work, and
    write results back; a zero-dependency build script turns the same files into this
    page on every push. No database, no CMS — and the motion layer is vendored,
    local, and purely decorative: disable JavaScript and every number still renders.
    Every card cites its source file — click the file name to see the raw markdown
    behind the number.</p>
    <p><strong>Where to click:</strong> expand any <em>agent</em> to see what it reads, produces, and
    depends on · open a <em>project</em> to get its dedicated dashboard page — tasks by department, milestones, risks, deadlines · expand a <em>decision</em> to see the reasoning it was made with · the
    heartbeat banner above shows whether the system is actively maintained right now —
    it computes that itself, and it does not flatter the owner.</p>
  </div>
  <div class="arch">${archSVG}</div>
</details>

<div class="heartbeat ${heartbeat.level}">
  <span class="hb-label">● ${heartbeat.label}</span>
  <div>
    <div>System heartbeat — ${
      lastCommitDate
        ? `last commit <span class="num">${lastCommitDate.toISOString().slice(0, 10)}</span> · <span class="mono dim">${esc(truncate(lastCommitSubject, 70))}</span>`
        : "git history unavailable"
    }</div>
    <div class="hb-detail">${heartbeat.detail}</div>
  </div>
</div>

<div class="activity">
  <div class="a-title">Activity — changes logged per week <span class="a-src">· sqrt scale · source: ${srcLink("logs/changes.md", "logs/changes.md")}</span></div>
  ${sparklineSVG()}
</div>

<div class="metrics">
  <div class="metric"><div class="v">${visibleProjects.length}</div><div class="k">Projects</div><div class="s">${esc(countBy(visibleProjects))}</div></div>
  <div class="metric"><div class="v">${agents.length}</div><div class="k">Agents</div><div class="s">${esc(countBy(agents))}</div></div>
  <div class="metric"><div class="v">${skills.length}</div><div class="k">Skills</div><div class="s">${esc(countBy(skills))}</div></div>
  <div class="metric"><div class="v">${tools.length}</div><div class="k">Tools</div><div class="s">${esc(countBy(tools.map((t) => ({ status: t.status === "Active" ? "Connected" : t.status }))))}</div></div>
  <div class="metric"><div class="v">${decisions.length}</div><div class="k">Decisions</div><div class="s">logged, append-only</div></div>
  <div class="metric"><div class="v">${changes.length}</div><div class="k">Changes</div><div class="s">logged, append-only</div></div>
  <div class="metric"><div class="v">${esc(costValue)}</div><div class="k">Monthly spend</div><div class="s">${esc(costNote) || "see cost tracker"} · as of ${lastSessionDate}</div></div>
</div>

<div class="grid">
  <div class="col">
    <div class="card">
      <h2>Agent roster — click to expand <small>${srcLink("projects/master-operating-system/ai-system-registry.md", "source: ai-system-registry.md")}</small></h2>
${agentItems}
    </div>
    <div class="card">
      <h2>Project portfolio — click a project for its full dashboard <small>${srcLink("projects/master-operating-system/project-tracker.md", "source: project-tracker.md")}</small></h2>
${projectItems || '<p class="dim" style="padding:10px 16px">No projects registered.</p>'}
    </div>
    <div class="card">
      <h2>Skill registry — click to expand <small>${srcLink("projects/master-operating-system/ai-system-registry.md", "source: ai-system-registry.md")}</small></h2>
${skillItems}
    </div>
  </div>
  <div class="col">
${brStatusCard}
${brQueueCard}
${brCaptureCard}
    <div class="card">
      <h2>Next actions${prioUpdated ? ` — as of ${prioUpdated}` : ""} <small>${srcLink("context/current-priorities.md", "source: current-priorities.md")}</small></h2>
      ${heartbeat.level === "crit" ? `<div class="dim" style="padding:8px 16px 0;font-size:12.5px">Frozen at the last active state — see heartbeat above.</div>` : ""}
      <ul class="next">
${nextActionItems || "<li>None parsed</li>"}
      </ul>
    </div>
    <div class="card">
      <h2>Recent decisions — click for reasoning <small>${srcLink("decisions/log.md", `${decisions.length} total`)}</small></h2>
${decisionItems}
    </div>
    <div class="card">
      <h2>Recent changes <small>${srcLink("logs/changes.md", `${changes.length} total`)}</small></h2>
      <ul class="feed">
${changeItems}
      </ul>
    </div>
  </div>
</div>

<footer>
  <span>Generated by <span class="mono">dashboard/build.js</span> — static data from the markdown source of truth; motion is vendored, local, and decorative.</span>
  <span><a href="https://github.com/evanderpool/artificial-management">github.com/evanderpool/artificial-management</a></span>
</footer>
</main>
<script defer src="assets/gsap.min.js"></script>
<script defer src="assets/ScrollTrigger.min.js"></script>
<script defer src="assets/app.js"></script>
${BRIDGE ? '<script defer src="assets/bridge.js"></script>' : ""}
</body>
</html>
`;

const outPath = PRIVATE_MODE
  ? path.join(ROOT, "dashboard", "private", "index.html")
  : path.join(ROOT, "dashboard", "index.html");
if (PRIVATE_MODE) fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, html);

// ---- per-project sub-pages: <outdir>/projects/<id>.html ----
function projectPage(d) {
  const p = d.p;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.name)} — Project Dashboard</title>
<style>${STYLE}</style>
</head>
<body>
<main class="wrap">
${PRIVATE_MODE ? `<div class="heartbeat warn" style="margin-bottom:16px"><span class="hb-label">PRIVATE</span><div>Master view — includes private and client projects. Never publish or share this file.</div></div>` : ""}
<header>
  <div>
    <div class="eyebrow"><a href="../index.html">← all projects</a> · project dashboard${p.source ? " · " + esc(p.source) : ""}</div>
    <h1>${esc(p.name)} <span class="co">// ${esc(p.type) || "project"}</span></h1>
  </div>
  <div class="eyebrow num">built ${fmtDate(now)}</div>
</header>

<div class="heartbeat ${d.doneOverall ? "good" : d.blockedCount || d.overdueCount ? "warn" : "good"}">
  <span class="hb-label">${d.doneOverall ? "DONE" : "NEXT"}</span>
  <div>
    <div>${esc(p.nextAction) || "—"}</div>
    <div class="hb-detail">Status: ${esc(p.status)}${d.blockedCount ? ` · ${d.blockedCount} task${d.blockedCount === 1 ? "" : "s"} blocked` : ""}${d.overdueCount ? ` · ${d.overdueCount} item${d.overdueCount === 1 ? "" : "s"} overdue` : ""}</div>
  </div>
</div>

<div class="metrics">
  <div class="metric"><div class="v">${d.pct}%</div><div class="k">Progress</div><div class="s">${d.doneCount}/${d.tasks.length} tasks done</div></div>
  ${d.milestones.length ? `<div class="metric"><div class="v">${d.msDone}/${d.milestones.length}</div><div class="k">Milestones</div><div class="s">${d.nextMilestone ? "next " + esc(d.nextMilestone.target) : "all reached"}</div></div>` : ""}
  <div class="metric"><div class="v" style="font-size:18px;padding-top:4px">${esc(p.deadline)}</div><div class="k">Deadline</div><div class="s">${deadlineChip(p.deadline, d.doneOverall) || (d.doneOverall ? "complete" : "—")}</div></div>
  <div class="metric"><div class="v">${d.blockedCount}</div><div class="k">Blocked</div><div class="s">tasks needing action</div></div>
  <div class="metric"><div class="v">${d.overdueCount}</div><div class="k">Overdue</div><div class="s">tasks + milestones</div></div>
  <div class="metric"><div class="v" style="font-size:18px;padding-top:4px">${esc(p.lastUpdated) || "—"}</div><div class="k">Last updated</div><div class="s">${d.staleChip || "current"}</div></div>
</div>

<div class="grid">
  <div class="col">
    ${BRIDGE ? `<div class="card">
      <h2>Actions <small class="dim">this project</small></h2>
      <div id="brStatus" class="br-status">connecting…</div>
      <div class="br-actions">
        <button class="br-btn" data-br-action="proceed">▶ Proceed — next step</button>
        <button class="br-btn br-sec" data-br-action="project_status">Where are we?</button>
      </div>
      <div class="br-fields">
        <input class="br-in" id="brTask" placeholder="task text (add, or match to complete)">
      </div>
      <div class="br-fields">
        <input class="br-in" id="brOwner" placeholder="owner — default Erick">
        <input class="br-in" id="brDue" type="date">
      </div>
      <div class="br-actions">
        <button class="br-btn" data-br-action="add_task">Add task</button>
        <button class="br-btn br-sec" data-br-action="complete_task">Mark complete</button>
      </div>
      <div class="br-fields">
        <textarea class="br-in" id="brCapture" placeholder="note or idea for this project"></textarea>
      </div>
      <div class="br-actions">
        <button class="br-btn br-sec" data-br-action="add_note">Save note</button>
        <button class="br-btn br-sec" data-br-action="capture_idea">Save idea</button>
      </div>
    </div>
    <div class="card">
      <h2>Bridge activity</h2>
      <div id="brQueue"><p class="dim" style="padding:10px 16px">Nothing queued.</p></div>
    </div>` : ""}
    <div class="card">
      <h2>Overview</h2>
      <div style="padding:12px 16px 14px"><div class="kv">${d.fieldRows || '<p class="dim">No Detail section yet.</p>'}</div>${d.readmeLink}</div>
    </div>
    <div class="card">
      <h2>Tasks by department ${d.tasks.length ? `<small>${d.doneCount}/${d.tasks.length} done · ${d.pct}%</small>` : ""}</h2>
      <div style="padding:8px 16px 14px">${d.taskHtml}</div>
    </div>
  </div>
  <div class="col">
    ${d.milestoneHtml ? `<div class="card"><h2>Milestones <small>${d.msDone}/${d.milestones.length} reached</small></h2><div style="padding:8px 16px 14px">${d.milestoneHtml}</div></div>` : ""}
    ${d.riskHtml ? `<div class="card"><h2 style="color:var(--warn)">Risks &amp; blockers</h2><div style="padding:8px 16px 14px">${d.riskHtml}</div></div>` : ""}
    <div class="card">
      <h2>Recent changes <small>${srcLink("logs/changes.md", "source: logs/changes.md")}</small></h2>
      ${d.changesHtml ? `<div style="padding:8px 16px 14px">${d.changesHtml}</div>` : `<p class="dim" style="padding:10px 16px">None logged under PROJECT: ${esc(p.id)} yet — log work with that tag to populate this panel.</p>`}
    </div>
  </div>
</div>

<footer>
  <span>Generated by <span class="mono">dashboard/build.js</span> from ${srcLink("projects/master-operating-system/project-tracker.md", "project-tracker.md")}</span>
  <span><a href="../index.html">← back to ops dashboard</a></span>
</footer>
</main>
<script defer src="../assets/gsap.min.js"></script>
<script defer src="../assets/ScrollTrigger.min.js"></script>
<script defer src="../assets/app.js"></script>
${BRIDGE ? `<script>window.__BRIDGE_PROJECT=${JSON.stringify(p.name).replace(/</g, "\\u003c")};</script>
<script defer src="../assets/bridge.js"></script>` : ""}
</body>
</html>
`;
}

// The mobile bridge shares this exact stylesheet — one design system, no drift.
try {
  fs.mkdirSync(path.join(ROOT, "bridge", "static"), { recursive: true });
  fs.writeFileSync(
    path.join(ROOT, "bridge", "static", "shared.css"),
    `/* generated by dashboard/build.js — do not edit; edit STYLE in build.js */\n${STYLE}`
  );
} catch (e) {
  console.warn(`WARN: could not write bridge stylesheet — ${e.message}`);
}

const pagesDir = path.join(path.dirname(outPath), "projects");
fs.rmSync(pagesDir, { recursive: true, force: true });
fs.mkdirSync(pagesDir, { recursive: true });
let pageCount = 0;
for (const d of projectData) {
  if (!d.p.id) continue;
  fs.writeFileSync(path.join(pagesDir, `${d.p.id}.html`), projectPage(d));
  pageCount++;
}

// Private mode: project manifest for the mobile bridge (/api/projects)
if (PRIVATE_MODE) {
  fs.writeFileSync(
    path.join(path.dirname(outPath), "projects.json"),
    JSON.stringify({
      ok: true,
      built: now.toISOString(),
      projects: sortedProjects.map((p) => ({ name: p.name, id: p.id, status: p.status })),
    })
  );
}

console.log(`OK: wrote ${outPath}${PRIVATE_MODE ? " (PRIVATE — gitignored, do not publish)" : ""}`);
console.log(`   ${pageCount} project sub-page${pageCount === 1 ? "" : "s"} in ${pagesDir}`);
console.log(
  `   ${visibleProjects.length} projects shown (${projects.length} total) · ${agents.length} agents · ${skills.length} skills · ${tools.length} tools · ${decisions.length} decisions · ${changes.length} changes · ${weeks.length} activity weeks`
);
if (heartbeat.level !== "good") {
  console.log(`   HEARTBEAT ${heartbeat.label}: ${heartbeat.detail}`);
}
