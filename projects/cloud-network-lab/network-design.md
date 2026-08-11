# Network Design — Artificial Management Reference Business Network

**Status:** Proposed 2026-08-11, expanding the Phase 1 lab at Erick's direction
**Driver:** the lab should resemble a real small-business network, not a
three-box routing demo — multiple operating systems, real isolation zones,
containers doing specific jobs, and a security posture that has been audited
rather than asserted.

---

## Naming convention

Adopted 2026-08-11 at Erick's direction, replacing the shorthand names (`gw`,
`app`, `dc`) used during the first build. Short names are fast to type and
useless to read — six months from now, or to anyone else looking at the
portfolio, `gw` says nothing about what the machine is for.

Two layers, because they serve different readers.

### VirtualBox display name — for a human looking at the GUI

`NN-ZONE-Role (Platform)`

The numeric prefix forces VirtualBox to list the machines in **network order** —
edge first, then core, then the tiers behind it — so the VM list itself reads
as a diagram.

| # | VirtualBox display name | Was |
|---|---|---|
| 01 | `01-EDGE-Firewall (OPNsense)` | *(new)* |
| 02 | `02-CORE-Router-Bastion (Debian)` | `gw` |
| 03 | `03-APP-Server (Debian-Docker)` | `app` |
| 04 | `04-DATA-Database (Postgres-pgvector)` | *(new)* |
| 05 | `05-IDENTITY-DomainController (WinServer2025)` | `dc` |
| 06 | `06-DMZ-ReverseProxy (Alpine-Docker)` | *(new)* |
| 07 | `07-SEC-Monitoring (Debian)` | *(new)* |

### Guest hostname — for machines and logs

`am-<role><NN>` — lowercase, DNS-safe, and **15 characters or fewer** so that
Windows NetBIOS never truncates it.

| Hostname | Address | Role |
|---|---|---|
| `am-fw01` | 10.0.1.x / 10.0.0.1 | Perimeter firewall |
| `am-rtr01` | 10.0.2.1 | Router, NAT, DHCP, bastion |
| `am-app01` | 10.0.2.20 | Application server |
| `am-db01` | 10.0.2.30 | Database, no egress |
| `am-dc01` | 10.0.2.40 | Domain controller |
| `am-dmz01` | 10.0.0.20 | Reverse proxy |
| `am-sec01` | 10.0.2.50 | Logging and monitoring |

Descriptive label for humans, terse code for machines, is what real
infrastructure inventories do: the CMDB entry reads
"Perimeter Firewall — OPNsense", the host answers to `am-fw01`.

### DNS domain: `corp.internal`, not `lab.local`

The first build used `lab.local`. That is a long-standing mistake worth
correcting rather than inheriting.

`.local` is reserved for **mDNS** (Bonjour/Avahi). Using it as an Active
Directory domain causes intermittent, hard-to-diagnose resolution failures on
any host running an mDNS responder — which is most modern machines. Microsoft
has advised against it for years.

**ICANN reserved `.internal` for private use in 2024**, explicitly as the
replacement for improvised choices like `.local`, `.corp`, and `.lan`. It can
never be delegated as a public TLD, so it cannot collide with a real domain the
way `.corp` could.

AD domain: **`corp.internal`**. dnsmasq's `domain=` moves to match, so one
namespace covers the network.

### Sequencing note

`am-dc01` must be renamed **before** it is promoted to a domain controller.
Renaming a DC after promotion means touching the AD database, SPNs, and DNS
records — doable, but a genuinely bad afternoon. Renaming a plain member server
is a reboot. The rename therefore happens as soon as the install finishes and
before `Install-ADDSForest` is ever run.

Renaming a VirtualBox VM also requires it to be **powered off**, so the whole
rename lands as one coordinated pass rather than piecemeal.

---

## Design principle: zones, not machines

A business network is not a list of servers. It is a set of **trust zones**
with deliberately controlled paths between them. Every host below exists to
occupy a zone, and the interesting engineering is in what may cross a boundary
— not in the boxes themselves.

