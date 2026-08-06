#!/usr/bin/env node
/**
 * System integrity audit — deterministic, no LLM.
 *
 * Extracts the same facts the dashboard parses, then checks them against each
 * other. Replaces the by-hand arithmetic in /data-integrity: the script does
 * the counting (reproducible), the agent interprets and recommends.
 *
 * Usage:
 *   node scripts/audit.js           human-readable report
 *   node scripts/audit.js --json    machine-readable facts + findings
 *   node scripts/audit.js --ci      exit 1 on any CRITICAL finding
 *
 * Exit codes: 0 = no critical findings (warnings allowed), 1 = critical (with --ci),
 *             2 = the audit itself could not run.
 */
const fs = require("fs");
const path = require("path");

const ROOT = fs.existsSync(path.join(process.cwd(), "CLAUDE.md"))
  ? process.cwd()
  : path.resolve(__dirname, "..");
const JSON_OUT = process.argv.includes("--json");
const CI = process.argv.includes("--ci");
const TODAY = new Date();
const DAY = 86400000;

const findings = [];
const add = (level, check, detail) => findings.push({ level, check, detail });

const read = (rel) => {
  try {
    return fs.readFileSync(path.join(ROOT, rel), "utf8");
  } catch {
    return null;
  }
};
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const stripMd = (s) => s.replace(/\*\*/g, "").replace(/`/g, "").replace(/~~/g, "").trim();
const parseISO = (s) => {
  const m = String(s || "").match(/(\d{4}-\d{2}-\d{2})/);
  return m ? new Date(m[1] + "T00:00:00Z") : null;
};
const daysOld = (d) => Math.floor((TODAY - d) / DAY);

// ---------------------------------------------------------------- parsers
function tableRows(md, heading) {
  const idx = md.indexOf(heading);
  if (idx === -1) return [];
  const rows = [];
  let inTable = false;
  for (const line of md.slice(idx).split("\n").slice(1)) {
    const t = line.trim();
    if (t.startsWith("|")) {
      inTable = true;
      const cells = t.split("|").slice(1, -1).map(stripMd);
      if (cells.every((c) => /^[-\s:]*$/.test(c))) continue;
      rows.push(cells);
    } else if (inTable && t !== "") break;
    else if (!inTable && t.startsWith("#")) break;
  }
  return rows.slice(1);
}

const trackerMd = read("projects/master-operating-system/project-tracker.md");
const registryMd = read("projects/master-operating-system/ai-system-registry.md");
const changesMd = read("logs/changes.md");
const decisionsMd = read("decisions/log.md");
const sotMd = read("references/source-of-truth/source-of-truth-map.md");
const prioritiesMd = read("context/current-priorities.md");
const goalsMd = read("context/goals.md");

if (!trackerMd || !registryMd) {
  console.error("FATAL: tracker or registry missing — audit cannot run.");
  process.exit(2);
}

const projects = tableRows(trackerMd, "## Project Portfolio").map((c) => ({
  name: c[0], id: c[1], type: c[2], visibility: c[3],
  status: c[4], deadline: c[5], lastUpdated: c[6], nextStep: c[7],
}));
const agents = tableRows(registryMd, "## Section 1 — Agent Registry").map((c) => ({
  id: c[0], name: c[1], status: c[3], spec: (c[4] || "").trim(),
}));
const tools = tableRows(registryMd, "## Section 2 — Tool Registry").map((c) => ({
  name: c[0], status: c[2],
}));
const skills = tableRows(registryMd, "## Section 3 — Skill Registry").map((c) => ({
  id: c[0], status: c[3], file: (c[4] || "").trim(),
}));

const sectionNames = (kind) =>
  [...trackerMd.matchAll(new RegExp(`^### (.+?) — ${kind}\\s*$`, "gm"))].map((m) =>
    stripMd(m[1].trim())
  );
const taskSections = sectionNames("Tasks");
const milestoneSections = sectionNames("Milestones");
const detailSections = sectionNames("Detail");

const changeLines = changesMd ? changesMd.split("\n").filter((l) => l.startsWith("[")) : [];
const changeEntries = changeLines
  .map((l) => l.match(/^\[(\d{4}-\d{2}-\d{2})\] CHANGED: (.*?) \| TYPE: (\w[\w/ ]*?) \| PROJECT: (.*?) \|/))
  .filter(Boolean)
  .map((m) => ({ date: m[1], file: m[2], type: m[3].trim(), project: m[4].trim() }));
