# Client Onboarding Workflow — Artificial Management

**Owner:** Client Services Agent
**Status:** Active — v1.0
**Last Updated:** 2026-05-16
**Use for:** All new client engagements — run this from signed agreement to first deliverable

---

## Purpose

Ensure every client engagement starts with clear scope, confirmed access, aligned expectations, and a documented first deliverable — before any build work begins.

---

## Trigger

Run this workflow when:
- Client signs the agreement **and**
- Deposit is received

Do not begin build work before both conditions are met.

---

## Phase 1 — Agreement & Deposit (Before Kickoff)

**Owner:** Erick

- [ ] Send agreement (scope, timeline, payment terms, IP ownership)
- [ ] Receive signed agreement
- [ ] Send invoice for 50% deposit
- [ ] Confirm deposit received
- [ ] Reply to client confirming receipt and send kickoff scheduling link
- [ ] Create client folder in Google Drive: `Clients/[Client Name]/`
- [ ] Copy proposal to client folder: `[Client Name]-proposal-[date].md`
- [ ] Log in `decisions/log.md`: `[DATE] DECISION: [Client Name] engagement confirmed | REASONING: Agreement signed, deposit received | CONTEXT: [Tier, scope summary]`

---

## Phase 2 — Kickoff Call (Day 1)

**Duration:** 30–45 minutes

**Goals:**
- Confirm scope (nothing assumed — state it explicitly)
- Get all access credentials or tool invites
- Agree on communication norms
- Name the first deliverable and its due date

### Kickoff Call Agenda

1. **Welcome and recap** (5 min)
   - "Here's what we agreed to build, here's the timeline, here's how we'll work together."
   - Read back the scope from the proposal — get verbal confirmation

2. **Access and systems** (10 min)
   - Walk through every system they need to give you access to
   - Collect credentials or send tool invites on the call — don't let this slip to async
   - Confirm who their point of contact is and their availability

3. **Communication norms** (5 min)
   - Preferred channel: email, Slack, WhatsApp — confirm one
   - Response time expectation: "I'll respond within [X] business hours. If I need something from you, I'll flag it clearly."
   - Check-in cadence: weekly async update, or synchronous call at delivery only

4. **First deliverable** (5 min)
   - Name it explicitly: "The first thing you'll receive is [X] by [date]."
   - Confirm what they need to provide before you can begin: data, access, sample reports, etc.

5. **Questions** (5 min)

### Post-Kickoff Checklist

- [ ] Send kickoff summary email within 2 hours (scope confirmed, access received, first deliverable named, next check-in date)
- [ ] Add project to `projects/master-operating-system/project-tracker.md` as an active engagement
- [ ] Log kickoff in `logs/changes.md`
- [ ] Set internal reminder for first check-in

---

## Phase 3 — Build (Active Engagement)

**Communication standard:**
- Send one async status update per week (even if nothing is blocked)
- Flag blockers same day — don't let a missing access or unclear requirement sit
- Never go more than 5 business days without a client-facing update

**Weekly update format (email or Slack):**

> **[Client Name] — Weekly Update [Date]**
>
> **Done this week:** [1–2 bullets]
> **In progress:** [what's being built now]
> **Needed from you:** [anything blocking progress — or "nothing blocked"]
> **On track for:** [first deliverable date / overall delivery date]

**If scope changes:**
- Flag it immediately: "This is outside the original scope — here's what I'd recommend and what it would add to the timeline/investment."
- Never expand scope silently
- Document any scope change in `decisions/log.md`

---

## Phase 4 — Delivery

**When everything is built and tested:**

- [ ] Run internal QA: does every deliverable match the proposal? Is it documented?
- [ ] Write delivery summary: what was built, how it works, how to maintain it
- [ ] Send final deliverables to client (Google Drive folder or direct files)
- [ ] Schedule delivery walkthrough call (30 min)

### Delivery Walkthrough Agenda

1. Walk through each deliverable — show it working, not just hand it over
2. Walk through the documentation — make sure they know how to use and maintain it
3. Collect feedback: "Is there anything that's not working the way you expected?"
4. Confirm the support window: "[X] days from today — here's how to reach me"
5. Ask for a testimonial or case study permission: "Would you be open to me using this as a portfolio example?"

### Post-Delivery Checklist

- [ ] Send final invoice for remaining 50%
- [ ] Confirm all access credentials are transferred or revoked per client preference
- [ ] Log delivery in `decisions/log.md`
- [ ] Update project status in `projects/master-operating-system/project-tracker.md`
- [ ] Begin case study draft in `references/examples/case-studies/[client-name]/` (if permission granted)
- [ ] Log to `logs/changes.md`

---

## Phase 5 — Support Window

**Duration:** Per proposal (Tier 1: none, Tier 2: 2 weeks, Tier 3: 30 days, Tier 4: 60 days)

**What's included:**
- Bug fixes for anything built in the engagement
- Clarification questions on how to use deliverables
- Minor tweaks (under 1 hour)

**What's not included:**
- New features or scope additions (quote separately)
- Operation of the system on the client's behalf (quote as managed retainer)

**Escalation:** If a support request is outside scope, respond within 24 hours: "That's outside our original scope — I can scope that as a separate engagement if it's helpful. The fix would take approximately [X] and run [price]."

---

## Communication Norms — Standing Rules

| Situation | Response Time |
|---|---|
| General question | Within 1 business day |
| Blocker flagged by client | Same day |
| Blocker flagged by Erick to client | Same day — flag clearly in subject line |
| Scope change request | Within 1 business day with a written response |
| Emergency (system down, data issue) | Within 4 hours |

---

## Client Folder Structure (Google Drive)

```
Clients/
  [Client Name]/
    proposal-[date].md
    agreement-[date].pdf
    kickoff-summary-[date].md
    deliverables/
      [deliverable-1].md
      [deliverable-2].md
    documentation/
      [sop or how-to].md
    case-study/ (if permission granted)
```

---

*Source of truth: `references/sops/client-onboarding.md`*
*Proposal template: `templates/proposal-template.md`*
*Discovery call script: `references/sops/discovery-call-script.md`*
