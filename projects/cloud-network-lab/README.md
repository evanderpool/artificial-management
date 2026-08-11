# Cloud Network Lab

**Status:** In Progress (started 2026-08-11)
**Tracker:** registered in the [Master Project Tracker](../master-operating-system/project-tracker.md) as `cloud-network-lab`
**Lab files live outside this repo:** `C:\Users\Erick\CloudLab` (ISOs, VM disks, build scripts — never committed)
**Build log:** [build-log.md](build-log.md) — dated, append-only, failures kept in

## What it is

The same network architecture, built three times, each time with less manual
work and more precision:

1. **Local** — three Linux VMs on VirtualBox, wired by hand into a segmented
   network with a NAT gateway, a bastion, and a default-deny firewall.
2. **Cloud by hand** — the identical topology rebuilt in the AWS console:
   VPC, subnets, route tables, security groups, NAT.
3. **Cloud as code** — the same thing again in Terraform, so it can be
   destroyed and rebuilt on demand and costs **nothing at rest**.

The progression *is* the artifact. A finished network proves you can follow a
tutorial; the same network expressed three ways, with the reasoning that moved
between them, proves you understand what the abstraction is hiding.

## Why it exists

Erick is applying for **both** cloud engineering and AI engineering roles. This
project serves both:

- **Cloud track** — subnetting, routing, NAT, firewalling, bastion access, and
  then the AWS/Terraform equivalents. The mapping table below is the centrepiece.
- **AI track** — the `db` tier runs Postgres + pgvector, making this lab the
  rehearsal environment for the [AI OS v2 canonical store](../master-operating-system/project-tracker.md)
  migration rather than a competitor for the same hours.

Built and executed by the Claude Code agent under Erick's direction, which is
itself the Artificial Management thesis: AI agents doing real operational work.
Erick keeps the break/fix drills (Phase 1, step 5) — that is the part that has
to live in a human's hands to be worth anything in an interview.

## Topology (Phase 1 — local)

```
        Windows host
              │  ssh (host-only 192.168.56.0/24)
              ▼
      ┌───────────────┐
      │      gw       │  2 NICs — bastion + NAT gateway
      │  10.0.1.10    │──── NAT Network "am-public" ──► internet
      │  10.0.2.1     │     (10.0.1.0/24)
      └───────┬───────┘
              │  Internal Network "am-private" (10.0.2.0/24)
              │  no route out except through gw
       ┌──────┴──────┐
       ▼             ▼
  ┌─────────┐   ┌─────────┐
  │   app   │   │   db    │
  │10.0.2.20│   │10.0.2.30│
  └─────────┘   └─────────┘
```

| VM | RAM | Disk | Role |
|---|---|---|---|
| `gw` | 768 MB | 8 GB | Router, NAT, bastion, nftables firewall |
| `app` | 1 GB | 8 GB | Service tier — private subnet only |
| `db` | 1.5 GB | 12 GB | Postgres + pgvector — private subnet only |

Total ~3.3 GB RAM of 32 GB available, headless, negligible idle CPU.

## Accuracy caveat — `am-public` is not a simulated internet

Corrected 2026-08-11 after the independent security review.

`am-public` is described elsewhere as "simulating the internet." **It does not
simulate anything — it is a live NAT route to the real internet and to the
home LAN.** `app`, which has no external NIC, resolved `deb.debian.org` end to
end through `gw`, whose upstream resolver is the actual home router.

Inbound is genuinely closed: no port-forwarding rules on the NAT network and no
host route into the lab subnets, so exposure is one-directional. Separately,
VirtualBox maps `10.0.1.2` to host loopback by default — a standing pinhole
that exposes nothing today but is worth knowing about rather than discovering.

The lab is isolated *from* the outside. It is not isolated *from reaching* the
outside, and no claim here should suggest otherwise.

## Lab → cloud mapping

The translation table. This is what turns a homelab into a cloud-engineering
artifact — every local component has a named cloud equivalent.

| Lab component | AWS | Azure |
|---|---|---|
| NAT Network `am-public` | VPC + Internet Gateway | VNet + public subnet |
| Internal Network `am-private` | Private subnet | Private subnet |
| `gw` IP forwarding + nftables masquerade | NAT Gateway | NAT Gateway |
| SSH into `gw` only, ProxyJump beyond | Bastion host / SSM Session Manager | Azure Bastion |
| nftables rulesets | Security Groups + NACLs | Network Security Groups |
| dnsmasq on `gw` | Route 53 private hosted zone | Private DNS zone |
| `VBoxManage` build script | Terraform | Terraform / Bicep |

## Phases

### Phase 1 — Local foundation
Build by hand, break it deliberately, fix it. Ends with a `VBoxManage` script
that rebuilds the whole lab from nothing.

### Phase 2 — Cloud by hand
Rebuild the identical topology in the AWS console, clicking every button. This
phase is deliberately *not* skipped: running `terraform apply` without having
built the thing manually first produces someone who can copy a module and not
diagnose it.

### Phase 3 — Cloud as code
Tear down Phase 2, redeclare it in Terraform, `apply`, verify, `destroy`.

## Cost discipline

**A managed AWS NAT Gateway is not free tier** — roughly $0.045/hour plus data
transfer, about $32/month, billed whether traffic flows or not. It is the most
common way self-taught learners generate a surprise cloud bill. Phases 2 and 3
use a NAT *instance* on a free-tier-eligible VM, or design around egress
entirely. **A billing alarm is the first resource created in Phase 2, before
any network resource.**

Phase 1 costs $0. Phase 3 costs $0 at rest because the environment is fully
declarative and destroyed between sessions.

## Success criteria

- [ ] `app` reaches the internet only through `gw`; proven by removing the route and watching it fail
- [ ] `db` is unreachable from the host except by SSH ProxyJump through `gw`
- [ ] Default-deny firewall on `gw` with an explicit, documented allow list
- [ ] Whole lab rebuildable from nothing by one script
- [ ] Break/fix drills completed by Erick and written up in the build log
- [ ] Identical topology running in AWS, built by console
- [ ] Identical topology running in AWS, built by Terraform, destroyable
- [ ] Case study published with one diagram rendered three ways

## Scope boundary

Lab binaries — ISOs, VM disks, generated keys — live in `C:\Users\Erick\CloudLab`
and are never committed. This folder holds documentation, the mapping table, the
build log, and (once written) the build scripts and Terraform.