const decisionLines = decisionsMd ? decisionsMd.split("\n").filter((l) => l.startsWith("[")) : [];
const decisionEntries = decisionLines
  .map((l) => l.match(/^\[(\d{4}-\d{2}-\d{2})\] DECISION: (.+?) \| REASONING: /))
  .filter(Boolean);

// ---------------------------------------------------------------- checks

// 1. Registry file references resolve
for (const a of agents)
  if (a.spec && a.spec !== "—" && !exists(a.spec))
    add("CRITICAL", "agent-spec-exists", `${a.name}: spec file missing — ${a.spec}`);
for (const s of skills)
  if (s.file && !exists(s.file))
    add("CRITICAL", "skill-file-exists", `/${s.id}: skill file missing — ${s.file}`);

// 2. Skills on disk vs registry (both directions)
let skillDirs = [];
try {
  skillDirs = fs
    .readdirSync(path.join(ROOT, ".claude/skills"), { withFileTypes: true })
    .filter((d) => d.isDirectory() && exists(`.claude/skills/${d.name}/SKILL.md`))
    .map((d) => d.name);
} catch {}
for (const d of skillDirs)
  if (!skills.some((s) => s.id === d))
    add("CRITICAL", "undocumented-skill", `/${d} exists on disk but is not in the registry`);
for (const s of skills)
  if (!skillDirs.includes(s.id))
    add("WARNING", "registry-only-skill", `/${s.id} is registered but has no skill directory`);

// 3. Tracker section integrity
for (const p of projects) {
  if (!p.id) add("WARNING", "project-id", `${p.name}: no ID — change-log tagging will not link`);
  if (!["Public", "Private"].includes(p.visibility))
    add("CRITICAL", "visibility", `${p.name}: visibility "${p.visibility}" is not Public/Private (build fails closed to Private)`);
  for (const [kind, list] of [["Tasks", taskSections], ["Milestones", milestoneSections], ["Detail", detailSections]])
    if (!list.includes(p.name))
      add("INFO", "missing-section", `${p.name}: no "### ${p.name} — ${kind}" section`);
}
const projectNames = projects.map((p) => p.name);
for (const [kind, list] of [["Tasks", taskSections], ["Milestones", milestoneSections], ["Detail", detailSections]])
  for (const n of list)
    if (!projectNames.includes(n))
      add("CRITICAL", "orphan-section", `"### ${n} — ${kind}" matches no portfolio row (name/em-dash mismatch — it renders nowhere)`);

// 4. Dates parse, and nothing is silently stale
for (const p of projects) {
  const lu = parseISO(p.lastUpdated);
  if (!lu) add("WARNING", "date-format", `${p.name}: Last Updated "${p.lastUpdated}" is not YYYY-MM-DD`);
  else if (daysOld(lu) > 14 && !/complete/i.test(p.status))
    add("WARNING", "stale-project", `${p.name}: not updated in ${daysOld(lu)} days (STALE rule is 14)`);
  if (p.deadline && p.deadline !== "—" && !parseISO(p.deadline))
    add("WARNING", "date-format", `${p.name}: deadline "${p.deadline}" is not YYYY-MM-DD`);
}

// 5. Source-of-truth map points at real files
if (sotMd) {
  const paths = [...sotMd.matchAll(/\|\s*`([^`]+\.md|[^`]+\.json)`\s*\|/g)].map((m) => m[1]);
  for (const rel of paths)
    if (!rel.startsWith("private repo") && !exists(rel))
      add("WARNING", "sot-missing-file", `source-of-truth map references a missing file: ${rel}`);
} else add("WARNING", "sot-missing", "source-of-truth-map.md not found");

// 6. Append-only logs are chronological (an out-of-order date means an edit, not an append)
const chronoCheck = (entries, label) => {
  for (let i = 1; i < entries.length; i++)
    if (entries[i].date < entries[i - 1].date) {
      add("WARNING", "log-order", `${label}: ${entries[i].date} appears after ${entries[i - 1].date} — append-only order broken`);
      break;
    }
};
chronoCheck(changeEntries, "logs/changes.md");
chronoCheck(decisionEntries.map((m) => ({ date: m[1] })), "decisions/log.md");