```
                        ( simulated internet )
                                 │
                        ┌────────▼────────┐
       ZONE 0 EDGE      │       fw        │  OPNsense (FreeBSD)
                        │  firewall/IDS   │  web console, Suricata, VPN
                        └───┬─────────┬───┘
                            │         │
        ┌───────────────────┘         └──────────────┐
        │                                            │
  ┌─────▼─────┐  ZONE 1 DMZ                   ┌──────▼──────┐  ZONE 4 USER
  │    dmz    │  Alpine + Docker              │     ws      │  desktop OS
  │  reverse  │  assumed hostile              │ workstation │  most likely
  │   proxy   │                               │             │  compromise
  └─────┬─────┘                               └──────┬──────┘
        │                                            │
        └──────────────┬─────────────────────────────┘
                       │
                 ┌─────▼─────┐  ZONE 2 SERVER
                 │    gw     │  Debian — hand-built router / bastion
                 │  nftables │  internal segmentation + DHCP/DNS
                 └─────┬─────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
  ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
  │    app    │  │    db     │  │    sec    │
  │  Debian   │  │  Debian   │  │  Debian   │
  │  +Docker  │  │ Postgres  │  │ log/IDS   │
  │           │  │ +pgvector │  │  console  │
  │  ZONE 2   │  │  ZONE 3   │  │  ZONE 5   │
  │           │  │ NO EGRESS │  │  MGMT     │
  └───────────┘  └───────────┘  └───────────┘
```

---

## What each host does, and why that OS

| Host | OS | Zone | Job | Why this OS specifically |
|---|---|---|---|---|
| `fw` | **OPNsense** (FreeBSD) | 0 Edge | Perimeter firewall, NAT, IDS/IPS (Suricata), VPN terminator, web admin console | A real appliance real businesses actually deploy. FreeBSD's `pf` is a different firewall language from `nftables` — learning both is the point. Gives the lab a genuine GUI without putting a desktop on a server. |
| `gw` | **Debian 13** | 2 Server | Internal router, bastion/jump host, DHCP + DNS for the private subnet, host firewall | Already built by hand with `nftables`. Kept deliberately: building the router manually *then* putting an appliance in front of it is defence-in-depth **and** the same "by hand, then by product" arc the whole project is built on. |
| `dmz` | **Alpine Linux** + Docker | 1 DMZ | Reverse proxy (Caddy) with TLS termination, WAF | ~150 MB installed. A DMZ host is assumed hostile, so it should carry the least software that can possibly do the job. Alpine's small surface is the argument for it here — and it teaches a second package manager and init system in the one place that justifies the cost. |
| `app` | **Debian 13** + Docker | 2 Server | Business application containers | Matches what runs on a cloud instance. Docker here demonstrates containers as a *deployment* boundary, not a security one. |
| `db` | **Debian 13** | 3 Data | PostgreSQL + pgvector. **No egress whatsoever.** | The crown jewels. Bare-metal Postgres rather than a container, on its own VM, to make the isolation argument concrete. |
| `sec` | **Debian 13** + Docker | 5 Mgmt | Log collection, IDS event console, metrics | The audit plane must not live on what it audits. |
| `dc` | **Windows Server 2025** (Desktop Experience) | 6 Identity | Active Directory, AD-integrated DNS, Group Policy, file services, CA | Identity is the centre of enterprise security and the direct conceptual ancestor of cloud IAM. Full GUI. 180-day evaluation. |
| `ws` | **Xubuntu** *(optional, later)* | 4 User | Employee workstation, domain-joined | The realistic entry point for a real attack. Deferred — see note below. |

### Why the Windows box is a domain controller, not a desktop

Erick supplied `26100.32230...SERVER_EVAL_x64FRE_en-us.iso` describing it as
"Windows 11 eval". Build 26100 is the kernel shared by Windows 11 24H2 and
Windows Server 2025, which is why the naming reads client-ish — but the SKU is
`ServerStandardEval`. It is a **server**, not a client OS.

That is a better outcome than what was planned, and the role changed to match:

- A server OS makes a poor "employee workstation" — the pretence would teach
  nothing and look wrong to anyone who knows the difference.
- What it *does* provide is the thing the lab was missing entirely: **identity**.
  Active Directory, Kerberos, LDAP, Group Policy, and an internal CA are the
  direct conceptual ancestors of cloud IAM, and "I built and secured a domain"
  is a stronger line for both target roles than "I ran a desktop VM".
