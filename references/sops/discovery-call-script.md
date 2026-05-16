# Discovery Call Script — Artificial Management

**Owner:** Client Services Agent
**Status:** Active — v1.0
**Last Updated:** 2026-05-16
**Use for:** All first-time client calls · Inbound inquiries · Warm intros · LinkedIn DM follow-ups

---

## Before the Call

**Review:**
- [ ] How the prospect found you (cold outreach, LinkedIn, referral, GitHub)
- [ ] Their company size, industry, and role (LinkedIn or website)
- [ ] Which service tier they referenced (if any)
- [ ] Any specific pain point they mentioned in outreach

**Have ready:**
- [ ] Service packages doc open (`references/sops/service-packages.md`)
- [ ] Portfolio proof statement (1 paragraph version)
- [ ] GitHub repo URL: github.com/evanderpool/artificial-management
- [ ] Calendar link for follow-up

---

## Call Structure (30 minutes)

| Section | Time | Goal |
|---|---|---|
| Opening | 2–3 min | Build rapport, set agenda |
| Their situation | 8–10 min | Understand operations, pain points, current tools |
| Qualification | 5–7 min | Budget, timeline, decision-maker |
| Solution alignment | 5–7 min | Match to a service tier, show proof |
| Close | 3–5 min | Define next step |

---

## Opening (2–3 min)

> "Thanks for making time — I'll keep this focused. My goal for today is just to understand how your business actually runs, figure out where the friction is, and be honest with you about whether there's a fit. Sound good?"

**Set the agenda:**
> "I'll spend most of the time asking you questions — probably 15 minutes. Then I'll share a quick overview of what we do and see if anything clicks. We should have time for your questions too."

---

## Their Situation — Diagnostic Questions (8–10 min)

Ask 4–5 of these based on what you already know about them. Don't read them all — have a conversation.

### Operations & Workflow

1. **"Walk me through your week. What are the 2–3 things you spend the most time on that feel like they shouldn't require your attention?"**

2. **"When something falls through the cracks in your business — what does that usually look like? What breaks first?"**

3. **"How does your team currently stay aligned on what's happening, what's blocked, and what's next? Weekly meeting? Slack? Spreadsheet?"**

### Data & Systems

4. **"What tools are you running your business on today? (CRM, project tracker, email, calendar, docs)"**

5. **"How much time does your team spend each week pulling information out of one system and putting it into another — copy-paste, manual reports, that kind of thing?"**

6. **"If I asked you right now: what's the status of your top 3 projects — could you answer in under a minute without opening anything?"**

### Pain Point Depth

7. **"What's the one operational problem that, if it were solved, would give you the most time or headspace back?"**

8. **"Have you tried to fix this before? What happened?"**

---

## Qualification Questions (5–7 min)

These are required before recommending a scope. Ask them naturally — don't make it feel like an interrogation.

### Budget (Required)

> "I want to make sure I'm pointing you toward the right scope — our engagements range from a few hundred dollars for a data fix to $15,000+ for a full system build. Do you have a rough budget range in mind, or is it more 'depends on what the ROI looks like'?"

*Listen for:* specific number, range, or signal that budget is tied to perceived value. If unclear, ask: "Is there a number that would feel like a no-brainer if the ROI was obvious?"

### Timeline (Required)

> "Are you looking to have something built in the next few weeks, or is this more of a Q3/Q4 initiative?"

*Listen for:* urgency signals. If they say "soon" or "ASAP," ask what's driving the timeline.

### Decision-Maker (Required)

> "Is this a decision you'd make on your own, or does it need to go through a partner, CFO, or board?"

*Listen for:* whether you're talking to the decision-maker or an influencer. If influencer: "Would it make sense to loop in [decision-maker] for the follow-up call?"

---

## Solution Alignment (5–7 min)

Match what you heard to a service tier. Use one of these openers based on what they described:

**If data/reporting was the pain:**
> "Based on what you described, the fastest place to start is usually the data foundation — cleaning up what's broken, getting reliable reporting in place. We do that as a project-based engagement starting around $750. Want me to walk you through what that typically includes?"

**If manual workflows were the pain:**
> "What you're describing is a textbook automation opportunity. We build 1–3 workflow automations — the kind that run automatically every day or every week without anyone touching them. That's our Automation Starter package, starting at $2,500. The weekly briefing automation is a good example — want to see how that works?"

**If AI/operations were the focus:**
> "What you're describing is actually what we built for ourselves — a custom AI agent layer that coordinates across your tools and gives you operational visibility without a full ops team. That's our AI Agent Build, starting at $6,000. I can show you the live system if that would help."

**Show proof (if applicable):**
> "We built a live version of this for Artificial Management — 10 agents, 8 automated workflows, cron-driven weekly briefing. It's on GitHub if you want to see the architecture: github.com/evanderpool/artificial-management."

**Proof statement (for skeptical prospects):**
> "We don't pitch AI theory — the system we'd build for you is the same design as the one running our own operations. Same engineer, same process, same documentation."

---

## Close (3–5 min)

### If there's a clear fit:

> "Based on what you've told me, I think [Tier X] is the right starting point. I'd want to put together a brief scope doc — just a page — that outlines exactly what's included, the timeline, and the investment. Can we plan a 30-minute follow-up this week to walk through it?"

**Always name a specific next step:**
- Send a scope/proposal → get a 30-min follow-up call
- Loop in decision-maker → schedule a second call
- They need time → send the service packages doc + schedule a check-in in 5 days

### If there's no clear fit:

> "Honestly, based on what you've described, I don't think we're the right fit right now — [brief reason]. What might actually help you is [honest recommendation]. I'd rather tell you that now than take on a project where I can't deliver full value."

### If they're not ready to decide:

> "That's completely fine. Let me send you our service packages overview and a quick summary of what we covered — that way you have it when you're ready to move forward. What's the best email?"

---

## After the Call

**Within 24 hours:**
- [ ] Send follow-up email (use outreach template: `references/examples/outreach/outreach-templates.md` — "Post-Call Follow-Up")
- [ ] Log the call in `decisions/log.md` if a commitment or scope decision was made
- [ ] If advancing to proposal: draft using `templates/proposal-template.md`
- [ ] Update `logs/changes.md` if any client or project status changed

**Flag to Erick if:**
- Request is outside current service scope
- Prospect wants pricing that doesn't fit any current tier
- Timeline is under 2 weeks (may require scope reduction)
- Decision-maker wasn't on the call

---

*Source of truth: `references/sops/discovery-call-script.md`*
*Service packages: `references/sops/service-packages.md`*
*Proposal template: `templates/proposal-template.md`*