// 7. Malformed log lines
const badChange = changeLines.length - changeEntries.length;
if (badChange > 0)
  add("WARNING", "log-format", `${badChange} change-log line(s) do not match the CHANGED/TYPE/PROJECT format`);
const badDecision = decisionLines.length - decisionEntries.length;
if (badDecision > 0)
  add("WARNING", "log-format", `${badDecision} decision-log line(s) do not match the DECISION/REASONING format`);

// 8. Change-log PROJECT tags resolve to known projects (or the system itself)
const knownTags = new Set([...projects.map((p) => p.id).filter(Boolean), "master-operating-system",
  ...agents.map((a) => a.id)]);
const unknownTags = {};
for (const c of changeEntries.slice(-60))
  if (c.project && !knownTags.has(c.project)) unknownTags[c.project] = (unknownTags[c.project] || 0) + 1;
for (const [tag, n] of Object.entries(unknownTags))
  add("INFO", "unknown-project-tag", `recent change log uses PROJECT: ${tag} (${n}×) which matches no project or agent id`);

// 9. Context freshness
for (const [rel, md] of [["context/current-priorities.md", prioritiesMd], ["context/goals.md", goalsMd]]) {
  if (!md) { add("CRITICAL", "context-missing", `${rel} is missing`); continue; }
  const lu = parseISO((md.match(/\*\*Last updated:\*\*\s*(.+)/) || [])[1] || "");
  if (!lu) add("INFO", "context-date", `${rel}: no parseable Last updated date`);
  else if (daysOld(lu) > 30)
    add("WARNING", "context-stale", `${rel}: last updated ${daysOld(lu)} days ago`);
}

// 10. Public/private hygiene — content classes that must never be in this repo
const forbidden = [
  ["references/resume", "resume content"],
  ["references/examples/outreach", "outreach templates"],
  ["references/sops/service-packages.md", "service pricing"],
  ["templates/proposal-template.md", "proposal template"],
];
for (const [rel, what] of forbidden)
  if (exists(rel))
    add("CRITICAL", "public-private-split", `${what} present at ${rel} — must live in the private repo`);

// ---------------------------------------------------------------- output
const facts = {
  generated: TODAY.toISOString(),
  projects: projects.length,
  projectsByStatus: projects.reduce((m, p) => ((m[p.status] = (m[p.status] || 0) + 1), m), {}),
  agents: agents.length,
  skills: skills.length,
  skillDirsOnDisk: skillDirs.length,
  tools: tools.length,
  decisions: decisionEntries.length,
  changes: changeEntries.length,
  lastChange: changeEntries.length ? changeEntries[changeEntries.length - 1].date : null,
  sections: { tasks: taskSections.length, milestones: milestoneSections.length, detail: detailSections.length },
};
const counts = findings.reduce((m, f) => ((m[f.level] = (m[f.level] || 0) + 1), m), {});
// Confidence: deterministic, so two runs on the same tree always agree.
const score = Math.max(0, 100 - (counts.CRITICAL || 0) * 20 - (counts.WARNING || 0) * 5 - (counts.INFO || 0) * 1);

if (JSON_OUT) {
  console.log(JSON.stringify({ facts, findings, counts, score }, null, 2));
} else {
  console.log(`\nSystem Integrity Audit — ${TODAY.toISOString().slice(0, 10)}`);
  console.log("=".repeat(52));
  console.log(`Projects ${facts.projects} · agents ${facts.agents} · skills ${facts.skills}` +
    ` (${facts.skillDirsOnDisk} on disk) · tools ${facts.tools}`);
  console.log(`Decisions ${facts.decisions} · changes ${facts.changes} (last ${facts.lastChange})`);
  console.log(`\nConfidence score: ${score}/100  —  ` +
    `${counts.CRITICAL || 0} critical, ${counts.WARNING || 0} warning, ${counts.INFO || 0} info`);
  if (!findings.length) console.log("\nNo findings. Every cross-file check passed.");
  for (const level of ["CRITICAL", "WARNING", "INFO"]) {
    const group = findings.filter((f) => f.level === level);
    if (!group.length) continue;
    console.log(`\n${level}`);
    for (const f of group) console.log(`  [${f.check}] ${f.detail}`);
  }
  console.log("");
}

process.exit(CI && (counts.CRITICAL || 0) > 0 ? 1 : 0);