- Practical bonus: Windows **Server** has no TPM 2.0 / Secure Boot requirement,
  unlike the Windows 11 client, so it installs in VirtualBox without the
  workarounds a client image would have needed. The evaluation window is also
  180 days rather than 90.

A separate lightweight Linux desktop can still be added later for the user zone
if the case study wants a compromise-path demonstration. It is no longer on the
critical path.

### The DNS authority problem this creates

`gw` currently runs dnsmasq as DHCP **and** DNS for `am-private`. A Windows
domain wants AD-integrated DNS, because domain members locate domain
controllers through `_ldap._tcp` and `_kerberos._tcp` SRV records that live in
the DNS zone. Two authorities for one namespace is a classic real-world
misconfiguration and produces intermittent, miserable failures.

Boundary drawn deliberately:

| Function | Owner | Reason |
|---|---|---|
| DHCP for `am-private` | `gw` (dnsmasq) | Already working, reserved leases by MAC, one less service on the DC |
| DNS for `lab.local` (the AD zone) | `dc` | SRV records must be authoritative on the DC or domain join fails |
| DNS for everything else | `dc` forwards to `gw`, which forwards upstream | Single recursive path, still logged in one place |

Domain members are handed `dc` as their resolver via a DHCP option change on
`gw`; non-domain Linux hosts keep using `gw` directly. Recording the split here
because the failure mode it prevents is invisible until something breaks.

### Access path — no management NIC on `dc`

`dc` gets exactly one NIC, on `am-private`. It deliberately does **not** get a
host-only adapter, because that is precisely the private-to-management leak the
security review flagged as F-02.

RDP is reached by tunnelling through the bastion instead:

```
ssh -F scripts/ssh_config -L 13389:10.0.2.40:3389 lab-gw
# then RDP to localhost:13389
```

Same pattern used to reach a private-subnet Windows instance in a real VPC,
where the equivalents are SSM port forwarding or Azure Bastion. The convenient
option — a second NIC straight to the host — is the one that quietly destroys
the segmentation the whole lab exists to demonstrate.

---

## Security vs privacy — they are not the same thing

Erick asked which components provide security and which provide privacy. Worth
separating precisely, because conflating them is how systems end up with a
strong front door and a wide-open back one.

### Security = controlling what comes IN, and limiting movement once in

| Control | Where | Protects against |
|---|---|---|
| Perimeter firewall rules | `fw` (pf) | Unsolicited inbound from the internet |
| IDS/IPS (Suricata) | `fw` | Known-bad traffic patterns; gives *detection*, not just blocking |
| Host firewalls (`nftables`) | every Linux host | East-west movement after a single host falls |
| Forward chain `policy drop` | `gw` | Any path from public into the private subnet |
| SSH keys only, no passwords | all hosts | Credential guessing |
| Bastion-only access | `gw` | Direct reachability of internal hosts |
| Container isolation | `app`, `dmz` | One compromised service reaching its neighbours |

### Privacy = controlling what goes OUT, and where data is allowed to live

| Control | Where | Protects against |
|---|---|---|
| **`db` has no default route at all** | `db` | Exfiltration. A compromised database cannot call home because it has nowhere to call. |
| Egress filtering | `fw`, `gw` | Malware beaconing from any internal host |
| Internal-only DNS | `gw` dnsmasq | Query logs leaking what the business looks up |
| TLS inside the network | `dmz` Caddy internal CA | Plaintext capture on internal segments |
| Logs stay on `sec` | `sec` | Operational data leaving the environment |
| No bridged adapter anywhere | hypervisor | **The lab touching Erick's real home LAN** |

The bridge between the two ideas is **egress filtering**. Almost every real
breach becomes a *data* incident at the moment compromised infrastructure is
allowed to talk outbound. Inbound rules are the part everyone writes; outbound
rules are the part that decides how bad it gets.

---

## Four isolation boundaries, ranked by strength

Stated explicitly because the ranking drives every placement decision above.

