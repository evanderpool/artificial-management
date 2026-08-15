// Vercel build entry: mirrors .github/workflows/dashboard.yml exactly.
// Audit (report-only) -> public build -> stage ONLY the public files into _site/
// (defense in depth — never ship private/ or anything else from the repo).
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SITE = path.join(ROOT, "_site");

execSync("node scripts/audit.js", { cwd: ROOT, stdio: "inherit" });
execSync("node dashboard/build.js", { cwd: ROOT, stdio: "inherit" });

fs.rmSync(SITE, { recursive: true, force: true });
fs.mkdirSync(SITE, { recursive: true });
fs.copyFileSync(path.join(ROOT, "dashboard", "index.html"), path.join(SITE, "index.html"));
const cs = path.join(ROOT, "dashboard", "case-study.html");
if (fs.existsSync(cs)) fs.copyFileSync(cs, path.join(SITE, "case-study.html"));
for (const dir of ["projects", "assets"]) {
  const src = path.join(ROOT, "dashboard", dir);
  if (fs.existsSync(src)) fs.cpSync(src, path.join(SITE, dir), { recursive: true });
}
console.log("OK: staged public dashboard into _site/");
