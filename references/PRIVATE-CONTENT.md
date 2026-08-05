# Private Content Pointer

The following were moved to the private repo
`artificial-management-private` on 2026-08-05 (and purged from this repo's
git history) under the public/private split rule in
`.claude/rules/ai-system-standards.md`:

- `references/resume/` — resume system (all versions, master source, recruiter analysis)
- `references/examples/outreach/` — client outreach templates
- `references/sops/service-packages.md` — service tiers and pricing
- `templates/proposal-template.md` — client proposal template

Agents: when a workflow needs one of these files, note the dependency and
flag it — do not recreate the content in this repo.