| Strength | Boundary | Used for |
|---|---|---|
| Strongest | **Hypervisor / VM** | Separating zones from each other |
| Strong | **Network segment** (VirtualBox Internal Network) | Making `am-private` genuinely unreachable, not merely unrouted |
| Medium | **Firewall rules** | Controlling permitted paths between segments |
| Weakest | **Container** (namespaces + cgroups, shared kernel) | Separating co-operating services on one host |

This is why `db` is a VM and not a container on `app`. A container shares the
host kernel; a kernel-level escape crosses it. For the data zone that is not an
acceptable trade, and saying so out loud is the difference between using
containers and understanding them.

**Technical note:** Docker inside these VMs needs no nested virtualization.
Linux containers are kernel namespaces and cgroups, not virtual machines — so
they run fine inside VirtualBox on a host whose VT-x is already owned by the
Windows hypervisor.

---

## Container assignments — specific jobs, not general-purpose boxes

| Host | Container | Job |
|---|---|---|
| `dmz` | Caddy | TLS termination + reverse proxy to `app` |
| `dmz` | CrowdSec *(optional)* | Behavioural blocking at the edge |
| `app` | business web app | The actual service being protected |
| `app` | Redis | Cache — demonstrates service-to-service policy |
| `sec` | Loki + Grafana | Log aggregation and dashboards |
| `sec` | Prometheus | Metrics |
| `db` | *(none — bare metal)* | Deliberate. See isolation ranking. |

---

## Cloud mapping, extended

The Phase 1 table still holds; the expansion adds rows.

| Lab | AWS | Azure |
|---|---|---|
| `fw` OPNsense | Network Firewall + IGW | Azure Firewall |
| Suricata IDS | GuardDuty | Microsoft Defender for Cloud |
| `dmz` zone | Public subnet + ALB | Public subnet + App Gateway |
| `gw` nftables | Security Groups + NACLs | NSGs |
| `app` zone | Private subnet + ECS/EKS | Private subnet + AKS |
| `db` no-egress zone | Isolated subnet, no NAT route, RDS | Isolated subnet + Private Endpoint |
| `sec` | CloudWatch + Security Hub | Log Analytics + Sentinel |
| `ws` | Client VPN / WorkSpaces | Azure Virtual Desktop |

---

## Resource budget — honest version

Host is an i7-6700: **4 physical cores / 8 threads**, 31.8 GB RAM.

| Host | RAM (run) | Install-time RAM |
|---|---|---|
| `fw` OPNsense | 1024 MB | 1024 MB |
| `gw` | 768 MB | 2048 MB |
| `dmz` Alpine | 768 MB | 1024 MB |
| `app` | 2048 MB | 2048 MB |
| `db` | 1536 MB | 2048 MB |
| `sec` | 2048 MB | 2048 MB |
| `ws` (Linux) | 2048 MB | 2048 MB |
| `ws` (Windows 11) | 4096 MB | 4096 MB |
| **Total (Linux ws)** | **~10.2 GB** | — |
| **Total (Windows ws)** | **~12.2 GB** | — |

RAM is not the constraint — **CPU is**. Seven VMs on four physical cores will
feel slow if all are busy at once. The lab is therefore designed to run in
**scenarios** rather than all-on:

- *Routing / segmentation work*: `fw` + `gw` + `app` (~3.8 GB)
- *Data tier work*: add `db` (~5.4 GB)
- *Security review*: add `sec` (~7.4 GB)
- *Full end-to-end demo*: everything, briefly, for the case-study recording

Stating this constraint up front is itself the exercise. Capacity planning is
the part of infrastructure work that gets skipped until it hurts.

---

## Build order

1. ~~`gw` — hand-built router, NAT, firewall, DHCP/DNS~~ **done 2026-08-11**
2. ~~`app` — private subnet, installed through the gateway~~ **done 2026-08-11**
3. Security audit of what exists *(agent-run, 2026-08-11)*
4. `db` — Postgres + pgvector, **egress removed**
5. `fw` — OPNsense perimeter in front of `gw`
6. `dmz` — Alpine + Caddy
7. `sec` — log/IDS console
8. `ws` — workstation
9. Full re-audit, then the case study

Each step is a build-log entry. Each failure stays in.
