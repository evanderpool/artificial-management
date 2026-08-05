# Portfolio Website 2 — Project Plan

**Project location:** `c:\Users\Erick\OneDrive\Desktop\Portfolio WEbsite 2\portfolio\`
**Status:** Active — Core build complete, content + features remaining
**Last updated:** 2026-05-20

---

## Project Summary

A high-end 3D portfolio site built in Next.js 16 + React Three Fiber with GSAP, Framer Motion, and Lenis scroll. The core visual system (Hero, About, Projects, Timeline, Skills, Contact, Nav, Performance optimizations) is fully complete. What remains is **content**, **features**, and **deployment**.

---

## What's Done

| Section | Status |
|---------|--------|
| Design system (tokens, fonts, motion) | ✅ Done |
| Hero (WebGL shader + dotted globe) | ✅ Done |
| About (blob bg + skills + glass mark) | ✅ Done |
| Projects (editorial grid + WebGL distortion) | ✅ Done |
| Timeline (GSAP pin + R3F spline camera) | ✅ Done |
| Skills (orbital nodes + progress bars) | ✅ Done |
| Contact section (wireframe sphere + glass cards) | ✅ Done |
| Page transition system (curtain wipe) | ✅ Done |
| Animated pill nav | ✅ Done |
| Performance optimizations (7 changes) | ✅ Done |
| shadcn/ui helpers (button/sheet/input/label) | ✅ Done |

---

## What's Remaining — Master Task Queue

### Phase 1 — Ready to Build Now (No Dependencies)

| Task | Complexity | Notes |
|------|-----------|-------|
| Contact form UI | Medium | Structured fields, glass card design, no backend yet |
| Social + contact links | Low | GitHub, LinkedIn, Twitter, Calendly URLs in Contact.tsx + Footer.tsx |

### Phase 2 — Blocked on Erick's Answers

| Task | Blocked On |
|------|-----------|
| Project data (12 projects) | Erick fills out questionnaire × 12 |
| Project cover images | Erick provides screenshots or generated images |
| /work standalone page | Erick confirms: separate page or homepage section only? |
| AI Blog system architecture | Erick answers 7 blog questions |
| AI Blog content pipeline | Answers above + Claude API integration decisions |

### Phase 3 — Lower Priority / Post-Content

| Task | Notes |
|------|-------|
| Fraunces typeface JSON | Replace placeholder helvetiker font for GlassMark component |
| OG image | `app/opengraph-image.tsx` for social sharing previews |
| Mobile polish | Verify layouts at 375px |
| Deploy to Vercel | `vercel --prod` from portfolio/ directory |
| Vercel Analytics | One import line post-deploy |

---

## Decision Queue — Needs Erick's Input

### Decision 1: /work Page
**Question:** Do you want `/work` to be its own standalone page (full project listing with filtering, case study previews, more detail per card), OR are you fine with the homepage Projects section being the only place projects live?

**Option A — Standalone /work page**
- Pros: Better UX for recruiters/clients browsing all work; nav already links to it via TransitionLink
- Cons: More build work; needs layout + filtering logic

**Option B — Homepage section only**
- Pros: Simpler; homepage Projects section already built
- Cons: Nav links to /work which currently 404s or needs redirect

**Recommendation:** Build the standalone /work page — the nav already routes to it and it significantly improves the recruiter/client browsing experience.

---

### Decision 2: AI Blog System Architecture

**Answer these 7 questions:**

1. **Cadence** — How often do you want posts published?
   - [ ] Daily
   - [ ] 2–3x per week
   - [ ] Weekly
   - [ ] As-needed (manual trigger only)

2. **Topics** — What are the main topics? (check all that apply)
   - [ ] Databases & data systems
   - [ ] Web development (Next.js, React, etc.)
   - [ ] AI automation & agents
   - [ ] Content systems
   - [ ] Career / job search in AI
   - [ ] Other: _______________

3. **Voice** — How should posts sound?
   - [ ] Written as Erick (first-person, personal voice — requires voice/style guide)
   - [ ] Editorial / technical (third-person, authoritative, less personal)
   - [ ] Hybrid (editorial tone, first-person occasionally)

4. **Cross-posting** — Where do posts live?
   - [ ] This site only
   - [ ] This site + Medium
   - [ ] This site + LinkedIn articles
   - [ ] This site + Substack
   - [ ] All of the above

5. **Pipeline model** — Which automation approach fits your workflow?
   - [ ] Option A: Semi-auto — you input topic + 3 bullets → Claude writes full post → you review → publish
   - [ ] Option B: Full-auto — cron generates posts from a predefined topic list, auto-publishes, no input needed
   - [ ] Option C: Hybrid — cron generates drafts → drafts queue → you one-click approve → auto-publish

6. **Storage** — Where do posts live technically?
   - [ ] MDX files in the repo (simplest, version-controlled)
   - [ ] Notion API (visual editing, good CMS feel)
   - [ ] Sanity CMS (most powerful, steeper setup)
   - [ ] Supabase/Postgres (database-driven, good for search)

7. **Style reference** — Do you have any existing writing (blog posts, LinkedIn posts, articles) we can use to train the Claude API system prompt on your voice?
   - Answer: _______________

---

### Decision 3: Project Images
**Question:** For the 12 project cover images needed in `public/projects/` — how do you want to handle this?

Expected filenames: `inkwell.jpg`, `feedline.jpg`, `narrate.jpg`, `archon.jpg`, `velum.jpg`, `orrery.jpg`, `conduit.jpg`, `scribe.jpg`, `meridian.jpg`, `caisson.jpg`, `glossary.jpg`, `prism.jpg`

- [ ] I'll take real screenshots of each project and provide them
- [ ] Generate AI images (Midjourney/DALL-E) per project — need prompts built
- [ ] Use abstract placeholder images tied to project category until real ones are ready
- [ ] Mix: screenshots for live projects, generated for others

---

## Project Data Questionnaire — Fill Out × 12

Copy and fill this in for each of your 12 projects. The project names currently in the codebase are: inkwell, feedline, narrate, archon, velum, orrery, conduit, scribe, meridian, caisson, glossary, prism.

```
PROJECT [#]
─────────────────────────────────
Name:
Tagline (one punchy sentence, ~10 words max):
Description (2–4 sentences — what it does and why it matters):
Category: [Engineering / Content / Databases / Experiments]
My role:
Tech stack (comma-separated list):
Key result or outcome (quantify if possible):
Live URL (or "none"):
GitHub URL (or "none"):
Year completed:
Status: [Live / In Progress / Archived]
Featured on homepage? [Yes / No]
Cover image file: [real screenshot / AI generated / pending]
```

---

## Contact Form — Fields to Include

The contact form will be built in the existing Contact section with glass card design. No backend for now.

**Confirmed fields:**
- Name (text input)
- Email (email input)
- Company (text input, optional)
- Project type (dropdown): Web Development / AI Automation / Data Systems / AI Engineering / Other
- Budget range (dropdown): Under $1K / $1K–$5K / $5K–$15K / $15K+ / Not sure
- Timeline (dropdown): ASAP / Within 1 month / 1–3 months / 3–6 months / Flexible
- Project description (textarea)
- Submit button

**Question:** Is there anything else you want in the contact form? Any fields you want removed?

---

## Build Sequence (Recommended Order)

```
Week 1
  ├─ [TODAY] Contact form UI — build it (no decisions needed)
  ├─ [TODAY] Social links — add real URLs
  └─ [TODAY] Fill out project questionnaire × 12

Week 2
  ├─ Wire project data into projects.ts
  ├─ Answer /work page decision → build if confirmed
  ├─ Answer blog questions → design pipeline architecture
  └─ Source or generate project cover images

Week 3
  ├─ Build AI blog pipeline (based on decisions)
  ├─ Fraunces typeface JSON fix
  └─ OG image

Week 4 (Launch)
  ├─ Mobile QA (375px)
  ├─ npm run build (must be clean)
  └─ vercel --prod → live URL
```

---

## Social Links Needed

Gather these before the next build session:

| Platform | URL |
|----------|-----|
| GitHub | github.com/evanderpool |
| LinkedIn | linkedin.com/in/[your-handle] |
| Twitter/X | x.com/[your-handle] (or "none") |
| Calendly | calendly.com/[your-link] (or "none") |

---

## Notes

- The `/work` nav link uses `TransitionLink` and routes to `/work` — that route currently 404s until the page is built or redirected
- `public/fonts/fraunces.json` is a placeholder (helvetiker font) — the GlassMark "EV" 3D text will look wrong until replaced
- All project images 404 — this is expected until images are provided
- Pre-existing TS error in `animated-shader-hero.tsx` line 85 — ignore, unrelated to current work

---

**ARCHIVED 2026-08-05** — Portfolio Website and LangGraph Research Agent removed from the project portfolio at Erick's direction (new projects incoming to replace them). Plan retained here per the archive rule; the Next.js codebase itself lives outside this repo and is untouched.
